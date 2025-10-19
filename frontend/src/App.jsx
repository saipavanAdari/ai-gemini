import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Customize from './pages/Customize';
import Customize2 from './pages/Customize2';
import Home from './pages/Home';
import { userDataContext } from './context/UserContext';

const App = () => {
  const { userData, loading } = useContext(userDataContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  const isLoggedIn = Boolean(userData);

  return (
    <Routes>
      <Route path="/signup" element={!isLoggedIn ? <SignUp /> : <Navigate to="/customize" />} />
      <Route path="/login" element={!isLoggedIn ? <SignIn /> : <Navigate to="/customize" />} />

      <Route path="/customize" element={isLoggedIn ? <Customize /> : <Navigate to="/login" />} />
      <Route path="/customize2" element={isLoggedIn ? <Customize2 /> : <Navigate to="/login" />} />
      <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />

      <Route path="/" element={<Navigate to={isLoggedIn ? "/customize" : "/login"} />} />
    </Routes>
  );
};

export default App;
