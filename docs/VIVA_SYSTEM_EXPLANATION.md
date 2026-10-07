# ScholarChain: Viva System Explanation

ScholarChain is an **academic prototype on the Ethereum Sepolia Testnet**. It demonstrates **decentralized verification with permissioned issuer governance**: the contract owner controls privileged governance actions, while anyone can read credential state through the public RPC.

## What exactly is a token?

It is an ERC-721 token minted by the ScholarChain contract to represent a credential record. The contract assigns it a numeric **Token ID**. The institution's own **Credential ID** is a separate serial/reference string.

## Why does the student need a wallet?

The wallet address identifies the credential holder and receives the token. A student can connect that wallet to view its Credential Vault. Receiving/viewing does not require the student to sign the issuer's mint transaction.

## Does the verifier need MetaMask?

No. The verifier can query a Token ID or public wallet address. Read operations use the app's public Sepolia RPC; MetaMask is needed for actions that submit transactions.

## Who pays gas?

The address that signs a transaction pays its gas in Sepolia test ETH: the institution for applying or minting, and the contract owner for governance actions such as approval or revocation. Public lookups are read-only and do not require a wallet transaction.

## What is stored on chain?

The contract stores institution profile URI and status, and for each credential its unique serial, achievement title, issuer address, issue time, category, revoked flag, holder address and metadata URI. ERC-721 ownership and the token URI are also on chain. The app's default metadata URI contains base64-encoded JSON, so its metadata content is embedded in that URI; an externally hosted URI can instead be provided.

## What is stored in metadata?

The default credential metadata JSON includes the credential name, description, artwork URI (if supplied), institution, Credential ID, category, issue date, recipient address and optional duration. Metadata fields are supplementary to the contract's on-chain credential fields. IPFS is an option for external files/metadata, not a requirement of the default issuance path.

## What does soulbound mean?

It means the ERC-721 cannot be transferred from one user wallet to another. The contract allows minting to the recipient and burning at the token implementation level. The app's revocation operation does not burn the token; it marks the record revoked.

## What happens when revoked?

The contract owner sets the revoked flag. The token and record remain available for lookup and audit, but the app displays the credential as revoked rather than valid. Revocation does not delete the record or transfer the token.

## Why not a normal database?

A database could store the same fields, but its operator controls the records and verification depends on that operator's service. A public blockchain lets verifiers independently read the issuer-recorded data and current revocation state. It does not prove the student's achievement was deserved, guarantee the accuracy of issuer input, or make this system's governance fully decentralized. ScholarChain uses permissioned issuer approval and is currently a Sepolia demo.
