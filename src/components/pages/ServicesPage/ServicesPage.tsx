import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AddIcon from "../../../../public/icons/add-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import CurrencyDropdown from "../../reusables/CurrencyDropdown/CurrencyDropdown";
import ChevronDown from "../../../../public/icons/chevron-down.svg";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import ServicesIcon from "/icons/nav-product-icon.svg";
import "./ServicesPage.css";
import { Edit, Trash2 } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import LoadingSpinner from "../../reusables/LoadingSpinner/LoadingSpinner";

interface ServicesPageProps {
  role?: string;
}

const serviceNames = [
  "International Departure",
  "International Arrival",
  "Domestic Departure",
  "Domestic Arrival",
];

const initialService = {
  serviceName: "",
  currency: "NGR",
  price: "",
};

const customerServices = [
  {
    id: 1,
    name: "International Arrival",
    price: "8,000",
    amount: 8000,
    image: "/images/intl-arrival.svg",
  },
  {
    id: 2,
    name: "International Departure",
    price: "10,000",
    amount: 10000,
    image: "/images/intl-departure.svg",
  },
  {
    id: 3,
    name: "VIP Lounge International",
    price: "6,000",
    amount: 6000,
    image: "/images/vip-lounge.svg",
  },
  {
    id: 4,
    name: "Abuja International OneOff",
    price: "12,000",
    amount: 12000,
    image: "/images/abj-intl.svg",
  },
  {
    id: 5,
    name: "One Year Protocol Service(Domestic operations PH)",
    price: "500,000",
    amount: 500000,
    image: "/images/one-year.svg",
  },
  {
    id: 6,
    name: "Additional One(1) Unit(Domestic ODC PH)",
    price: "300,000",
    amount: 300000,
    image: "/images/add-one-unit.svg",
  },
  {
    id: 7,
    name: "Port Harcourt Domestic Service",
    price: "1,000,000",
    amount: 1000000,
    image: "/images/ph-domestic.svg",
  },
  {
    id: 8,
    name: "Protocol Car Park Porthacourt",
    price: "800,000",
    amount: 800000,
    image: "/images/ph-protocol.svg",
  },
];

type CustomerService = (typeof customerServices)[number];

interface BookingPassenger {
  firstName: string;
  lastName: string;
  designation: string;
  gender: string;
  mobile: string;
  specialReq: string;
  airport: string;
  travelDate: string;
  flightNumber: string;
  airportTime: string;
  airline: string;
  destination: string;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ role }) => {
  const { getAllTariffs, makePayment, refreshUserDetails } = useAuth();
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [services, setServices] = useState([{ ...initialService }]);
  const [serviceNameSelectOpen, setServiceNameSelectOpen] = useState<
    number | null
  >(null);
  const [selectedService, setSelectedService] =
    useState<CustomerService | null>(null);
  const [activeTab, setActiveTab] = React.useState<"passenger" | "airport">(
    "passenger"
  );
  const [bookingForm, setBookingForm] = React.useState<BookingPassenger>({
    firstName: "",
    lastName: "",
    designation: "",
    gender: "",
    mobile: "",
    specialReq: "",
    airport: "",
    travelDate: "",
    flightNumber: "",
    airportTime: "",
    airline: "",
    destination: "",
  });
  const [passengers, setPassengers] = React.useState<BookingPassenger[]>([]);
  const [bookingFormError, setBookingFormError] = React.useState("");
  const [showPaymentLoading, setShowPaymentLoading] = React.useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);

  // Add search state for admin view
  const [searchName, setSearchName] = useState("");
  const [filteredServices, setFilteredServices] = useState(customerServices);
  const [allServices] = useState(customerServices); // Rename for clarity

  // Customer search state
  const [customerSearchName, setCustomerSearchName] = useState("");
  const [customerFilteredServices, setCustomerFilteredServices] =
    useState(customerServices);

  // Add state for API tariffs
  const [isLoadingTariffs, setIsLoadingTariffs] = useState(true);

  // Add toast state for tariff fetching feedback
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  // Function to map API tariff name to existing image
  const getImageForTariff = (tariffName: string): string => {
    // Map API tariff names to existing mock images
    const imageMap: { [key: string]: string } = {
      "International Arrival": "/images/intl-arrival.svg",
      "International Departure": "/images/intl-departure.svg",
      "VIP lounge International": "/images/vip-lounge.svg",
      "Abuja International OneOff": "/images/abj-intl.svg",
      "One Year Protocol Service (Domestic operations PH)":
        "/images/one-year.svg",
      "Additional One(1) Unit(Domestic ODC PH)": "/images/add-one-unit.svg",
      "Extra ODC": "/images/add-one-unit.svg", // Use same image as additional unit
      "Protocol Car Park Porthacourt": "/images/ph-protocol.svg",
      "Protocol Lounge porthacourt": "/images/vip-lounge.svg", // Use VIP lounge image
      "Port Harcourt Domestic Service": "/images/ph-domestic.svg",
    };

    return imageMap[tariffName] || "/images/default-service.svg";
  };

  // Add useEffect to fetch tariffs when component mounts
  useEffect(() => {
    const fetchTariffs = async () => {
      console.log("🎯 ServicesPage: Attempting to fetch all tariffs...");
      setIsLoadingTariffs(true);
      try {
        const tariffsData = await getAllTariffs();
        console.log("🎯 ServicesPage: Received tariffs data:", tariffsData);

        if (tariffsData && tariffsData.status && tariffsData.data) {
          console.log(
            "🎯 ServicesPage: Setting API tariffs:",
            tariffsData.data
          );

          // If API has data, use it; otherwise fall back to static data
          if (tariffsData.data.length > 0) {
            console.log(
              "🎯 ServicesPage: Using API tariffs for customer services"
            );
            // Convert API tariffs to customer service format
            const convertedServices = tariffsData.data.map(
              (tariff: {
                id: number;
                name: string;
                description: string;
                amount: number;
              }) => ({
                id: tariff.id,
                name: tariff.name,
                price: tariff.amount.toLocaleString(), // Convert amount to formatted string
                amount: tariff.amount, // Keep the raw amount for calculations
                image: getImageForTariff(tariff.name), // Map to existing image
              })
            );
            setCustomerFilteredServices(convertedServices);
            console.log(
              "🎯 ServicesPage: Converted services:",
              convertedServices
            );
            setTimeout(() => {
              showToast(
                `${tariffsData.data.length} services loaded successfully`,
                "success"
              );
            }, 500);
          } else {
            console.log(
              "🎯 ServicesPage: API returned empty data, using static services"
            );
            setTimeout(() => {
              showToast(
                "No services available from server, using default services",
                "error"
              );
            }, 500);
          }
        } else {
          console.log(
            "🎯 ServicesPage: API call failed or returned invalid data, using static services"
          );
          setTimeout(() => {
            showToast("Failed to load services from server", "error");
          }, 500);
        }
      } catch (error) {
        console.error("🎯 ServicesPage: Error fetching tariffs:", error);
        console.log(
          "🎯 ServicesPage: Falling back to static services due to error"
        );
        setTimeout(() => {
          showToast("Error loading services, using default services", "error");
        }, 500);
      } finally {
        setIsLoadingTariffs(false);
      }
    };

    fetchTariffs();
  }, [getAllTariffs]);

  // Helper to format number with commas
  function formatNumberWithCommas(value: string) {
    const num = value.replace(/,/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const handleServiceChange = (
    idx: number,
    field: keyof typeof initialService,
    value: string
  ) => {
    const updated = [...services];
    if (field === "price") {
      // Only allow numbers
      const raw = value.replace(/[^\d]/g, "");
      updated[idx][field] = raw;
    } else {
      updated[idx][field] = value;
    }
    setServices(updated);
  };

  const addMoreService = () => {
    setServices([...services, { ...initialService }]);
  };

  // Helper to check if all fields are filled
  const allFieldsFilled = Object.values(bookingForm).every(
    (v) => v && v !== ""
  );

  const handleBookingFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
    if (bookingFormError) setBookingFormError("");
  };

  const handleAddPassenger = () => {
    if (!allFieldsFilled) {
      setBookingFormError("Please fill in all required fields.");
      return;
    }
    setPassengers([...passengers, { ...bookingForm }]);
    setBookingForm({
      firstName: "",
      lastName: "",
      designation: "",
      gender: "",
      mobile: "",
      specialReq: "",
      airport: "",
      travelDate: "",
      flightNumber: "",
      airportTime: "",
      airline: "",
      destination: "",
    });
    setBookingFormError("");
  };
  const handleDeletePassenger = (idx: number) => {
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  // Search functionality for admin view
  const handleSearch = () => {
    const filtered = allServices.filter((service) => {
      const nameMatch = searchName
        ? service.name.toLowerCase().includes(searchName.toLowerCase())
        : true;

      return nameMatch;
    });
    setFilteredServices(filtered);
  };

  const handleClearSearch = () => {
    setSearchName("");
    setFilteredServices(allServices);
  };

  // Customer search functionality
  const handleCustomerSearch = () => {
    const filtered = customerServices.filter((service) => {
      const nameMatch = customerSearchName
        ? service.name.toLowerCase().includes(customerSearchName.toLowerCase())
        : true;

      return nameMatch;
    });
    setCustomerFilteredServices(filtered);
  };

  const handleCustomerClearSearch = () => {
    setCustomerSearchName("");
    setCustomerFilteredServices(customerServices);
  };

  if (role === "Customer") {
    // Booking form view
    if (selectedService) {
      // Calculate summary values based on selected service and passenger count
      const passengerCount = passengers.length || 1; // At least 1 for the service itself
      const serviceAmount = selectedService.amount || 0;
      const subTotal = serviceAmount * passengerCount;
      const otherCharges = 500; // Fixed charge
      const total = subTotal + otherCharges;

      // Function to handle payment
      const handlePayment = async () => {
        if (!selectedService?.id) {
          showToast("No service selected for payment", "error");
          return;
        }

        if (passengers.length === 0) {
          showToast("Please add at least one passenger", "error");
          return;
        }

        setShowPaymentLoading(true);

        try {
          // Generate payment reference
          const reference = `NM-${Date.now()}-${
            selectedService.id
          }-${Math.random().toString(36).substring(2, 8)}`;

          console.log("🎯 ServicesPage: Starting payment process");
          console.log("🎯 Payment reference:", reference);
          console.log("🎯 Tariff ID:", selectedService.id);
          console.log("🎯 Total amount:", total);
          console.log("🎯 Passenger count:", passengers.length);

          const paymentSuccess = await makePayment(
            reference,
            selectedService.id
          );

          if (paymentSuccess) {
            setShowPaymentLoading(false);
            setShowPaymentSuccess(true);

            // Refresh user details to get updated wallet balance and transaction stats
            console.log(
              "🔄 ServicesPage: Refreshing user details after successful payment"
            );
            try {
              await refreshUserDetails();
              console.log(
                "✅ ServicesPage: User details refreshed successfully"
              );
            } catch (error) {
              console.error(
                "❌ ServicesPage: Failed to refresh user details:",
                error
              );
            }

            setTimeout(() => {
              showToast("Payment successful!", "success");
            }, 500);
            console.log("🎯 ServicesPage: Payment completed successfully");
          } else {
            setShowPaymentLoading(false);
            setTimeout(() => {
              showToast("Payment failed. Please try again.", "error");
            }, 500);
            console.log("🎯 ServicesPage: Payment failed");
          }
        } catch (error) {
          console.error("🎯 ServicesPage: Payment error:", error);
          setShowPaymentLoading(false);
          setTimeout(() => {
            showToast(
              "An error occurred during payment. Please try again.",
              "error"
            );
          }, 500);
        }
      };

      return (
        <div className="services-customer-page">
          <MessageToast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
          />
          <div className="page-header">
            <PageTitle
              icon={ServicesIcon}
              title="Services"
              breadcrumb={[
                { label: "Services", icon: ServicesIcon },
                { label: selectedService.name },
              ]}
              onBreadcrumbClick={(idx) => {
                if (idx === 0) setSelectedService(null);
              }}
            />
          </div>
          <div className="booking-form-card">
            <h2
              style={{
                color: "#222b45",
                fontWeight: 500,
                fontSize: 22,
                marginBottom: 18,
              }}
            >
              Please input all required details to add a passenger.
            </h2>
            {/* Tabs */}
            <div className="booking-tabs-row">
              <div
                className={`booking-tab${
                  activeTab === "passenger" ? " active" : ""
                }`}
                onClick={() => setActiveTab("passenger")}
              >
                PASSENGER DETAILS
              </div>
              <div
                className={`booking-tab${
                  activeTab === "airport" ? " active" : ""
                }`}
                onClick={() => setActiveTab("airport")}
              >
                AIRPORT DETAILS
              </div>
            </div>
            <div className="booking-tab-underline" />
            {/* Passenger Form */}
            {activeTab === "passenger" && (
              <>
                <div className="booking-form-fields-row">
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">First Name</label>
                    <input
                      className="booking-form-input"
                      name="firstName"
                      value={bookingForm.firstName}
                      onChange={handleBookingFormChange}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Last Name</label>
                    <input
                      className="booking-form-input"
                      name="lastName"
                      value={bookingForm.lastName}
                      onChange={handleBookingFormChange}
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Designation</label>
                    <select
                      className="booking-form-input"
                      name="designation"
                      value={bookingForm.designation}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Designation</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Chief">Chief</option>
                      <option value="Engr.">Engr.</option>
                    </select>
                  </div>
                </div>
                <div className="booking-form-fields-row">
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Gender</label>
                    <select
                      className="booking-form-input"
                      name="gender"
                      value={bookingForm.gender}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Mobile Number</label>
                    <input
                      className="booking-form-input"
                      name="mobile"
                      value={bookingForm.mobile}
                      onChange={handleBookingFormChange}
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">
                      Special Requirement
                    </label>
                    <select
                      className="booking-form-input"
                      name="specialReq"
                      value={bookingForm.specialReq}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Special Requirement</option>
                      <option value="Nil">Nil</option>
                      <option value="Wheelchair">Wheelchair</option>
                      <option value="Assistance">Assistance</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            {/* Airport Details Form */}
            {activeTab === "airport" && (
              <>
                <div className="booking-form-fields-row">
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Airport</label>
                    <select
                      className="booking-form-input"
                      name="airport"
                      value={bookingForm.airport}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Airport</option>
                      <option value="MMIA">MMIA (INTERNATIONAL)</option>
                      <option value="ABV">ABV (ABUJA)</option>
                    </select>
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Travel Date</label>
                    <input
                      className="booking-form-input"
                      name="travelDate"
                      value={bookingForm.travelDate}
                      onChange={handleBookingFormChange}
                      placeholder="Travel Date"
                      type="date"
                    />
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Flight Number</label>
                    <input
                      className="booking-form-input"
                      name="flightNumber"
                      value={bookingForm.flightNumber}
                      onChange={handleBookingFormChange}
                      placeholder="Flight Number"
                    />
                  </div>
                </div>
                <div className="booking-form-fields-row">
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Airport Time</label>
                    <input
                      className="booking-form-input"
                      name="airportTime"
                      value={bookingForm.airportTime}
                      onChange={handleBookingFormChange}
                      placeholder="Airport Time"
                      type="time"
                    />
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Airline</label>
                    <select
                      className="booking-form-input"
                      name="airline"
                      value={bookingForm.airline}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Airline</option>
                      <option value="DELTA">DELTA</option>
                      <option value="ARIK">ARIK</option>
                    </select>
                  </div>
                  <div className="booking-form-field-col">
                    <label className="booking-form-label">Destination</label>
                    <select
                      className="booking-form-input"
                      name="destination"
                      value={bookingForm.destination}
                      onChange={handleBookingFormChange}
                    >
                      <option value="">Select Destination</option>
                      <option value="LAGOS">LAGOS</option>
                      <option value="ABUJA">ABUJA</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            <button
              className="booking-add-passenger-btn"
              type="button"
              onClick={handleAddPassenger}
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              + Add New Passenger
            </button>
            {bookingFormError && (
              <div className="booking-form-error">{bookingFormError}</div>
            )}
            {/* Passengers Table */}
            <div className="booking-passengers-table-section">
              <div className="booking-passengers-table-title">
                PASSENGERS ADDED
              </div>
              <div className="booking-passengers-table-wrap">
                <table className="booking-passengers-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>NAME</th>
                      <th>AIRPORT</th>
                      <th>AIRLINE</th>
                      <th>FLIGHT NO.</th>
                      <th>TRAVEL DATE/TIME</th>
                      <th>SPECIAL REQUI.</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}.</td>
                        <td>
                          {p.firstName} {p.lastName}
                        </td>
                        <td>{p.airport}</td>
                        <td>{p.airline}</td>
                        <td>{p.flightNumber}</td>
                        <td>
                          {p.travelDate}
                          {p.airportTime ? ` @${p.airportTime}` : ""}
                        </td>
                        <td>{p.specialReq || "Nil"}</td>
                        <td>
                          <button
                            className="booking-delete-btn"
                            onClick={() => handleDeletePassenger(idx)}
                          >
                            <span style={{ color: "#ef4444", fontWeight: 700 }}>
                              🗑 Delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Summary Card */}
            <div className="booking-summary-card">
              <div className="booking-summary-title">SUMMARY</div>
              <div className="booking-summary-row">
                <span>SUB-TOTAL</span>
                <span>₦{subTotal.toLocaleString()}</span>
              </div>
              <div className="booking-summary-row">
                <span>OTHER CHARGES</span>
                <span>₦{otherCharges.toLocaleString()}</span>
              </div>
              <div className="booking-summary-row total">
                <span>TOTAL</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div style={{ width: "100%" }}>
                <GradientButton
                  fullWidth
                  onClick={handlePayment}
                  disabled={passengers.length === 0}
                >
                  PAY
                </GradientButton>
              </div>
            </div>
            {/* Payment Loading Spinner Overlay */}
            <LoadingSpinner
              isVisible={showPaymentLoading}
              message="Processing payment..."
            />
            {/* Payment Success Modal Overlay */}
            {showPaymentSuccess && (
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
                      Payment Success!
                    </div>
                    <div className="customer-success-desc">
                      Your payment has been successfully done.
                    </div>
                    <div className="customer-success-actions">
                      <div style={{ width: "100%" }}>
                        <GradientButton
                          fullWidth
                          onClick={() => {
                            setShowPaymentSuccess(false);
                            setSelectedService(null);
                            setPassengers([]);
                            setBookingForm({
                              firstName: "",
                              lastName: "",
                              designation: "",
                              gender: "",
                              mobile: "",
                              specialReq: "",
                              airport: "",
                              travelDate: "",
                              flightNumber: "",
                              airportTime: "",
                              airline: "",
                              destination: "",
                            });
                            setActiveTab("passenger");
                          }}
                        >
                          BACK TO SERVICES
                        </GradientButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Service grid view
    return (
      <div className="services-customer-page">
        <MessageToast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
        <div className="page-header">
          <PageTitle icon={ServicesIcon} title="Services" />
        </div>
        <div className="services-customer-header">
          <SearchInput
            placeholder="Search services"
            value={customerSearchName}
            onChange={(e) => setCustomerSearchName(e.target.value)}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <BorderButton
              text="Search"
              onClick={handleCustomerSearch}
              className="border-button-userspage"
            />
            <BorderButton
              text="Clear"
              onClick={handleCustomerClearSearch}
              className="border-button-userspage"
            />
          </div>
        </div>

        {/* Show loading state while fetching tariffs */}
        {isLoadingTariffs && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading services...</p>
          </div>
        )}

        {/* Show services when not loading */}
        {!isLoadingTariffs && (
          <div className="services-customer-grid">
            {customerFilteredServices.map((service) => (
              <div className="service-card" key={service.id}>
                <div className="service-card-img-wrap">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="service-card-img"
                  />
                </div>
                <div className="service-card-name">{service.name}</div>
                <div className="service-card-price">
                  <TbCurrencyNaira
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      verticalAlign: "middle",
                      marginTop: -2,
                    }}
                  />
                  {service.price}
                </div>
                <div style={{ padding: "0 18px", width: "100%" }}>
                  <GradientButton
                    fullWidth
                    onClick={() => setSelectedService(service)}
                  >
                    BOOK SERVICE
                  </GradientButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="page-content">
        {!showAddServiceForm ? (
          <>
            <div className="page-header-bottom">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <SearchInput
                  placeholder="Search name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <BorderButton
                  text="Search"
                  onClick={handleSearch}
                  className="border-button-servicespage"
                />
                <BorderButton
                  text="Clear"
                  onClick={handleClearSearch}
                  className="border-button-servicespage"
                />
              </div>
              <div>
                <BorderButton
                  text="Add New Service"
                  icon={AddIcon}
                  onClick={() => setShowAddServiceForm(true)}
                  className="border-button-servicespage"
                />
              </div>
            </div>

            <div className="content-card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="table-header-item">ID</th>
                      <th className="table-header-item">Service Name</th>
                      <th className="table-header-item">Price</th>
                      <th className="table-header-item">Last Modified By</th>
                      <th className="table-header-item">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((product) => (
                      <tr key={product.id}>
                        <td className="table-data-item">{product.id}</td>
                        <td className="table-data-item">{product.name}</td>
                        <td className="table-data-item">₦{product.price}</td>
                        <td className="table-data-item last-modified-cell">
                          <span className="last-modified-name">
                            {product.name}:
                          </span>
                          <br />
                          <span className="last-modified-date">
                            12-08-2024 / 11:32pm
                          </span>
                        </td>
                        <td className="table-data-item">
                          <button className="action-btn-table edit">
                            <Edit size={16} /> Edit
                          </button>
                          <button className="action-btn-table delete">
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="add-service-form-card">
            <h2 className="add-user-title">Add New Service</h2>
            <p className="add-user-helper">
              Please input all required details to add a new service.
            </p>
            <form
              className="user-form-list"
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddServiceForm(false);
              }}
            >
              {services.map((service, idx) => (
                <div className="service-form-row" key={idx}>
                  <div className="service-index-circle">{idx + 1}.</div>
                  <div className="service-field-group service-name-group">
                    <label>Service Name:</label>
                    <div
                      className={`select-dropdown-wrapper${
                        serviceNameSelectOpen === idx ? " open" : ""
                      }`}
                    >
                      <select
                        value={service.serviceName}
                        onFocus={() => setServiceNameSelectOpen(idx)}
                        onBlur={() => setServiceNameSelectOpen(null)}
                        onChange={(e) => {
                          handleServiceChange(
                            idx,
                            "serviceName",
                            e.target.value
                          );
                          setServiceNameSelectOpen(null);
                        }}
                      >
                        <option value="">Select service</option>
                        {serviceNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <img
                        src={ChevronDown}
                        alt="dropdown"
                        className="select-chevron"
                      />
                    </div>
                  </div>
                  <div className="service-field-group currency-group">
                    <label>Currency:</label>
                    <CurrencyDropdown
                      label=""
                      value={service.currency}
                      options={["NGR"]}
                      onChange={(val) =>
                        handleServiceChange(idx, "currency", val)
                      }
                    />
                  </div>
                  <div className="service-field-group price-group">
                    <label>Price:</label>
                    <input
                      type="text"
                      value={formatNumberWithCommas(service.price)}
                      onChange={(e) =>
                        handleServiceChange(idx, "price", e.target.value)
                      }
                      placeholder=""
                    />
                  </div>
                </div>
              ))}
              <div className="form-row form-row-full">
                <button
                  type="button"
                  className="add-more-items-btn"
                  onClick={addMoreService}
                >
                  + Add New Service
                </button>
              </div>
              <div className="form-actions">
                <GradientButton type="submit" fullWidth>
                  SAVE ITEM(S)
                </GradientButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
