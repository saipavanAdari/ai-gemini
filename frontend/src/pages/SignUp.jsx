import React, { useState, useContext } from "react";
import bg from "../assets/1Bg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, { name, email, password }, { withCredentials: true });

      setUserData(result.data.user);
      if (result.data.token) sessionStorage.setItem("token", result.data.token);
      setMessage("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-cover bg-center flex items-center justify-center relative" style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">REGISTER TO AI</h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-white">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-2 rounded-lg transition-all duration-300 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {(message || error) && <p className={`text-center mt-4 text-sm p-2 rounded ${error ? "bg-red-500/50 text-white" : "bg-green-500/50 text-white"}`}>{error || message}</p>}

        <p className="text-center mt-4 text-sm text-gray-200">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
