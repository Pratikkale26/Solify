import { useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const Navbar = ({ isAuthenticated, setIsAuthenticated }: NavbarProps) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("publicKey");
    setIsAuthenticated(false);
    setPublicKey(null);
    setShowKey(false);
  };

  const handleShowPublicKey = () => {
    const storedKey = localStorage.getItem("publicKey");
    if (storedKey) {
      setPublicKey(storedKey);
      setShowKey(!showKey);
    } else {
      alert("Public key not found. Please log in again.");
    }
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      alert("Public key copied to clipboard!");
    }
  };

  return (
    <nav className="bg-gray-800 shadow-md p-4 fixed top-0 w-full flex justify-between items-center max-w-[95%] ml-10 mt-3 rounded-2xl text-white">
      <Link to="/" className="text-3xl font-bold text-blue-400 ml-5">Solify</Link>

      <div className="space-x-4 flex items-center">
        {isAuthenticated ? (
          <>
            <button
              onClick={handleShowPublicKey}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              {showKey ? "Hide Public Key" : "Show Public Key"}
            </button>

            {showKey && publicKey && (
              <div className="bg-gray-700 p-2 rounded-lg text-sm flex items-center space-x-2">
                <span className="truncate max-w-[200px]">{publicKey}</span>
                <button
                  onClick={handleCopy}
                  className="bg-gray-600 px-2 py-1 rounded hover:bg-gray-500"
                >
                  Copy
                </button>
              </div>
            )}

            <Link to="/send-sol" className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">
              Send SOL
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="px-4 py-2 border border-blue-400 rounded-lg hover:bg-blue-600 transition">
              Sign In
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
