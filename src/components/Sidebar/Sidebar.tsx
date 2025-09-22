import React from "react";

import "./sidebar.css";
import type { PageType } from "../Dashboard";
import DashboardIcon from "/icons/nav-dashboard-icon.svg";
import UserIcon from "/icons/nav-user-icon.svg";
import ProductIcon from "/icons/nav-product-icon.svg";
import CustomerIcon from "/icons/nav-customer-icon.svg";
import BillIcon from "/icons/nav-bill-icon.svg";
import PaymentIcon from "/icons/nav-payment-icon.svg";
import LogoutIcon from "/icons/nav-logout-icon.svg";
import { Users, UserCheck, FileText, ChevronRight } from "lucide-react";

// Mobile-specific icons (using Lucide React icons for better mobile experience)

import HomeBottomBarIcon from "/icons/home-bottombar.svg";
import ServicesBottomBarIcon from "/icons/services-bottombar.svg";
import PaymentsBottomBarIcon from "/icons/payments-bottombar.svg";
import ProfileBottomBarIcon from "/icons/profile-bottombar.svg";

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
  activePage: PageType;
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
      icon: () => (
        <img src={DashboardIcon} alt="Dashboard" width={20} height={20} />
      ),
      mobileIcon: () => (
        <img
          src={HomeBottomBarIcon}
          alt="Home"
          className="sidebar-mobile-svg"
        />
      ),
      label: "Dashboard",
      mobileLabel: "Home",
      page: "dashboard" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    {
      icon: () => <img src={UserIcon} alt="Users" width={20} height={20} />,
      mobileIcon: () => <Users size={20} />,
      label: "Users",
      mobileLabel: "Users",
      page: "users" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => (
        <img src={ProductIcon} alt="Products" width={20} height={20} />
      ),
      mobileIcon: () => (
        <img
          src={ServicesBottomBarIcon}
          alt="Services"
          className="sidebar-mobile-svg"
        />
      ),
      label: "Services",
      mobileLabel: "Services",
      page: "services" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    {
      icon: () => (
        <img src={CustomerIcon} alt="Customers" width={20} height={20} />
      ),
      mobileIcon: () => <UserCheck size={20} />,
      label: "Customers",
      mobileLabel: "Customers",
      page: "customers" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => <img src={BillIcon} alt="Bills" width={20} height={20} />,
      mobileIcon: () => <FileText size={20} />,
      label: "Bills",
      mobileLabel: "Bills",
      page: "bills" as PageType,
      showForCustomer: false,
      showForAdmin: true,
    },
    {
      icon: () => (
        <img
          src="/icons/reports-icon.svg"
          alt="Reports"
          width={20}
          height={20}
        />
      ),
      mobileIcon: () => <FileText size={20} />,
      label: "Reports",
      mobileLabel: "Reports",
      page: "reports" as PageType,
      showForCustomer: false,
      showForAdmin: true,
      desktopOnly: true,
    },
    {
      icon: () => (
        <img
          src="/icons/audit-trail-icon.svg"
          alt="Audit Trail"
          width={20}
          height={20}
        />
      ),
      mobileIcon: () => <FileText size={20} />,
      label: "Audit Trail",
      mobileLabel: "Audit Trail",
      page: "audit-trail" as PageType,
      showForCustomer: false,
      showForAdmin: true,
      desktopOnly: true,
    },
    {
      icon: () => <img src={BillIcon} alt="Invoices" width={20} height={20} />,
      mobileIcon: () => <FileText size={20} />,
      label: "Invoices",
      mobileLabel: "Invoices",
      page: "invoices" as PageType,
      showForCustomer: true,
      showForAdmin: true, // allow admins to access invoices
    },
    {
      icon: () => (
        <img src={PaymentIcon} alt="Payment" width={20} height={20} />
      ),
      mobileIcon: () => (
        <img
          src={PaymentsBottomBarIcon}
          alt="Payments"
          className="sidebar-mobile-svg"
        />
      ),
      label: "Payment",
      mobileLabel: "Payments",
      page: "payment" as PageType,
      showForCustomer: true,
      showForAdmin: true,
    },
    // Profile for both mobile and desktop
    {
      icon: () => (
        <img
          src="/icons/nav-user-icon.svg"
          alt="Profile"
          width={20}
          height={20}
        />
      ),
      mobileIcon: () => (
        <img
          src={ProfileBottomBarIcon}
          alt="Profile"
          className="sidebar-mobile-svg"
        />
      ),
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
          .map((item, index) => (
            <div
              key={index}
              className={`nav-item ${activePage === item.page ? "active" : ""}`}
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
            </div>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item logout" onClick={onLogout}>
          <img src={LogoutIcon} alt="Logout" width={20} height={20} />
          {!isCollapsed && (
            <span style={{ whiteSpace: "nowrap" }}>Log Out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
