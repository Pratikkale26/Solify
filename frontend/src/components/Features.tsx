import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { name: "Send SOL", path: "/send-sol", description: "Transfer SOL to any wallet.", color: "bg-blue-500" },
  { name: "AirDrop SOL (Devnet)", path: "/airdrop", description: "Airdrop SOL in your account.", color: "bg-orange-500" },
  { name: "Check Balance", path: "/balance", description: "Check how much solana someone has.", color: "bg-amber-500" },
  { name: "Buy NFT", path: "/buy-nft", description: "Purchase NFTs directly.", color: "bg-purple-500" },
  { name: "Stake SOL", path: "/stake-sol", description: "Earn rewards by staking.", color: "bg-green-500" },
  { name: "Transaction History", path: "/transactions", description: "View your past transactions.", color: "bg-yellow-500" },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-gray-900 text-white">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-12 text-center">
        Explore Features - (Devnet)
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-6xl">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            className={`relative overflow-hidden rounded-3xl p-6 shadow-xl ${feature.color} hover:scale-105 transition-all transform hover:bg-opacity-80 cursor-pointer border-2 border-gray-700`}
            onClick={() => navigate(feature.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="absolute inset-0 bg-black opacity-40 rounded-3xl"></div>
            <h2 className="relative text-2xl font-bold text-white mb-3">{feature.name}</h2>
            <p className="relative text-gray-200 text-lg">{feature.description}</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40 rounded-3xl"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
