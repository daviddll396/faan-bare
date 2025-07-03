import React, { useState } from "react";
import "./customerspage.css";
import { Eye } from "lucide-react";
import CheckCircle from "../../../../public/icons/check-circle.svg";

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
  const [activeTab, setActiveTab] = useState("fetch");
  const [fetching, setFetching] = useState(false);
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
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    setFetching(true);
    setFetched(false);
    setTimeout(() => {
      setFetching(false);
      setFetched(true);
    }, 2000);
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setShowSuccess(true);
    }, 2000);
  };

  return (
    <div className="customers-page-bg">
      <div className="customer-tabs">
        <button
          className={`customer-tab${activeTab === "fetch" ? " active" : ""}`}
          onClick={() => setActiveTab("fetch")}
        >
          Fetch Customer Info
        </button>
        <button
          className={`customer-tab${activeTab === "create" ? " active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create New Customer
        </button>
      </div>
      {activeTab === "fetch" && !fetching && !fetched && (
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
            <button className="customer-fetch-btn" type="submit">
              FETCH
            </button>
          </form>
        </div>
      )}
      {activeTab === "fetch" && fetching && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal-center">
            <div className="customer-loader-spinner">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  stroke="#e4e4e4"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.4"
                />
                <path
                  d="M56 32a24 24 0 0 1-24 24"
                  stroke="#007948"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 32 32"
                    to="360 32 32"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            </div>
          </div>
        </div>
      )}
      {activeTab === "fetch" && fetched && (
        <div className="customer-table-card">
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
                      <button className="view-more-btn">
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
            <button className="customer-fetch-btn" type="submit">
              SAVE
            </button>
          </form>
          {/* Loading Spinner Overlay */}
          {creating && (
            <div className="customer-modal-backdrop">
              <div className="customer-modal-center">
                <div className="customer-loader-spinner">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="24"
                      stroke="#e4e4e4"
                      strokeWidth="6"
                      fill="none"
                      opacity="0.4"
                    />
                    <path
                      d="M56 32a24 24 0 0 1-24 24"
                      stroke="#007948"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 32 32"
                        to="360 32 32"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          )}
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
                    <button className="customer-success-btn create-bill">
                      CREATE BILL
                    </button>
                    <button
                      className="customer-success-btn close"
                      onClick={() => setShowSuccess(false)}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
