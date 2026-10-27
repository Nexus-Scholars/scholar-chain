import { Link, NavLink } from 'react-router-dom'
import WalletConnect from './WalletConnect'
import { ScholarChainBrand } from './ScholarChainLogo'

function navClass({ isActive }) {
	return [
		'relative rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200',
		isActive
			? 'bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-bold'
			: 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent',
	].join(' ')
}

export default function Navbar({ walletState }) {
	const {
		account,
		isContractOwner,
		isSepolia,
		isRoleRefreshing,
		chainId,
		organizationLabel,
		handleConnectWallet,
		handleSwitchAccount,
		handleDisconnectWallet,
	} = walletState

	return (
		<header className="sticky top-0 z-30 border-b border-white/10 bg-[#070A10]/90 backdrop-blur-2xl shadow-xl shadow-black/50">
			<div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
				{/* Brand Logo & Academic Identity */}
				<Link to="/" className="group flex items-center transition">
					<ScholarChainBrand />
				</Link>

				{/* Primary Navigation — Home, Verify, Institution Portal, Issue Credential */}
				<nav className="flex flex-wrap items-center gap-1 sm:gap-1.5" aria-label="Main Navigation">
					<NavLink to="/" className={navClass}>
						Home
					</NavLink>
					<NavLink to="/verify" className={navClass}>
						Verify
					</NavLink>
					<NavLink to="/issuer-dashboard" className={navClass} title="Institution Management Portal">
						Institution Portal
					</NavLink>
					<NavLink to="/issue" className={navClass} title="Issue new Soulbound credential">
						Issue Credential
					</NavLink>

					{/* Role-Specific Secondary Links */}
					{isSepolia && !isRoleRefreshing && isContractOwner ? (
						<NavLink to="/admin" className={navClass}>
							Admin Governance
						</NavLink>
					) : (
						<>
							<NavLink to="/dashboard" className={navClass} title="View credentials in connected wallet">
								My Credentials
							</NavLink>
							<NavLink to="/issuer-application" className={navClass} title="Apply to become an approved issuer">
								Onboarding
							</NavLink>
						</>
					)}
				</nav>

				{/* Wallet Status & Active Network Header */}
				<WalletConnect
					account={account}
					organizationLabel={organizationLabel}
					roleLabel={walletState.roleLabel}
					roleIcon={walletState.roleIcon}
					isRoleRefreshing={walletState.isRoleRefreshing}
					isSepolia={isSepolia}
					chainId={chainId}
					onConnected={handleConnectWallet}
					onSwitchAccount={handleSwitchAccount}
					onDisconnected={handleDisconnectWallet}
					buttonClassName="px-4 py-2"
				/>
			</div>
		</header>
	)
}
