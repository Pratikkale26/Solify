import { useState } from "react";
import useGetBalance from "../hooks/useGetBalance";

const WalletBalance = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { balance, loading, error } = useGetBalance(walletAddress);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg mt-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Check Wallet Balance</h2>
      <input
        type="text"
        placeholder="Enter your Solana Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <div>Loading balance...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {balance !== null && !loading && !error && (
        <div className="mt-3 text-lg font-semibold">
          Balance: {balance} SOL
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
