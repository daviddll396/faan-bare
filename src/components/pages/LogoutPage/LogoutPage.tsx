import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "./logoutpage.css";

const LogoutPage = () => {
  const { logout } = useAuth();

  // Since routing is handled by Dashboard's state, we use a custom event to communicate cancel/logout
  // We'll use a workaround: window event to notify parent to change page
  const handleCancel = () => {
    window.dispatchEvent(new CustomEvent("faan-dashboard-cancel-logout"));
  };

  const handleLogout = () => {
    logout();
    // After logout, trigger a reload to reset to login (since AppContent checks isAuthenticated)
    window.location.reload();
  };

  return (
    <div className="logout-bg">
      <div className="logout-modal">
        <img
          src="/icons/big-logout-icon.svg"
          alt="Log Out Icon"
          className="logout-icon"
        />
        <div className="logout-title">Log Out</div>
        <div className="logout-text">Are you sure you want to Log Out?</div>
        <button
          className="logout-btn logout-btn-confirm"
          onClick={handleLogout}
        >
          YES, LOG OUT
        </button>
        <button className="logout-btn logout-btn-cancel" onClick={handleCancel}>
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default LogoutPage;
