import { useState } from 'react'
import CredentialCard from '../components/CredentialCard'
import CredentialDetailsModal from '../components/CredentialDetailsModal'
import {
	decodeContractError,
	fetchV2Metadata,
	getV2Credential,
	getV2CredentialsOfHolder,
	resolveIpfsUrl,
	V2_CONTRACT_ADDRESS,
} from '../contracts/ScholarChainV2Service'

const DEMO_STUDENT = '0x8D665e3D77bcA5141E04a2E0324E53b9Cb91cD6A'

export default function VerifyCredential() {
	const [tokenId, setTokenId] = useState('')
	const [credential, setCredential] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedCredential, setSelectedCredential] = useState(null)
	const [walletAddress, setWalletAddress] = useState('')
	const [walletCredentials, setWalletCredentials] = useState([])
	const [activeTab, setActiveTab] = useState('token') // 'token' | 'wallet'

	const executeTokenVerify = async (idToQuery) => {
		const targetId = idToQuery?.trim() || tokenId.trim()
		setError('')
		setCredential(null)
		setSelectedCredential(null)

		if (!targetId) {
			setError('Please enter a valid numeric Token ID.')
			return
		}

		setLoading(true)
		try {
			const data = await getV2Credential(targetId)
			let metadata = null

			try {
				metadata = await fetchV2Metadata(data.metadataURI)
			} catch {
				metadata = null
			}

			setCredential({
				...data,
				metadata,
			})
		} catch (verifyError) {
			setError(decodeContractError(verifyError))
		} finally {
			setLoading(false)
		}
	}

	const executeWalletLookup = async (addressToQuery) => {
		const targetAddr = addressToQuery?.trim() || walletAddress.trim()
		setError('')
		setWalletCredentials([])
		setSelectedCredential(null)

		if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddr)) {
			setError('Please enter a valid 42-character Ethereum wallet address (0x...).')
			return
		}

		setLoading(true)
		try {
			const rawItems = await getV2CredentialsOfHolder(targetAddr)
			const enrichedItems = await Promise.all(
				rawItems.map(async (item) => {
					try {
						const metadata = await fetchV2Metadata(item.metadataURI)
						return { ...item, metadata }
					} catch {
						return { ...item, metadata: null }
					}
				}),
			)
			setWalletCredentials(enrichedItems)
		} catch (lookupError) {
			setError(decodeContractError(lookupError))
		} finally {
			setLoading(false)
		}
	}

	const handleVerifyToken = (event) => {
		event.preventDefault()
		executeTokenVerify(tokenId)
	}

	const handleWalletLookup = (event) => {
		event.preventDefault()
		executeWalletLookup(walletAddress)
	}

	return (
		<section className="mx-auto max-w-5xl space-y-8">
			{/* Header */}
			<div className="text-center space-y-3">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
					🔍 Public Verification Engine
				</div>
				<h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
					Verify Academic Credentials
				</h1>
				<p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
					Instantly check the public Sepolia blockchain record and on-chain revocation status. <strong className="text-amber-200">No MetaMask wallet or gas fees required.</strong>
				</p>
				<p className="mx-auto max-w-2xl text-[11px] text-slate-400">
					Connected to ScholarChain V2 contract <code className="font-mono text-amber-300">{V2_CONTRACT_ADDRESS}</code> via public Sepolia RPC.
				</p>
			</div>

			{/* Tab navigation */}
			<div className="flex justify-center border-b border-white/10 pb-4">
				<div className="inline-flex rounded-2xl border border-white/10 bg-slate-900/90 p-1.5 backdrop-blur-md">
					<button
						type="button"
						onClick={() => {
							setActiveTab('token')
							setError('')
						}}
						className={[
							'rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
							activeTab === 'token'
								? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
								: 'text-slate-400 hover:text-white',
						].join(' ')}
					>
						Verify by Token ID
					</button>
					<button
						type="button"
						onClick={() => {
							setActiveTab('wallet')
							setError('')
						}}
						className={[
							'rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
							activeTab === 'wallet'
								? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
								: 'text-slate-400 hover:text-white',
						].join(' ')}
					>
						Lookup Student Portfolio
					</button>
				</div>
			</div>

			{/* Live Demo Quick-Select Chips */}
			<div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 backdrop-blur-md">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className="text-amber-400 text-sm">⚡</span>
						<span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
							Demo Quick-Query:
						</span>
						<span className="text-xs text-slate-400 hidden sm:inline">
							Click any verified test fixture to evaluate live on-chain results:
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => {
								setActiveTab('token')
								setTokenId('1')
								executeTokenVerify('1')
							}}
							className="rounded-lg border border-amber-500/30 bg-slate-900/90 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/15 hover:border-amber-400 transition"
						>
							🎓 Token #1 (B.S. in CS)
						</button>
						<button
							type="button"
							onClick={() => {
								setActiveTab('token')
								setTokenId('2')
								executeTokenVerify('2')
							}}
							className="rounded-lg border border-amber-500/30 bg-slate-900/90 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/15 hover:border-amber-400 transition"
						>
							🏅 Token #2 (Honors)
						</button>
						<button
							type="button"
							onClick={() => {
								setActiveTab('wallet')
								setWalletAddress(DEMO_STUDENT)
								executeWalletLookup(DEMO_STUDENT)
							}}
							className="rounded-lg border border-indigo-400/30 bg-slate-900/90 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-400 transition"
						>
							📂 Student Vault (0x8D66...cD6A)
						</button>
					</div>
				</div>
			</div>

			{error ? (
				<div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-1 text-center">
					<p className="text-xs font-bold text-rose-300">⚠️ Lookup Notice</p>
					<p className="text-xs text-rose-200">{error}</p>
				</div>
			) : null}

			{/* Token ID Form */}
			{activeTab === 'token' ? (
				<form
					onSubmit={handleVerifyToken}
					className="rounded-3xl border border-white/10 bg-[#0F172A]/90 p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xl"
				>
					<div>
						<h2 className="font-serif text-lg font-bold text-white">Single Token Verification</h2>
						<p className="mt-1 text-xs text-slate-300 leading-relaxed">
							Enter the ERC-721 numeric Token ID recorded on the Sepolia smart contract. The public RPC retrieves the issuing institution address, mint timestamp, revocation status, and metadata URI.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<input
							value={tokenId}
							onChange={(e) => setTokenId(e.target.value)}
							placeholder="Enter Token ID (e.g. 1)"
							className="flex-1 rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white font-mono outline-none ring-amber-500 transition focus:ring-2"
						/>
						<button
							type="submit"
							disabled={loading}
							className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
						>
							{loading ? 'Querying Sepolia...' : 'Verify Token'}
						</button>
					</div>

					{credential ? (
						<div className="pt-6 border-t border-white/10 space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
									<span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
										Verified On-Chain Record
									</span>
								</div>
								{credential.metadataURI ? (
									<a
										href={resolveIpfsUrl(credential.metadataURI)}
										target="_blank"
										rel="noreferrer"
										className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
									>
										<span>🔗 Raw Metadata URI</span>
									</a>
								) : null}
							</div>
							<div className="max-w-xl mx-auto">
								<CredentialCard credential={credential} onOpen={setSelectedCredential} />
							</div>
						</div>
					) : null}
				</form>
			) : null}

			{/* Wallet Lookup Form */}
			{activeTab === 'wallet' ? (
				<form
					onSubmit={handleWalletLookup}
					className="rounded-3xl border border-white/10 bg-[#0F172A]/90 p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xl"
				>
					<div>
						<h2 className="font-serif text-lg font-bold text-white">Student Portfolio Lookup</h2>
						<p className="mt-1 text-xs text-slate-300 leading-relaxed">
							Enter any 42-character recipient wallet address to read all non-transferable credentials minted to that holder on Sepolia.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<input
							value={walletAddress}
							onChange={(e) => setWalletAddress(e.target.value)}
							placeholder="Enter Student Wallet Address (0x...)"
							className="flex-1 rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white font-mono outline-none ring-amber-500 transition focus:ring-2"
						/>
						<button
							type="submit"
							disabled={loading}
							className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-60"
						>
							{loading ? 'Searching Sepolia...' : 'View Student Vault'}
						</button>
					</div>

					{!loading && walletCredentials.length === 0 && walletAddress && !error ? (
						<div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-2">
							<p className="text-3xl">📜</p>
							<p className="text-xs font-bold text-white">No Credentials Found</p>
							<p className="text-xs text-slate-400 max-w-md mx-auto">
								No credentials have been minted to{' '}
								<span className="font-mono text-amber-300">{walletAddress}</span> yet on Sepolia.
							</p>
						</div>
					) : null}

					{walletCredentials.length > 0 ? (
						<div className="pt-6 border-t border-white/10 space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-xs font-bold uppercase tracking-wider text-amber-300">
									Found {walletCredentials.length} Credential(s) for Student
								</p>
								<span className="text-[11px] text-slate-400 font-mono">
									Holder: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
								</span>
							</div>
							<div className="grid gap-6 sm:grid-cols-2">
								{walletCredentials.map((item) => (
									<CredentialCard key={item.tokenId} credential={item} onOpen={setSelectedCredential} />
								))}
							</div>
						</div>
					) : null}
				</form>
			) : null}

			{/* Educational Verification Architecture Card */}
			<div className="rounded-3xl border border-white/10 bg-[#070A10]/90 p-6 sm:p-8 space-y-4">
				<h3 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
					💡 How Decentralized Verification Works in ScholarChain
				</h3>
				<div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-400">
					<div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-1.5">
						<span className="text-amber-400 font-bold">1. Zero-Wallet Requirement</span>
						<p className="leading-relaxed">
							Public lookup queries the public Ethereum Sepolia JSON-RPC node directly. Verifiers and employers do not need MetaMask or crypto tokens.
						</p>
					</div>
					<div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-1.5">
						<span className="text-amber-400 font-bold">2. Soulbound Guarantee</span>
						<p className="leading-relaxed">
							Tokens implement strict non-transferability in Solidity (<code className="text-slate-300">_update</code> hook blocks transfers between non-zero addresses).
						</p>
					</div>
					<div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-1.5">
						<span className="text-amber-400 font-bold">3. Real-Time Revocation Check</span>
						<p className="leading-relaxed">
							Revocations are checked in real time on-chain. If an institution revokes an erroneously issued credential, it immediately reflects as revoked.
						</p>
					</div>
				</div>
			</div>

			{selectedCredential ? (
				<CredentialDetailsModal credential={selectedCredential} onClose={() => setSelectedCredential(null)} />
			) : null}
		</section>
	)
}
