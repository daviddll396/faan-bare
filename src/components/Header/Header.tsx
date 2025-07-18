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
    <div className="header">
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
  );
};

export default Header;
