# ScholarChain QA Failure Matrix

Branch: `test/failure-matrix`  
Date: 2026-10-26  
Scope: frontend-oriented failure review of `codex/v2-scholar-chain`.

## Execution notes

This checkout was inspected and the requested scenarios were mapped, but this environment has no configured MetaMask wallets, test accounts, or confirmed Sepolia transaction access. Network access to npm/GitHub was unavailable during validation, so runtime, browser, and live-chain scenarios are marked **NOT RUN** rather than reported as passed. Source observations below are static review only. No frontend defect was confirmed strongly enough to justify changing application code during this pass.

## Findings from source review

| ID | Observation | Severity | Status |
|---|---|---|---|
| S-01 | Issue Credential's submit handler requires a connected account and approved issuer role; `signerContract()` checks Sepolia before signing. | Informational | Reviewed |
| S-02 | Issue Credential disables its submit button while a transaction is pending, preventing ordinary duplicate clicks. | Informational | Reviewed |
| S-03 | Issuer Application disables its submit button while its transaction is pending. | Informational | Reviewed |
| S-04 | Admin page renders role-gated content based on `isContractOwner`; contract writes also require signer/contract authorization. Direct URL handling still needs a browser check for the non-admin view. | Informational | Static review; runtime not run |
| S-05 | Public token verification uses a public Sepolia JSON-RPC provider and does not require a connected wallet. RPC outage behavior has not been exercised. | Informational | Static review; runtime not run |

## Test matrix

`NOT RUN` means the scenario needs a browser, wallet, test chain, or controllable network condition that was not available. Expected results are the intended behavior to verify in a live QA session. Severity is the impact if the expected behavior fails.

| ID | Role | Scenario | Steps | Expected | Actual | Severity | Status | Fix |
|---|---|---|---|---|---|---|---|---|
| R-01 | Disconnected visitor | Public verification | Open `/verify`; verify known token | Read-only lookup works without MetaMask | Not run: no runtime/RPC access | High | NOT RUN | — |
| R-02 | Disconnected visitor | Restricted issue/admin routes | Open `/issue`, `/admin`, `/issuer-dashboard` directly | No unauthorized write controls; explain wallet/role requirement | Not run: browser unavailable | High | NOT RUN | — |
| R-03 | Random wallet | Student/default role | Connect a non-issuer wallet; open issue page | Mint form unavailable and clear authorization message shown | Not run: no wallet | High | NOT RUN | — |
| R-04 | Student wallet | Credentials view | Connect student account; inspect `/dashboard` | Only that wallet's credentials displayed | Not run: no wallet | High | NOT RUN | — |
| R-05 | Pending institution | Issue attempt | Open `/issue` as pending issuer | Mint blocked with pending status explanation | Not run: no wallet | High | NOT RUN | — |
| R-06 | Approved institution | Issue permission | Open `/issue` | Mint form available on Sepolia | Not run: no wallet | High | NOT RUN | — |
| R-07 | Suspended institution | Issue attempt | Open `/issue`; attempt mint | Mint rejected by UI and contract | Not run: no wallet | Critical | NOT RUN | — |
| R-08 | Rejected institution | Reapplication | Open application page and submit again | Contract/state policy clearly represented; no misleading success | Not run: no wallet | Medium | NOT RUN | — |
| R-09 | Governance admin | Admin access | Connect owner wallet; open `/admin` | Admin tools load; non-owner cannot execute admin actions | Not run: no wallet | Critical | NOT RUN | — |
| I-01 | Institution applicant | Empty institution name | Submit with name blank | Submission blocked with field-specific message | Not run: no runtime | Medium | NOT RUN | — |
| I-02 | Institution applicant | Malformed email | Enter malformed official email and submit | Client validation rejects malformed email | Not run: no runtime | Medium | NOT RUN | — |
| I-03 | Institution applicant | Fake email | Enter syntactically valid but fake email | UI does not imply email ownership was verified | Not run: no runtime | Medium | NOT RUN | — |
| I-04 | Institution applicant | Invalid website | Enter malformed website URL | Invalid URL is rejected or safely treated as plain text | Not run: no runtime | Low | NOT RUN | — |
| I-05 | Institution applicant | Invalid logo URL | Enter invalid logo URL | Broken image degrades gracefully; no layout failure | Not run: no runtime | Low | NOT RUN | — |
| I-06 | Institution applicant | Huge description | Paste very large description and submit | Bounded input/error is graceful; page remains responsive | Not run: no runtime | Medium | NOT RUN | — |
| I-07 | Institution applicant | Unicode | Enter non-Latin name/description | Text encodes and displays without corruption | Not run: no runtime | Low | NOT RUN | — |
| I-08 | Institution applicant | HTML/script-looking text | Enter `<script>`-looking text in fields | Content displays as text; no script execution | Not run: no runtime | High | NOT RUN | — |
| I-09 | Institution applicant | Data URI logo | Enter data URI in logo field | Unsafe/unsupported scheme is rejected or image safely constrained | Not run: no runtime | Medium | NOT RUN | — |
| I-10 | Institution applicant | Unreachable IPFS URI | Submit profile with unreachable IPFS URI | Profile/application remains usable with fallback/error state | Not run: no runtime | Medium | NOT RUN | — |
| I-11 | Institution applicant | Repeated submission | Double-click submit while pending | One application transaction; button remains locked | Button lock observed in source; runtime not run | High | PARTIAL | — |
| I-12 | Rejected institution | Reapply after rejection | Submit another application from rejected wallet | Contract policy and UI give accurate outcome | Not run: no wallet | Medium | NOT RUN | — |
| I-13 | Suspended institution | Reapply after suspension | Submit from suspended wallet | Contract policy and UI give accurate outcome | Not run: no wallet | High | NOT RUN | — |
| I-14 | Institution applicant | Wrong network | Submit while connected off Sepolia | Signing is blocked with network guidance | Network guard observed in source; runtime not run | High | PARTIAL | — |
| I-15 | Institution applicant | Change wallet mid-form | Fill form, switch account, submit | Application is attributed only to current signer; stale role not trusted | Not run: no wallet | High | NOT RUN | — |
| I-16 | Institution applicant | Refresh during pending transaction | Submit, refresh before confirmation | UI recovers state without falsely claiming success | Not run: no wallet | Medium | NOT RUN | — |
| C-01 | Approved institution | Empty recipient | Submit blank recipient | Rejected before transaction with useful error | Not run: no wallet | High | NOT RUN | — |
| C-02 | Approved institution | Zero address | Submit zero address | Rejected by UI or contract with clear error | Not run: no wallet | High | NOT RUN | — |
| C-03 | Approved institution | Malformed wallet | Submit malformed recipient | Rejected before transaction with useful error | Not run: no wallet | High | NOT RUN | — |
| C-04 | Approved institution | Duplicate credential ID | Mint same serial twice | Contract outcome is clear; no silent overwrite | Not run: no wallet | Medium | NOT RUN | — |
| C-05 | Approved institution | Extremely long credential ID | Submit oversized ID | Graceful validation or contract error; UI remains usable | Not run: no runtime | Medium | NOT RUN | — |
| C-06 | Approved institution | Empty title | Submit without achievement title | Submission blocked | Not run: no runtime | Medium | NOT RUN | — |
| C-07 | Approved institution | All credential categories | Issue each available category | Correct category is recorded and displayed | Not run: no wallet | Medium | NOT RUN | — |
| C-08 | Approved institution | Invalid metadata URI | Use manual malformed URI | Graceful metadata fallback; issuance result accurately shown | Not run: no wallet | Medium | NOT RUN | — |
| C-09 | Approved institution | Huge metadata | Submit very large metadata fields | Useful limit/error; no browser freeze or runaway transaction | Not run: no runtime | High | NOT RUN | — |
| C-10 | Approved institution | Wrong network | Issue while off Sepolia | Signing blocked with network guidance | Network guard observed in source; runtime not run | Critical | PARTIAL | — |
| C-11 | Random wallet | Mint as unapproved wallet | Open issue and attempt mint | UI and contract deny mint | Role check observed in source; runtime not run | Critical | PARTIAL | — |
| C-12 | Suspended institution | Mint after suspension | Attempt mint while suspended | Contract rejects mint | Not run: no wallet | Critical | NOT RUN | — |
| C-13 | Approved institution | Switch wallet before MetaMask confirmation | Start mint and change account in wallet prompt | Transaction cannot be misattributed; failures are explained | Not run: no wallet | Critical | NOT RUN | — |
| C-14 | Approved institution | Reject MetaMask transaction | Reject signing prompt | No success state; actionable error shown | Not run: no wallet | Medium | NOT RUN | — |
| C-15 | Approved institution | Insufficient test ETH | Submit without gas funds | Clear failure; form remains recoverable | Not run: no wallet | Medium | NOT RUN | — |
| C-16 | Approved institution | Refresh while transaction pending | Refresh before receipt | No false success; chain state can be checked after reload | Not run: no wallet | High | NOT RUN | — |
| C-17 | Approved institution | Double-click Issue Credential | Double-click during pending state | Only one pending transaction initiated | Button lock observed in source; runtime not run | Critical | PARTIAL | — |
| C-18 | Approved institution | Issue to own wallet | Set recipient to issuer wallet | Explicit policy outcome; no misleading result | Not run: no wallet | Medium | NOT RUN | — |
| C-19 | Approved institution | Multiple credentials to one student | Issue successive distinct credentials | All records appear without cross-contamination | Not run: no wallet | Medium | NOT RUN | — |
| V-01 | Public visitor | Token ID zero | Verify `0` | Graceful not-found result | Not run: public RPC not exercised | Low | NOT RUN | — |
| V-02 | Public visitor | Negative token ID | Verify `-1` | Input rejected as non-negative integer | Not run: no runtime | Medium | NOT RUN | — |
| V-03 | Public visitor | Letters | Verify alphabetic input | Input rejected without uncaught error | Not run: no runtime | Low | NOT RUN | — |
| V-04 | Public visitor | Massive integer | Paste extremely large numeric string | Input bounded or graceful provider/contract error | Not run: no runtime | Medium | NOT RUN | — |
| V-05 | Public visitor | Nonexistent token | Verify unused positive ID | Clear not-found status | Not run: public RPC not exercised | Low | NOT RUN | — |
| V-06 | Public visitor | Valid token | Verify known valid ID | Correct credential details/status shown | Not run: no known live fixture | High | NOT RUN | — |
| V-07 | Public visitor | Revoked token | Verify revoked ID | Revoked state clearly shown | Not run: no known live fixture | High | NOT RUN | — |
| V-08 | Public visitor | Wallet with zero credentials | Look up empty wallet | Clear empty state | Not run: public RPC not exercised | Low | NOT RUN | — |
| V-09 | Public visitor | Wallet with multiple credentials | Look up holder with several tokens | All records rendered | Not run: no known live fixture | Medium | NOT RUN | — |
| V-10 | Public visitor | Malformed wallet | Wallet lookup with invalid address | Client validation rejects input | Regex validation observed in source; runtime not run | Low | PARTIAL | — |
| V-11 | Public visitor | Address casing | Lookup same address uppercase/lowercase | Equivalent results | Not run: public RPC not exercised | Low | NOT RUN | — |
| V-12 | Public visitor | No MetaMask | Verify token and wallet without extension | Public read-only lookup works | Static provider path observed; runtime not run | High | PARTIAL | — |
| V-13 | Public visitor | MetaMask locked | Verify while extension locked | Public lookup remains independent of wallet lock | Not run: no browser/wallet | Medium | NOT RUN | — |
| A-01 | Non-admin | Revoke nonexistent token | Directly invoke admin URL/action | Admin access denied; no write action | Not run: no wallet/browser | Critical | NOT RUN | — |
| A-02 | Admin | Revoke already revoked token | Search and revoke revoked credential | No second revocation; status remains revoked | Not run: no wallet | Medium | NOT RUN | — |
| A-03 | Admin | Revoke valid token | Revoke existing valid token | Confirmation required; status updates after receipt | Not run: no wallet | Critical | NOT RUN | — |
| A-04 | Non-admin | Manually access `/admin` | Navigate directly as random/student/institution | Admin tools hidden or blocked | Role-conditioned render observed; runtime not run | Critical | PARTIAL | — |
| A-05 | Admin | Switch admin wallet away while page open | Load admin, change account, click action | Stale admin authority cannot execute a transaction | Not run: no wallet | Critical | NOT RUN | — |
| A-06 | Admin | Suspend issuer | Suspend approved institution | Status updates and issuer loses mint ability | Not run: no wallet | Critical | NOT RUN | — |
| A-07 | Suspended institution | Mint after suspension | Attempt mint after admin suspension | Mint denied by contract | Not run: no wallet | Critical | NOT RUN | — |
| A-08 | Admin | Reactivate issuer | Reactivate suspended institution | Status updates and issuer can mint again | Not run: no wallet | Critical | NOT RUN | — |
| N-01 | Any | Offline | Disconnect network during load/read/write | Loading terminates with recoverable error | Not run: no browser/network shaping | High | NOT RUN | — |
| N-02 | Any | Slow network | Throttle RPC and metadata fetch | Loading feedback; no duplicate actions or frozen UI | Not run: no browser/network shaping | Medium | NOT RUN | — |
| N-03 | Any | Blocked RPC | Block Sepolia RPC endpoint | Read/write errors are clear and recoverable | Not run: no network shaping | High | NOT RUN | — |
| N-04 | Any | Failed IPFS gateway | Force gateway failures | Metadata omission does not break credential rendering | Fallback path observed in source; runtime not run | Medium | PARTIAL | — |
| N-05 | Any | Failed metadata fetch | Return HTTP error/invalid JSON | Credential record still displays without metadata | Fallback path observed in source; runtime not run | Medium | PARTIAL | — |
| N-06 | Any | RPC rate limit | Return 429 from provider | Error shown; page does not crash | Not run: no network shaping | High | NOT RUN | — |
| U-01 | Any | 360 px phone | Browse public, issuer, admin pages | No horizontal overflow or clipped controls | Not run: browser unavailable | Medium | NOT RUN | — |
| U-02 | Any | Tablet | Browse principal workflows | Layout adapts without overlap | Not run: browser unavailable | Low | NOT RUN | — |
| U-03 | Any | Laptop | Browse principal workflows | Controls and text remain usable | Not run: browser unavailable | Low | NOT RUN | — |
| U-04 | Any | 1920x1080 projector | Browse principal workflows | Content remains legible and centered | Not run: browser unavailable | Low | NOT RUN | — |

## Automated coverage

No automated tests were added. The frontend package has lint/build scripts but no test runner or existing test suite, and adding a test framework without being able to install dependencies would provide no executable coverage. The matrix identifies browser/contract scenarios for a configured QA session.
