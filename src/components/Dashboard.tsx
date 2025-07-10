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
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

export type PageType =
  | "dashboard"
  | "users"
  | "services"
  | "customers"
  | "bills"
  | "payment"
  | "logout";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<PageType>("dashboard");
  const [prevPage, setPrevPage] = useState<PageType>("dashboard");

  // Define allowed pages based on role
  const allowedPages: PageType[] =
    user?.role === "Customer"
      ? ["dashboard", "services", "payment", "logout"]
      : [
          "dashboard",
          "users",
          "services",
          "customers",
          "bills",
          "payment",
          "logout",
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
      payment: "Payment",
      logout: "Log Out",
    };
    return titles[page];
  };

  const renderPageContent = () => {
    if (!allowedPages.includes(activePage)) {
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
      case "payment":
        return <PaymentPage role={user?.role} />;
      case "logout":
        return <LogoutPage />;
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
        <Header pageTitle={getPageTitle(activePage)} />
        <div className="dashboard-content">{renderPageContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
