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
			<div className={['flex items-center gap-2.5', className].join(' ')}>
				{/* Connected Wallet & Active Role Badge */}
				<div
					className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2 shadow-lg shadow-black/30 backdrop-blur-md cursor-help"
					title="Wallet role is resolved from the live Sepolia contract."
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-base border border-amber-500/20">
						{roleIcon}
					</div>
					<div className="text-left">
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
								{isRoleRefreshing ? 'Refreshing wallet role...' : roleLabel}
							</span>
							{organizationLabel ? (
								<span className="max-w-[140px] truncate text-[10px] text-slate-400 font-medium">
									• {organizationLabel}
								</span>
							) : null}
						</div>
						<p className="font-mono text-xs font-semibold text-slate-100">{shortenAddress(account)}</p>
						<p className="mt-0.5 text-[10px] text-slate-400">{isSepolia ? 'Sepolia' : chainId ? `Unsupported chain ${chainId}` : 'Network unknown'}</p>
					</div>

					{/* Hover helper popover */}
					<div className="absolute right-0 top-full mt-2 hidden w-64 rounded-xl border border-amber-500/30 bg-[#0F172A] p-3 text-left shadow-xl backdrop-blur-xl group-hover:block z-50">
						<p className="text-[11px] font-bold text-amber-300">💡 Switch roles anytime</p>
						<p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
							Use Switch Account to choose an account. ScholarChain checks its role against the live Sepolia contract.
						</p>
					</div>
				</div>

				<button type="button" onClick={handleSwitchAccount} disabled={isConnecting} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60">
					{isConnecting ? 'Opening...' : 'Switch Account'}
				</button>

				{/* Hide local wallet session; this does not revoke MetaMask permission. */}
				<button
					type="button"
					onClick={onDisconnected}
				title="Hide this wallet in ScholarChain. MetaMask permissions remain connected."
					className="inline-flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
				>
					Hide Wallet
				</button>
			</div>
		)
	}

	return (
		<button
			type="button"
			onClick={handleConnect}
			disabled={isConnecting}
			className={[
				'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
				'border border-amber-500/40 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20',
				'hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70',
				buttonClassName,
				className,
			].join(' ')}
		>
			{isConnecting ? 'Connecting...' : 'Connect Wallet'}
		</button>
	)
}
