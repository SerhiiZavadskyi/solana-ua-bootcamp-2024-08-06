import "dotenv/config"
import { Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js"
import { getExplorerLink } from "@solana-developers/helpers"
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata"
import { TOKEN_METADATA_PROGRAM_ID_ADDRESS, TOKEN_MINT_ACCOUNT_ADDRESS } from "./constants"

let privateKey = process.env["SECRET_KEY"]
if (privateKey === undefined) {
    console.log("Add SECRET_KEY to .env!")
    process.exit(1)
}
const asArray = Uint8Array.from(JSON.parse(privateKey))
const user = Keypair.fromSecretKey(asArray)
const connection = new Connection(clusterApiUrl("devnet"))
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(TOKEN_METADATA_PROGRAM_ID_ADDRESS)
const tokenMintAccount = new PublicKey(TOKEN_MINT_ACCOUNT_ADDRESS)

const metadataData = {
    name: "Pantera",
    symbol: "PNTR",
    uri: "https://arweave.net/1234",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
}

const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMintAccount.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
)

const transaction = new Transaction()
const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataPDA,
        mint: tokenMintAccount,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
    },
    {
        createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadataData,
            isMutable: true,
        },
    }
)
transaction.add(createMetadataAccountInstruction)

await sendAndConfirmTransaction(connection, transaction, [user])

const tokenMintLink = getExplorerLink("address", tokenMintAccount.toString(), "devnet")
console.log(`✅ Look at the token mint again: ${tokenMintLink}!`)
