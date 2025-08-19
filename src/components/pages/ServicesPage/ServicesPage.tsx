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
import { FiUserPlus } from "react-icons/fi";
import CheckCircle from "../../../../public/icons/check-circle.svg";
import MessageToast from "../../reusables/MessageToast/MessageToast";
import Modal from "../../reusables/Modal/Modal";
import SlideIndicator from "../../reusables/SlideIndicator";
import DataTable from "../../reusables/DataTable/DataTable";

// ITEXPay inline types (local)
type ItexPayOptions = {
  api_key: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  amount: number;
  redirecturl?: string;
  currency: string;
  reference: string;
  onCompleted: (data: unknown) => void;
  onError: (err: unknown) => void;
  onClose?: () => void;
};

interface ItexPayInstance {
  init: () => void;
}

interface ItexPayNS {
  ItexPay: new (opts: ItexPayOptions) => ItexPayInstance;
}

type WindowWithItex = Window & { ItexPayNS?: ItexPayNS };

// Payment provider: ITEXPay inline is used for payments

// Guard to prevent duplicate fetches within a single mount (React 18 StrictMode)

interface ServicesPageProps {
  role?: string;
}

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
    description: "Facilitation of International Arrival service",
    price: "7,000",
    amount: 7000,
    image: "/images/intl-arrival.svg",
  },
  {
    id: 2,
    name: "International Departure",
    description: "Facilitation of International Departure service",
    price: "7,000",
    amount: 7000,
    image: "/images/intl-departure.svg",
  },
  {
    id: 3,
    name: "VIP lounge International",
    description: "NAIA VIP International lounge service",
    price: "5,000",
    amount: 5000,
    image: "/images/vip-lounge.svg",
  },
  {
    id: 4,
    name: "Abuja International OneOff",
    description: "International Facilitation for Abuja One-off users",
    price: "10,000",
    amount: 10000,
    image: "/images/abj-intl.svg",
  },
  {
    id: 5,
    name: "One Year Protocol Service (Domestic operations PH)",
    description: "2 UNITS WHITE ODC",
    price: "1,000,000",
    amount: 1000000,
    image: "/images/one-year.svg",
  },
  {
    id: 6,
    name: "Additional One(1) Unit(Domestic ODC PH)",
    description: "1 unit additional DOMESTIC",
    price: "200,000",
    amount: 200000,
    image: "/images/add-one-unit.svg",
  },
  {
    id: 7,
    name: "Extra ODC",
    description: "Adding Extra ODC after the first addition",
    price: "300,000",
    amount: 300000,
    image: "/images/add-one-unit.svg",
  },
  {
    id: 8,
    name: "Protocol Car Park Porthacourt",
    description: "Car park for one year",
    price: "1,000,000",
    amount: 1000000,
    image: "/images/ph-protocol.svg",
  },
  {
    id: 9,
    name: "Protocol Lounge porthacourt",
    description: "Lounge service for one year",
    price: "1,000,000",
    amount: 1000000,
    image: "/images/vip-lounge.svg",
  },
  {
    id: 10,
    name: "Test Airport Service 1",
    description: "This is to test the test service api integration",
    price: "500",
    amount: 500,
    image: "/images/default-service.svg",
  },
  {
    id: 11,
    name: "EXtra On-Duty-charge",
    description: "For ODC",
    price: "10,000",
    amount: 10000,
    image: "/images/default-service.svg",
  },
];

type CustomerService = (typeof customerServices)[number];

interface AdminService {
  id: number;
  name: string;
  price: string;
  amount: number;
  description: string;
  lastModified: string;
}

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
  // Note: Remita removed — using ITEXPay for payments

  const { getAllTariffs, refreshUserDetails, createTariff, makePayment, user } =
    useAuth();
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
  // Airline and destination options for booking form
  const airlineOptions = [
    "DELTA",
    "ARIK",
    "AIR PEACE",
    "DANA AIR",
    "IBOM AIR",
    "AZMAN AIR",
    "MAX AIR",
    "ETHIOPIAN AIRLINES",
    "TURKISH AIRLINES",
    "KLM",
    "AIR FRANCE",
  ];
  const destinationOptions = [
    "LAGOS",
    "ABUJA",
    "PORT HARCOURT",
    "KANO",
    "KADUNA",
    "JOS",
    "YOLA",
    "LONDON",
    "DUBAI",
    "DOHA",
    "JOHANNESBURG",
    "ACCRA",
  ];
  const [passengers, setPassengers] = React.useState<BookingPassenger[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [bookingFormError, setBookingFormError] = React.useState<string | null>(
    null
  );
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);
  const [lastOrderId] = React.useState<string>("");
  const [receiptData, setReceiptData] = React.useState<{
    invoiceNumber: string;
    rrr: string;
    transactionId: number;
    amount: number;
    serviceName: string;
    customerId: string;
    paymentDate: string;
  } | null>(null);

  // Add search state for admin view
  const [searchName, setSearchName] = useState("");
  const [filteredServices, setFilteredServices] = useState<AdminService[]>([]);
  const [allServices, setAllServices] = useState<AdminService[]>([]); // Admin services from API

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

    // If we have a mapped image, use it
    if (imageMap[tariffName]) {
      return imageMap[tariffName];
    }

    // If no mapped image, return a random image from our available images
    const availableImages = [
      "/images/intl-arrival.svg",
      "/images/intl-departure.svg",
      "/images/vip-lounge.svg",
      "/images/abj-intl.svg",
      "/images/one-year.svg",
      "/images/add-one-unit.svg",
      "/images/ph-protocol.svg",
      "/images/ph-domestic.svg",
    ];

    // Generate a consistent random image based on the tariff name
    // This ensures the same service always gets the same random image
    const hash = tariffName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const randomIndex = Math.abs(hash) % availableImages.length;
    return availableImages[randomIndex];
  };

  // Add useEffect to fetch tariffs when component mounts
  useEffect(() => {
    // Per-mount ref guard (avoids double-invoke within a single mount in StrictMode)
    const fetchedRef = { current: false } as { current: boolean };

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
            // Convert API tariffs to customer service format (include description)
            const convertedServices = tariffsData.data.map(
              (tariff: {
                id: number;
                name: string;
                description?: string;
                amount: number;
              }) => ({
                id: tariff.id,
                name: tariff.name,
                description: tariff.description || "Description not available",
                price: tariff.amount.toLocaleString(), // Convert amount to formatted string
                amount: tariff.amount, // Keep the raw amount for calculations
                image: getImageForTariff(tariff.name), // Map to existing image
              })
            );
            setCustomerFilteredServices(convertedServices);

            // Also update admin services table with API data
            const adminServices = tariffsData.data.map(
              (tariff: {
                id: number;
                name: string;
                description: string;
                amount: number;
              }) => ({
                id: tariff.id,
                name: tariff.name,
                price: tariff.amount.toLocaleString(),
                amount: tariff.amount,
                description: tariff.description || "No description available",
                lastModified: "12-08-2024 / 11:32pm", // Default value for now
              })
            );
            setFilteredServices(adminServices);
            setAllServices(adminServices);

            console.log(
              "🎯 ServicesPage: Converted services:",
              convertedServices
            );
            console.log("🎯 ServicesPage: Admin services:", adminServices);
            setTimeout(() => {
              showToast(`Services loaded successfully`, "success");
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

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchTariffs();
    }
  }, []);

  // Add useEffect to check if Remita script is loaded
  // Remita script removed.

  // Monitor payment success modal state changes
  useEffect(() => {
    console.log("🎭 Payment Success Modal State Changed:", showPaymentSuccess);
  }, [showPaymentSuccess]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleServiceChange = (
    idx: number,
    field: keyof typeof initialService,
    value: string
  ) => {
    setServices(
      services.map((service, i) =>
        i === idx ? { ...service, [field]: value } : service
      )
    );
  };

  // removed unused addMoreService helper (UI currently doesn't expose adding more rows)

  const handleBookingFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
    // Clear field error when user starts typing/selecting
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: false }));
    }
    // Clear any form-level error message when user edits fields
    if (bookingFormError) setBookingFormError(null);
  };

  const handleCreateServices = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all services have required fields
    const validServices = services.filter(
      (service) => service.serviceName && service.price && service.description
    );

    if (validServices.length === 0) {
      showToast(
        "Please fill in all required fields for at least one service",
        "error"
      );
      return;
    }

    showLoading("Creating services...");

    try {
      let successCount = 0;
      let errorCount = 0;

      // Create each service
      for (const service of validServices) {
        try {
          const request = {
            name: service.serviceName,
            amount: parseFloat(service.price),
            description: service.description,
          };

          console.log("🚀 Creating service:", request);
          const response = await createTariff(request);

          if (response && response.status) {
            console.log("✅ Service created successfully:", response.data);
            successCount++;
          } else {
            console.error("❌ Failed to create service:", response);
            errorCount++;
          }
        } catch (error) {
          console.error("💥 Error creating service:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully created ${successCount} service(s)${
            errorCount > 0 ? `, ${errorCount} failed` : ""
          }`,
          "success"
        );

        // Refresh the services list
        await getAllTariffs();

        // Also refresh admin services table
        const refreshedTariffsData = await getAllTariffs();
        if (
          refreshedTariffsData &&
          refreshedTariffsData.status &&
          refreshedTariffsData.data
        ) {
          const refreshedAdminServices = refreshedTariffsData.data.map(
            (tariff: {
              id: number;
              name: string;
              description: string;
              amount: number;
            }) => ({
              id: tariff.id,
              name: tariff.name,
              price: tariff.amount.toLocaleString(),
              amount: tariff.amount,
              description: tariff.description || "No description available",
              lastModified: "12-08-2024 / 11:32pm",
            })
          );
          setFilteredServices(refreshedAdminServices);
          setAllServices(refreshedAdminServices);
        }

        // Reset form and close modal
        setServices([{ ...initialService }]);
        setShowAddServiceForm(false);
      } else {
        showToast("Failed to create any services. Please try again.", "error");
      }
    } catch (error) {
      console.error("💥 Error in handleCreateServices:", error);
      showToast("An error occurred while creating services", "error");
    } finally {
      hideLoading();
    }
  };

  const handleAddPassenger = () => {
    // Check each required field and set field errors
    const newFieldErrors: { [key: string]: boolean } = {};

    if (!bookingForm.firstName.trim()) {
      newFieldErrors.firstName = true;
    }
    if (!bookingForm.lastName.trim()) {
      newFieldErrors.lastName = true;
    }
    if (!bookingForm.designation) {
      newFieldErrors.designation = true;
    }
    if (!bookingForm.gender) {
      newFieldErrors.gender = true;
    }
    if (!bookingForm.mobile.trim()) {
      newFieldErrors.mobile = true;
    }
    if (!bookingForm.specialReq) {
      newFieldErrors.specialReq = true;
    }
    if (!bookingForm.airport) {
      newFieldErrors.airport = true;
    }
    if (!bookingForm.travelDate) {
      newFieldErrors.travelDate = true;
    }
    if (!bookingForm.flightNumber.trim()) {
      newFieldErrors.flightNumber = true;
    }
    if (!bookingForm.airportTime) {
      newFieldErrors.airportTime = true;
    }
    if (!bookingForm.airline) {
      newFieldErrors.airline = true;
    }
    if (!bookingForm.destination) {
      newFieldErrors.destination = true;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      // Map keys to human friendly labels
      const labelMap: { [key: string]: string } = {
        firstName: "First Name",
        lastName: "Last Name",
        designation: "Designation",
        gender: "Gender",
        mobile: "Mobile Number",
        specialReq: "Special Requirement",
        airport: "Airport",
        travelDate: "Travel Date",
        flightNumber: "Flight Number",
        airportTime: "Airport Time",
        airline: "Airline",
        destination: "Destination",
      };
      const missing = Object.keys(newFieldErrors).map((k) => labelMap[k] || k);
      setBookingFormError(
        `Please fill in all required details: ${missing.join(", ")}`
      );
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
    setFieldErrors({});
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

      // Function to process payment: Guests use ITEXPay inline; Customers call backend directly
      const handlePayment = async () => {
        if (!selectedService?.id) {
          showToast("No service selected for payment", "error");
          return;
        }

        if (passengers.length === 0) {
          showToast("Please add at least one passenger", "error");
          return;
        }

        const firstName =
          passengers[0]?.firstName || user?.firstName || "Guest";
        const lastName = passengers[0]?.lastName || user?.lastName || "User";
        const email = user?.email || "guest@example.com";
        const transactionId = Math.floor(Math.random() * 1101233);
        const reference = `NM-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        // If authenticated Customer: call makePayment backend directly
        if (user && user.role === "Customer") {
          try {
            showToast("Processing payment...", "success");
            const result = await makePayment(reference, selectedService.id);
            if (result?.success) {
              const paymentInfo = {
                invoiceNumber: lastOrderId || `INV-${Date.now()}`,
                rrr: reference,
                transactionId,
                amount: total,
                serviceName: selectedService.name,
                customerId: user?.customerId || "GUEST",
                paymentDate: new Date().toLocaleString(),
              };
              setReceiptData(paymentInfo);
              setShowReceiptModal(true);
              refreshUserDetails();
              showToast("Payment recorded successfully", "success");
            } else {
              showToast(result?.message || "Payment failed", "error");
            }
          } catch (err) {
            console.error("Error calling makePayment for Customer:", err);
            showToast("Payment failed. Please try again.", "error");
          }

          return;
        }

        // Otherwise (Guest): use ITEXPay inline
        try {
          let isPaymentSuccessful = false;

          console.log("🚀 === STARTING ITEXPAY PAYMENT ===");
          console.log("💰 Amount:", total);
          console.log("🔢 Transaction ID:", transactionId);

          const win = window as WindowWithItex;
          const itexAvailable = !!(win && win.ItexPayNS);
          if (!itexAvailable) {
            showToast("Payment provider unavailable", "error");
            return;
          }

          // Hardcoded ITEXPay API key for debugging
          const apiKey =
            "ITXPUB_STAGING_N9OSLGOKR2WT6KNKMRPHI0TNDZF3FEMCFDUO2PFN-6011000252-04GPRVVTV0CPUVD";

          const Pay = new win.ItexPayNS!.ItexPay({
            api_key: apiKey,
            first_name: firstName,
            last_name: lastName,
            phone_number: user?.phoneNumber || "",
            email: email,
            amount: Math.round(total),
            redirecturl: window.location.origin + "/",
            currency: "NGN",
            reference,
            onCompleted: async () => {
              if (isPaymentSuccessful) return;
              isPaymentSuccessful = true;
              showToast("Payment successful!", "success");
              try {
                await makePayment(reference, selectedService.id);
              } catch (err) {
                console.error("Error calling makePayment after ITEX:", err);
              }
              const paymentInfo = {
                invoiceNumber: lastOrderId || `INV-${Date.now()}`,
                rrr: reference,
                transactionId,
                amount: total,
                serviceName: selectedService.name,
                customerId: user?.customerId || "GUEST",
                paymentDate: new Date().toLocaleString(),
              };
              setReceiptData(paymentInfo);
              setShowReceiptModal(true);
              refreshUserDetails();
            },
            onError: (err: unknown) => {
              console.error("ITEXPay error:", err);
              showToast("Payment failed. Please try again.", "error");
            },
            onClose: () => {
              if (!isPaymentSuccessful)
                showToast("Payment was cancelled", "error");
            },
          });

          try {
            Pay.init();
          } catch (err) {
            console.error("ITEX init error", err);
            showToast("Payment initialization failed", "error");
          }
        } catch (error) {
          console.error("💥 Payment initialization error:", error);
          showToast("Failed to initialize payment", "error");
        }
      };

      // RRR generation removed (Remita no longer used)

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
                : "Passenger & Airport Details"}
            </h2>
            {windowWidth > 768 && (
              <p className="booking-form-helper">
                Please input all required passenger and airport details to add a
                passenger.
              </p>
            )}
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
                      <label className="booking-form-label required">
                        First Name
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.firstName ? "error" : ""
                        }`}
                        name="firstName"
                        value={bookingForm.firstName}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col">
                      <label className="booking-form-label required">
                        Last Name
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.lastName ? "error" : ""
                        }`}
                        name="lastName"
                        value={bookingForm.lastName}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col">
                      <label className="booking-form-label required">
                        Designation
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.designation ? "error" : ""
                        }`}
                        name="designation"
                        value={bookingForm.designation}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
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
                      <label className="booking-form-label required">
                        Gender
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.gender ? "error" : ""
                        }`}
                        name="gender"
                        value={bookingForm.gender}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="booking-form-field-col">
                      <label className="booking-form-label required">
                        Mobile Number
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.mobile ? "error" : ""
                        }`}
                        name="mobile"
                        value={bookingForm.mobile}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col">
                      <label className="booking-form-label required">
                        Special Requirement
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.specialReq ? "error" : ""
                        }`}
                        name="specialReq"
                        value={bookingForm.specialReq}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
                        <option value="none">none</option>
                        <option value="wheelchair">wheelchair</option>
                        <option value="assistance">assistance</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="booking-form-fields-row-mobile">
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label required">
                        First Name
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.firstName ? "error" : ""
                        }`}
                        name="firstName"
                        value={bookingForm.firstName}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label required">
                        Last Name
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.lastName ? "error" : ""
                        }`}
                        name="lastName"
                        value={bookingForm.lastName}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label required">
                        Designation
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.designation ? "error" : ""
                        }`}
                        name="designation"
                        value={bookingForm.designation}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
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
                      <label className="booking-form-label required">
                        Gender
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.gender ? "error" : ""
                        }`}
                        name="gender"
                        value={bookingForm.gender}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label required">
                        Mobile Number
                      </label>
                      <input
                        className={`booking-form-input ${
                          fieldErrors.mobile ? "error" : ""
                        }`}
                        name="mobile"
                        value={bookingForm.mobile}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                    <div className="booking-form-field-col-mobile">
                      <label className="booking-form-label required">
                        Special Requirement
                      </label>
                      <select
                        className={`booking-form-input ${
                          fieldErrors.specialReq ? "error" : ""
                        }`}
                        name="specialReq"
                        value={bookingForm.specialReq}
                        onChange={handleBookingFormChange}
                      >
                        <option value=""></option>
                        <option value="none">none</option>
                        <option value="wheelchair">wheelchair</option>
                        <option value="assistance">assistance</option>
                      </select>
                    </div>
                  </div>
                )}
                {/* Show form-level error above add button */}
                {bookingFormError && (
                  <div className="booking-form-error-text">
                    {bookingFormError}
                  </div>
                )}
                <div className="booking-add-passenger-row">
                  <button
                    className="booking-add-passenger-btn"
                    type="button"
                    onClick={handleAddPassenger}
                    style={{ marginTop: 12, marginBottom: 0 }}
                  >
                    + Add New Passenger
                  </button>
                </div>
              </>
            )}
            {/* Airport Details Form */}
            {activeTab === "airport" && (
              <>
                {windowWidth > 768 ? (
                  <>
                    <div className="booking-form-fields-row">
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Airport
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.airport ? "error" : ""
                          }`}
                          name="airport"
                          value={bookingForm.airport}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          <option value="MMIA">MMIA (INTERNATIONAL)</option>
                          <option value="ABV">ABV (ABUJA)</option>
                        </select>
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Travel Date
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.travelDate ? "error" : ""
                          }`}
                          name="travelDate"
                          value={bookingForm.travelDate}
                          onChange={handleBookingFormChange}
                          type="date"
                        />
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Flight Number
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.flightNumber ? "error" : ""
                          }`}
                          name="flightNumber"
                          value={bookingForm.flightNumber}
                          onChange={handleBookingFormChange}
                        />
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Airport Time
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.airportTime ? "error" : ""
                          }`}
                          name="airportTime"
                          value={bookingForm.airportTime}
                          onChange={handleBookingFormChange}
                          type="time"
                        />
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Airline
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.airline ? "error" : ""
                          }`}
                          name="airline"
                          value={bookingForm.airline}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          {airlineOptions.map((al) => (
                            <option key={al} value={al}>
                              {al}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="booking-form-field-col">
                        <label className="booking-form-label required">
                          Destination
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.destination ? "error" : ""
                          }`}
                          name="destination"
                          value={bookingForm.destination}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          {destinationOptions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="booking-form-fields-row-mobile">
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Airport
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.airport ? "error" : ""
                          }`}
                          name="airport"
                          value={bookingForm.airport}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          <option value="MMIA">MMIA (INTERNATIONAL)</option>
                          <option value="ABV">ABV (ABUJA)</option>
                        </select>
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Travel Date
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.travelDate ? "error" : ""
                          }`}
                          name="travelDate"
                          value={bookingForm.travelDate}
                          onChange={handleBookingFormChange}
                          type="date"
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Flight Number
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.flightNumber ? "error" : ""
                          }`}
                          name="flightNumber"
                          value={bookingForm.flightNumber}
                          onChange={handleBookingFormChange}
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Airport Time
                        </label>
                        <input
                          className={`booking-form-input ${
                            fieldErrors.airportTime ? "error" : ""
                          }`}
                          name="airportTime"
                          value={bookingForm.airportTime}
                          onChange={handleBookingFormChange}
                          type="time"
                        />
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Airline
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.airline ? "error" : ""
                          }`}
                          name="airline"
                          value={bookingForm.airline}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          {airlineOptions.map((al) => (
                            <option key={al} value={al}>
                              {al}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="booking-form-field-col-mobile">
                        <label className="booking-form-label required">
                          Destination
                        </label>
                        <select
                          className={`booking-form-input ${
                            fieldErrors.destination ? "error" : ""
                          }`}
                          name="destination"
                          value={bookingForm.destination}
                          onChange={handleBookingFormChange}
                        >
                          <option value=""></option>
                          {destinationOptions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                {/* Show form-level error above add button */}
                {bookingFormError && (
                  <div className="booking-form-error-text">
                    {bookingFormError}
                  </div>
                )}
                <div className="booking-add-passenger-row">
                  <button
                    className="booking-add-passenger-btn"
                    type="button"
                    onClick={handleAddPassenger}
                    style={{ marginTop: 12, marginBottom: 0 }}
                  >
                    + Add New Passenger
                  </button>
                </div>
              </>
            )}
            {/* Only show passengers table and summary card inside form card on desktop */}
            {windowWidth > 768 && (
              <>
                <div className="booking-passengers-table-section">
                  <div className="booking-passengers-table-title">
                    PASSENGERS ADDED
                  </div>
                  <div className="booking-passengers-list">
                    {passengers.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#6c6c6c" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <FiUserPlus size={18} /> No passengers yet. Please add
                          a passenger to continue.
                        </span>
                      </div>
                    ) : (
                      <div className="passengers-pill-wrap">
                        {passengers.map((p, idx) => (
                          <div className="passenger-pill" key={idx}>
                            <div className="passenger-pill-left">
                              <img
                                src="/icons/passengers-details-airplane.svg"
                                alt="Airplane"
                                className="passenger-pill-icon"
                              />
                            </div>
                            <div className="passenger-pill-body">
                              <div className="passenger-pill-title">
                                {p.firstName} {p.lastName}{" "}
                                {p.designation && (
                                  <span className="passenger-pill-designation">
                                    ({p.designation})
                                  </span>
                                )}
                              </div>
                              <div className="passenger-pill-sub">
                                {p.airport || "International Arrival"} •{" "}
                                {p.airline || "Airline"} •{" "}
                                {p.flightNumber || "-"}
                              </div>
                              <div className="passenger-pill-meta">
                                {p.gender && <span>{p.gender}</span>}
                                {p.mobile && <span> • {p.mobile}</span>}
                                {p.travelDate && <span> • {p.travelDate}</span>}
                                {p.airportTime && (
                                  <span> • {p.airportTime}</span>
                                )}
                                {p.destination && (
                                  <span> • {p.destination}</span>
                                )}
                                {p.specialReq && <span> • {p.specialReq}</span>}
                              </div>
                            </div>
                            <div className="passenger-pill-actions">
                              <button
                                className="passenger-pill-delete"
                                aria-label="Delete Passenger"
                                onClick={() => handleDeletePassenger(idx)}
                              >
                                <img
                                  src="/icons/delete-passenger.svg"
                                  alt="Delete"
                                  className="passenger-pill-delete-icon"
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* RRR generation removed — use ITEXPay inline on PAY */}
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
                  {/* RRR removed */}
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
                            src="/icons/delete-passenger.svg"
                            alt="Delete"
                            style={{ width: 20, height: 20 }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* RRR generation removed — ITEXPay is used on PAY */}
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
                {/* RRR removed */}
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

          {/* Receipt Modal */}
          <Modal
            isOpen={showReceiptModal}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedService(null);
              setPassengers([]);
              setReceiptData(null);
              setActiveTab("passenger");
            }}
            showHeader={true}
            headerTitle="PAYMENT RECEIPT"
            className="service-receipt-modal"
          >
            {receiptData && (
              <div className="receipt-paper">
                <div className="receipt-head">
                  <div className="receipt-brand">
                    Federal Airports Authority of Nigeria
                  </div>
                  <div className="receipt-title">PAYMENT RECEIPT</div>
                  <div className="receipt-sub">Thank you for your payment.</div>
                </div>
                <div className="receipt-meta">
                  <div className="meta-row">
                    <span>Invoice Number</span>
                    <span className="mono">{receiptData.invoiceNumber}</span>
                  </div>
                  {/* RRR removed - Remita no longer used */}
                  <div className="meta-row">
                    <span>Transaction ID</span>
                    <span className="mono">{receiptData.transactionId}</span>
                  </div>
                  <div className="meta-row">
                    <span>Payment Date</span>
                    <span>{receiptData.paymentDate}</span>
                  </div>
                </div>
                <div className="receipt-items">
                  <div className="thead">
                    <span>Item</span>
                    <span className="right">Amount</span>
                  </div>
                  <div className="row">
                    <span>{receiptData.serviceName}</span>
                    <span className="right mono">
                      ₦{receiptData.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <span className="right mono">
                      ₦{receiptData.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="receipt-foot">
                  Customer ID: {receiptData.customerId}
                </div>
                <div className="receipt-download">
                  <GradientButton
                    fullWidth
                    onClick={() => {
                      if (!receiptData) return;
                      const html = `<!doctype html><html><head><meta charset='utf-8'><title>Receipt ${
                        receiptData.invoiceNumber
                      }</title>
                      <style>
                        @page { margin: 10mm; }
                        body{background:#eef2f7;margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827}
                        .receipt-paper{position:relative;max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 2px 10px rgba(17,24,39,0.06);padding:24px;color:#111827}
                        .receipt-paper:before{content:"";position:absolute;left:0;right:0;top:-8px;height:16px;background:radial-gradient(circle at 8px 8px,#fff 8px,transparent 8px) left top/16px 16px repeat-x,linear-gradient(#e5e7eb,#e5e7eb)}
                        .receipt-head{text-align:center;margin:8px 0}
                        .receipt-brand{font-weight:700;color:#374151;font-size:14px}
                        .receipt-title{font-size:16px;font-weight:800;color:#111827;letter-spacing:0.06em;margin-top:2px}
                        .receipt-sub{font-size:12px;color:#6b7280;margin-top:2px}
                        .receipt-meta{border:1px dashed #e5e7eb;border-radius:10px;padding:12px 14px;margin:12px 0 16px 0}
                        .receipt-meta .meta-row{display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px dashed #e5e7eb}
                        .receipt-meta .meta-row:last-child{border-bottom:none}
                        .receipt-meta .meta-row span:first-child{color:#6b7280;font-size:12px}
                        .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:700}
                        .receipt-items{border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
                        .receipt-items .thead,.receipt-items .row,.receipt-items .total{display:grid;grid-template-columns:1fr 160px;gap:12px;padding:10px 0}
                        .receipt-items .thead{color:#6b7280;font-size:12px}
                        .receipt-items .row{border-top:1px dashed #e5e7eb}
                        .right{text-align:right}
                        .receipt-items .total{border-top:2px solid #e5e7eb;font-weight:800}
                        .receipt-foot{margin-top:10px;color:#6b7280;font-size:12px;text-align:center}
                      </style>
                      </head><body>
                        <div class='receipt-paper'>
                          <div class='receipt-head'>
                            <div class='receipt-brand'>Federal Airports Authority of Nigeria</div>
                            <div class='receipt-title'>PAYMENT RECEIPT</div>
                            <div class='receipt-sub'>Thank you for your payment.</div>
                      </div>
                          <div class='receipt-meta'>
                            <div class='meta-row'><span>Invoice Number</span><span class='mono'>${
                              receiptData.invoiceNumber
                            }</span></div>
                            <!-- RRR removed - Remita no longer used -->
                            <div class='meta-row'><span>Transaction ID</span><span class='mono'>${
                              receiptData.transactionId
                            }</span></div>
                            <div class='meta-row'><span>Payment Date</span><span>${
                              receiptData.paymentDate
                            }</span></div>
                      </div>
                          <div class='receipt-items'>
                            <div class='thead'><span>Item</span><span class='right'>Amount</span></div>
                            <div class='row'><span>${
                              receiptData.serviceName
                            }</span><span class='right mono'>₦${receiptData.amount.toLocaleString()}</span></div>
                            <div class='total'><span>Total</span><span class='right mono'>₦${receiptData.amount.toLocaleString()}</span></div>
                    </div>
                          <div class='receipt-foot'>Customer ID: ${
                            receiptData.customerId
                          }</div>
                      </div>
                        <script>
                          window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 250); };
                        </script>
                      </body></html>`;
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.open();
                        win.document.write(html);
                        win.document.close();
                      }
                    }}
                  >
                    Download PDF
                  </GradientButton>
                </div>
              </div>
            )}
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

              <div className="service-card-body">
                <div className="service-card-top">
                  <div className="service-card-name">{service.name}</div>
                  <div className="service-card-price">₦{service.price}</div>
                </div>

                <div className="service-card-desc">
                  {service.description && service.description.length > 0
                    ? service.description
                    : "Description not available"}
                </div>

                <div className="service-card-meta">
                  <button
                    type="button"
                    className="service-card-action-text"
                    onClick={() => setSelectedService(service)}
                  >
                    Book Service
                  </button>
                </div>
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

            <DataTable
              headers={[
                "ID",
                "Service Name",
                "Description",
                "Price",
                "Actions",
              ]}
              data={filteredServices.map((service) => [
                service.id,
                <span key={`n-${service.id}`} className="max-td-width-mobile">
                  {service.name}
                </span>,
                <span key={`d-${service.id}`} className="max-td-width-mobile">
                  {service.description}
                </span>,
                `₦${service.price}`,
                <div key={`a-${service.id}`}>
                  <button className="action-btn-table edit">
                    <Edit size={16} /> Edit
                  </button>
                  <button className="action-btn-table delete">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>,
              ])}
              className="services-admin-table"
            />

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
              <form className="user-form-list" onSubmit={handleCreateServices}>
                {services.map((service, idx) => (
                  <div className="service-form-row" key={idx}>
                    {/* <div className="service-index-circle">{idx + 1}.</div> */}
                    <div className="service-form-body">
                      <div className="service-row-top">
                        <div className="service-field-group service-name-group">
                          <label>Service Name:</label>
                          <input
                            type="text"
                            value={service.serviceName}
                            onChange={(e) => {
                              handleServiceChange(
                                idx,
                                "serviceName",
                                e.target.value
                              );
                            }}
                            placeholder="Enter service name"
                            className="service-name-input"
                          />
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
                            value={service.price}
                            onChange={(e) =>
                              handleServiceChange(idx, "price", e.target.value)
                            }
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
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {/* <div className="form-row form-row-full">
                  <button
                    type="button"
                    className="add-more-items-btn"
                    onClick={addMoreService}
                  >
                    + Add New Service
                  </button>
                </div> */}
                <div className="form-actions">
                  <GradientButton type="submit" fullWidth>
                    SAVE SERVICE
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
