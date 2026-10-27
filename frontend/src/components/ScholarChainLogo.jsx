export function ScholarChainIcon({ className = 'h-10 w-10' }) {
	return (
		<div className={`relative flex items-center justify-center shrink-0 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-[#070A10] p-1.5 shadow-md shadow-amber-500/10 ${className}`}>
			<svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
				<defs>
					<linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#FDE68A" />
						<stop offset="50%" stopColor="#F59E0B" />
						<stop offset="100%" stopColor="#D97706" />
					</linearGradient>
				</defs>
				{/* Cap / Mortarboard */}
				<path d="M32 14L49 21.5L32 29L15 21.5L32 14Z" fill="url(#logoGold)" />
				<path d="M22 25.5V32C22 35.5 26.5 38 32 38C37.5 38 42 35.5 42 32V25.5" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
				<path d="M45 23.5V34.5C45 35.3 45.7 36 46.5 36" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
				<circle cx="46.5" cy="36" r="1.5" fill="#FDE68A" />

				{/* Interlocking Blockchain Chain */}
				<circle cx="23" cy="48" r="3.5" fill="#0B0F17" stroke="url(#logoGold)" strokeWidth="1.8" />
				<circle cx="32" cy="48" r="4" fill="#F59E0B" />
				<circle cx="41" cy="48" r="3.5" fill="#0B0F17" stroke="url(#logoGold)" strokeWidth="1.8" />
				<line x1="26.5" y1="48" x2="28" y2="48" stroke="#FDE68A" strokeWidth="2" />
				<line x1="36" y1="48" x2="37.5" y2="48" stroke="#FDE68A" strokeWidth="2" />
			</svg>
		</div>
	)
}

export function ScholarChainBrand() {
	return (
		<div className="flex items-center gap-3">
			<ScholarChainIcon className="h-10 w-10" />
			<div className="text-left">
				<div className="flex items-center gap-2">
					<span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-200 transition">
						ScholarChain
					</span>
					<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
						V2 Sepolia
					</span>
				</div>
				<p className="text-[10px] font-medium text-slate-400 tracking-wide">
					by <span className="text-slate-300 font-semibold">Nexus Scholars</span>
				</p>
			</div>
		</div>
	)
}
