import { Link } from 'react-router-dom'
import { V2_CONTRACT_ADDRESS } from '../contracts/ScholarChainV2Service'

const howItWorks = [
	{
		step: '01',
		icon: '🏛️',
		title: 'Institution applies',
		body: 'An institution connects its wallet and submits an onboarding profile. Its on-chain status becomes Pending.',
	},
	{
		step: '02',
		icon: '🛡️',
		title: 'Governance reviews',
		body: 'The contract owner reviews the application and approves or rejects it. Approval enables that institution wallet to issue credentials.',
	},
	{
		step: '03',
		icon: '🏅',
		title: 'Issuer creates a credential',
		body: 'An approved institution enters the student wallet, credential serial, achievement and optional details. The app builds the metadata URI.',
	},
	{
		step: '04',
		icon: '⛓️',
		title: 'Institution signs the mint',
		body: 'The institution confirms a Sepolia transaction. The contract mints a non-transferable ERC-721 token and records its credential details.',
	},
	{
		step: '05',
		icon: '🎓',
		title: 'Student views the credential',
		body: 'The holder wallet can view its credentials in the vault. A public wallet lookup can also read the holder’s records.',
	},
	{
		step: '06',
		icon: '🔍',
		title: 'Anyone can check the record',
		body: 'A verifier looks up a Token ID or wallet on Sepolia without MetaMask and sees the issuer, recorded details and current revocation status.',
	},
]

const roles = [
	{
		title: 'Governance Admin',
		body: 'The contract owner approves, rejects, suspends or reactivates institutions, and can revoke credentials.',
	},
	{
		title: 'Approved Institution',
		body: 'An institution with Approved status can issue credentials from its authorized wallet and pays the mint transaction gas.',
	},
	{
		title: 'Student / Credential Holder',
		body: 'The student wallet receives the non-transferable credential and can view it in the Credential Vault.',
	},
	{
		title: 'Public Verifier',
		body: 'Anyone can read on-chain credential data using the public Sepolia RPC. No account or MetaMask is needed.',
	},
]

const forWho = [
	{
		icon: '🎓',
		title: 'Students',
		color: 'border-blue-500/30 bg-blue-500/10',
		labelColor: 'text-blue-300',
		items: [
			'View all credentials issued to your wallet',
			'Share a permanent, tamper-proof record with employers',
			'No paperwork — your achievements live on the blockchain',
		],
	},
	{
		icon: '🏛️',
		title: 'Institutions',
		color: 'border-amber-500/30 bg-amber-500/10',
		labelColor: 'text-amber-300',
		items: [
			'Apply once to become a verified issuer',
			'Issue credentials to students in seconds',
			'Manage your issued certificates from your portal',
		],
	},
	{
		icon: '🔍',
		title: 'Employers & Verifiers',
		color: 'border-emerald-500/30 bg-emerald-500/10',
		labelColor: 'text-emerald-300',
		items: [
			'Verify any credential instantly — no account required',
			'Check revocation status in real time',
			'Confirm the issuing institution is legitimate',
		],
	},
]

export default function Home({ walletState }) {
	const { isAuthorizedIssuerRole, isContractOwner, account } = walletState

	return (
		<div className="space-y-16 py-4">
			{/* ── Hero ─────────────────────────────────────────────────────────── */}
			<section className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0F172A] via-slate-950 to-[#070A10] p-8 sm:p-16 shadow-2xl shadow-black/80">
				<div className="absolute right-0 top-0 h-96 w-96 translate-x-20 -translate-y-20 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
				<div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-16 translate-y-16 rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />

				<div className="relative mx-auto max-w-4xl text-center space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
						📜 Blockchain-Verified Academic Credentials
					</div>

					<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
						Academic credentials<br />
						<span className="text-amber-300">you can actually trust</span>
					</h1>

					<p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
						ScholarChain records credentials issued by approved institutions on
						Ethereum Sepolia Testnet. Anyone can check the recorded issuer and
						current blockchain status. This academic prototype demonstrates
						decentralized verification with permissioned issuer governance.
					</p>

					{/* Role-aware CTAs */}
					<div className="pt-4 flex flex-wrap items-center justify-center gap-4">
						<Link
							to="/verify"
							className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 hover:scale-[1.02]"
						>
							🔍 Verify a Credential
						</Link>

						{isContractOwner ? (
							<Link
								to="/admin"
								className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/25"
							>
								🛡️ Admin Panel
							</Link>
						) : isAuthorizedIssuerRole ? (
							<>
								<Link
									to="/issue"
									className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/25"
								>
									🎓 Issue a Credential
								</Link>
								<Link
									to="/issuer-dashboard"
									className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10"
								>
									🏛️ Institution Portal
								</Link>
							</>
						) : (
							<>
								<Link
									to="/dashboard"
									className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10 hover:text-white"
								>
									🎓 My Credentials
								</Link>
								{!account ? (
									<Link
										to="/issuer-application"
										className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20"
									>
										🏛️ Apply as an Institution
									</Link>
								) : null}
							</>
						)}
					</div>

					{/* Contract address */}
					<div className="pt-4 flex items-center justify-center gap-3 text-xs text-slate-500 font-mono">
						<span>Contract:</span>
						<a
							href={`https://sepolia.etherscan.io/address/${V2_CONTRACT_ADDRESS}`}
							target="_blank"
							rel="noreferrer"
							className="text-slate-400 hover:text-amber-400 transition break-all"
						>
							{V2_CONTRACT_ADDRESS}
						</a>
					</div>
				</div>
			</section>

			{/* ── Who it's for ──────────────────────────────────────────────────── */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Who uses ScholarChain?</h2>
					<p className="mt-2 text-sm text-slate-400">
						Built for every person in the credential journey.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{forWho.map((item) => (
						<article
							key={item.title}
							className={[
								'group rounded-3xl border p-7 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-1',
								item.color,
							].join(' ')}
						>
							<div className={['text-[10px] font-bold uppercase tracking-widest mb-3', item.labelColor].join(' ')}>
								{item.icon} {item.title}
							</div>
							<ul className="space-y-2.5">
								{item.items.map((line) => (
									<li key={line} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
										<span className="mt-0.5 text-amber-400 shrink-0">→</span>
										{line}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</section>

			{/* ── How it works ──────────────────────────────────────────────────── */}
			<section className="rounded-3xl border border-white/10 bg-[#0B0F17] p-8 sm:p-12 space-y-8 shadow-2xl">
				<div className="text-center space-y-2">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">How ScholarChain Works</h2>
					<p className="text-sm text-slate-400">From institution application to an independently readable credential record.</p>
				</div>
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{howItWorks.map((item) => (
						<div key={item.step} className="space-y-3">
							<div className="flex items-center gap-3">
								<span className="text-3xl font-serif font-bold text-amber-500/40">{item.step}</span>
								<span className="text-2xl">{item.icon}</span>
							</div>
							<h3 className="font-serif text-base font-bold text-white">{item.title}</h3>
							<p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
						</div>
					))}
				</div>
			</section>

			<section className="space-y-6">
				<div className="text-center space-y-2">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Who does what?</h2>
					<p className="text-sm text-slate-400">Issuing is permissioned; reading and verification are public.</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{roles.map((role) => (
						<article key={role.title} className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5">
							<h3 className="font-serif text-sm font-bold text-amber-200">{role.title}</h3>
							<p className="mt-2 text-xs leading-relaxed text-slate-400">{role.body}</p>
						</article>
					))}
				</div>
				<p className="text-center text-[11px] text-slate-500">A blockchain record shows what an approved issuer recorded and the current on-chain status; it does not prove the student deserved the qualification.</p>
			</section>

			{/* ── Why blockchain ────────────────────────────────────────────────── */}
			<section className="grid gap-6 md:grid-cols-3">
				{[
					{
						icon: '🔒',
						title: 'Cannot be faked',
						body: 'Every credential is written permanently to the blockchain. No institution, admin, or third party can silently alter or delete it.',
					},
					{
						icon: '⚡',
						title: 'Instant verification',
						body: 'Anyone can verify a credential in seconds using just the credential ID or the student\'s wallet address — completely free, no account needed.',
					},
					{
						icon: '🏅',
						title: 'Student wallet receives the record',
						body: 'The credential is minted to the student wallet and cannot be transferred. If revoked, it remains visible with an invalid status.',
					},
				].map((item) => (
					<article
						key={item.title}
						className="group rounded-3xl border border-white/10 bg-[#0F172A]/80 p-8 shadow-xl backdrop-blur-md transition duration-300 hover:border-amber-500/40 hover:-translate-y-1"
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-2xl group-hover:scale-110 transition">
							{item.icon}
						</div>
						<h3 className="mt-5 font-serif text-lg font-bold text-white group-hover:text-amber-200 transition">
							{item.title}
						</h3>
						<p className="mt-2 text-xs leading-relaxed text-slate-300">{item.body}</p>
					</article>
				))}
			</section>
		</div>
	)
}
