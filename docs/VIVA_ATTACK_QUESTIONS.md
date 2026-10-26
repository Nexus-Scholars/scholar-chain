# ScholarChain V2: Difficult Viva Questions and Answers

Answers describe the current repository contract and frontend. “Verified” means checked against the on-chain record unless explicitly stated otherwise.

1. **How is this decentralized if one admin approves everyone?**  
   Credential records and revocation state are publicly readable and independently checkable on Sepolia. Institution approval, suspension, reactivation, rejection, and revocation are permissioned owner actions, so governance is centralized.

2. **What happens if the admin wallet is hacked?**  
   The attacker can exercise owner-only governance, including approving malicious issuers and revoking credentials. The current contract has no multisig requirement, timelock, or emergency recovery process.

3. **What happens if the admin loses its private key?**  
   Owner-only actions may become unavailable. There is no second administrator or recovery mechanism in this contract; use a carefully governed multisig in a future production deployment.

4. **Why can an institution change its profile after approval?**  
   `updateInstitutionProfile` allows both Pending and Approved status and leaves approval status unchanged. That means an approved wallet can change its displayed name/logo/website without reapproval. This is a known governance flaw to address in a future version.

5. **Can an approved institution impersonate another university through its profile?**  
   It can submit a new profile URI containing another name/logo while remaining approved. The current UI resolves issuer display data from that mutable profile. The event history exists on-chain but is not prominently presented.

6. **Does approval prove that an issuer is a real accredited university?**  
   No. It proves that the contract owner approved that address. Domain ownership, legal identity, accreditation, and email ownership require external verification.

7. **Can a university forge a fake achievement?**  
   An approved institution key can mint an assertion with arbitrary title, category, ID, holder, and metadata. Blockchain records who asserted it; it does not establish the achievement's truth.

8. **Does blockchain guarantee the truth of the certificate?**  
   No. It makes the recorded issuer, holder, timestamp, URI, and revocation state auditable. Truth depends on issuer honesty and the governance process.

9. **Can anyone mint a credential?**  
   No. `mintCredential` requires the caller's institution status to be Approved. A compromised approved issuer can mint arbitrary claims, however.

10. **Can a suspended institution still mint?**  
    Not while its status is Suspended; mint requires Approved. But the institution can call `applyForInstitution` again because that function only blocks Approved status, resetting itself to Pending and potentially seeking reapproval.

11. **Can a rejected institution reapply?**  
    Yes. `applyForInstitution` accepts Rejected status and resets it to Pending. The owner must approve it before minting.

12. **Why can an institution not revoke its own credential?**  
    Current policy gives that power only to the owner. This prevents unilateral issuer invalidation but adds a governance bottleneck. A future design must choose explicitly between issuer-only, issuer-or-governance, or governance-only revocation.

13. **Can the owner revoke credentials from any institution?**  
    Yes. `revokeCredential` is owner-only and does not check which institution issued it or the institution's current status.

14. **Does revocation burn or delete a credential?**  
    No. It sets a boolean flag. The token remains owned and queryable, and `getCredential` returns it with `revoked=true`; `isCredentialValid` returns false.

15. **What does `getCredential` do for a nonexistent token?**  
    It reverts with `CredentialDoesNotExist`, because `_ownerOf(tokenId)` is zero.

16. **What does `isCredentialValid` do for a nonexistent token?**  
    It returns false. Its check requires a nonzero owner and a false revoked flag.

17. **Can an institution mint while rejected or suspended?**  
    No. Both states fail the exact Approved-status check in `mintCredential` and revert with `UnauthorizedInstitution`.

18. **Can an institution change its credential metadata after minting?**  
    The on-chain `tokenURI` string is stored at mint and there is no contract setter to replace it. But if it points to HTTP content, that server can serve different bytes later; an image URL inside otherwise immutable JSON can also change.

19. **What if IPFS disappears?**  
    The CID still identifies the expected content, but the content may be unavailable if nobody pins it or gateways fail. Production requires independent pinning and durable backups.

20. **Is a data URI automatically safe and free?**  
    No. It embeds content in the URI and helps make that JSON stable, but larger strings cost more gas/storage. Linked images can remain mutable, and enormous payloads can burden clients.

21. **Can I view someone's entire academic history by wallet?**  
    Any visitor can query the public holder array and credential records. This can expose educational history and allow correlation with other public information.

22. **Does the student consent to public lookup?**  
    The contract has no consent mechanism. Issuers should obtain informed consent and avoid putting sensitive personal information in public chain storage or public metadata.

23. **Can one person have multiple student wallets?**  
    Yes. An Ethereum address is not a verified human identity, and the contract has no person-level deduplication.

24. **What if the student loses the private key?**  
    The student cannot access or transfer the soulbound token. The owner can revoke and an institution may reissue to a new address, but there is no automatic identity link or recovery procedure in the contract.

25. **Why use ERC-721 if credentials cannot transfer?**  
    It supplies token IDs, ownership reads, and familiar wallet/tooling integration. Its standard approvals and transfer controls can confuse users, and token ownership is not legal identity.

26. **Why not ERC-5192?**  
    ERC-5192 standardizes discovery of locked tokens for soulbound interoperability. It would improve signaling, but does not prove issuer authenticity, provide recovery/privacy, or by itself disable approvals. It should be considered in a future version, not migrated automatically.

27. **Can `transferFrom` move a credential?**  
    No. It reaches `_update`, which reverts `TransferNotAllowed` when a token has an existing owner and a nonzero destination. The reverted transaction rolls back the state update.

28. **Can either `safeTransferFrom` overload move it?**  
    No. Both delegate into the same ERC-721 transfer update path, which reaches the same `_update` guard.

29. **Can approvals still be granted?**  
    Yes. Inherited `approve` and `setApprovalForAll` remain enabled, but an approved operator still cannot transfer because every normal transfer reverts. This is confusing and should be clarified or corrected in a future contract.

30. **Why does mint succeed if transfer fails?**  
    On mint, the previous owner is zero. `_update` only rejects when the previous owner is nonzero and the destination is also nonzero, so minting to a student passes.

31. **Can a student burn a token?**  
    There is no public burn function in this contract. The internal `_update` condition would permit a burn to the zero address if an internal burn path were exposed, but none is exposed here.

32. **Can two institutions use the same credential serial?**  
    No. `credentialIdExists` is global across the contract, so the second exact string reverts. There is no institution namespace; use issuer/year/serial or a generated unique ID in a future design.

33. **Are credential IDs case-insensitive or normalized?**  
    No. Solidity string mapping compares exact bytes. Case, whitespace, or Unicode variations can produce distinct IDs that look similar to people.

34. **Can a malicious issuer store a hostile URL or huge metadata?**  
    The contract accepts any nonempty URI and has no explicit length limit. The browser fetches external metadata and displays some links/images. React text rendering is escaped, but there are no resource limits or full schema/protocol checks in the reviewed path.

35. **Is this server-side request forgery?**  
    The reviewed fetch happens in the visitor's browser, so the source does not show a server-side fetcher. Browser-side requests still create privacy, resource exhaustion, external tracking, and misleading-link risks.

36. **Will full wallet/institution history scale to millions of records?**  
    Not with whole-array getters and per-credential calls. RPC response size, rate limits, and client memory will become bottlenecks. Pagination and an event indexer are future scaling work.

37. **What is the difference between Token ID and Credential ID?**  
    Token ID is the sequential numeric identifier assigned by the contract. Credential ID is an issuer-provided serial string, globally unique in the current contract.

38. **Why not just use DigiLocker or a conventional database?**  
    Those may be better fits depending on jurisdiction, identity standards, governance, privacy, and institutional adoption. This prototype demonstrates public auditability and revocation reads; it does not establish that blockchain is superior or replace official document systems.

39. **What does the UI's “Verified” badge actually prove?**  
    The current badge is based on the record being non-revoked and present on the configured Sepolia contract. It does not independently prove accreditation, identity, achievement, or metadata truth.

40. **Which contract address is active?**  
    V2 service and README specify `0xf5716dEbdEe3E5aADD1fB4975EA2dc65Ceb59479`; legacy V1 config specifies `0xCE658Cf0BC19943549BDE3f141daA4bd6B86B3Ee`. Repository claims alone do not prove deployed bytecode identity; verify chain, code, owner, and deployment provenance.

41. **Are there automated contract tests?**  
    None are included in the repository package; `contracts/package.json` has a compile script only. Source reasoning is not a substitute for tests of transfer paths, lifecycle transitions, duplicate IDs, and revocation.

42. **What is the strongest production metadata design?**  
    Canonical JSON and media stored by content-addressed hashes, independently pinned and backed up, with hashes/issuer signatures checked by clients. Keep sensitive personal data off public storage and define availability responsibilities.

43. **What is decentralized here, and what is not?**  
    Public Sepolia state and transaction history are independently readable; no single frontend database is needed for those reads. Issuer admission, suspension/reactivation, rejection, and revocation are controlled by one contract owner, while real-world truth remains an off-chain trust assumption.
