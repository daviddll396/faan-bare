import React from "react";

import "./sidebar.css";
import type { PageType } from "../Dashboard";
import DashboardIcon from "../../../public/icons/nav-dashboard-icon.svg";
import UserIcon from "../../../public/icons/nav-user-icon.svg";
import ProductIcon from "../../../public/icons/nav-product-icon.svg";
import CustomerIcon from "../../../public/icons/nav-customer-icon.svg";
import BillIcon from "../../../public/icons/nav-bill-icon.svg";
import PaymentIcon from "../../../public/icons/nav-payment-icon.svg";
import LogoutIcon from "../../../public/icons/nav-logout-icon.svg";
import { Users, UserCheck, FileText } from "lucide-react";

// Mobile-specific icons (using Lucide React icons for better mobile experience)

import HomeBottomBarIcon from "/icons/home-bottombar.svg";
import ServicesBottomBarIcon from "/icons/services-bottombar.svg";
import PaymentsBottomBarIcon from "/icons/payments-bottombar.svg";
import ProfileBottomBarIcon from "/icons/profile-bottombar.svg";

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
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
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
    // Profile only for Customer
    {
      icon: null,
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
      mobileOnly: true,
    },
  ];

  // Filter menu items based on role and windowWidth for Profile
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.page === "profile") {
      return windowWidth <= 768; // Show profile for both Customer and Admin on mobile
    }
    if (userRole === "Customer")
      return item.showForCustomer && (!item.mobileOnly || windowWidth <= 768);
    return item.showForAdmin && (!item.mobileOnly || windowWidth <= 768);
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/images/faan-logo.svg" alt="logo" />
        </div>
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
              {/* Only show labels on mobile for customers, not for admin */}
              {!(windowWidth <= 768 && userRole !== "Customer") && (
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
          <span>Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
