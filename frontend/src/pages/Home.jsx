import { Link } from 'react-router-dom'
import { V2_CONTRACT_ADDRESS } from '../contracts/ScholarChainV2Service'

const howItWorks = [
	{
		step: '01',
		icon: '🏛️',
		title: 'Institution applies',
		body: 'An institution connects its Ethereum wallet and submits an official onboarding profile. Its on-chain status is set to Pending.',
	},
	{
		step: '02',
		icon: '🛡️',
		title: 'Governance reviews',
		body: 'The contract owner verifies institutional authenticity and grants Approved status, authorizing that wallet to mint credentials.',
	},
	{
		step: '03',
		icon: '🏅',
		title: 'Issuer builds credential',
		body: 'The approved institution enters the student address, achievement title, and dates. ScholarChain automatically compiles the metadata URI.',
	},
	{
		step: '04',
		icon: '⛓️',
		title: 'Institution signs mint',
		body: 'The institution wallet confirms a Sepolia transaction. The contract mints a non-transferable Soulbound token directly to the student.',
	},
	{
		step: '05',
		icon: '🎓',
		title: 'Student holds record',
		body: 'The recipient permanently owns the credential in their vault. Non-transferability prevents selling or trading academic qualifications.',
	},
	{
		step: '06',
		icon: '🔍',
		title: 'Instant public verification',
		body: 'Anyone can query the Token ID or student address via public Sepolia RPC in seconds. No MetaMask or transaction fee required.',
	},
]

const roles = [
	{
		title: 'Governance Admin',
		icon: '🛡️',
		wallet: '0x52dEc6d91876e874E20b8DA50ea93FADEB277a3c',
		body: 'Owner of ScholarChainV2.sol. Approves, rejects, suspends, or reactivates institutions, and exercises emergency credential revocation.',
	},
	{
		title: 'Approved Institution',
		icon: '🏛️',
		wallet: '0x74E2FbaCb00d4488C36131Cf4372a43F6bE6794d',
		body: 'Authorized university wallet. Mints credentials for graduating students, manages active certificates, and updates profile metadata.',
	},
	{
		title: 'Student / Recipient',
		icon: '🎓',
		wallet: '0x8D665e3D77bcA5141E04a2E0324E53b9Cb91cD6A',
		body: 'Receives non-transferable Soulbound credentials into their personal Web3 vault. Shareable with employers and universities worldwide.',
	},
	{
		title: 'Public Verifier',
		icon: '🔍',
		wallet: 'Any browser / No wallet',
		body: 'Zero-wallet lookup via Sepolia JSON-RPC. Verifies the authentic issuing institution address and real-time revocation status.',
	},
]

const forWho = [
	{
		icon: '🎓',
		title: 'Students & Alumni',
		color: 'border-blue-500/30 bg-blue-500/10',
		labelColor: 'text-blue-300',
		items: [
			'Own permanent, tamper-proof academic credentials in your Web3 vault',
			'Soulbound tokens prove your achievements without paper certificates',
			'Share verifiable public links directly with recruiters and institutions',
		],
	},
	{
		icon: '🏛️',
		title: 'Universities & Issuers',
		color: 'border-amber-500/30 bg-amber-500/10',
		labelColor: 'text-amber-300',
		items: [
			'Onboard once with verifiable institutional governance',
			'Issue immutable academic degrees, diplomas, and honors in seconds',
			'Maintain real-time revocation capability for erroneous or revoked degrees',
		],
	},
	{
		icon: '🔍',
		title: 'Employers & Verifiers',
		color: 'border-emerald-500/30 bg-emerald-500/10',
		labelColor: 'text-emerald-300',
		items: [
			'Verify degrees and credentials in seconds without registration or fees',
			'Check on-chain revocation status in real time against Sepolia',
			'Inspect authentic issuing university cryptographic signatures',
		],
	},
]

const concepts = [
	{
		icon: '🔒',
		title: 'Soulbound Tokens (Non-Transferable)',
		body: 'Unlike ordinary NFTs, academic credentials must stay with the person who earned them. ScholarChain overrides the ERC-721 _update method to disallow transfers between non-zero addresses.',
	},
	{
		icon: '🌐',
		title: 'Decentralized Metadata Architecture',
		body: 'Achievement details are formatted into permanent Base64 JSON Data URIs or Pinata IPFS CIDs. The data remains accessible even if a central server goes offline.',
	},
	{
		icon: '🛡️',
		title: 'Permissioned Institutional Governance',
		body: 'Prevents fraudulent credential factories. Only universities verified and approved by the Governance Administrator hold the cryptographic right to mint credentials.',
	},
	{
		icon: '⚡',
		title: 'Zero-Wallet Public RPC Access',
		body: 'Employers and the public do not need to install MetaMask or purchase cryptocurrency. Public read queries are executed directly over Sepolia JSON-RPC nodes.',
	},
]

export default function Home() {

	return (
		<div className="space-y-16 py-4">
			{/* ── Hero Section ─────────────────────────────────────────────────── */}
			<section className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0F172A] via-slate-950 to-[#070A10] p-8 sm:p-14 shadow-2xl shadow-black/80">
				<div className="absolute right-0 top-0 h-96 w-96 translate-x-20 -translate-y-20 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
				<div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-16 translate-y-16 rounded-full bg-indigo-900/20 blur-[110px] pointer-events-none" />

				<div className="relative mx-auto max-w-4xl text-center space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
						📜 Decentralized Academic Credential Management System
					</div>

					<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
						Academic credentials<br />
						<span className="text-amber-300">anchored on the blockchain</span>
					</h1>

					<p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
						ScholarChain empowers universities to issue tamper-proof, non-transferable
						Soulbound Credentials on Ethereum Sepolia. Anyone can publicly verify the
						legitimacy, issuer identity, and real-time revocation status in seconds.
					</p>

					{/* Primary Action Buttons */}
					<div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
						<Link
							to="/verify"
							className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 hover:scale-[1.02]"
						>
							🔍 Verify a Credential (No Wallet Needed)
						</Link>

						<Link
							to="/issuer-dashboard"
							className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/25"
						>
							🏛️ Institution Portal
						</Link>

						<Link
							to="/issue"
							className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10 hover:text-white"
						>
							🎓 Issue Credential
						</Link>
					</div>
				</div>
			</section>

			{/* ── College Review Demo Quickstart Card ───────────────────────────── */}
			<section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-[#0B0F17] to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
					<div>
						<div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
							<span>⚡</span> Live Demonstration Quickstart
						</div>
						<h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
							College Reviewer Test Fixtures
						</h2>
					</div>
					<span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
						Active Sepolia Deployment
					</span>
				</div>

				<p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
					Evaluate ScholarChain live on the Ethereum Sepolia Testnet using these verified on-chain demonstration workflows:
				</p>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-2xl border border-white/10 bg-[#070A10]/80 p-5 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Public Verification</span>
							<span className="text-[10px] text-emerald-400 font-semibold">● No Wallet</span>
						</div>
						<p className="text-xs text-slate-400 leading-relaxed">
							Test public verification on real Sepolia records without installing MetaMask.
						</p>
						<Link
							to="/verify"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
						>
							<span>Try Token #1 on Verify page</span>
							<span>→</span>
						</Link>
					</div>

					<div className="rounded-2xl border border-white/10 bg-[#070A10]/80 p-5 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Student Vault</span>
							<span className="text-[10px] text-indigo-400 font-semibold">● Student View</span>
						</div>
						<p className="text-xs text-slate-400 leading-relaxed">
							View credentials issued to student wallet <code className="text-slate-300 font-mono">0x8D66...cD6A</code>.
						</p>
						<Link
							to="/verify"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
						>
							<span>Lookup Student Portfolio</span>
							<span>→</span>
						</Link>
					</div>

					<div className="rounded-2xl border border-white/10 bg-[#070A10]/80 p-5 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Institution Issuance</span>
							<span className="text-[10px] text-amber-400 font-semibold">● Issuer View</span>
						</div>
						<p className="text-xs text-slate-400 leading-relaxed">
							Explore the credential form and base64 JSON metadata generator.
						</p>
						<Link
							to="/issue"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
						>
							<span>Explore Issue Credential Form</span>
							<span>→</span>
						</Link>
					</div>
				</div>
			</section>

			{/* ── Audience Journeys ────────────────────────────────────────────── */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Who Uses ScholarChain?</h2>
					<p className="mt-2 text-sm text-slate-400">
						Designed for every stakeholder in the academic credential lifecycle.
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
					<p className="text-sm text-slate-400">
						From institutional onboarding to cryptographic, permanent verification on Ethereum Sepolia.
					</p>
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

			{/* ── Key Technical & Architecture Concepts ─────────────────────────── */}
			<section className="space-y-6">
				<div className="text-center space-y-2">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
						Core Blockchain Architecture
					</h2>
					<p className="text-sm text-slate-400">
						Built on standard Ethereum improvements and robust cryptographic principles.
					</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2">
					{concepts.map((c) => (
						<article
							key={c.title}
							className="rounded-3xl border border-white/10 bg-[#0F172A]/80 p-7 shadow-xl backdrop-blur-md space-y-3"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-xl">
									{c.icon}
								</div>
								<h3 className="font-serif text-sm font-bold text-amber-200">{c.title}</h3>
							</div>
							<p className="text-xs leading-relaxed text-slate-300">{c.body}</p>
						</article>
					))}
				</div>
			</section>

			{/* ── Role Permissions Matrix ───────────────────────────────────────── */}
			<section className="space-y-6">
				<div className="text-center space-y-2">
					<h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
						Permission Matrix & Demo Accounts
					</h2>
					<p className="text-sm text-slate-400">
						Issuance and governance are permissioned on-chain; verification is completely public.
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{roles.map((role) => (
						<article key={role.title} className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5 space-y-2.5">
							<div className="flex items-center gap-2">
								<span className="text-xl">{role.icon}</span>
								<h3 className="font-serif text-sm font-bold text-amber-200">{role.title}</h3>
							</div>
							<p className="font-mono text-[10px] text-slate-400 truncate">
								{role.wallet}
							</p>
							<p className="text-xs leading-relaxed text-slate-400">{role.body}</p>
						</article>
					))}
				</div>
				<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-xs text-amber-300/90 max-w-3xl mx-auto space-y-1">
					<p>📜 <strong>Smart Contract Notice:</strong> ScholarChain verifies that an authorized university issued the credential and checks whether it has been revoked. It guarantees cryptographic non-repudiation on Ethereum Sepolia.</p>
					<p className="font-mono text-[11px] text-slate-400">Target Contract: {V2_CONTRACT_ADDRESS}</p>
				</div>
			</section>
		</div>
	)
}
