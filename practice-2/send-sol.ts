import "dotenv/config"
import {
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    Connection,
    sendAndConfirmTransaction,
    TransactionInstruction,
} from "@solana/web3.js"
import { MEMO_PROGRAM_ADDRESS, RECIPIENT_ADDRESS } from "./constants"

let privateKey = process.env["SECRET_KEY"]

if (privateKey === undefined) {
    console.log("Add SECRET_KEY to .env!")
    process.exit(1)
}

const asArray = Uint8Array.from(JSON.parse(privateKey))
const sender = Keypair.fromSecretKey(asArray)
const connection = new Connection(clusterApiUrl("devnet"))

console.log(`🔑 Our public key is: ${sender.publicKey.toBase58()}`)

const recipient = new PublicKey(RECIPIENT_ADDRESS)

console.log(`💸 Attempting to send 1 SOL to ${recipient.toBase58()}...`)

const transaction = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient,
    lamports: 1 * LAMPORTS_PER_SOL,
})

transaction.add(sendSolInstruction)

const memoProgram = new PublicKey(MEMO_PROGRAM_ADDRESS)

const memoText = "Hello from Solana!"

const addMemoInstruction = new TransactionInstruction({
    keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from(memoText, "utf-8"),
    programId: memoProgram,
})

transaction.add(addMemoInstruction)

console.log(`📝 memo is: ${memoText}`)

const signature = await sendAndConfirmTransaction(connection, transaction, [sender])

console.log(`✅ Transaction confirmed, signature: ${signature}!`)
