import { useRef, useState } from "react";
import axios from "axios";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { toast, ToastContainer } from "react-toastify";
import { PulseLoader } from "react-spinners";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com");

const SendSol = () => {
  const toRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Get public key from localStorage
  const getPublicKeyFromLocalStorage = () => {
    const storedPublicKey = localStorage.getItem("publicKey");
    if (!storedPublicKey) {
      toast.error("Public key not found in localStorage!");
      return null;
    }
    return new PublicKey(storedPublicKey);
  };

  // Create and send the transaction
  async function createTransaction() {
    const toAddress = toRef.current?.value;
    const amount = amountRef.current?.value;

    if (!toAddress || !amount) {
      toast.error("Please enter recipient address and amount");
      return;
    }

    const fromPubkey = getPublicKeyFromLocalStorage();
    if (!fromPubkey) return; // If publicKey is not found, stop here

    try {
      setLoading(true);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: new PublicKey(toAddress),
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const encodedTx = Buffer.from(serializedTx).toString("base64");

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please sign in.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/txn/sign`,
        { message: encodedTx, retry: false },
        { headers: { Authorization: `Bearer ${token}`}}
      );

      setLoading(false);

      // Show success or failure toast
      if (res.data.message) {
        toast.success("Transaction Successful!", {
          position: "top-right",
        });
      } else {
        toast.error("Transaction Failed: " + res.data.message, {
          position: "top-right",
        });
      }

      console.log("Transaction serialized & sent to backend:", encodedTx);
    } catch (error: any) {
      setLoading(false); 
      toast.error(`Failed to create transaction: ${error.message}`);
      console.error("Failed to create transaction:", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-45 bg-gray-900 text-white">
      <ToastContainer />
      <h1 className="text-3xl font-semibold mb-6 text-center">Solify - Swap SOL</h1>

      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Amount (SOL)</label>
          <input
            type="text"
            placeholder="Enter amount"
            ref={amountRef}
            className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Recipient Address</label>
          <input
            type="text"
            placeholder="Enter address"
            ref={toRef}
            className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={createTransaction}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition duration-200"
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center">
              <PulseLoader size={8} color={"#ffffff"} />
            </div>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default SendSol;
