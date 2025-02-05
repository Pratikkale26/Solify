import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import axios from "axios";

const StakeSol = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [staked, setStaked] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Fetch the user's balance from the backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("No token found. Please sign in.");
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/balance`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the request header
          },
        });

        console.log(response);
        setUserBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast.error("Error fetching balance.");
      }
    };

    fetchBalance();
  }, []);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0.00000001) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > userBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    setStaked(false);

    try {
      // TODO: Implement actual staking logic
      setTimeout(() => {
        setStaked(true);
        toast.success(`Successfully staked ${amount} SOL!`);
        setLoading(false);
      }, 2000);
    }catch (error: any) {
        toast.error(error.response?.data?.message || "An error occurred", {
          position: "top-right",
        });
    } finally {
        setLoading(false);
     }
  };
  
  return (
    <div className="flex flex-col items-center justify-center mt-45 bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Stake SOL</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md text-center">
        <p className="text-gray-400 mb-2">Available Balance: <span className="text-white font-semibold">{userBalance} SOL</span></p>

        <div className="relative mb-4">
          <input
            type="number"
            placeholder="Amount to Stake (SOL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 pl-4 pr-10 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="absolute right-4 top-3 text-gray-400">SOL</span>
        </div>

        <button
          onClick={handleStake}
          className={`w-full p-3 rounded-lg text-lg font-semibold transition ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading}
        >
          {loading ? <FiLoader className="inline animate-spin" /> : "Stake SOL"}
        </button>

        {staked && (
          <div className="mt-4 flex items-center justify-center text-green-400">
            <FiCheckCircle className="mr-2" /> Staking Successful!
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeSol;
