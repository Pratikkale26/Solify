import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { name: "Send SOL", path: "/send-sol", description: "Transfer SOL to any wallet.", color: "bg-blue-500" },
  { name: "Buy NFT", path: "/buy-nft", description: "Purchase NFTs directly.", color: "bg-purple-500" },
  { name: "Stake SOL", path: "/stake-sol", description: "Earn rewards by staking.", color: "bg-green-500" },
  { name: "Transaction History", path: "/transactions", description: "View your past transactions.", color: "bg-orange-500" },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center mt-40 bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Explore Features
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            className={`relative overflow-hidden rounded-2xl p-6 shadow-lg bg-opacity-20 backdrop-blur-lg hover:scale-105 transition-all cursor-pointer border border-gray-700 ${feature.color}`}
            onClick={() => navigate(feature.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.2 }}
          >
            <div className="absolute inset-0 bg-black opacity-30 rounded-2xl"></div>
            <h2 className="relative text-2xl font-semibold mb-2">{feature.name}</h2>
            <p className="relative text-gray-200">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
