import React from "react";
import { ChevronDown } from "lucide-react";
import "./header.css";
import UserIcon from "../../../public/images/header-user.svg";

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  return (
    <div className="header">
      <h1 className="page-title">{pageTitle}</h1>
      <div className="user-profile">
        <div className="user-avatar">
          <img src={UserIcon} alt="User" />
        </div>
        <div className="user-info">
          <span className="user-name">Kevin Mark</span>
          <span className="user-role">Admin</span>
        </div>
        <ChevronDown size={16} color="#000000" />
      </div>
    </div>
  );
};

export default Header;
