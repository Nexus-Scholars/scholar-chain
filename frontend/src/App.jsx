import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import IssueCredential from './pages/IssueCredential'
import VerifyCredential from './pages/VerifyCredential'
import MyCredentials from './pages/MyCredentials'
import AdminDashboard from './pages/AdminDashboard'
import Admin from './pages/Admin'
import IssuerApplication from './pages/IssuerApplication'
import {
	connectWallet,
	switchAccountPermissions,
} from './contracts/ScholarChainService'
import {
	getV2Owner,
	INSTITUTION_STATUS,
	resolveInstitutionProfile,
	SEPOLIA_CHAIN_ID,
	switchToSepoliaNetwork,
} from './contracts/ScholarChainV2Service'

function App() {
	const [account, setAccount] = useState('')
	const [chainId, setChainId] = useState('')
	const [isWalletReady, setIsWalletReady] = useState(false)
	const [contractOwner, setContractOwner] = useState('')
	const [isAuthorizedIssuerRole, setIsAuthorizedIssuerRole] = useState(false)
	const [isContractOwner, setIsContractOwner] = useState(false)
	const [organizationLabel, setOrganizationLabel] = useState('')
	const [institutionProfile, setInstitutionProfile] = useState(null)
	const [networkError, setNetworkError] = useState('')
	const [isRoleRefreshing, setIsRoleRefreshing] = useState(false)
	const [roleRefreshVersion, setRoleRefreshVersion] = useState(0)
	const walletEventVersion = useRef(0)

	const refreshWalletState = useCallback(async () => {
		if (!window.ethereum) return { account: '', chainId: '' }
		const version = ++walletEventVersion.current

		const providerAccounts = await window.ethereum.request({ method: 'eth_accounts' })
		const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })

		const next = { account: providerAccounts?.[0] || '', chainId: currentChainId || '' }
		if (version !== walletEventVersion.current) return next
		setAccount(next.account)
		setChainId(next.chainId)
		return next
	}, [])

	useEffect(() => {
		if (!window.ethereum) return undefined

		const handleAccountsChanged = (accounts) => {
		const version = ++walletEventVersion.current
			setIsRoleRefreshing(Boolean(accounts?.[0]))
			setChainId('')
			setContractOwner('')
			setIsAuthorizedIssuerRole(false)
			setIsContractOwner(false)
			setOrganizationLabel('')
			setInstitutionProfile(null)
			setAccount(accounts?.[0] || '')
			window.ethereum
				.request({ method: 'eth_chainId' })
				.then((currentChainId) => {
					if (version === walletEventVersion.current) setChainId(currentChainId || '')
				})
				.catch(() => {
					if (version === walletEventVersion.current) setChainId('')
				})
		}

		const handleChainChanged = (newChain) => {
			setIsRoleRefreshing(Boolean(account))
			setContractOwner('')
			setIsAuthorizedIssuerRole(false)
			setIsContractOwner(false)
			setOrganizationLabel('')
			setInstitutionProfile(null)
			setChainId(newChain || '')
			refreshWalletState().catch(() => {
				setAccount('')
				setChainId('')
			})
		}

		window.ethereum.on('accountsChanged', handleAccountsChanged)
		window.ethereum.on('chainChanged', handleChainChanged)

		const bootstrapWalletState = async () => {
			try {
				await refreshWalletState()
			} catch {
				setAccount('')
				setChainId('')
			} finally {
				setIsWalletReady(true)
			}
		}

		void bootstrapWalletState()

		return () => {
			window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
			window.ethereum.removeListener('chainChanged', handleChainChanged)
		}
	}, [account, refreshWalletState])

	useEffect(() => {
		const refreshInstitutionProfile = (event) => {
			if (event.detail?.address?.toLowerCase() !== account.toLowerCase()) return
			setIsRoleRefreshing(true)
			setRoleRefreshVersion((version) => version + 1)
		}
		window.addEventListener('scholarchain:institution-profile-updated', refreshInstitutionProfile)
		return () => window.removeEventListener('scholarchain:institution-profile-updated', refreshInstitutionProfile)
	}, [account])

	useEffect(() => {
		let mounted = true

		const loadRoleState = async () => {
			if (!account) {
				setContractOwner('')
				setIsAuthorizedIssuerRole(false)
				setIsContractOwner(false)
				setOrganizationLabel('')
				setInstitutionProfile(null)
				setIsRoleRefreshing(false)
				return
			}
			if (!chainId || (parseInt(chainId, 16) !== Number(SEPOLIA_CHAIN_ID) && chainId !== SEPOLIA_CHAIN_ID)) {
				setContractOwner('')
				setIsAuthorizedIssuerRole(false)
				setIsContractOwner(false)
				setOrganizationLabel('')
				setInstitutionProfile(null)
				setIsRoleRefreshing(Boolean(account && !chainId))
				return
			}

			setIsRoleRefreshing(true)
			try {
				const [ownerAddress, profile] = await Promise.all([
					getV2Owner(),
					resolveInstitutionProfile(account, true),
				])

				if (!mounted) return

				const normalizedAccount = account.toLowerCase()
				const normalizedOwner = ownerAddress.toLowerCase()
				const ownerMatch = normalizedAccount === normalizedOwner
				const authorizedIssuer = profile?.status === INSTITUTION_STATUS.APPROVED

				setContractOwner(ownerAddress)
				setIsContractOwner(ownerMatch)
				setIsAuthorizedIssuerRole(authorizedIssuer)
				setInstitutionProfile(profile)
				setOrganizationLabel(
					ownerMatch
						? 'ScholarChain Governance Admin'
						: authorizedIssuer
						? profile?.name || 'Approved Institution'
						: '',
				)
				setIsRoleRefreshing(false)
			} catch {
				if (!mounted) return
				setContractOwner('')
				setIsAuthorizedIssuerRole(false)
				setIsContractOwner(false)
				setOrganizationLabel('')
				setInstitutionProfile(null)
				setIsRoleRefreshing(false)
			}
		}

		void loadRoleState()

		return () => {
			mounted = false
		}
	}, [account, chainId, roleRefreshVersion])

	const isSepolia = useMemo(() => {
		if (!chainId) return false
		const numericChain = parseInt(chainId, 16)
		return numericChain === Number(SEPOLIA_CHAIN_ID) || chainId === SEPOLIA_CHAIN_ID
	}, [chainId])

	const handleSwitchNetwork = useCallback(async () => {
		setNetworkError('')
		try {
			await switchToSepoliaNetwork()
			await refreshWalletState()
		} catch (err) {
			setNetworkError(err.message || 'Failed to switch network')
		}
	}, [refreshWalletState])

	const handleConnectWallet = useCallback(async () => {
		await connectWallet()
		setIsRoleRefreshing(true)
		setContractOwner('')
		setIsAuthorizedIssuerRole(false)
		setIsContractOwner(false)
		setOrganizationLabel('')
		setInstitutionProfile(null)
		await refreshWalletState()
	}, [refreshWalletState])

	const handleSwitchAccount = useCallback(async () => {
		const result = await switchAccountPermissions()
		if (result.account.toLowerCase() !== account.toLowerCase() || result.chainId !== chainId) {
			setIsRoleRefreshing(Boolean(result.account))
			setContractOwner('')
			setIsAuthorizedIssuerRole(false)
			setIsContractOwner(false)
			setOrganizationLabel('')
			setInstitutionProfile(null)
		}
		await refreshWalletState()
	}, [account, chainId, refreshWalletState])

	const handleDisconnectWallet = useCallback(() => {
		setIsRoleRefreshing(false)
		setContractOwner('')
		setIsAuthorizedIssuerRole(false)
		setIsContractOwner(false)
		setOrganizationLabel('')
		setInstitutionProfile(null)
		setAccount('')
		setChainId('')
	}, [])

	const walletState = useMemo(
		() => ({
			account,
			setAccount,
			chainId,
			setChainId,
			isSepolia,
			isWalletReady,
			isRoleRefreshing,
			contractOwner,
			isAuthorizedIssuerRole,
			isContractOwner,
			organizationLabel,
			institutionProfile,
			roleLabel: !account ? 'Visitor' : !chainId ? 'Checking Network' : !isSepolia ? 'Wrong Network' : isRoleRefreshing ? 'Refreshing role' : isContractOwner ? 'Governance Admin' : isAuthorizedIssuerRole ? 'Approved Institution' : 'Wallet Holder',
			roleIcon: isContractOwner ? '🛡️' : isAuthorizedIssuerRole ? '🏛️' : '🎓',
			handleConnectWallet,
			handleSwitchAccount,
			handleDisconnectWallet,
			handleSwitchNetwork,
		}),
		[
			account,
			chainId,
			isSepolia,
			isWalletReady,
			isRoleRefreshing,
			contractOwner,
			isAuthorizedIssuerRole,
			isContractOwner,
			organizationLabel,
			institutionProfile,
			handleConnectWallet,
			handleSwitchAccount,
			handleDisconnectWallet,
			handleSwitchNetwork,
		],
	)

	return (
		<BrowserRouter>
			<div className="min-h-screen bg-[#070A10] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
				{/* Background ambient lighting for deep dark academic feel */}
				<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
					<div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-900/10 blur-[140px]" />
					<div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-950/20 blur-[160px]" />
					<div className="absolute -bottom-20 left-1/3 h-[500px] w-[600px] rounded-full bg-slate-900/40 blur-[150px]" />
				</div>

				{!isSepolia && chainId && account ? (
					<div className="relative z-30 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs font-semibold text-amber-200 backdrop-blur-md flex items-center justify-center gap-3">
						<span>⚠️ You are connected to an unsupported network (Chain ID: {chainId}). Switch to Sepolia Testnet to interact with V2 smart contract.</span>
						<button
							type="button"
							onClick={handleSwitchNetwork}
							className="rounded-md bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
						>
							Switch to Sepolia
						</button>
						{networkError ? <span className="text-rose-400 font-normal">({networkError})</span> : null}
					</div>
				) : null}
				{account && !chainId ? <div className="relative z-30 border-b border-white/10 bg-slate-900 px-4 py-2 text-center text-xs text-slate-300">Checking wallet network...</div> : null}
				{account && isRoleRefreshing ? <div className="relative z-20 border-b border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-center text-xs text-indigo-200">Refreshing wallet role and account data...</div> : null}

				<Navbar walletState={walletState} />

				<main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
					<Routes>
						<Route path="/" element={<Home walletState={walletState} />} />
						<Route path="/issue" element={<IssueCredential key={`${account}-${chainId}`} walletState={walletState} />} />
						<Route path="/verify" element={<VerifyCredential />} />
						<Route path="/dashboard" element={<MyCredentials key={`${account}-${chainId}`} walletState={walletState} />} />
						<Route path="/issuer-dashboard" element={<AdminDashboard key={`${account}-${chainId}`} walletState={walletState} />} />
						<Route path="/issuer-application" element={<IssuerApplication key={`${account}-${chainId}`} walletState={walletState} />} />
						<Route path="/admin" element={<Admin key={`${account}-${chainId}`} walletState={walletState} />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}

export default App
