# ScholarChain V2 Security and Governance Audit

**Scope:** Repository snapshot on `codex/v2-scholar-chain` (commit `5555070` before this audit), especially `contracts/ScholarChainV2.sol`, frontend V2 services/components, ABI/config, README, and deployment/system docs. This is a code and documentation review, not an independent on-chain bytecode audit or accreditation review. No contract was deployed or changed.

**System classification:** Sepolia prototype with public read access and permissioned issuer governance. The contract owner approves, rejects, suspends and reactivates institutions and revokes credentials. The chain makes recorded state independently readable; it does not independently establish that an issuer is a real university or that an award is true.

## Findings ordered by severity

### HIGH — Approved issuer identity can be replaced without reapproval

- **Finding:** An approved address can change its `profileURI` while remaining approved. The app derives the issuer's displayed name, logo and website from the current profile URI, so a compromised or malicious issuer key can change how past credentials are presented and impersonate another institution in the UI.
- **Actual code path:** `updateInstitutionProfile()` permits both `Pending` and `Approved`, changes `institutions[msg.sender].profileURI`, and leaves `status` unchanged. `resolveInstitutionProfile()` fetches that current URI and uses its `name`, `logo`, and `website` when formatting credentials. The event records old/new URI but the frontend does not show that history.
- **Attack/viva question:** “After ABC University is approved, can its wallet replace its profile with another university’s name and logo while keeping its approved badge?” Yes, in the current contract and UI.
- **Current protection:** The transaction is signed by the registered institution address and `InstitutionProfileUpdated` emits both URIs.
- **Limitation:** Signature proves control of the approved wallet, not that new profile fields are legitimate. No reapproval, immutable identity fields, profile version, or history display exists. The `approvedAt` timestamp remains unchanged.
- **Recommended fix:** Require an approved profile change to move the institution back to `Pending` (and gate minting until reapproved), or freeze identity fields after approval. Keep a versioned approval record and make profile changes/history and the approval timestamp visible. Verify institutional domains/registry records out of band.
- **Fix now or future work:** Future contract change; do not silently migrate or alter live behavior. UI should clearly label profile data as issuer-supplied and current.

### HIGH — One owner controls all governance and credential revocation

- **Finding:** `Ownable` centralizes the platform's critical controls in one key. Owner compromise permits approving malicious issuers, rejecting/suspending legitimate issuers, reactivating them, and revoking any credential. Owner loss can make those actions unavailable; ownership transfer is possible only if the current owner can still act.
- **Actual code path:** `approveInstitution`, `rejectInstitution`, `suspendInstitution`, `reactivateInstitution`, and `revokeCredential` are `onlyOwner`; constructor assigns ownership to deployer. There is no timelock, quorum, role separation, or on-chain appeal process.
- **Attack/viva question:** “How is this decentralized if one admin approves everyone?” Verification/read access is public, but issuer admission and key governance are permissioned and owner-controlled.
- **Current protection:** Owner-only access blocks arbitrary accounts from calling these controls; Ownable has ownership transfer/renunciation mechanisms inherited from OpenZeppelin.
- **Limitation:** A single compromised key has full governance authority. A lost or renounced owner may permanently disable governance actions. The chain does not enforce institutional due process.
- **Recommended fix:** Production deployment should use a well-governed multisig (with hardware-backed signers and recovery policy); consider a timelock and narrowly scoped roles. DAO governance is not automatically safer and needs accountable membership, emergency controls, and upgrade/change procedures.
- **Fix now or future work:** Future governance/deployment design. No change to live owner or contract requested.

### HIGH — Institution authenticity is an off-chain trust decision

- **Finding:** Approval records that an address was accepted by the owner; it does not prove the address belongs to a legally recognized, accredited institution or that the profile's domain, email, or claims are authentic.
- **Actual code path:** `approveInstitution(address)` checks only that the address has `Pending` status. `applyForInstitution(profileURI)` checks only that the URI is nonempty. Profile JSON is fetched by the frontend and its fields are displayed without independent domain/accreditation verification.
- **Attack/viva question:** “Can a university forge a fake achievement, and does blockchain prove the certificate is true?” An approved issuer can submit false claims; the chain proves that the approved key recorded them, not that the underlying achievement occurred.
- **Current protection:** Only the owner can approve applicants; only approved addresses can mint. Transactions and issuer addresses are publicly auditable.
- **Limitation:** No built-in accreditation oracle, domain proof, email challenge, legal identity check, or external audit evidence validation.
- **Recommended fix:** Publish a documented manual review policy and evidence trail, verify domain control and authoritative accreditation/registry sources, record what evidence was checked and when, and use a multisig for approval. Clearly label issuer assertions versus independently verified facts.
- **Fix now or future work:** Operational trust boundary to disclose now; verification workflow is future work.

### HIGH — Public wallet lookup exposes educational records

- **Finding:** Any visitor can enumerate the credential token IDs for any supplied wallet and retrieve credential IDs, titles, issuer, issue time, category, revocation state, holder address, and metadata URI. The frontend explicitly offers public wallet portfolio lookup.
- **Actual code path:** `getCredentialsOfHolder(address)` and `getCredential(tokenId)` are public view functions; `VerifyCredential.jsx` exposes a wallet lookup without authentication. All chain events/storage are public regardless of the UI.
- **Attack/viva question:** “Can I view someone's entire academic history by wallet?” Yes, within the contract's records; associating a wallet with a person may be possible from public activity or other data.
- **Current protection:** None at the contract level; public read access is a blockchain property. Hiding a lookup page would not make the records private.
- **Limitation:** No consent gate, selective disclosure, private storage, or access control. Public immutable records can be copied and correlated indefinitely.
- **Recommended fix:** Minimize personal data on-chain and in metadata, obtain informed consent before issuance, document public discoverability, and design future selective-disclosure/zero-knowledge proofs or privacy-preserving credential formats. Avoid storing sensitive student details or certificate scans on public IPFS.
- **Fix now or future work:** Disclose now; privacy architecture is future work and may require a redesigned system.

### MEDIUM — Suspended issuer can bypass suspension by reapplying

- **Finding:** `applyForInstitution` rejects only an already `Approved` institution. An address in `Suspended` status can call it, overwrite its profile, and change its status to `Pending`; the owner can then approve it. This bypasses the intended suspension state and audit meaning.
- **Actual code path:** `applyForInstitution()` tests `institution.status == Approved` only, then unconditionally sets `Pending`. `suspendInstitution()` sets `Suspended`; no explicit unsuspend/reapply policy is enforced in `applyForInstitution`.
- **Attack/viva question:** “Does suspension permanently prevent minting?” It prevents minting while status is `Suspended`, but the same key can apply again and potentially regain approval.
- **Current protection:** The suspended issuer cannot mint until status becomes `Approved`; the owner must approve the new pending application.
- **Limitation:** Reapplication discards the visible status distinction and may bypass a deliberate owner suspension rationale.
- **Recommended fix:** Define policy explicitly: prohibit reapplication while suspended, or add an owner-controlled unsuspension/reapplication path with reason and history. Do not let the applicant self-reset its status.
- **Fix now or future work:** Future contract change; disclose now.

### MEDIUM — Credential serial collision across institutions

- **Finding:** Credential IDs are globally unique strings, not namespaced by issuer. Two independent institutions choosing the same serial cannot both mint; the second transaction reverts. A malicious issuer could also reserve another institution's expected serial first.
- **Actual code path:** `mapping(string => bool) credentialIdExists`; `mintCredential()` rejects any already-used exact string and sets it globally.
- **Attack/viva question:** “Can two universities both issue credential `2026-001`?” No, not with this global uniqueness check.
- **Current protection:** Exact duplicate strings are rejected, avoiding two records with the exact same displayed ID.
- **Limitation:** No issuer namespace, normalization, case-folding, or bound on string length. Near-duplicates (`abc`, `ABC`, whitespace variants) can coexist; an issuer can squat on a serial.
- **Recommended fix:** Use a composite identity such as `(issuer address, institution year, serial)` or a canonical hash of issuer namespace plus serial. UI can generate UUIDs and display a human-readable issuer/year/serial separately. Enforce maximum lengths and canonicalization.
- **Fix now or future work:** Future contract version; current UI must explain global uniqueness.

### MEDIUM — Metadata integrity depends on URI type and external availability

- **Finding:** The contract accepts any nonempty URI. A URI is not inherently immutable: `https://` content can change, gateways can disappear, and images can be hosted separately from JSON. IPFS CIDs identify content, but retrieval still depends on pinning/gateway availability. The default data URI is embedded in token storage and therefore stable, but makes minting/storage expensive as it grows.
- **Actual code path:** `mintCredential()` only checks `bytes(metadataURI).length > 0`; `_setTokenURI` stores it. `fetchV2Metadata()` fetches arbitrary HTTP(S) or an IPFS gateway, and profile resolution does likewise. `buildCredentialMetadataURI()` creates a base64 JSON data URI; image/logo URIs can still be mutable.
- **Attack/viva question:** “Can metadata change? What if IPFS disappears?” HTTPS can change; an unpinned IPFS object may become unavailable. A CID detects content mismatch but does not guarantee availability.
- **Current protection:** On-chain URI itself is stable after mint; IPFS content addressing protects fetched bytes from silently matching a different CID.
- **Limitation:** No scheme policy, URI size limit, pinning SLA, hash of image bytes, or content availability guarantee. A `data:` JSON URI does not make its referenced image immutable.
- **Recommended fix:** Production: canonical JSON and all media stored under content-addressed CIDs, pinned by multiple independent providers, with issuer-signed manifest and durable backups; store the CID or content hash on-chain and validate fetched bytes. Consider a digest for image/document as well. Avoid mutable HTTPS for authoritative fields.
- **Fix now or future work:** Document now; content pinning, hash validation, and URI restrictions are future work.

### MEDIUM — Frontend fetches issuer-controlled URLs without resource limits

- **Finding:** An approved issuer can commit a huge data URI or point at arbitrary remote metadata/profile content. The browser fetch paths do not set a response-size limit, timeout, schema validation, or content-type check. This can consume memory/network, hang lookups, leak visitor IP/referrer context to a remote host, or display misleading data. It is browser-side fetching, not evidence of server-side SSRF.
- **Actual code path:** `fetchV2Metadata(uri)` decodes data URIs or calls `fetch(url)` and parses the full JSON response. `resolveInstitutionProfile()` and credential UI use the fetched values. Card/modal image `src` values and institution website links are derived from metadata.
- **Attack/viva question:** “Can an approved issuer make verification unsafe with malicious metadata?” It can supply malicious/oversized links/content; React renders text as escaped text, which reduces ordinary HTML injection, but remote resource loading and misleading destinations remain.
- **Current protection:** Metadata is parsed as JSON and displayed as React text; no `dangerouslySetInnerHTML` appears in reviewed components. Browser same-origin policy limits reading cross-origin responses unless CORS allows it.
- **Limitation:** No size/time bounds, schema/type validation, URI allowlist, CSP review, or link scheme validation is evident. Images and external links cause third-party requests.
- **Recommended fix:** Restrict supported URI schemes; impose size and timeout limits; validate schema and field lengths; sanitize/allowlist link protocols; show external links as untrusted issuer-supplied content; consider a controlled metadata proxy with limits and privacy controls.
- **Fix now or future work:** Frontend hardening is a safe follow-up; no contract behavior change required.

### MEDIUM — Unbounded on-chain arrays make list reads scale poorly

- **Finding:** Institution, holder credential, and issuer credential arrays grow monotonically. The contract returns complete arrays, and frontend list functions make one call per token then fetch metadata, potentially in parallel. RPC response limits, latency, rate limits, and browser memory make full enumeration unreliable as the prototype grows.
- **Actual code path:** `institutionList`, `credentialIdsByHolder`, and `credentialIdsByIssuer` are append-only; `getCredentialsOfHolder` and `getCredentialsOfInstitution` return entire arrays; `getV2Institutions` and credential list services load whole lists.
- **Attack/viva question:** “Will this work with millions of credentials?” Not with the present full-array reads and per-item fetch pattern.
- **Current protection:** Data is append-only, avoiding index invalidation; a direct token ID lookup is available.
- **Limitation:** No pagination, event indexer, query bounds, or documented maximums. One unusually large holder/institution list can fail a UI request.
- **Recommended fix:** Add paginated slice getters in a future version and use an indexed event/subgraph/API for discovery, with the contract as source of truth. Preserve single-token verification as a bounded path.
- **Fix now or future work:** Future architecture; prototype scale limitation.

### MEDIUM — Ownership approvals are accepted but transfer always reverts

- **Finding:** ERC-721 `approve` and `setApprovalForAll` remain usable even though their authorization cannot transfer a credential. This is confusing and could cause users or integrators to believe an operator can move it.
- **Actual code path:** No override disables inherited ERC-721 approval methods. `transferFrom`/both `safeTransferFrom` overloads reach `_update`; when there is an existing owner and destination is nonzero it reverts `TransferNotAllowed`.
- **Attack/viva question:** “Can an approved marketplace/operator transfer this token?” No; all normal transfer paths revert. The approval itself may still be set and emit standard events.
- **Current protection:** `_update()` blocks transfers after `super._update`; revert rolls back the whole state transition, so owner/balance remain unchanged. Mint succeeds because `previousOwner == address(0)`; a burn to zero would pass this guard if an exposed internal burn path existed, but this contract exposes no public burn function.
- **Limitation:** Allowing approvals suggests transfer capability and creates misleading approval records; there is no external burn/recovery method. ERC-5192 `locked(tokenId)` would standardize lock discovery and `Locked` events, improving interoperability, but does not by itself disable approvals or solve recovery. It should be considered in a future contract, not migrated automatically.
- **Recommended fix:** For a new deployment/version, explicitly reject or clear approvals and implement ERC-5192 consistently; disclose current behavior in UI. Keep transfer-blocking tests in that future contract's test suite.
- **Fix now or future work:** Safe frontend/docs clarity now; ERC behavior change only in a reviewed future deployment.

### MEDIUM — Wallet loss has no recovery path

- **Finding:** Credentials are permanently bound to the mint recipient address. A student who loses the private key cannot access the wallet or move tokens. Revocation does not reassign ownership.
- **Actual code path:** `_update` blocks nonzero-owner to nonzero-recipient changes; no holder recovery, burn, or identity migration function exists. `revokeCredential()` only flips `revoked`.
- **Attack/viva question:** “What happens if a student loses their wallet?” The credential becomes practically inaccessible to them; an institution/owner may revoke and issue a new token to a replacement address, but the contract does not prevent old and replacement records coexisting or formally link them.
- **Current protection:** Non-transferability reduces unauthorized resale/account transfer.
- **Limitation:** No proof-of-personhood, recovery authority, guardian scheme, or migration audit trail. Owner reissue is a manual workaround, not a wallet recovery mechanism.
- **Recommended fix:** Define a documented identity verification and revoke/reissue procedure; future designs may use recovery wallets, account abstraction/social recovery, or controlled identity migration with an immutable migration event and strict safeguards.
- **Fix now or future work:** Document now; future contract/account design.

### MEDIUM — Blockchain address is not a verified human identity

- **Finding:** One person can control multiple wallets, and one wallet may be shared or controlled by an organization. The contract binds credentials to an address only; it does not deduplicate people or prove the holder's legal identity.
- **Actual code path:** `mintCredential(student, ...)` accepts any nonzero address; no identity/uniqueness registry or student consent signature is required.
- **Attack/viva question:** “Can one person own several wallets?” Yes. “Does the wallet prove who earned the credential?” No.
- **Current protection:** A zero address is rejected; the recipient address is publicly recorded.
- **Limitation:** No Sybil resistance or legal-person binding. A wrong-address typo can create an inaccessible record.
- **Recommended fix:** Describe the subject as the wallet address unless a separate identity proofing process exists; add pre-issuance address confirmation and an institutional correction/reissue policy.
- **Fix now or future work:** Documentation and UI wording now; identity linkage is future work.

### MEDIUM — Revocation is owner-only; issuer cannot correct its own issuance

- **Finding:** An issuing institution cannot revoke a mistaken or fraudulent credential itself. Only platform owner can do so, creating delay and governance dependency.
- **Actual code path:** `revokeCredential(uint256)` has `onlyOwner`; it does not check the issuer or institution status. It checks existence and already-revoked state, then sets `revoked = true`.
- **Attack/viva question:** “Why can the issuer not revoke its own credential?” The current policy centralizes revocation in platform governance, presumably to constrain issuers, but no policy rationale or request workflow is encoded.
- **Current protection:** Issuers cannot unilaterally invalidate records; revocation is auditable and does not erase the token or history.
- **Limitation:** Owner key is a single point; legitimate errors depend on owner availability. The owner can revoke credentials from any issuer, including currently active institutions.
- **Recommended fix:** Decide policy explicitly. Issuer-only is responsive but gives issuers unilateral power; issuer-or-governance balances responsiveness with dispute oversight; governance-only offers strong control but poor responsiveness. A production design could let issuer initiate revocation and require governance/appeal rules, with reason codes and events.
- **Fix now or future work:** Future policy/contract change; no automatic change to live contract.

### LOW — Live V2 address and legacy V1 configuration disagree

- **Finding:** Repository contains two distinct contract addresses. V2 service and README name `0xf5716dEbdEe3E5aADD1fB4975EA2dc65Ceb59479`; legacy `frontend/src/contracts/config.js` names `0xCE658Cf0BC19943549BDE3f141daA4bd6B86B3Ee`, used by the old `ScholarChainService.js` and old ABI. A reader may mistake the V1 address for the active V2 deployment.
- **Actual code path:** `ScholarChainV2Service.js` hardcodes V2 address and inline V2 ABI; `ScholarChainService.js` imports `config.js` and `abi.json` for legacy V1 calls. README calls the V2 address active; deployment guide asks users to deploy their own contract and does not identify an address.
- **Attack/viva question:** “Which address is the current contract, and how do you know the frontend uses that ABI?” V2 paths use the V2 address; legacy code retains a different V1 address/ABI.
- **Current protection:** V2 service has its own explicit address and ABI, and README links the V2 address to Sepolia Etherscan.
- **Limitation:** No shared chain/address manifest or checked-in deployment verification record. Repository alone cannot prove either address contains the expected bytecode or that the README address is the intended live deployment.
- **Recommended fix:** Maintain one chain-specific deployment manifest with contract version, address, deployment transaction/block, compiler/settings, runtime bytecode verification link, and ABI provenance. Clearly mark legacy V1 config; add runtime chain/address verification.
- **Fix now or future work:** Fix docs/configuration clarity now after independently verifying deployment details; do not assume addresses are correct.

### LOW — Verification status wording overstates what is verified

- **Finding:** UI labels a non-revoked token “VERIFIED” / “VALID & VERIFIED”. That proves contract state and non-revocation, not authenticity of identity, institution accreditation, achievement, or mutable external metadata.
- **Actual code path:** `CredentialCard.jsx` derives `VERIFIED` from `!credential.revoked`; `CredentialDetailsModal.jsx` uses `VALID & VERIFIED`. `isCredentialValid()` likewise checks existence and revoked flag only.
- **Attack/viva question:** “Does blockchain guarantee the truth of the certificate?” No; it guarantees only that the chain currently records a non-revoked credential minted by an approved address at the time of minting.
- **Current protection:** Holder/issuer/token/status values are read from contract state; revoked state is displayed.
- **Limitation:** The word “verified” can be understood as real-world validation; current profile and media remain issuer-supplied.
- **Recommended fix:** Prefer “On-chain record found” / “Not revoked on Sepolia” and explain the exact checks; distinguish chain-state verification from institutional/achievement validation.
- **Fix now or future work:** Safe frontend/docs change now.

### LOW — No credential URI or text bounds; storage and gas can be inflated

- **Finding:** Credential ID, title, metadata URI, and profile URI only need be nonempty. Very long strings increase transaction calldata, persistent storage, logs, and frontend processing costs.
- **Actual code path:** `applyForInstitution`, `updateInstitutionProfile`, and `mintCredential` check `bytes(...).length == 0` but no maximum length or URI schema.
- **Attack/viva question:** “Can an approved issuer submit enormous metadata?” The issuer can submit a very large URI/data URI subject to transaction and block gas limits, increasing cost and degrading retrieval/display.
- **Current protection:** Ethereum transaction/block gas ceilings bound what can be committed in one transaction.
- **Limitation:** Bounds are imposed indirectly by gas, not explicit protocol limits; arbitrary strings persist in storage and events.
- **Recommended fix:** Add documented maximum byte lengths, URI scheme policy and payload limits in a future contract version and mirror them in frontend validation.
- **Fix now or future work:** UI limit and contract-version change are future work; do not change live behavior.

### DESIGN LIMITATION — ERC-721 is used for non-transferable credentials

- **Finding:** ERC-721 gives token ownership, standard token URI, and wallet tooling integration, but its normal transfer/approval semantics conflict with locked credentials and many wallets/marketplaces may show misleading controls.
- **Actual code path:** Contract inherits `ERC721URIStorage` and blocks owner-to-owner movement only in `_update`; approvals remain inherited.
- **Attack/viva question:** “Why use ERC-721 if credentials cannot transfer?” It provides token IDs, ownership queries, and ecosystem familiarity; however, locked credential standards or non-token credential formats may communicate the semantics better.
- **Current protection:** `_update` prevents transfers through the standard paths.
- **Limitation:** Approval UX and third-party compatibility are confusing; ERC-721 ownership is not legal identity.
- **Recommended fix:** Consider ERC-5192 support for interoperability or a signed verifiable credential architecture in a future version. ERC-5192 is a standardization improvement, not an automatic migration or complete governance/privacy solution.
- **Fix now or future work:** Future architecture.

### DESIGN LIMITATION — No tests are present in the contract package

- **Finding:** `contracts/package.json` exposes only `compile`; no Solidity unit/integration test framework or test files are present in the repository inventory.
- **Actual code path:** Contract package script is `solcjs` compile only; frontend package provides lint/build but no test script.
- **Attack/viva question:** “How did you prove transfer paths, governance edges, and revocation behavior?” The source review can reason about them, but there is no automated regression suite checked in.
- **Current protection:** Solidity compiler can catch syntax/type issues; no behavioral test protection is evidenced.
- **Limitation:** Edge cases may regress unnoticed.
- **Recommended fix:** Add unit tests in a future testing task for all transfer/approval routes, mint, application state transitions, revocation, duplicate IDs, nonexistent IDs, and metadata limits. The requested audit does not add tests.
- **Fix now or future work:** Future work; prominently disclosed.

## Behavior checks from source

| Case | Current behavior | Code basis |
|---|---|---|
| `transferFrom` | Reverts `TransferNotAllowed`; transfer state rolls back | ERC721 route reaches `_update`; existing owner and nonzero recipient |
| Both `safeTransferFrom` overloads | Revert through the same `_update` hook | OpenZeppelin ERC721 safe transfer delegates to transfer path |
| `approve` / `setApprovalForAll` | Can succeed; do not grant a successful transfer | No overrides; transfer still reverts |
| Mint | Succeeds for approved institution and nonzero student | `_safeMint` calls `_update` with `previousOwner == address(0)` |
| Burn | No public burn function exists; internal burn would pass the nonzero-to-zero exception if called | Contract exposes no burn wrapper |
| Nonexistent `getCredential(id)` | Reverts `CredentialDoesNotExist` | `_ownerOf(id) == address(0)` guard |
| Nonexistent `isCredentialValid(id)` | Returns `false` | `owner != 0 && !revoked` |
| Revoked credential | Remains owned/queryable; `getCredential` returns `revoked=true`; validity is false | Revocation flips flag only |
| Suspended institution mint | Reverts `UnauthorizedInstitution` | Mint requires `Approved` |
| Rejected institution mint | Reverts `UnauthorizedInstitution` | Mint requires `Approved` |
| Rejected institution reapplication | Allowed; resets to Pending | `applyForInstitution` blocks only Approved |
| Suspended institution reapplication | Allowed; can reset to Pending | Same condition; governance reapproval still needed |
| Approved institution profile edit | Allowed without status change/reapproval | `updateInstitutionProfile` accepts Approved |

## Trust assumptions and production recommendation

The strongest practical production path is a reviewed contract version with multisig-controlled governance, issuer identity verification tied to authoritative registries/domains, explicit profile version/reapproval rules, bounded and content-addressed metadata with independent pinning and hashes, minimal personal data, and a clear revoke/reissue and lost-wallet policy. For privacy-sensitive credentials, evaluate selective disclosure or signed verifiable credentials before committing personal information to a public chain. None of these properties follows merely from using a blockchain.

## Address inventory

- V2 frontend and README active Sepolia claim: `0xf5716dEbdEe3E5aADD1fB4975EA2dc65Ceb59479` (`frontend/src/contracts/ScholarChainV2Service.js`, `README.md`). The repository's claim is not independent proof of deployment identity.
- Legacy V1 frontend config: `0xCE658Cf0BC19943549BDE3f141daA4bd6B86B3Ee` (`frontend/src/contracts/config.js`; consumed by legacy `ScholarChainService.js`). Treat as legacy until verified.
- README demo governance wallet: `0x52dEc6d91876e874E20b8DA50ea93FADEB277a3c`.
- README demo institution wallet: `0x74E2FbaCb00d4488C36131Cf4372a43F6bE6794d`.
- README demo student wallet: `0x8D665e3D77bcA5141E04a2E0324E53b9Cb91cD6A`.

The three demo wallets are account addresses, not contract addresses. No deployment transaction, bytecode hash, or chain assertion is recorded alongside the V2 constant. Confirm the deployed code and constructor owner on Sepolia before relying on it operationally.

## Review limitations

- No live contract was deployed or modified.
- No Solidity tests exist in the repository; this review is source-based.
- This audit does not prove the on-chain deployment matches this source, independently validate addresses, assess key custody, or validate real-world institution claims.
