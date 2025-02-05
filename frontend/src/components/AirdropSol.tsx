import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const AirdropSOL = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAirdrop = async () => {
    if (!walletAddress) {
      setMessage("Please enter a wallet address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/airdrop`, { walletAddress }, {withCredentials: true});

      setMessage(`Airdrop successful! Txn: ${response.data.signature}`);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg mt-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Airdrop 1 SOL</h2>
      <input
        type="text"
        placeholder="Enter your Solana Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleAirdrop}
        disabled={loading}
        className="w-full p-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin mr-2 inline" /> : "Get Airdrop"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default AirdropSOL;
