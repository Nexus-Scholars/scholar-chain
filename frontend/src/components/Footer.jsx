import { Link } from 'react-router-dom'
import { V2_CONTRACT_ADDRESS } from '../contracts/ScholarChainV2Service'
import { ScholarChainIcon } from './ScholarChainLogo'

const teamMembers = [
	{ name: 'Shaik Zaheer Abbas', roll: '24R11A6690', role: 'Architecture & Contracts' },
	{ name: 'Jamulapuram Dhanush Narayana', roll: '24R11A6623', role: 'Wallet & State Sync' },
	{ name: 'Banoth Ganesh', roll: '24R11A6657', role: 'Security & Governance Audit' },
	{ name: 'Adusumilli Rohit Kumar', roll: '24R11A6652', role: 'Workflow & UI UX' },
	{ name: 'Jalaneela Sai Sandeep', roll: '24R11A6622', role: 'QA & Failure Analysis' },
	{ name: 'Kampelli Suhan Ramesh', roll: '24R11A6628', role: 'Documentation & Demo' },
]

export default function Footer() {
	return (
		<footer className="relative z-10 border-t border-white/10 bg-[#070A10]/95 backdrop-blur-xl pt-14 pb-10 text-slate-400">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
				{/* Top Grid */}
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
					{/* Brand Column */}
					<div className="space-y-4 lg:col-span-2">
						<div className="flex items-center gap-3">
							<ScholarChainIcon className="h-10 w-10" />
							<div>
								<span className="font-serif text-lg font-bold text-white">ScholarChain</span>
								<span className="ml-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-300">
									Ethereum Sepolia
								</span>
							</div>
						</div>
						<p className="max-w-md text-xs leading-relaxed text-slate-400">
							Decentralized academic credential tokenization and public verification platform. Empowers educational institutions to issue tamper-proof, non-transferable Soulbound Credentials directly on Ethereum Sepolia.
						</p>
						<div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
							<span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
								Solidity 0.8.20+
							</span>
							<span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
								ERC-721 Soulbound
							</span>
							<span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
								React 19 + Vite
							</span>
							<span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
								Ethers.js v6
							</span>
						</div>
					</div>

					{/* Navigation Links */}
					<div className="space-y-3">
						<h4 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-200">
							Demonstration Routes
						</h4>
						<ul className="space-y-2 text-xs">
							<li>
								<Link to="/" className="hover:text-amber-300 transition">
									Home & Overview
								</Link>
							</li>
							<li>
								<Link to="/verify" className="hover:text-amber-300 transition">
									Public Credential Verification
								</Link>
							</li>
							<li>
								<Link to="/issuer-dashboard" className="hover:text-amber-300 transition">
									Institution Portal
								</Link>
							</li>
							<li>
								<Link to="/issue" className="hover:text-amber-300 transition">
									Issue Credential Form
								</Link>
							</li>
							<li>
								<Link to="/issuer-application" className="hover:text-amber-300 transition">
									Apply as Institution
								</Link>
							</li>
							<li>
								<Link to="/dashboard" className="hover:text-amber-300 transition">
									Student Credential Vault
								</Link>
							</li>
						</ul>
					</div>

					{/* On-Chain Verification */}
					<div className="space-y-3">
						<h4 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-200">
							On-Chain Contract
						</h4>
						<p className="text-xs leading-relaxed text-slate-400">
							Active Sepolia V2 Smart Contract deployed at:
						</p>
						<a
							href={`https://sepolia.etherscan.io/address/${V2_CONTRACT_ADDRESS}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 font-mono text-[11px] text-amber-300 hover:border-amber-400 transition break-all"
						>
							{V2_CONTRACT_ADDRESS}
							<span className="mt-1 block text-[10px] text-slate-400 font-sans">
								↗ View on Etherscan Sepolia
							</span>
						</a>
						<p className="text-[11px] text-slate-500">
							All credentials enforce non-transferability through the overridden <code className="text-slate-400">_update()</code> method.
						</p>
					</div>
				</div>

				{/* Team Attributions */}
				<div className="border-t border-white/5 pt-8">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
						<h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
							Nexus Scholars Team — Project Contributors
						</h4>
						<span className="text-[11px] text-amber-400/80">College Internship Project Review</span>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
						{teamMembers.map((m) => (
							<div key={m.roll} className="rounded-xl border border-white/5 bg-slate-900/50 p-2.5 text-left">
								<p className="text-xs font-semibold text-slate-200 truncate">{m.name}</p>
								<p className="font-mono text-[10px] text-amber-300/80">{m.roll}</p>
								<p className="text-[10px] text-slate-400 truncate">{m.role}</p>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Copyright */}
				<div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
					<p>© 2026 ScholarChain. Academic demonstration release by Nexus Scholars.</p>
					<p>Licensed under MIT License • Tested on Ethereum Sepolia</p>
				</div>
			</div>
		</footer>
	)
}
