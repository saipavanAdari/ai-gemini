import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  // const serverUrl = "http://localhost:5000"
  const serverUrl = "https://ai-gemini1.onrender.com";

  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from server
  const fetchCurrentUser = async () => {
    try {
      // Try cookie-based authentication
      const res = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(res.data);
    } catch (cookieErr) {
      // Fallback: token-based authentication
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setUserData(null);
          return;
        }
        const res = await axios.get(`${serverUrl}/api/user/current`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (tokenErr) {
        console.warn("No valid current user:", tokenErr.response?.data || tokenErr.message);
        setUserData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await axios.post(
      `${serverUrl}/api/auth/signin`,
      { email, password },
      { withCredentials: true }
    );
    setUserData(res.data.user);
    sessionStorage.setItem("token", res.data.token);
    return res.data;
  };

  // Signup function
  const signup = async (name, email, password) => {
    const res = await axios.post(
      `${serverUrl}/api/auth/signup`,
      { name, email, password },
      { withCredentials: true }
    );
    setUserData(res.data.user);
    sessionStorage.setItem("token", res.data.token);
    return res.data;
  };

  // Logout function
  const logout = async () => {
    await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true }); // GET is correct as in backend
    setUserData(null);
    sessionStorage.removeItem("token");
  };

  return (
    <userDataContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        frontendImage,
        setFrontendImage,
        backendImage,
        setBackendImage,
        selectedImage,
        setSelectedImage,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
