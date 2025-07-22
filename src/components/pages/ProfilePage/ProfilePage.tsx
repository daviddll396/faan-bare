import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import { User as UserIcon } from "lucide-react";
import PersonalDataIcon from "/icons/profile-personal-data-mobile.svg";
import SettingsIcon from "/icons/profile-settings-mobile.svg";
import SupportIcon from "/icons/profile-support-mobile.svg";
import ContactIcon from "/icons/profile-contact-mobile.svg";
import LogoutIcon from "/icons/profile-logout-mobile.svg";
import ChevronIcon from "/icons/profile-chevron-mobile.svg";
import "./profilepage.css";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only show this layout for mobile
  if (windowWidth > 768) {
    return null;
  }

  return (
    <div className="profile-page-root">
      {/* PageTitle at the top */}
      <PageTitle
        icon={""}
        title="My Profile"
        // onBackClick={() => window.history.back()}
        className="profile-pagetitle"
      />
      {/* User Info */}
      <div className="profile-user-info">
        <div className="profile-avatar">
          <UserIcon size={40} color="#007948" />
        </div>
        <div className="profile-user-details">
          <div className="profile-user-name">
            {user?.firstName || "Kennie Mark"}
          </div>
          <div className="profile-user-email">
            {user?.email || "kennie2@gmail.com"}
          </div>
        </div>
        <button className="profile-edit-btn">Edit Profile</button>
      </div>
      {/* Menu List */}
      <div className="profile-menu-list">
        <div className="profile-menu-item">
          <img
            src={PersonalDataIcon}
            alt="Personal Data"
            className="profile-menu-icon"
          />
          <span className="profile-menu-label">Personal Data</span>
          <img
            src={ChevronIcon}
            alt="Chevron"
            className="profile-menu-chevron"
          />
        </div>
        <div className="profile-menu-item">
          <img
            src={SettingsIcon}
            alt="Settings"
            className="profile-menu-icon"
          />
          <span className="profile-menu-label">Settings</span>
          <img
            src={ChevronIcon}
            alt="Chevron"
            className="profile-menu-chevron"
          />
        </div>
        <div className="profile-menu-item">
          <img
            src={SupportIcon}
            alt="Help & Support"
            className="profile-menu-icon"
          />
          <span className="profile-menu-label">Help & Support</span>
          <img
            src={ChevronIcon}
            alt="Chevron"
            className="profile-menu-chevron"
          />
        </div>
        <div className="profile-menu-item">
          <img
            src={ContactIcon}
            alt="Contact Us"
            className="profile-menu-icon"
          />
          <span className="profile-menu-label">Contact Us</span>
          <img
            src={ChevronIcon}
            alt="Chevron"
            className="profile-menu-chevron"
          />
        </div>
        <div className="profile-menu-item profile-menu-logout" onClick={logout}>
          <img src={LogoutIcon} alt="Log Out" className="profile-menu-icon" />
          <span className="profile-menu-label profile-menu-logout-label">
            Log Out
          </span>
          <img
            src={ChevronIcon}
            alt="Chevron"
            className="profile-menu-chevron"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
