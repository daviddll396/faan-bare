import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";
import "./header.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { user } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <>
      {/* Desktop Header - Only visible above 768px */}
      <div className="header desktop-only-header">
        <h1 className="page-title">{pageTitle}</h1>
        <div
          className={`user-profile ${open ? "open" : ""}`}
          ref={containerRef}
          onClick={() => setOpen((s) => !s)}
          role="button"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <div className="user-avatar">
            <User size={40} color="#007948" />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Guest User"}</span>
            <span className="user-role">{user?.role || "Guest"}</span>
          </div>
          <ChevronDown size={16} color="#000000" className="profile-chevron" />

          {open && (
            <div className="user-dropdown" role="menu">
              {/* <button
                type="button"
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  navigate("/profile");
                }}
              >
                Profile
              </button>
              <div className="dropdown-divider" /> */}
              <button
                type="button"
                className="dropdown-item logout"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
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
