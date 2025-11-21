import React, { useState, useEffect, Suspense } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import LoadingSpinner from "./reusables/LoadingSpinner/LoadingSpinner";

const DashboardPage = React.lazy(
  () => import("./pages/DashoardPage/DashboardPage")
);
const UsersPage = React.lazy(() => import("./pages/UsersPage/UsersPage"));
const ServicesPage = React.lazy(
  () => import("./pages/ServicesPage/ServicesPage")
);
const CustomersPage = React.lazy(
  () => import("./pages/CustomersPage/CustomersPage")
);
const BillsPage = React.lazy(() => import("./pages/BillsPage/BillsPage"));
const PaymentPage = React.lazy(() => import("./pages/PaymentPage/PaymentPage"));
const LogoutPage = React.lazy(() => import("./pages/LogoutPage/LogoutPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const InvoicesPage = React.lazy(() => import("./pages/InvoicesPage"));
const ReportsPage = React.lazy(() => import("./pages/ReportsPage/ReportsPage"));
const AuditTrailPage = React.lazy(
  () => import("./pages/AuditTrailPage/AuditTrailPage")
);
const FeedbackDisputesPage = React.lazy(
  () => import("./pages/FeedbackDisputesPage/FeedbackDisputesPage")
);
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

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
  | "feedback-disputes"
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
  const navigate = useNavigate();
  const location = useLocation();
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
          "feedback-disputes",
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
          "invoices" /* allow admins access to invoices */,
          "payment",
          "feedback-disputes",
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
      "feedback-disputes": "Feedback & Disputes",
      logout: "Log Out",
      profile: "Profile",
    };
    return titles[page];
  };
  // Map PageType to route path
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

  // derive page from current location pathname
  useEffect(() => {
    const pathname = location.pathname || "/";
    const match =
      pathname === "/"
        ? "dashboard"
        : pathname.replace(/^\//, "").split("/")[0];
    const page = [
      "dashboard",
      "users",
      "services",
      "customers",
      "bills",
      "audit-trail",
      "reports",
      "invoices",
      "payment",
      "feedback-disputes",
      "logout",
      "profile",
    ].includes(match)
      ? (match as PageType)
      : "dashboard";
    if (allowedPages.includes(page)) {
      setActivePage(page);
    } else {
      // redirect to first allowed page if current path is not allowed
      const defaultPage = allowedPages[0] || "dashboard";
      navigate(pathForPage(defaultPage), { replace: true });
      setActivePage(defaultPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handlePageChange = (page: PageType) => {
    if (allowedPages.includes(page)) {
      setPrevPage(page);
      const path = pathForPage(page);
      navigate(path);
    }
  };

  const handleLogout = () => {
    setPrevPage(activePage);
    navigate(pathForPage("logout"));
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
          <Header
            pageTitle={getPageTitle(activePage)}
            onPageChange={(page) => handlePageChange(page as PageType)}
          />
        ) : null}

        <div className="dashboard-content">
          <Suspense
            fallback={
              <LoadingSpinner isVisible={true} message="Loading Data" />
            }
          >
            <Routes>
              <Route path="/" element={<DashboardPage role={user?.role} />} />
              <Route path="/users" element={<UsersPage role={user?.role} />} />
              <Route
                path="/services"
                element={<ServicesPage role={user?.role} />}
              />
              <Route
                path="/customers"
                element={<CustomersPage role={user?.role} />}
              />
              <Route path="/bills" element={<BillsPage role={user?.role} />} />
              <Route
                path="/audit-trail"
                element={<AuditTrailPage role={user?.role} />}
              />
              <Route
                path="/reports"
                element={<ReportsPage role={user?.role} />}
              />
              <Route
                path="/invoices"
                element={<InvoicesPage role={user?.role} />}
              />
              <Route
                path="/payment"
                element={<PaymentPage role={user?.role} />}
              />
              <Route
                path="/feedback-disputes"
                element={<FeedbackDisputesPage />}
              />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
