import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import CheckCircle from "/icons/check-circle.svg";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import { useLoading } from "../../../contexts/LoadingContext";
import { useAuth } from "../../../contexts/AuthContext";
import "./customerspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SwitchingTabs from "../../reusables/SwitchingTabs/SwitchingTabs";
import Card from "../../reusables/Card/Card";
import CustomersIcon from "/icons/nav-customer-icon.svg";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import DataTable from "../../reusables/DataTable/DataTable";
import Modal from "../../reusables/Modal/Modal";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import Input from "../../reusables/Input/Input";
import ListBox from "../../reusables/ListBox/ListBox";

interface CustomersPageProps {
  role?: string;
}

const CustomersPage: React.FC<CustomersPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();
  const {
    searchCustomers,
    getAllCustomers,
    changeCustomerStatus,
    createCustomer,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [fetched, setFetched] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // State for all customers tab
  const [allCustomersStatus, setAllCustomersStatus] = useState("PENDING");
  const [allCustomersData, setAllCustomersData] = useState<
    Array<{
      id: number;
      firstName: string;
      lastName: string;
      customerId: string;
      phoneNumber: string;
      email: string;
      address?: string;
      nin?: string;
      customerStatus: string;
      createdAt: string;
      creationType?: string;
      customerType?: string;
      dob?: string;
    }>
  >([]);
  const [allCustomersFetched, setAllCustomersFetched] = useState(false);

  // State for toast messages
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  // Helper function to show toast messages
  const showToastMessage = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Function to handle customer approval
  const handleApproveCustomer = async (customer: typeof selectedCustomer) => {
    if (!customer) return;

    showLoading("Approving customer...");

    try {
      const result = await changeCustomerStatus(customer.idNo, "APPROVED");

      if (result && result.status) {
        console.log("✅ Customer approved successfully:", result);
        showToastMessage("Customer approved successfully!", "success");

        // Close the modal
        handleCloseCustomerDetails();

        // Refresh the pending customers list
        handleFetchAllCustomers("PENDING");
      } else {
        console.log("⚠️ Customer approval failed:", result);
        showToastMessage("Failed to approve customer", "error");
      }
    } catch (error) {
      console.error("💥 Error approving customer:", error);
      showToastMessage("Error approving customer", "error");
    } finally {
      hideLoading();
    }
  };

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
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State for create new customer form
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phoneNumber: "",
    address: "",
    password: "",
    email: "",
    nin: "",
    userType: "CUSTOMER",
    creationType: "ADMIN",
    customerType: "INDIVIDUAL",
  });

  const customerTypeOptions = [
    { id: "individual", name: "Individual", value: "INDIVIDUAL" },
    { id: "corporate", name: "Corporate", value: "CORPORATE" },
    { id: "government", name: "Government", value: "GOVERNMENT" },
    { id: "family", name: "Family", value: "FAMILY" },
  ];

  const userTypeOptions = [
    { id: "customer", name: "Customer", value: "CUSTOMER" },
    { id: "admin", name: "Admin", value: "ADMIN" },
  ];
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

  const handleFetch = async () => {
    // Validate that at least one search parameter is provided
    if (!searchForm.firstName && !searchForm.lastName && !searchForm.nin) {
      showToastMessage(
        "Please provide at least one search parameter (First Name, Last Name, or NIN)",
        "error"
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
        showToastMessage("Customer search completed successfully", "success");
      } else {
        console.log("⚠️ No customers found or search failed");
        setFetchedCustomers([]);
        setFetched(true);
        showToastMessage("No customers found matching your criteria", "error");
      }
    } catch (error) {
      console.error("💥 Error searching customers:", error);
      setFetchedCustomers([]);
      setFetched(true);
      showToastMessage("Error searching customers", "error");
    } finally {
      hideLoading();
    }
  };

  const handleClearSearch = () => {
    setSearchForm({
      firstName: "",
      lastName: "",
      nin: "",
    });
    setFetchedCustomers([]);
    setFetched(false);
  };

  const handleFetchAllCustomers = async (status: string) => {
    showLoading(`Fetching ${status.toLowerCase()} customers...`);
    setAllCustomersFetched(false);

    try {
      const result = await getAllCustomers(status);

      if (
        result &&
        result.status &&
        result.data &&
        Array.isArray(result.data)
      ) {
        console.log(`✅ ${status} customers fetch successful:`, result.data);
        setAllCustomersData(result.data);
        setAllCustomersFetched(true);

        // Show success toast with customer count
        const customerCount = result.data.length;
        const message =
          customerCount > 0
            ? `${customerCount} ${status.toLowerCase()} customer${
                customerCount === 1 ? "" : "s"
              } retrieved successfully`
            : `No ${status.toLowerCase()} customers found`;
        showToastMessage(message, "success");
      } else {
        console.log(
          `⚠️ No ${status.toLowerCase()} customers found or fetch failed`
        );
        setAllCustomersData([]);
        setAllCustomersFetched(true);
        showToastMessage(
          `Failed to retrieve ${status.toLowerCase()} customers`,
          "error"
        );
      }
    } catch (error) {
      console.error(
        `💥 Error fetching ${status.toLowerCase()} customers:`,
        error
      );
      setAllCustomersData([]);
      setAllCustomersFetched(true);
      showToastMessage(
        `Error retrieving ${status.toLowerCase()} customers`,
        "error"
      );
    } finally {
      hideLoading();
    }
  };

  const handleViewMore = (
    customer:
      | (typeof fetchedCustomers)[number]
      | (typeof allCustomersData)[number]
  ) => {
    // Convert to the expected format for the modal
    const customerForModal = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      idNo: "customerId" in customer ? customer.customerId : customer.idNo,
      phone: "phoneNumber" in customer ? customer.phoneNumber : customer.phone,
      email: customer.email,
      address: customer.address,
      nin: customer.nin,
    };
    setSelectedCustomer(customerForModal);
    setShowCustomerDetails(true);
  };

  const handleCloseCustomerDetails = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "dob",
      "phoneNumber",
      "address",
      "password",
      "email",
      "nin",
    ];
    const missingFields = requiredFields.filter(
      (field) => !form[field as keyof typeof form]
    );

    if (missingFields.length > 0) {
      showToastMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`,
        "error"
      );
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToastMessage("Please enter a valid email address", "error");
      return false;
    }

    // Basic phone number validation (Nigerian format)
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      showToastMessage(
        "Please enter a valid Nigerian phone number (e.g., 08012345678)",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    showLoading("Creating new customer...");

    try {
      // Prepare the customer data
      const customerData = {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        phoneNumber: form.phoneNumber,
        address: form.address,
        password: form.password,
        email: form.email,
        nin: form.nin,
        userType: form.userType as "CUSTOMER" | "ADMIN",
        creationType: form.creationType as "ADMIN" | "CUSTOMER",
        customerType: form.customerType as
          | "INDIVIDUAL"
          | "CORPORATE"
          | "GOVERNMENT"
          | "FAMILY",
      };

      const result = await createCustomer(customerData);

      if (result && result.status) {
        showToastMessage("Customer created successfully!", "success");
        setShowSuccess(true);

        // Reset form
        setForm({
          firstName: "",
          lastName: "",
          dob: "",
          phoneNumber: "",
          address: "",
          password: "",
          email: "",
          nin: "",
          userType: "CUSTOMER",
          creationType: "ADMIN",
          customerType: "INDIVIDUAL",
        });
      } else {
        // Handle error response
        const errorMessage = result?.message || "Failed to create customer";
        showToastMessage(errorMessage, "error");
      }
    } catch (error) {
      console.error("💥 Error creating customer:", error);
      showToastMessage("Error creating customer. Please try again.", "error");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="customers-page-bg">
      <PageTitle
        icon={CustomersIcon}
        title="Customers"
        subtitle={"Manage and search customers by name, NIN or ID."}
      />
      <div className="customer-tabs">
        {/* use reusable SwitchingTabs component */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <SwitchingTabs
          items={[
            { id: "create", label: "Create New Customer" },
            { id: "fetch", label: "Fetch Customer Info" },
            { id: "all", label: "All Customers" },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            if (id === "all" && !allCustomersFetched) {
              handleFetchAllCustomers(allCustomersStatus);
            }
          }}
        />
      </div>
      {activeTab === "fetch" && !fetched && (
        <div className="customer-search-section">
          <div
            className="page-title-header"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <h3 className="customer-search-title">Search Customers</h3>
            <p className="customer-search-subtitle">
              Find customers by First Name, Last Name, or NIN. Use the search
              below to filter customers.
            </p>
          </div>

          <div className="customer-search-inputs">
            <div style={{ display: "flex", gap: 12, flex: 1 }}>
              <Input
                placeholder="First name"
                value={searchForm.firstName}
                onChange={(e) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Last name"
                value={searchForm.lastName}
                onChange={(e) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="NIN number"
                value={searchForm.nin}
                onChange={(e) =>
                  setSearchForm((prev) => ({ ...prev, nin: e.target.value }))
                }
              />
            </div>

            {/* placeholder for future filters (e.g., role/listbox) */}
          </div>

          <div className="customer-action-buttons">
            <div className="customer-actions-fieldbutton">
              <FieldButton
                buttons={[
                  { text: "Search", onClick: handleFetch },
                  { text: "Clear", onClick: handleClearSearch },
                ]}
                className="customer-actions-fieldbutton"
              />
            </div>
          </div>
        </div>
      )}
      {activeTab === "fetch" && fetched && (
        <>
          <DataTable
            headers={[
              "S/N",
              "First Name",
              "Last Name",
              "ID No.",
              "Phone No.",
              "Email",
              "Actions",
            ]}
            data={
              fetchedCustomers.length > 0
                ? fetchedCustomers.map((user, idx) => [
                    `${idx + 1}.`,
                    user.firstName,
                    user.lastName,
                    user.idNo,
                    user.phone,
                    user.email,
                    <button
                      key={`view-${user.id}`}
                      className="view-more-btn"
                      onClick={() => handleViewMore(user)}
                    >
                      <Eye size={20} /> View More
                    </button>,
                  ])
                : []
            }
            className="customer-table-card"
          />

          {windowWidth <= 768 && <SlideIndicator />}
        </>
      )}
      {activeTab === "all" && (
        <>
          {/* Status Sub-tabs (use booking-tabs-row styles for consistency) */}
          <div className="booking-tabs-row">
            <div
              className={`booking-tab${
                allCustomersStatus === "PENDING" ? " active" : ""
              }`}
              onClick={() => {
                setAllCustomersStatus("PENDING");
                handleFetchAllCustomers("PENDING");
              }}
            >
              PENDING
            </div>
            <div
              className={`booking-tab${
                allCustomersStatus === "APPROVED" ? " active" : ""
              }`}
              onClick={() => {
                setAllCustomersStatus("APPROVED");
                handleFetchAllCustomers("APPROVED");
              }}
            >
              APPROVED
            </div>
          </div>

          {/* All Customers Data Table */}
          {allCustomersFetched && (
            <DataTable
              headers={[
                "S/N",
                "First Name",
                "Last Name",
                "ID No.",
                "Phone No.",
                "Email",
                "Status",
                "Created Date",
                "Actions",
              ]}
              data={
                allCustomersData.length > 0
                  ? allCustomersData.map((customer, idx) => [
                      `${idx + 1}.`,
                      customer.firstName,
                      customer.lastName,
                      customer.customerId,
                      customer.phoneNumber,
                      customer.email,
                      <span
                        className={`status-badge ${
                          allCustomersStatus === "PENDING"
                            ? "pending"
                            : "completed"
                        }`}
                      >
                        {allCustomersStatus}
                      </span>,
                      customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : "N/A",
                      <button
                        key={`view-${customer.id}`}
                        className="view-more-btn"
                        onClick={() => handleViewMore(customer)}
                      >
                        <Eye size={20} /> View More
                      </button>,
                    ])
                  : []
              }
              className="customer-table-card"
            />
          )}

          {windowWidth <= 768 && <SlideIndicator />}
        </>
      )}
      {activeTab === "create" && (
        <Card
          title="Input Customer Details"
          helper={
            "Please input all required customer details to register a new customer."
          }
        >
          <form className="customer-form-grid" onSubmit={handleCreateSubmit}>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>First Name *</label>
                <Input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleCreateChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="customer-form-group">
                <label>Last Name *</label>
                <Input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleCreateChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Date of Birth *</label>
                <Input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleCreateChange}
                  required
                />
              </div>
              <div className="customer-form-group">
                <label>Phone Number *</label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleCreateChange}
                  placeholder="08012345678"
                  required
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Email Address *</label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleCreateChange}
                  placeholder="customer@example.com"
                  required
                />
              </div>
              <div className="customer-form-group">
                <label>NIN *</label>
                <Input
                  name="nin"
                  type="text"
                  value={form.nin}
                  onChange={handleCreateChange}
                  placeholder="12345678901"
                  required
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Residential Address *</label>
                <Input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleCreateChange}
                  placeholder="123 Allen Avenue, Ikeja, Lagos"
                  required
                />
              </div>
              <div className="customer-form-group">
                <label>Password *</label>
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleCreateChange}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <div className="customer-form-row">
              <div className="customer-form-group">
                <label>Customer Type</label>
                <ListBox
                  options={customerTypeOptions}
                  selected={
                    customerTypeOptions.find(
                      (o) => o.value === form.customerType
                    ) ?? null
                  }
                  onChange={(opt) =>
                    setForm((prev) => ({ ...prev, customerType: opt.value }))
                  }
                  placeholder="Select customer type"
                  className="customer-type-listbox"
                />
              </div>
              <div className="customer-form-group">
                <label>User Type</label>
                <ListBox
                  options={userTypeOptions}
                  selected={
                    userTypeOptions.find((o) => o.value === form.userType) ??
                    null
                  }
                  onChange={(opt) =>
                    setForm((prev) => ({ ...prev, userType: opt.value }))
                  }
                  placeholder="Select user type"
                  className="user-type-listbox"
                />
              </div>
            </div>
            <div className="customer-success-btn-container">
              <GradientButton type="submit" fullWidth>
                CREATE CUSTOMER
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
                Customer
                <br />
                Successfully Created!
              </div>
              <div className="customer-success-desc">
                The customer has been registered and can now access the system.
              </div>
              <div className="customer-success-actions">
                <GradientButton variant="primary" size="medium">
                  VIEW CUSTOMERS
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
        </Card>
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
              <div className="customer-details-item">
                <div className="customer-details-label">Status:</div>
                <div className="customer-details-value">
                  <span
                    className={`status-badge ${
                      allCustomersStatus === "PENDING" ? "pending" : "completed"
                    }`}
                  >
                    {allCustomersStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="customer-details-actions">
              {allCustomersStatus === "PENDING" && (
                <GradientButton
                  variant="primary"
                  size="medium"
                  onClick={() => handleApproveCustomer(selectedCustomer)}
                >
                  APPROVE CUSTOMER
                </GradientButton>
              )}
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

      {/* Message Toast */}
      <MessageToast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
};

export default CustomersPage;
