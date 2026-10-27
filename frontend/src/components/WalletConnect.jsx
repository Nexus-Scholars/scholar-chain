import { useState } from 'react'
import { connectWallet } from '../contracts/ScholarChainService'

function shortenAddress(address) {
	if (!address) return ''
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletConnect({
	account,
	organizationLabel = '',
	roleLabel = 'Student',
	roleIcon = '🎓',
	onConnected,
	onDisconnected,
	onSwitchAccount,
	isRoleRefreshing = false,
	isSepolia = false,
	chainId = '',
	className = '',
	buttonClassName = '',
}) {
	const [isConnecting, setIsConnecting] = useState(false)

	const handleConnect = async () => {
		setIsConnecting(true)
		try {
			const result = await connectWallet()
			onConnected?.(result)
		} catch (error) {
			alert(error.message || 'Failed to connect wallet')
		} finally {
			setIsConnecting(false)
		}
	}

	const handleSwitchAccount = async () => {
		setIsConnecting(true)
		try {
			await onSwitchAccount?.()
		} catch (error) {
			alert(error.message || 'Failed to open account selection')
		} finally {
			setIsConnecting(false)
		}
	}

	if (account) {
		return (
			<div className={['flex flex-wrap items-center gap-2', className].join(' ')}>
				{/* Connected Wallet & Active Role Badge */}
				<div
					className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-1.5 shadow-lg shadow-black/40 backdrop-blur-md cursor-help"
					title="Wallet role is resolved from the live Sepolia contract."
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-base border border-amber-500/20 shrink-0">
						{roleIcon}
					</div>
					<div className="text-left">
						<div className="flex items-center gap-1.5">
							<span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
								{isRoleRefreshing ? 'Refreshing role...' : roleLabel}
							</span>
							{organizationLabel ? (
								<span className="max-w-[130px] truncate text-[10px] text-slate-400 font-medium">
									• {organizationLabel}
								</span>
							) : null}
						</div>
						<p className="font-mono text-xs font-semibold text-slate-100 leading-tight">
							{shortenAddress(account)}
						</p>
						<div className="mt-0.5 flex items-center gap-1 text-[10px]">
							{isSepolia ? (
								<span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
									Sepolia (11155111)
								</span>
							) : chainId ? (
								<span className="inline-flex items-center gap-1 text-amber-400 font-medium">
									<span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
									Unsupported Chain ({chainId})
								</span>
							) : (
								<span className="text-slate-400">Network unknown</span>
							)}
						</div>
					</div>

					{/* Hover helper popover */}
					<div className="absolute right-0 top-full mt-2 hidden w-72 rounded-xl border border-amber-500/30 bg-[#0F172A] p-3.5 text-left shadow-2xl backdrop-blur-xl group-hover:block z-50">
						<p className="text-[11px] font-bold text-amber-300">💡 Role Detection</p>
						<p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
							ScholarChain checks this address against <code className="text-amber-200">ScholarChainV2.sol</code> on Sepolia. Roles determine write permissions for minting and governance.
						</p>
					</div>
				</div>

				{/* Switch Account */}
				<button
					type="button"
					onClick={handleSwitchAccount}
					disabled={isConnecting}
					className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
					title="Switch accounts inside MetaMask"
				>
					{isConnecting ? 'Opening...' : 'Switch'}
				</button>

				{/* Disconnect */}
				<button
					type="button"
					onClick={onDisconnected}
					title="Disconnect wallet session in ScholarChain"
					className="inline-flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
				>
					Disconnect
				</button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-3">
			<div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 border border-white/5 bg-white/5 px-2.5 py-1 rounded-lg">
				<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
				<span>Sepolia Public RPC Active</span>
			</div>
			<button
				type="button"
				onClick={handleConnect}
				disabled={isConnecting}
				className={[
					'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200',
					'border border-amber-500/40 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20',
					'hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70',
					buttonClassName,
					className,
				].join(' ')}
			>
				{isConnecting ? 'Connecting...' : 'Connect Wallet'}
			</button>
		</div>
	)
}
