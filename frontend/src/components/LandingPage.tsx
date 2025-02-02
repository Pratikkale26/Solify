import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="text-white flex flex-col items-center justify-center mt-25 text-center">
      {/* Hero Section */}
      <h1 className="text-7xl font-bold mb-4 text-blue-400">Welcome to Solify</h1>
      <p className="text-lg mt-3 text-gray-300 max-w-xl">
        Solify is the easiest way to swap SOL and interact with the Solana blockchain. 
        Sign in to get started.
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 space-x-4">
        <Link to="/signup" className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition">
          Get Started
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-4xl font-semibold text-blue-300">Why Use Solify?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 max-w-4xl">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-400">🔄 Swap SOL Easily</h3>
            <p className="text-gray-400 mt-2">Fast and secure transactions on Solana.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-400">⚡ Instant Transfers</h3>
            <p className="text-gray-400 mt-2">Send SOL instantly with minimal fees.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-400">🔐 Secure & Reliable</h3>
            <p className="text-gray-400 mt-2">Backed by the power of the Solana blockchain.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
