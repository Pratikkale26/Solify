import axios from "axios"
import { Connection,  PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js"
import './App.css'

const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com")
const fromPubkey = new PublicKey("GJncGZ4PmX9YNWRZSDSHinH6Ahbs4rxqN28ukBFFQ7i6")

function App() {

  async function sendSol() {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: new PublicKey("DiKnQgezs33nzVLrWAynaUcdgBYUPyw5St2KFSvZMPhb"),
        lamports: 0.001 * LAMPORTS_PER_SOL
      })
    )

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    // convert the txn to a bunch of byte
    const serilizedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    })

    await axios.post("http://localhost:3000/api/v1/txn/sign", {
      message: serilizedTx,
      retry: false
    })
  }

  return (
    <div>
      Pratik kale
      <input type="text" placeholder='Amount' />
      <input type="text" placeholder='Address'/>
      <button onClick={sendSol}>Submit</button>
    </div>
  )
}

export default App
