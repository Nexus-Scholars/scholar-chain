import { useMemo, useState } from 'react'
import { CREDENTIAL_TYPE_OPTIONS } from '../contracts/credentialTypes'
import {
	buildCredentialMetadataURI,
	decodeContractError,
	mintV2Credential,
	V2_CONTRACT_ADDRESS,
} from '../contracts/ScholarChainV2Service'

// ─── Demo Quick-Fill Presets ─────────────────────────────────────────────────
const DEMO_STUDENT = '0x8D665e3D77bcA5141E04a2E0324E53b9Cb91cD6A'
const DEMO_ISSUER = '0x74E2FbaCb00d4488C36131Cf4372a43F6bE6794d'

// ─── Credential type labels matching the ABI enum order ─────────────────────
const TYPE_LABELS = ['Academic', 'Internship', 'Workshop', 'Competition', 'Volunteer', 'Research']

const initialForm = {
	student: '',
	credentialId: '',
	achievementTitle: '',
	credentialType: '0',
	// metadata fields
	issueDate: new Date().toISOString().split('T')[0],
	duration: '',
	description: '',
	imageUri: '',
	// advanced override
	manualMetadataURI: '',
	useManualURI: false,
}

function buildId() {
	const y = new Date().getFullYear()
	const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
	return `SC-${y}-${rand}`
}

export default function IssueCredential({ walletState }) {
	const { account, isAuthorizedIssuerRole, institutionProfile, isSepolia } = walletState
	const [form, setForm] = useState(initialForm)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [result, setResult] = useState(null)
	const [error, setError] = useState('')
	const [metaPreview, setMetaPreview] = useState('')

	// ── Derived values ──────────────────────────────────────────────────────
	const institutionName =
		institutionProfile?.name || (isAuthorizedIssuerRole ? 'ScholarChain Test University' : 'Authorized Institution')

	const computedMetaURI = useMemo(() => {
		if (form.useManualURI && form.manualMetadataURI.trim()) {
			return form.manualMetadataURI.trim()
		}
		if (!form.student || !form.credentialId || !form.achievementTitle) return ''
		return buildCredentialMetadataURI({
			institutionName,
			credentialTitle: form.achievementTitle,
			credentialId: form.credentialId,
			credentialType: TYPE_LABELS[Number(form.credentialType)] ?? 'Academic',
			studentAddress: form.student,
			issueDate: form.issueDate,
			duration: form.duration,
			description: form.description,
			logoUri: institutionProfile?.logo || '',
			imageUri: form.imageUri,
		})
	}, [form, institutionName, institutionProfile])

	const canSubmit =
		form.student &&
		form.credentialId &&
		form.achievementTitle &&
		computedMetaURI

	// ── Handlers ────────────────────────────────────────────────────────────
	const update = (e) => {
		const { name, value, type, checked } = e.target
		setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
	}

	const applyDemoFill = () => {
		setForm((prev) => ({
			...prev,
			student: DEMO_STUDENT,
			credentialId: buildId(),
			achievementTitle: 'Bachelor of Computer Science with Honors',
			credentialType: '0',
			issueDate: new Date().toISOString().split('T')[0],
			duration: '4 years',
			description:
				'Awarded for the successful completion of a four-year Bachelor of Computer Science programme with First Class Honours.',
		}))
		setError('')
		setResult(null)
	}

	const handlePreview = () => {
		setMetaPreview(computedMetaURI ? atob(computedMetaURI.split(',')[1] || '') : '')
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setResult(null)

		if (!account) {
			setError('Please connect your institution wallet in the header first.')
			return
		}
		if (!isAuthorizedIssuerRole) {
			setError(
				`Wallet ${account.slice(0, 6)}...${account.slice(-4)} is not approved as an institution. Switch to demo institution wallet ${DEMO_ISSUER.slice(0, 6)}...${DEMO_ISSUER.slice(-4)}.`
			)
			return
		}
		if (!isSepolia) {
			setError('Please switch your wallet network to Ethereum Sepolia Testnet.')
			return
		}
		if (!computedMetaURI) {
			setError('Fill in all required fields so the metadata URI can be generated.')
			return
		}

		setIsSubmitting(true)
		try {
			const minted = await mintV2Credential({
				student: form.student.trim(),
				credentialId: form.credentialId.trim(),
				achievementTitle: form.achievementTitle.trim(),
				credentialType: Number(form.credentialType),
				metadataURI: computedMetaURI,
			})
			setResult(minted)
		} catch (mintError) {
			setError(decodeContractError(mintError))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="mx-auto max-w-5xl space-y-8">
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<div className="text-center space-y-3">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
					🎓 Institutional Credential Issuance
				</div>
				<h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
					Issue a Soulbound Credential
				</h1>
				<p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
					Mint an immutable, non-transferable ERC-721 academic credential directly to a student’s wallet on Ethereum Sepolia.
				</p>
			</div>

			{/* ── Role Banner & Authorization Guide ─────────────────────────── */}
			<div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 p-5 backdrop-blur-xl shadow-xl">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-xl">
							🏛️
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-white uppercase tracking-wider">
									Issuing Authority:
								</span>
								<span className="text-xs font-semibold text-amber-300 font-serif">
									{institutionName}
								</span>
							</div>
							<p className="font-mono text-[11px] text-slate-400">
								{account ? `Connected: ${account}` : 'No wallet connected (Demonstration Form Mode)'}
							</p>
						</div>
					</div>

					{isAuthorizedIssuerRole ? (
						<span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
							✓ Authorized to Mint on Sepolia
						</span>
					) : (
						<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-right text-xs">
							<span className="font-bold text-amber-300">💡 Demo Institution Wallet:</span>
							<code className="block font-mono text-[10px] text-slate-300 mt-0.5">
								{DEMO_ISSUER}
							</code>
						</div>
					)}
				</div>
			</div>

			{/* ── Main Layout: Form + Concept Sidebar ────────────────────────── */}
			<div className="grid gap-8 lg:grid-cols-3">
				{/* Form Column */}
				<form
					className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0F172A]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
					onSubmit={handleSubmit}
				>
					{/* ── Quick Demo Fill ──────────────────────────────────────── */}
					<div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-4 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
								⚡ Demo Quick-Fill Preset
							</p>
							<button
								type="button"
								onClick={applyDemoFill}
								className="rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/30 hover:border-indigo-400"
							>
								Autofill Demo Values
							</button>
						</div>
						<p className="text-xs text-slate-400 leading-relaxed">
							Populates all fields with verified graduation data for demo student{' '}
							<span className="font-mono text-indigo-300">0x8D66…cD6A</span>.
						</p>
					</div>

					{/* ── Recipient ────────────────────────────────────────────── */}
					<fieldset className="space-y-4">
						<legend className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 w-full">
							1. Student / Recipient Information
						</legend>

						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
							<span>Student Ethereum Wallet Address *</span>
							<input
								name="student"
								value={form.student}
								onChange={update}
								placeholder="0x8D665e3D77bcA5141E04a2E0324E53b9Cb91cD6A"
								className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white font-mono outline-none ring-amber-500 transition focus:ring-2"
								disabled={isSubmitting}
							/>
							<span className="text-[11px] font-normal text-slate-500 normal-case block">
								Must be a valid 42-character Ethereum address. The token is minted directly to this holder.
							</span>
						</label>
					</fieldset>

					{/* ── Credential Details ──────────────────────────────────── */}
					<fieldset className="space-y-4">
						<legend className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 w-full">
							2. Academic Credential Specification
						</legend>

						<div className="grid gap-4 sm:grid-cols-2">
							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
								<span>Credential Serial / ID *</span>
								<div className="flex gap-2">
									<input
										name="credentialId"
										value={form.credentialId}
										onChange={update}
										placeholder="e.g. SC-2026-AB123"
										className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white font-mono outline-none ring-amber-500 transition focus:ring-2"
										disabled={isSubmitting}
									/>
									<button
										type="button"
										onClick={() =>
											setForm((p) => ({ ...p, credentialId: buildId() }))
										}
										className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
										title="Generate random reference code"
									>
										Gen ID
									</button>
								</div>
							</label>

							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
								<span>Credential Category *</span>
								<select
									name="credentialType"
									value={form.credentialType}
									onChange={update}
									className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white outline-none ring-amber-500 transition focus:ring-2"
									disabled={isSubmitting}
								>
									{CREDENTIAL_TYPE_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value} className="bg-slate-900">
											{opt.label}
										</option>
									))}
								</select>
							</label>
						</div>

						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
							<span>Achievement / Degree Title *</span>
							<input
								name="achievementTitle"
								value={form.achievementTitle}
								onChange={update}
								placeholder="e.g. Bachelor of Computer Science with Honors"
								className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white outline-none ring-amber-500 transition focus:ring-2"
								disabled={isSubmitting}
							/>
						</label>

						<div className="grid gap-4 sm:grid-cols-2">
							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
								<span>Official Issue Date</span>
								<input
									type="date"
									name="issueDate"
									value={form.issueDate}
									onChange={update}
									className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white outline-none ring-amber-500 transition focus:ring-2"
									disabled={isSubmitting}
								/>
							</label>

							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
								<span>Course / Degree Duration</span>
								<input
									name="duration"
									value={form.duration}
									onChange={update}
									placeholder="e.g. 4 years / 8 semesters"
									className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white outline-none ring-amber-500 transition focus:ring-2"
									disabled={isSubmitting}
								/>
							</label>
						</div>

						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 space-y-1.5">
							<span>Academic Description / Honors</span>
							<textarea
								name="description"
								value={form.description}
								onChange={update}
								rows={3}
								placeholder="Official citation or remarks..."
								className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-xs text-white outline-none ring-amber-500 transition focus:ring-2"
								disabled={isSubmitting}
							/>
						</label>
					</fieldset>

					{/* ── Metadata preview ─────────────────────────────────────── */}
					{computedMetaURI && !form.useManualURI ? (
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
							<div className="flex items-center justify-between">
								<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
									Decentralized Metadata Builder
								</p>
								<button
									type="button"
									onClick={handlePreview}
									className="text-[11px] font-semibold text-amber-400 hover:underline"
								>
									{metaPreview ? 'Hide JSON Preview' : 'Preview JSON Payload'}
								</button>
							</div>
							<p className="text-[11px] text-slate-400">
								Encodes attributes into a permanent standard <code className="text-amber-300 font-mono">data:application/json;base64</code> URI written to the blockchain.
							</p>
							{metaPreview ? (
								<pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] text-emerald-300 whitespace-pre-wrap break-all font-mono">
									{metaPreview}
								</pre>
							) : null}
						</div>
					) : null}

					{/* ── Submit Button with Role-Aware State ──────────────────── */}
					{isAuthorizedIssuerRole ? (
						<button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							className="w-full rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? '⛓️ Signing and Minting on Sepolia…' : '🎓 Issue Soulbound Credential'}
						</button>
					) : (
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => {
									if (!account) {
										alert('Please connect MetaMask in the header. To mint, use authorized demo account 0x74E2FbaCb00d4488C36131Cf4372a43F6bE6794d.')
									} else {
										alert(`Current wallet (${account.slice(0, 6)}...${account.slice(-4)}) is not an approved issuer. Please switch to demo institution wallet 0x74E2FbaCb00d4488C36131Cf4372a43F6bE6794d to execute on-chain minting.`)
									}
								}}
								className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20"
							>
								🔒 Switch to Demo Institution (0x74E2...794d) to Mint on Sepolia
							</button>
							<p className="text-center text-[11px] text-slate-500">
								Form validation and JSON metadata generator can be evaluated in demonstration mode above.
							</p>
						</div>
					)}
				</form>

				{/* Concept Notes Sidebar */}
				<aside className="space-y-5">
					<div className="rounded-3xl border border-white/10 bg-[#0F172A]/90 p-6 space-y-4">
						<h3 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
							💡 Issuance Specifications
						</h3>
						<div className="space-y-3 text-xs text-slate-400">
							<div className="space-y-1">
								<span className="text-slate-200 font-semibold block">Non-Transferability Guarantee</span>
								<p className="leading-relaxed">
									Credentials minted by this form can never be sold, traded, or transferred to another address. They are bound to the student recipient forever.
								</p>
							</div>
							<div className="space-y-1">
								<span className="text-slate-200 font-semibold block">Gas & Blockchain State</span>
								<p className="leading-relaxed">
									The institution pays a small amount of testnet Sepolia gas to execute the transaction. The recipient pays nothing.
								</p>
							</div>
							<div className="space-y-1">
								<span className="text-slate-200 font-semibold block">Contract Target</span>
								<p className="font-mono text-[10px] text-amber-300 break-all">
									{V2_CONTRACT_ADDRESS}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-3">
						<h3 className="font-serif text-xs font-bold text-indigo-300 uppercase tracking-wider">
							📋 Demonstration Tips for Review
						</h3>
						<p className="text-xs text-slate-300 leading-relaxed">
							1. Click <strong>Autofill Demo Values</strong> to test form validation.
						</p>
						<p className="text-xs text-slate-300 leading-relaxed">
							2. Click <strong>Preview JSON Payload</strong> to view the generated metadata.
						</p>
						<p className="text-xs text-slate-300 leading-relaxed">
							3. Switch to account <code className="text-indigo-200 font-mono">0x74E2...</code> to demonstrate live on-chain minting.
						</p>
					</div>
				</aside>
			</div>

			{/* Success Result */}
			{result ? (
				<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
					<p className="text-xs font-bold text-emerald-300">✅ Credential Issued on Sepolia!</p>
					<p className="text-xs text-emerald-200">
						The credential transaction has been submitted and confirmed by the Sepolia network.
					</p>
					<a
						href={`https://sepolia.etherscan.io/tx/${result.hash}`}
						target="_blank"
						rel="noreferrer"
						className="block font-mono text-[11px] text-amber-300 hover:underline break-all"
					>
						Transaction hash: {result.hash} ↗
					</a>
				</div>
			) : null}

			{/* Error Notice */}
			{error ? (
				<div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
					⚠️ {error}
				</div>
			) : null}
		</section>
	)
}
