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

// Mobile-specific icons (using Lucide React icons for better mobile experience)
import {
  Home,
  Users,
  Grid3X3,
  UserCheck,
  FileText,
  CreditCard,
} from "lucide-react";

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
  // userRole,
}) => {
  const menuItems = [
    {
      icon: () => (
        <img src={DashboardIcon} alt="Dashboard" width={20} height={20} />
      ),
      mobileIcon: () => <Home size={20} />,
      label: "Dashboard",
      mobileLabel: "Home",
      page: "dashboard" as PageType,
    },
    {
      icon: () => <img src={UserIcon} alt="Users" width={20} height={20} />,
      mobileIcon: () => <Users size={20} />,
      label: "Users",
      mobileLabel: "Users",
      page: "users" as PageType,
    },
    {
      icon: () => (
        <img src={ProductIcon} alt="Products" width={20} height={20} />
      ),
      mobileIcon: () => <Grid3X3 size={20} />,
      label: "Services",
      mobileLabel: "Services",
      page: "services" as PageType,
    },
    {
      icon: () => (
        <img src={CustomerIcon} alt="Customers" width={20} height={20} />
      ),
      mobileIcon: () => <UserCheck size={20} />,
      label: "Customers",
      mobileLabel: "Customers",
      page: "customers" as PageType,
    },
    {
      icon: () => <img src={BillIcon} alt="Bills" width={20} height={20} />,
      mobileIcon: () => <FileText size={20} />,
      label: "Bills",
      mobileLabel: "Bills",
      page: "bills" as PageType,
    },
    {
      icon: () => (
        <img src={PaymentIcon} alt="Payment" width={20} height={20} />
      ),
      mobileIcon: () => <CreditCard size={20} />,
      label: "Payment",
      mobileLabel: "Payments",
      page: "payment" as PageType,
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/images/faan-logo.svg" alt="logo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems
          .filter((item) => allowedPages.includes(item.page))
          .map((item, index) => (
            <div
              key={index}
              className={`nav-item ${activePage === item.page ? "active" : ""}`}
              onClick={() => onPageChange(item.page)}
            >
              {/* Desktop Icon */}
              <div className="desktop-icon">
                <item.icon />
              </div>
              {/* Mobile Icon */}
              <div className="mobile-icon">
                <item.mobileIcon />
              </div>
              {/* Desktop Label */}
              <span className="desktop-label">{item.label}</span>
              {/* Mobile Label */}
              <span className="mobile-label">{item.mobileLabel}</span>
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
