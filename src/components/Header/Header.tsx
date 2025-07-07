import React from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./header.css";
import UserIcon from "/images/header-user.svg";

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
          <img src={UserIcon} alt="User" />
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
