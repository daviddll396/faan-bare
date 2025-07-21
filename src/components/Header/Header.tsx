import React from "react";
import { ChevronDown, User } from "lucide-react";
import "./header.css";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Desktop Header - Only visible above 768px */}
      <div className="header desktop-only-header">
        <h1 className="page-title">{pageTitle}</h1>
        <div className="user-profile">
          <div className="user-avatar">
            <User size={40} color="#007948" />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Guest User"}</span>
            <span className="user-role">{user?.role || "Guest"}</span>
          </div>
          <ChevronDown size={16} color="#000000" />
        </div>
      </div>

      {/* Mobile Header - Only visible below 768px */}
      <div className="mobile-header mobile-only">
        <div className="mobile-user-profile">
          <div className="mobile-user-avatar">
            <User size={48} color="#007948" />
          </div>
          <div className="mobile-user-info">
            <span className="mobile-user-greeting">
              Hello {user?.firstName || "User"},
            </span>
            <span className="mobile-user-subtitle">View your dashboard</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
