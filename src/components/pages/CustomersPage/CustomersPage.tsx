import React, { useState } from "react";
import { Eye } from "lucide-react";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import FaanLogo from "../../../../public/images/faan-logo.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { useLoading } from "../../../contexts/LoadingContext";
import "./customerspage.css";

const sampleFetchedCustomers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    idNo: "A1234567",
    phone: "+234-801-234-5678",
    email: "john@faan.gov.ng",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    idNo: "B9876543",
    phone: "+234-802-345-6789",
    email: "jane@faan.gov.ng",
  },
];

interface CustomersPageProps {
  role?: string;
}

const CustomersPage: React.FC<CustomersPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();
  const [activeTab, setActiveTab] = useState("create");
  const [fetched, setFetched] = useState(false);

  // State for create new customer form
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    email: "",
    address: "",
    nin: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    (typeof sampleFetchedCustomers)[0] | null
  >(null);

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    showLoading("Fetching customer information...");
    setFetched(false);
    setTimeout(() => {
      hideLoading();
      setFetched(true);
    }, 2000);
  };

  const handleViewMore = (customer: (typeof sampleFetchedCustomers)[0]) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleCloseCustomerDetails = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseCustomerDetails();
    }
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
                <input type="text" />
              </div>
              <div className="customer-form-group">
                <label>Last Name</label>
                <input type="text" />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>NIN</label>
                <input type="text" />
              </div>
              <div className="customer-form-group">
                <label>Date of Birth</label>
                <input type="date" />
              </div>
            </div>
            <GradientButton type="submit" fullWidth>
              FETCH
            </GradientButton>
          </form>
        </div>
      )}
      {activeTab === "fetch" && fetched && (
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
                {sampleFetchedCustomers.map((user, idx) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                <label>Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
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
          {/* Success Modal Overlay */}
          {showSuccess && (
            <div className="customer-modal-backdrop">
              <div className="customer-modal-center">
                <div className="customer-success-modal">
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
              </div>
            </div>
          )}
        </div>
      )}
      {showCustomerDetails && selectedCustomer && (
        <div className="customer-details-modal" onClick={handleBackdropClick}>
          <div className="customer-details-content">
            <div className="customer-details-header">
              <img
                src={FaanLogo}
                alt="FAAN Logo"
                className="customer-details-logo"
              />
              <div className="customer-details-org-name">
                FEDERAL AIRPORT AUTHORITY OF NIGERIA
              </div>
            </div>
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
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
