import React from "react";
import { NavLink } from "react-router-dom";

import "./sidebar.css";
import type { PageType } from "../Dashboard";
import {
  Home,
  Users,
  UserCheck,
  FileText,
  Clipboard,
  Package,
  CreditCard,
  ChevronRight,
  BarChart2,
  Activity,
  User,
  MessageSquare,
} from "lucide-react";

interface MenuItem {
  icon: (() => React.ReactNode) | null;
  mobileIcon: () => React.ReactNode;
  label: string;
  mobileLabel: string;
  page: PageType;
  showForCustomer: boolean;
  showForAdmin: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

interface SidebarProps {
  activePage?: PageType;
  onPageChange: (page: PageType) => void;
  onLogout: () => void;
  allowedPages: PageType[];
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onPageChange,
  onLogout,
  allowedPages,
  userRole,
}) => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showSmallLogo, setShowSmallLogo] = React.useState(false);
  const [mainLogoFadingOut, setMainLogoFadingOut] = React.useState(false);
  const [smallLogoFadingIn, setSmallLogoFadingIn] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (isCollapsed) {
      // Start fading out main logo immediately
      setMainLogoFadingOut(true);

      // After 0.5s, hide main logo completely and show small logo
      const hideMainTimer = setTimeout(() => {
        setShowSmallLogo(true);
      }, 250);

      // After 1s total, start fading in small logo
      const showSmallTimer = setTimeout(() => {
        setSmallLogoFadingIn(true);
      }, 500);

      return () => {
        clearTimeout(hideMainTimer);
        clearTimeout(showSmallTimer);
      };
    } else {
      // When expanding, reset all states immediately
      setMainLogoFadingOut(false);
      setShowSmallLogo(false);
      setSmallLogoFadingIn(false);
    }
  }, [isCollapsed]);

  const menuItems: MenuItem[] = [
    {
      icon: () => <Home size={20} />,
      mobileIcon: () => <Home size={20} />,
      label: "Dashboard",
      mobileLabel: "Home",
      page: "dashboard" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    {
      icon: () => <Users size={20} />,
      mobileIcon: () => <Users size={20} />,
      label: "Users",
      mobileLabel: "Users",
      page: "users" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => <Package size={20} />,
      mobileIcon: () => <Package size={20} />,
      label: "Services",
      mobileLabel: "Services",
      page: "services" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    {
      icon: () => <UserCheck size={20} />,
      mobileIcon: () => <UserCheck size={20} />,
      label: "Customers",
      mobileLabel: "Customers",
      page: "customers" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => <Clipboard size={20} />,
      mobileIcon: () => <Clipboard size={20} />,
      label: "Bills",
      mobileLabel: "Bills",
      page: "bills" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => <BarChart2 size={20} />, // replaced image with Lucide BarChart2
      mobileIcon: () => <BarChart2 size={20} />,
      label: "Reports",
      mobileLabel: "Reports",
      page: "reports" as PageType,
      showForCustomer: false,
      showForAdmin: true,
      desktopOnly: true,
    },
    {
      icon: () => <Activity size={20} />, // replaced image with Lucide Activity
      mobileIcon: () => <Activity size={20} />,
      label: "Audit Trail",
      mobileLabel: "Audit Trail",
      page: "audit-trail" as PageType,
      showForCustomer: false,
      showForAdmin: true,
      desktopOnly: true,
    },
    {
      icon: () => <FileText size={20} />,
      mobileIcon: () => <FileText size={20} />,
      label: "Invoices",
      mobileLabel: "Invoices",
      page: "invoices" as PageType,
      showForCustomer: true,
      showForAdmin: true, // allow admins to access invoices
    },
    {
      icon: () => <CreditCard size={20} />,
      mobileIcon: () => <CreditCard size={20} />,
      label: "Payment",
      mobileLabel: "Payments",
      page: "payment" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    {
      icon: () => <MessageSquare size={20} />,
      mobileIcon: () => <MessageSquare size={20} />,
      label: "Feedback & Disputes",
      mobileLabel: "Feedback",
      page: "feedback-disputes" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    // Profile for both mobile and desktop
    {
      icon: () => <User size={20} />,
      mobileIcon: () => <User size={20} />,
      label: "Profile",
      mobileLabel: "Profile",
      page: "profile" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
  ];

  // Filter menu items based on role and windowWidth
  const filteredMenuItems = menuItems.filter((item) => {
    if (userRole === "Guest") {
      return item.page === "services"; // Guest users only see services
    }
    if (userRole === "Customer")
      return item.showForCustomer && (!item.mobileOnly || windowWidth <= 768);
    return item.showForAdmin && (!item.desktopOnly || windowWidth > 768);
  });

  const pathForPage = (page: PageType) => {
    switch (page) {
      case "dashboard":
        return "/";
      case "users":
        return "/users";
      case "services":
        return "/services";
      case "customers":
        return "/customers";
      case "bills":
        return "/bills";
      case "audit-trail":
        return "/audit-trail";
      case "reports":
        return "/reports";
      case "invoices":
        return "/invoices";
      case "payment":
        return "/payment";
      case "feedback-disputes":
        return "/feedback-disputes";
      case "logout":
        return "/logout";
      case "profile":
        return "/profile";
      default:
        return "/";
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!isCollapsed && (
            <img
              src="/images/faan-logo.svg"
              alt="logo"
              className={`main-logo ${mainLogoFadingOut ? "fade-out" : ""}`}
            />
          )}
          {showSmallLogo && (
            <img
              src="/images/faan-small-white.png"
              alt="logo"
              className={`small-logo ${smallLogoFadingIn ? "fade-in" : ""}`}
              style={{
                width: "80%",
                height: "70%",
              }}
            />
          )}
        </div>
        {windowWidth > 768 && (
          <button
            className={`collapse-button ${isCollapsed ? "collapsed" : ""}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className="chevron-icon" />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems
          .filter((item) => allowedPages.includes(item.page))
          .map((item, index) => {
            const to = pathForPage(item.page);
            return (
              <NavLink
                key={index}
                to={to}
                className={({ isActive }) =>
                  `nav-item ${
                    isActive || activePage === item.page ? "active" : ""
                  }`
                }
                onClick={() => onPageChange(item.page)}
              >
                {/* Desktop Icon */}
                {item.icon && (
                  <div className="desktop-icon">
                    <item.icon />
                  </div>
                )}
                {/* Mobile Icon */}
                {item.mobileIcon && (
                  <div className="mobile-icon">
                    <item.mobileIcon />
                  </div>
                )}
                {/* Only show labels on mobile for customers, not for admin, and hide in collapsed desktop */}
                {!(windowWidth <= 768 && userRole !== "Customer") &&
                  !isCollapsed && (
                    <>
                      <span className="desktop-label">{item.label}</span>
                      <span className="mobile-label">{item.mobileLabel}</span>
                    </>
                  )}
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item logout" onClick={onLogout}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "var(--color-text-on-accent)" }}
          >
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!isCollapsed && (
            <span style={{ whiteSpace: "nowrap" }}>Log Out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
