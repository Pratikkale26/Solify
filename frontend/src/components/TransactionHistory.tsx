import { useState, useEffect } from "react";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<
    { id: string; amount: string; type: string; date: string }[]
  >([]);

    // TODO: Transaction history needs to fetch from the blockchain, have to figure out
  useEffect(() => {
    setTransactions([
      { id: "tx1", amount: "1.2 SOL", type: "Sent", date: "2025-01-30" },
      { id: "tx2", amount: "2.5 SOL", type: "Received", date: "2025-01-28" },
      { id: "tx3", amount: "3.0 SOL", type: "Staked", date: "2025-01-25" },
    ]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-50 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Type</th>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border-b p-2">{tx.type}</td>
                <td className="border-b p-2">{tx.amount}</td>
                <td className="border-b p-2">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
