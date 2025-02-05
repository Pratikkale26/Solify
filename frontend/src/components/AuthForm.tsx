import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLoader } from "react-icons/fi";

interface AuthFormProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const AuthForm = ({ setIsAuthenticated }: AuthFormProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setIsSignup(!isSignup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isSignup ? "/api/v1/signup" : "/api/v1/signin";
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}${url}`, { username, password }, {withCredentials: true});

      if (!isSignup) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("publicKey", response.data.publicKey);
        setIsAuthenticated(true);
      }

      toast.success(`${isSignup ? "Sign up" : "Sign in"} successful!`, {
        position: "top-right",
      });
      toast.error(`${response.data.msg}!`, {
        position: "top-right",
      });

      setTimeout(() => navigate("/features"), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "An error occurred", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-45 bg-gray-900 px-4">
      <ToastContainer />
      
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md text-white">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-1 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 mt-4 rounded-lg text-lg font-semibold transition flex justify-center items-center ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? <FiLoader className="animate-spin" /> : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={toggleForm} className="text-blue-400 hover:text-blue-500 underline">
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
