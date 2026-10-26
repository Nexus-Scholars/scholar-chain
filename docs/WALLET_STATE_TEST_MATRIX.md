# Wallet State Test Matrix

**Validation status:** Implementation scenarios below have not been exercised against a live MetaMask session. No wallet extension or connected demo browser was available in this repository checkout. “Actual Result” therefore records this limitation; it is not a passing manual test.

| Scenario | Expected Role | Expected UI | Actual Result | Pass/Fail |
|---|---|---|---|---|
| A. Start disconnected | Visitor | Connect Wallet; no wallet-specific data or protected navigation | Not run; MetaMask session required | Not run |
| B. Connect student wallet | Wallet Holder (student only when supported by app data) | Address shown; Sepolia role resolved; credentials loaded for this address | Not run; live contract and wallet required | Not run |
| C. Switch Student → Institution | Approved Institution | Old credentials/profile cleared; institution role and profile load; institution nav appears | Not run; live account switch required | Not run |
| D. Switch Institution → Admin | Governance Admin | Institution data cleared; governance role/nav and admin data load | Not run; live account switch required | Not run |
| E. Switch Admin → Student | Wallet Holder | Admin data cleared; student wallet credentials load; admin nav removed | Not run; live account switch required | Not run |
| F. Switch to unknown/random wallet | Wallet Holder | No institution/admin label; only current wallet's data; no previous credentials | Not run; live account switch required | Not run |
| G. Sepolia → unsupported network | Unresolved / Wrong Network | Wrong Network state; role-specific actions disabled; no valid Sepolia role shown | Not run; live network switch required | Not run |
| H. Switch back to Sepolia | Contract-derived role | Resolve role and institution profile again; refresh current page data | Not run; live network switch required | Not run |
| I. Lock MetaMask | Visitor when provider reports no exposed accounts | Account/role-specific state cleared on provider account event | Not run; MetaMask lock required | Not run |
| J. Remove site account permission | Visitor | Account cleared when provider emits an empty accountsChanged event | Not run; MetaMask permission change required | Not run |
| K. Refresh while wallet remains connected | Contract-derived role | Bootstrap current account and chain, then load only its role/data | Not run; live wallet required | Not run |
| L. Change account rapidly twice | Latest account's contract-derived role | Older async event/role responses ignored; only latest wallet data shown | Not run; rapid live account switches required | Not run |
| M. Open role-protected page, then switch account | Role allowed for current wallet, otherwise authorization required | Old page data is discarded on account/chain change; authorization reflects latest account | Not run; live wallet required | Not run |
| N. Connect on wrong network | Wrong Network | Unsupported-network banner; no Admin/Institution/Wallet Holder role presented as valid | Not run; live wallet/network required | Not run |
| O. Use site “Hide Wallet” control | Visitor in ScholarChain UI | Local session and role data hidden; MetaMask site permission remains connected | Not run; live wallet required | Not run |

## Manual checks for each scenario

Record the visible address and chain, contract-derived role, organization name, navbar links, current page authorization, loaded credential/profile content, and whether any content from the prior account remains. Do not mark a scenario Pass until these are observed in the running app with MetaMask.

## MetaMask limitation

The wallet provider API does not expose a universal dApp disconnect operation. ScholarChain’s “Hide Wallet” control clears its local React session; it does not revoke MetaMask’s site permission or guarantee that MetaMask will stop exposing the account. The “Switch Account” action invokes `wallet_requestPermissions` for `eth_accounts`; support and prompt behavior depend on the provider.
