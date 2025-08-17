import React, { useState } from "react";
import { Eye } from "lucide-react";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { useLoading } from "../../../contexts/LoadingContext";
import { useAuth } from "../../../contexts/AuthContext";
import "./customerspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import CustomersIcon from "/icons/nav-customer-icon.svg";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import Modal from "../../reusables/Modal/Modal";

interface CustomersPageProps {
  role?: string;
}

const CustomersPage: React.FC<CustomersPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();
  const { searchCustomers } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [fetched, setFetched] = useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  // State for customer search
  const [searchForm, setSearchForm] = useState({
    firstName: "",
    lastName: "",
    nin: "",
  });
  const [fetchedCustomers, setFetchedCustomers] = useState<
    Array<{
      id: number;
      firstName: string;
      lastName: string;
      idNo: string;
      phone: string;
      email: string;
      address?: string;
      nin?: string;
    }>
  >([]);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State for create new customer form
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    nin: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    idNo: string;
    phone: string;
    email: string;
    address?: string;
    nin?: string;
  } | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one search parameter is provided
    if (!searchForm.firstName && !searchForm.lastName && !searchForm.nin) {
      alert(
        "Please provide at least one search parameter (First Name, Last Name, or NIN)"
      );
      return;
    }

    showLoading("Searching for customers...");
    setFetched(false);

    try {
      const searchResult = await searchCustomers(
        searchForm.nin || undefined,
        searchForm.firstName || undefined,
        searchForm.lastName || undefined
      );

      if (searchResult && searchResult.status && searchResult.data) {
        console.log("✅ Customer search successful:", searchResult.data);
        setFetchedCustomers(searchResult.data);
        setFetched(true);
      } else {
        console.log("⚠️ No customers found or search failed");
        setFetchedCustomers([]);
        setFetched(true);
      }
    } catch (error) {
      console.error("💥 Error searching customers:", error);
      setFetchedCustomers([]);
      setFetched(true);
    } finally {
      hideLoading();
    }
  };

  const handleViewMore = (customer: (typeof sampleFetchedCustomers)[0]) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleCloseCustomerDetails = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showLoading("Creating new customer...");
    setTimeout(() => {
      hideLoading();
      setShowSuccess(true);
    }, 2000);
  };

  return (
    <div className="customers-page-bg">
      {windowWidth <= 768 && (
        <PageTitle icon={CustomersIcon} title="Customers" />
      )}
      <div className="customer-tabs">
        <button
          className={`customer-tab${activeTab === "create" ? " active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create New Customer
        </button>
        <button
          className={`customer-tab${activeTab === "fetch" ? " active" : ""}`}
          onClick={() => setActiveTab("fetch")}
        >
          Fetch Customer Info
        </button>
      </div>
      {activeTab === "fetch" && !fetched && (
        <div className="customer-card">
          <h2 className="customer-card-title">Input Customer Details</h2>
          <p className="customer-card-helper">
            Please input all required customer details to know if the customer
            is already registered.
          </p>
          <form className="customer-form-grid" onSubmit={handleFetch}>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={searchForm.firstName}
                  onChange={handleSearchChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="customer-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={searchForm.lastName}
                  onChange={handleSearchChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group" style={{ flex: 1 }}>
                <label>NIN</label>
                <input
                  type="text"
                  name="nin"
                  value={searchForm.nin}
                  onChange={handleSearchChange}
                  placeholder="Enter NIN number"
                />
              </div>
            </div>
            <div className="customer-success-btn-container">
              <GradientButton type="submit" fullWidth>
                SEARCH
              </GradientButton>
            </div>
          </form>
        </div>
      )}
      {activeTab === "fetch" && fetched && (
        <>
          <div className="content-card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="table-header-item">S/N</th>
                    <th className="table-header-item">First Name</th>
                    <th className="table-header-item">Last Name</th>
                    <th className="table-header-item">ID No.</th>
                    <th className="table-header-item">Phone No.</th>
                    <th className="table-header-item">Email</th>
                    <th className="table-header-item">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedCustomers.length > 0 ? (
                    fetchedCustomers.map((user, idx) => (
                      <tr key={user.id}>
                        <td className="table-data-item">{idx + 1}.</td>
                        <td className="table-data-item">{user.firstName}</td>
                        <td className="table-data-item">{user.lastName}</td>
                        <td className="table-data-item">{user.idNo}</td>
                        <td className="table-data-item">{user.phone}</td>
                        <td className="table-data-item">{user.email}</td>
                        <td className="table-data-item">
                          <button
                            className="view-more-btn"
                            onClick={() => handleViewMore(user)}
                          >
                            <Eye size={20} /> View More
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="table-data-item"
                        style={{ textAlign: "center", color: "#6b7280" }}
                      >
                        {fetched
                          ? "No customers found matching your search criteria"
                          : "Search for customers to see results"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {windowWidth <= 768 && <SlideIndicator />}
        </>
      )}
      {activeTab === "create" && (
        <div className="customer-card">
          <h2 className="customer-card-title">Input Customer Details</h2>
          <p className="customer-card-helper">
            Please input all required customer details to register a new
            customer.
          </p>
          <form className="customer-form-grid" onSubmit={handleCreateSubmit}>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>First Name</label>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleCreateChange}
                />
              </div>
              <div className="customer-form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleCreateChange}
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleCreateChange}
                />
              </div>
              <div className="customer-form-group">
                <label>NIN</label>
                <input
                  name="nin"
                  type="text"
                  value={form.nin}
                  onChange={handleCreateChange}
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleCreateChange}
                />
              </div>
              <div className="customer-form-group">
                <label>Residential Address</label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleCreateChange}
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group" style={{ flex: 1 }}>
                <label>NIN</label>
                <input
                  name="nin"
                  type="text"
                  value={form.nin}
                  onChange={handleCreateChange}
                />
              </div>
            </div>
            <div className="customer-success-btn-container">
              <GradientButton type="submit" fullWidth>
                SAVE
              </GradientButton>
            </div>
          </form>
          {/* Success Modal */}
          <Modal
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            showHeader={false}
            className="customer-success-modal"
          >
            <div className="customer-success-content">
              <div className="customer-success-icon-wrap">
                <img
                  src={CheckCircle}
                  alt="success"
                  className="customer-success-icon"
                />
              </div>
              <div className="customer-success-title">
                New Customer
                <br />
                Successfully Created!
              </div>
              <div className="customer-success-desc">
                You can proceed to create a bill for the customer.
              </div>
              <div className="customer-success-actions">
                <GradientButton variant="primary" size="medium">
                  CREATE BILL
                </GradientButton>
                <GradientButton
                  variant="close"
                  size="medium"
                  onClick={() => setShowSuccess(false)}
                >
                  CLOSE
                </GradientButton>
              </div>
            </div>
          </Modal>
        </div>
      )}
      {/* Customer Details Modal */}
      <Modal
        isOpen={showCustomerDetails}
        onClose={handleCloseCustomerDetails}
        showHeader={true}
        headerTitle="FEDERAL AIRPORT AUTHORITY OF NIGERIA"
        className="customer-details-modal"
      >
        {selectedCustomer && (
          <div className="customer-details-content">
            <h2 className="customer-details-title">Customer Details</h2>
            <div className="customer-details-info">
              <div className="customer-details-item">
                <div className="customer-details-label">First Name:</div>
                <div className="customer-details-value">
                  {selectedCustomer.firstName}
                </div>
              </div>
              <div className="customer-details-item">
                <div className="customer-details-label">Last Name:</div>
                <div className="customer-details-value">
                  {selectedCustomer.lastName}
                </div>
              </div>
              <div className="customer-details-item">
                <div className="customer-details-label">ID Number:</div>
                <div className="customer-details-value highlight">
                  {selectedCustomer.idNo}
                </div>
              </div>
              <div className="customer-details-item">
                <div className="customer-details-label">Phone Number:</div>
                <div className="customer-details-value">
                  {selectedCustomer.phone}
                </div>
              </div>
              <div className="customer-details-item">
                <div className="customer-details-label">Email Address:</div>
                <div className="customer-details-value">
                  {selectedCustomer.email}
                </div>
              </div>
            </div>
            <div className="customer-details-actions">
              <GradientButton
                variant="close"
                size="medium"
                onClick={handleCloseCustomerDetails}
              >
                CLOSE
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
