import { useState, useEffect } from "react";
import axios from "axios";

const useGetBalance = (walletAddress: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token")
        if(!token) return;
        const response = await axios.get(`http://localhost:3000/api/v1/balance2?walletAddress=${walletAddress}`, {
            headers:{
                Authorization: `Bearer ${token}`, 
            }
        });
        setBalance(response.data.balance);
      } catch (error: any) {
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  return { balance, loading, error };
};

export default useGetBalance;
