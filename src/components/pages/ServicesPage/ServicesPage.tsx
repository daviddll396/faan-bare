import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLoading } from "../../../contexts/LoadingContext";
import AddIcon from "../../../../public/icons/add-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import SearchInput from "../../reusables/SearchInput/SearchInput";
import ChevronDown from "../../../../public/icons/chevron-down.svg";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import ServicesIcon from "/icons/nav-product-icon.svg";
import "./ServicesPage.css";
import { Edit, Trash2 } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Modal from "../../reusables/Modal/Modal";
import SlideIndicator from "../../reusables/SlideIndicator";

// Dev-only guard to prevent duplicate fetches in React 18 StrictMode
let hasFetchedTariffs = false;

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
  description: "",
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
  const { showLoading, hideLoading } = useLoading();
  const getAllTariffsRef = useRef(getAllTariffs);
  const showLoadingRef = useRef(showLoading);
  const hideLoadingRef = useRef(hideLoading);

  useEffect(() => {
    getAllTariffsRef.current = getAllTariffs;
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
  }, [getAllTariffs, showLoading, hideLoading]);
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
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "transfer">(
    "transfer"
  );
  const [cardNumber, setCardNumber] = React.useState("");
  const [expirationDate, setExpirationDate] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [saveCard, setSaveCard] = React.useState(false);

  // Add search state for admin view
  const [searchName, setSearchName] = useState("");
  const [filteredServices, setFilteredServices] = useState(customerServices);
  const [allServices] = useState(customerServices); // Rename for clarity

  // Customer search state
  const [customerSearchName, setCustomerSearchName] = useState("");
  const [customerFilteredServices, setCustomerFilteredServices] =
    useState(customerServices);

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
    // Guard to prevent duplicate calls in development StrictMode
    if (hasFetchedTariffs) return;
    hasFetchedTariffs = true;

    const fetchTariffs = async () => {
      console.log("🎯 ServicesPage: Attempting to fetch all tariffs...");
      showLoadingRef.current("Loading services...");
      try {
        const tariffsData = await getAllTariffsRef.current();
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
        hideLoadingRef.current();
      }
    };

    fetchTariffs();
  }, []);

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

  // Responsive window width for conditional PageTitle
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (role === "Customer" || role === "Guest") {
    // Booking form view
    if (selectedService) {
      // Calculate summary values based on selected service and passenger count
      const passengerCount = passengers.length || 1; // At least 1 for the service itself
      const serviceAmount = selectedService.amount || 0;
      const subTotal = serviceAmount * passengerCount;
      const otherCharges = 500; // Fixed charge
      const total = subTotal + otherCharges;

      // Function to show payment modal
      const handlePayment = () => {
        if (!selectedService?.id) {
          showToast("No service selected for payment", "error");
          return;
        }

        if (passengers.length === 0) {
          showToast("Please add at least one passenger", "error");
          return;
        }

        setShowPaymentModal(true);
      };

      // Function to process payment after modal submission
      const handlePaymentSubmit = async () => {
        setShowPaymentModal(false);
        showLoading("Processing payment...");

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
            hideLoading();
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
            hideLoading();
            setTimeout(() => {
              showToast("Payment failed. Please try again.", "error");
            }, 500);
            console.log("🎯 ServicesPage: Payment failed");
          }
        } catch (error) {
          console.error("🎯 ServicesPage: Payment error:", error);
          hideLoading();
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
            {/* Desktop PageTitle with breadcrumbs */}
            {windowWidth > 768 && (
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
            )}
            {/* Mobile PageTitle with back button */}
            {windowWidth <= 768 && (
              <PageTitle
                icon={ServicesIcon}
                title="Book Service"
                onBackClick={() => setSelectedService(null)}
              />
            )}
          </div>
          <div className="booking-form-card">
            <h2 className="booking-form-title">
              {windowWidth <= 768
                ? selectedService.name
                : "Please input all required details to add a passenger."}
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
                {windowWidth > 768 ? (
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
                      <label className="booking-form-label">
                        Mobile Number
                      </label>
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
                ) : (
                  <div className="booking-form-fields-row-mobile">
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label">First Name</label>
                      <input
                        className="booking-form-input"
                        name="firstName"
                        value={bookingForm.firstName}
                        onChange={handleBookingFormChange}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label">Last Name</label>
                      <input
                        className="booking-form-input"
                        name="lastName"
                        value={bookingForm.lastName}
                        onChange={handleBookingFormChange}
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
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
                    <div className="booking-form-field-col-mobile">
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
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label">
                        Mobile Number
                      </label>
                      <input
                        className="booking-form-input"
                        name="mobile"
                        value={bookingForm.mobile}
                        onChange={handleBookingFormChange}
                        placeholder="Mobile Number"
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
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
                )}
                <button
                  className="booking-add-passenger-btn"
                  type="button"
                  onClick={handleAddPassenger}
                  style={{ marginTop: 12, marginBottom: 0 }}
                >
                  + Add New Passenger
                </button>
                <MessageToast
                  message={bookingFormError}
                  type="error"
                  isVisible={!!bookingFormError}
                  onClose={() => setBookingFormError("")}
                />
              </>
            )}
            {/* Airport Details Form */}
            {activeTab === "airport" && (
              <>
                {windowWidth > 768 ? (
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
                        <label className="booking-form-label">
                          Travel Date
                        </label>
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
                        <label className="booking-form-label">
                          Flight Number
                        </label>
                        <input
                          className="booking-form-input"
                          name="flightNumber"
                          value={bookingForm.flightNumber}
                          onChange={handleBookingFormChange}
                          placeholder="Flight Number"
                        />
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label">
                          Airport Time
                        </label>
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
                        <label className="booking-form-label">
                          Destination
                        </label>
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
                ) : (
                  <>
                    <div className="booking-form-fields-row-mobile">
                      <div className="booking-form-field-col-mobile">
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
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label">
                          Travel Date
                        </label>
                        <input
                          className="booking-form-input"
                          name="travelDate"
                          value={bookingForm.travelDate}
                          onChange={handleBookingFormChange}
                          placeholder="Travel Date"
                          type="date"
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label">
                          Flight Number
                        </label>
                        <input
                          className="booking-form-input"
                          name="flightNumber"
                          value={bookingForm.flightNumber}
                          onChange={handleBookingFormChange}
                          placeholder="Flight Number"
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label">
                          Airport Time
                        </label>
                        <input
                          className="booking-form-input"
                          name="airportTime"
                          value={bookingForm.airportTime}
                          onChange={handleBookingFormChange}
                          placeholder="Airport Time"
                          type="time"
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
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
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label">
                          Destination
                        </label>
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
                <MessageToast
                  message={bookingFormError}
                  type="error"
                  isVisible={!!bookingFormError}
                  onClose={() => setBookingFormError("")}
                />
              </>
            )}
            {/* Only show passengers table and summary card inside form card on desktop */}
            {windowWidth > 768 && (
              <>
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
                          <th>SPECIAL REQUIREMENTS</th>
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
                                <span
                                  style={{ color: "#ef4444", fontWeight: 700 }}
                                >
                                  🗑 Delete
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {passengers.length > 0 && (
                    <div className="booking-passengers-actions">
                      <BorderButton
                        text="Generate Remita"
                        onClick={handlePayment}
                      />
                    </div>
                  )}
                </div>
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
              </>
            )}
          </div>
          {/* On mobile, show passengers table and summary card outside the form card */}
          {windowWidth <= 768 && (
            <>
              <div className="booking-passengers-table-section">
                <div className="booking-passengers-table-title">
                  PASSENGERS ADDED
                </div>
                <div className="booking-passengers-mobile-list">
                  {passengers.map((p, idx) => (
                    <div className="passenger-mobile-card" key={idx}>
                      <div className="passenger-mobile-icon-wrap">
                        <img
                          src="/icons/passengers-details-airplane.svg"
                          alt="Airplane"
                          className="passenger-mobile-icon"
                        />
                      </div>
                      <div className="passenger-mobile-details">
                        <div className="passenger-mobile-title">
                          {p.airport || "International Arrival"}
                        </div>
                        <div className="passenger-mobile-price">
                          ₦{selectedService.price || "25,000"}
                        </div>
                        <div className="passenger-mobile-name">
                          <span
                            style={{
                              color: "var(--green)",
                              fontWeight: 500,
                              fontSize: 12,
                              textTransform: "none",
                              fontStyle: "italic",
                            }}
                          >
                            <svg
                              style={{
                                verticalAlign: "middle",
                                marginRight: 3,
                              }}
                              width="12"
                              height="12"
                              fill="var(--green)"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                            {p.firstName} {p.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="passenger-mobile-actions">
                        <button
                          className="passenger-mobile-delete"
                          aria-label="Delete Passenger"
                          onClick={() => handleDeletePassenger(idx)}
                        >
                          <img
                            src="/icons/passenger-delete.svg"
                            alt="Delete"
                            style={{ width: 20, height: 20 }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {passengers.length > 0 && (
                  <div className="booking-passengers-actions">
                    <BorderButton
                      text="Generate Remita"
                      onClick={handlePayment}
                    />
                  </div>
                )}
              </div>
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
              </div>
              <div style={{ width: "100%", marginTop: 12 }}>
                <GradientButton
                  fullWidth
                  onClick={handlePayment}
                  disabled={passengers.length === 0}
                >
                  PAY
                </GradientButton>
              </div>
            </>
          )}

          {/* Payment Success Modal */}
          <Modal
            isOpen={showPaymentSuccess}
            onClose={() => {
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
            showHeader={false}
            className="service-payment-success-modal"
          >
            <div className="service-payment-success-content">
              <div className="customer-success-icon-wrap">
                <img
                  src={CheckCircle}
                  alt="success"
                  className="customer-success-icon"
                />
              </div>
              <div className="customer-success-title">Payment Success!</div>
              <div className="customer-success-desc">
                Your payment has been made successfully.
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
          </Modal>

          {/* Payment Modal */}
          <Modal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setPaymentMethod("transfer");
              setCardNumber("");
              setExpirationDate("");
              setCvv("");
              setSaveCard(false);
            }}
            showHeader={true}
            headerTitle="FEDERAL AIRPORT AUTHORITY OF NIGERIA"
            className="service-payment-modal"
          >
            <div className="service-payment-modal-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePaymentSubmit();
                }}
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "#0079480D",
                    borderRadius: 12,
                    padding: "14px",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <span
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Amount
                    </span>
                    <span
                      style={{
                        color: "var(--black)",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Account Number
                    </span>
                    <span
                      style={{
                        color: "var(--black)",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      0035678923
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Bank
                    </span>
                    <span
                      style={{
                        color: "var(--black)",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      Access Bank
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "#6c7278",
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Name
                    </span>
                    <span
                      style={{
                        color: "var(--black)",
                        fontWeight: 600,
                        fontSize: 16,
                        float: "right",
                      }}
                    >
                      FAAN A/C
                    </span>
                  </div>
                </div>
                <div style={{ width: "100%", marginBottom: 24 }}>
                  <div
                    style={{
                      color: "var(--black)",
                      fontWeight: 600,
                      fontSize: 16,
                      marginBottom: 12,
                    }}
                  >
                    Pay With:
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: `2px solid ${
                            paymentMethod === "card" ? "#007948" : "#d1d5db"
                          }`,
                          borderRadius: "50%",
                          position: "relative",
                          background:
                            paymentMethod === "card"
                              ? "#007948"
                              : "transparent",
                        }}
                      >
                        {paymentMethod === "card" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 6,
                              height: 6,
                              background: "white",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--black)",
                        }}
                      >
                        Card
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={() => setPaymentMethod("transfer")}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: `2px solid ${
                            paymentMethod === "transfer" ? "#007948" : "#d1d5db"
                          }`,
                          borderRadius: "50%",
                          position: "relative",
                          background:
                            paymentMethod === "transfer"
                              ? "#007948"
                              : "transparent",
                        }}
                      >
                        {paymentMethod === "transfer" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 6,
                              height: 6,
                              background: "white",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--black)",
                        }}
                      >
                        Transfer
                      </span>
                    </label>
                  </div>
                </div>
                {/* Card Details */}
                {paymentMethod === "card" && (
                  <div style={{ width: "100%", marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--black)",
                          marginBottom: 6,
                        }}
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Enter card number"
                        maxLength={16}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1.5px solid #e4e4e7",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          background: "#fff",
                          color: "#18181b",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--black)",
                            marginBottom: 6,
                          }}
                        >
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1.5px solid #e4e4e7",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            background: "#fff",
                            color: "#18181b",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--black)",
                            marginBottom: 6,
                          }}
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1.5px solid #e4e4e7",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            background: "#fff",
                            color: "#18181b",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        style={{ display: "none" }}
                      />
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: `2px solid ${
                            saveCard ? "#007948" : "#d1d5db"
                          }`,
                          borderRadius: 4,
                          position: "relative",
                          background: saveCard ? "#007948" : "transparent",
                        }}
                      >
                        {saveCard && (
                          <span
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "white",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--black)",
                        }}
                      >
                        Save card details
                      </span>
                    </label>
                  </div>
                )}
                <GradientButton type="submit" fullWidth size="large">
                  PAY
                </GradientButton>
                <p
                  style={{
                    fontSize: 12,
                    color: "#acacac",
                    textAlign: "center",
                    lineHeight: 1.5,
                    marginTop: "15px",
                  }}
                >
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our{" "}
                  <a
                    href="#"
                    style={{ color: "#007948", textDecoration: "underline" }}
                  >
                    privacy policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </Modal>
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

        {/* Show services */}
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
              <div className="service-card-btn-wrap">
                <GradientButton
                  fullWidth
                  size={windowWidth <= 768 ? "tiny" : "medium"}
                  onClick={() => setSelectedService(service)}
                >
                  BOOK SERVICE
                </GradientButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="page-content">
        {!showAddServiceForm ? (
          <>
            {windowWidth <= 768 && (
              <PageTitle title="Services" icon={ServicesIcon} />
            )}

            <div className="page-header-bottom">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: windowWidth <= 768 ? "100%" : "auto",
                  gap: 12,
                  justifyContent: "space-between",
                }}
              >
                <SearchInput
                  placeholder="Search name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <div style={{ display: "flex", gap: 12 }}>
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
                        <td className="table-data-item max-td-width-mobile">
                          {product.name}
                        </td>
                        <td className="table-data-item">₦{product.price}</td>
                        <td className="table-data-item last-modified-cell">
                          {/* <span className="table-data-item last-modified-name max-td-width-mobile">
                            {product.name}:
                          </span> */}
                          {/* <br /> */}
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
            {windowWidth <= 768 && <SlideIndicator />}
          </>
        ) : (
          <>
            {windowWidth <= 768 && (
              <PageTitle title="Add New Service" icon={AddIcon} />
            )}
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
                    <div className="service-form-body">
                      <div className="service-row-top">
                        <div className="service-field-group service-name-group">
                          <label>Service Name:</label>
                          <div
                            className={`services-select-dropdown-wrapper${
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
                              className="services-select-chevron"
                            />
                          </div>
                        </div>
                        <div className="service-field-group currency-group">
                          <label>Currency:</label>
                          <div className="services-select-dropdown-wrapper">
                            <select
                              value={service.currency}
                              onChange={(e) =>
                                handleServiceChange(
                                  idx,
                                  "currency",
                                  e.target.value
                                )
                              }
                            >
                              <option value="NGR">NGR</option>
                            </select>
                            <img
                              src={ChevronDown}
                              alt="dropdown"
                              className="services-select-chevron"
                            />
                          </div>
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
                      <div className="service-field-group description-group">
                        <label>Description:</label>
                        <textarea
                          value={service.description}
                          onChange={(e) =>
                            handleServiceChange(
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Enter service description"
                          rows={3}
                        />
                      </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
