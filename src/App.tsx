import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/pages/LoginPage/LoginPage";
import RegisterPage from "./components/pages/RegisterPage/RegisterPage";
import Preloader from "./components/reusables/Preloader";
import "./App.css";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // or a loading spinner

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
      />
      <Route
        path="/*"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Listen for logout event to show preloader
    const handleShowPreloader = () => {
      setShowPreloader(true);
    };

    window.addEventListener("faan-show-preloader", handleShowPreloader);

    return () => {
      window.removeEventListener("faan-show-preloader", handleShowPreloader);
    };
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppContent />
          {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
