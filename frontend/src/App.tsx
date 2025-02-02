import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import SendSol from "./components/SendSol";
import Features from "./components/Features";
import LandingPage from "./components/LandingPage";
import BuyNFT from "./components/BuyNFT";
import StakeSol from "./components/StakeSol";
import TransactionHistory from "./components/TransactionHistory";
import AirdropSOL from "./components/AirdropSol";
import WalletBalance from "./components/WalletBalance";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="bg-gray-900 min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/features" /> : <LandingPage />} />
            <Route path="/signin" element={isAuthenticated ? <Navigate to="/features" /> : <AuthForm setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/features" /> : <AuthForm setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/features" element={isAuthenticated ? <Features /> : <Navigate to="/signin" />} />
            <Route path="/send-sol" element={isAuthenticated ? <SendSol /> : <Navigate to="/signin" />} />
            <Route path="/buy-nft" element={isAuthenticated ? <BuyNFT /> : <Navigate to="/signin" />} />
            <Route path="/stake-sol" element={isAuthenticated ? <StakeSol /> : <Navigate to="/signin" />} />
            <Route path="/transactions" element={isAuthenticated ? <TransactionHistory /> : <Navigate to="/signin" />} />
            <Route path="/airdrop" element={isAuthenticated ? <AirdropSOL /> : <Navigate to="/signin" />} />
            <Route path="/balance" element={isAuthenticated ? <WalletBalance /> : <Navigate to="/signin" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
