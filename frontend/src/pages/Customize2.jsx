import React, { useState, useContext } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

const Customize2 = () => {
  const navigate = useNavigate();
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("assistantName", assistantName);

      if (backendImage instanceof File) {
        formData.append("assistantImage", backendImage);
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      const token = sessionStorage.getItem("token");

      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.put(
        `${serverUrl}/api/user/updateAssistant`,
        formData,
        {
          withCredentials: true,
          headers,
        }
      );

      setUserData(res.data);
      navigate("/home");
    } catch (error) {
      console.error("Error updating assistant:", error.response?.data || error.message);
      alert("Failed to update assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assistantName.trim()) return alert("Enter assistant name!");
    handleUpdateAssistant();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none"></div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 drop-shadow-lg">
        Enter Your <span className="text-white">Assistant Name</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-md bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10"
      >
        <input
          type="text"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="Enter name..."
          className="w-full px-5 py-3 rounded-xl text-gray-900 bg-white/90 placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-300 mb-8 shadow-md"
        />

        <button
          type="button"
          onClick={() => navigate("/customize")}
          className="flex items-center gap-2 mb-6 text-white hover:text-pink-300 transition-all duration-300"
        >
          <IoMdArrowRoundBack size={24} />
          <span className="font-semibold">Back</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 rounded-xl font-semibold text-lg text-white transition-all duration-300 shadow-lg 
            ${loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 hover:shadow-pink-500/40"}
          `}
        >
          {loading ? "Creating..." : "Finally Create Your Assistant"}
        </button>
      </form>
    </div>
  );
};

export default Customize2;
