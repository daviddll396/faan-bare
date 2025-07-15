import { useAuth } from "../../../contexts/AuthContext";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import "./logoutpage.css";

const LogoutPage = () => {
  const { logout } = useAuth();

  // Since routing is handled by Dashboard's state, we use a custom event to communicate cancel/logout
  // We'll use a workaround: window event to notify parent to change page
  const handleCancel = () => {
    window.dispatchEvent(new CustomEvent("faan-dashboard-cancel-logout"));
  };

  const handleLogout = () => {
    // Trigger preloader before logout
    window.dispatchEvent(new CustomEvent("faan-show-preloader"));

    // Wait for preloader to start, then logout
    setTimeout(() => {
      logout();
      // After logout, trigger a reload to reset to login (since AppContent checks isAuthenticated)
      window.location.reload();
    }, 500);
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
        <div style={{ width: "100%", marginBottom: 14 }}>
          <GradientButton onClick={handleLogout} fullWidth>
            YES, LOG OUT
          </GradientButton>
        </div>
        <div style={{ width: "100%" }}>
          <GradientButton variant="close" onClick={handleCancel} fullWidth>
            CANCEL
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
