import React, { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import DashboardPage from "./pages/DashoardPage/DashboardPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import CustomersPage from "./pages/CustomersPage/CustomersPage";
import BillsPage from "./pages/BillsPage/BillsPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import LogoutPage from "./pages/LogoutPage/LogoutPage";
import ProfilePage from "./pages/ProfilePage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage/ReportsPage";
import AuditTrailPage from "./pages/AuditTrailPage/AuditTrailPage";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

export type PageType =
  | "dashboard"
  | "users"
  | "services"
  | "customers"
  | "bills"
  | "audit-trail"
  | "reports"
  | "invoices"
  | "payment"
  | "logout"
  | "profile";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<PageType>(
    user?.role === "Guest" ? "services" : "dashboard"
  );
  const [prevPage, setPrevPage] = useState<PageType>(
    user?.role === "Guest" ? "services" : "dashboard"
  );
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define allowed pages based on role
  const allowedPages: PageType[] =
    user?.role === "Customer"
      ? [
          "dashboard",
          "services",
          "reports",
          "invoices",
          "payment",
          "logout",
          "profile",
        ]
      : user?.role === "Guest"
      ? ["services", "logout"]
      : [
          "dashboard",
          "users",
          "services",
          "customers",
          "bills",
          "audit-trail",
          "reports",
          "payment",
          "logout",
          "profile",
        ];

  React.useEffect(() => {
    const handleCancelLogout = () => {
      setActivePage(prevPage);
    };
    window.addEventListener("faan-dashboard-cancel-logout", handleCancelLogout);
    return () => {
      window.removeEventListener(
        "faan-dashboard-cancel-logout",
        handleCancelLogout
      );
    };
  }, [prevPage]);

  const getPageTitle = (page: PageType): string => {
    const titles = {
      dashboard: "Dashboard",
      users: "Users",
      services: "Services",
      customers: "Customers",
      bills: "Bills",
      "audit-trail": "Audit Trail",
      reports: "Reports",
      invoices: "Invoices",
      payment: "Payment",
      logout: "Log Out",
      profile: "Profile",
    };
    return titles[page];
  };

  const renderPageContent = () => {
    if (!allowedPages.includes(activePage)) {
      // For guest users, redirect to services if they try to access dashboard
      if (user?.role === "Guest" && activePage === "dashboard") {
        return <ServicesPage role={user?.role} />;
      }
      return <DashboardPage role={user?.role} />;
    }
    switch (activePage) {
      case "dashboard":
        return <DashboardPage role={user?.role} />;
      case "users":
        return <UsersPage role={user?.role} />;
      case "services":
        return <ServicesPage role={user?.role} />;
      case "customers":
        return <CustomersPage role={user?.role} />;
      case "bills":
        return <BillsPage role={user?.role} />;
      case "audit-trail":
        return <AuditTrailPage role={user?.role} />;
      case "reports":
        return <ReportsPage role={user?.role} />;
      case "invoices":
        return <InvoicesPage role={user?.role} />;
      case "payment":
        return <PaymentPage role={user?.role} />;
      case "logout":
        return <LogoutPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage role={user?.role} />;
    }
  };

  const handlePageChange = (page: PageType) => {
    if (allowedPages.includes(page)) {
      setActivePage(page);
      setPrevPage(page);
    }
  };

  const handleLogout = () => {
    setPrevPage(activePage);
    setActivePage("logout");
  };

  return (
    <div className="dashboard">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        allowedPages={allowedPages}
        userRole={user?.role}
      />
      <div className="main-content">
        {/* Show header only on dashboard page when screen width is 768px and below */}
        {(activePage === "dashboard" && windowWidth <= 768) ||
        windowWidth > 768 ? (
          <Header pageTitle={getPageTitle(activePage)} />
        ) : null}
        <div className="dashboard-content">{renderPageContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
