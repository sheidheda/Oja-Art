# OjaArt - Decentralized Pixel Art Marketplace

OjaArt is a decentralized platform that brings artists and collectors together, empowering them to create, list, and trade unique pixel art NFTs. Built on the Stacks blockchain using Clarity smart contracts, OjaArt allows artists to monetize their digital art in a fully decentralized environment while enabling collectors to buy and own unique artwork.

## Features

- **Mint and Sell Pixel Art**: Artists can mint pixel art NFTs by uploading details such as the artwork's IPFS hash, name, and description.
- **Set Custom Prices**: Artists list their art at custom prices, making each piece unique and accessible to collectors at different price points.
- **Purchase with STX Tokens**: Collectors can seamlessly purchase artwork using STX tokens, securing ownership of one-of-a-kind digital assets.
- **Platform Fee System**: A 2.5% platform fee on transactions supports the platform’s maintenance.
- **Artist Statistics**: Tracks artists' metrics, including the number of creations, sales, and total earnings, promoting transparency and growth for the artist community.

## Smart Contract Structure

### Key Files

- `oja-art.clar`: Main contract implementing all marketplace functionalities.
- `traits/oja-art-trait.clar`: Interface definition for contract interactions.

## Key Functionalities

### For Artists

- **Create Pixel Art** (`create-pixel-art`): Mint new pixel art by providing an IPFS hash, name, and description. Each piece is added as an NFT on the blockchain.
- **List Pixel Art** (`list-pixel-art`): List minted artwork for sale by setting a price, making it available for collectors to buy.
- **Unlist Pixel Art** (`unlist-pixel-art`): Remove artwork from sale to retain ownership or update the listing.

### For Collectors

- **Buy Pixel Art** (`buy-pixel-art`): Securely purchase listed artwork, transferring ownership in a trustless manner.
- **View Pixel Art Details** (`get-pixel-art`): Access comprehensive details of an artwork by providing its unique ID.
- **View Artist Statistics** (`get-artist-stats`): View an artist’s performance, including artworks created, sales, and total earnings, promoting transparency and reputation building.

### Admin Functionality

- **Set Platform Fee** (`set-platform-fee`): Update the platform fee percentage (admin-only), providing flexibility to adjust fees as needed.

## Error Handling

OjaArt uses specific error codes to handle issues during contract interactions:

- `u100`: Owner-only operation.
- `u101`: Artwork not found.
- `u102`: Artwork already listed for sale.
- `u103`: Artwork not listed for sale.
- `u104`: Invalid price (must be greater than zero).
- `u105`: Insufficient balance for the transaction.
- `u106`: Operation restricted to artwork owner.
- `u107`: Invalid input provided.

## Usage

1. **Minting Art**: Artists mint new pixel art by providing artwork details such as IPFS hash, name, and description.
2. **Listing for Sale**: Once minted, artists can list artwork for sale by setting a price in STX tokens.
3. **Buying Art**: Collectors can browse listed art and purchase pieces, transferring ownership through the smart contract.
4. **Updating Platform Fee**: Admins can adjust the platform fee percentage for sales by using `set-platform-fee`.

## License

MIT License