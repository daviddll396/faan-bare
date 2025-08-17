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
import DataTable from "../../reusables/DataTable/DataTable";

// Remita Payment Engine types
declare global {
  interface Window {
    RmPaymentEngine: {
      init: (config: RemitaPaymentConfig) => RemitaPaymentHandler;
    };
  }
}

interface RemitaPaymentConfig {
  key: string;
  customerId: string;
  transactionId: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  narration: string;
  onSuccess: (response: Record<string, unknown>) => void;
  onError: (response: Record<string, unknown>) => void;
  onClose: () => void;
}

interface RemitaPaymentHandler {
  showPaymentWidget: () => void;
}

// Dev-only guard to prevent duplicate fetches in React 18 StrictMode
let hasFetchedTariffs = false;

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
  // Remita Payment Configuration
  const REMITA_PUBLIC_KEY =
    "QzAwMDAyNzEyNTl8MTEwNjE4NjF8OWZjOWYwNmMyZDk3MDRhYWM3YThiOThlNTNjZTE3ZjYxOTY5NDdmZWE1YzU3NDc0ZjE2ZDZjNTg1YWYxNWY3NWM4ZjMzNzZhNjNhZWZlOWQwNmJhNTFkMjIxYTRiMjYzZDkzNGQ3NTUxNDIxYWNlOGY4ZWEyODY3ZjlhNGUwYTY="; // Replace with your actual public key

  const {
    getAllTariffs,
    refreshUserDetails,
    generateInvoice,
    createTariff,
    user,
  } = useAuth();
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
  const [passengers, setPassengers] = React.useState<BookingPassenger[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [generatedRRR, setGeneratedRRR] = React.useState<string>("");
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false);

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

  // Add useEffect to check if Remita script is loaded
  useEffect(() => {
    const checkRemitaScript = () => {
      if (typeof window.RmPaymentEngine !== "undefined") {
        console.log("✅ Remita Payment Engine loaded successfully");
      } else {
        console.warn("⚠️ Remita Payment Engine not yet loaded");
        // Check again after a short delay
        setTimeout(checkRemitaScript, 1000);
      }
    };

    checkRemitaScript();
  }, []);

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

  const addMoreService = () => {
    setServices([...services, { ...initialService }]);
  };

  const handleBookingFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
    // Clear field error when user starts typing/selecting
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: false }));
    }
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
    setGeneratedRRR(""); // Clear RRR when adding new passenger
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

      // Function to process Remita payment
      const handlePayment = () => {
        if (!selectedService?.id) {
          showToast("No service selected for payment", "error");
          return;
        }

        if (passengers.length === 0) {
          showToast("Please add at least one passenger", "error");
          return;
        }

        if (!generatedRRR) {
          showToast("Please generate RRR first", "error");
          return;
        }

        // Check if Remita script is loaded
        if (typeof window.RmPaymentEngine === "undefined") {
          console.error("❌ Remita Payment Engine not loaded");
          showToast(
            "Payment engine not available. Please refresh the page.",
            "error"
          );
          return;
        }

        try {
          // Reset payment success flag for new payment
          let isPaymentSuccessful = false;

          // Get user details for payment
          const firstName =
            passengers[0]?.firstName || user?.firstName || "Guest";
          const lastName = passengers[0]?.lastName || user?.lastName || "User";
          const email = user?.email || "guest@example.com";

          // Generate unique transaction ID
          const transactionId = Math.floor(Math.random() * 1101233);

          console.log("🚀 === STARTING REMITA PAYMENT ===");
          console.log("💰 Amount:", total);
          console.log("🔢 RRR:", generatedRRR);
          console.log("🔢 Transaction ID:", transactionId);

          // Initialize Remita payment engine
          const paymentEngine = window.RmPaymentEngine.init({
            key: REMITA_PUBLIC_KEY,
            transactionId: transactionId,
            customerId: user?.customerId || "GUEST",
            firstName: firstName,
            lastName: lastName,
            email: email,
            amount: total,
            narration: `Payment for ${selectedService.name} - ${passengers.length} passenger(s)`,
            onSuccess: (response) => {
              console.log("🎉 === REMITA PAYMENT SUCCESSFUL ===");
              console.log("📄 Payment response:", response);
              console.log("🔢 Transaction ID:", transactionId);
              console.log("💰 Amount:", total);
              console.log("🔢 RRR:", generatedRRR);

              // Show success toast
              showToast("Payment successful!", "success");

              // Set payment success state to show modal
              console.log("🎭 Setting showPaymentSuccess to true");
              setShowPaymentSuccess(true);
              isPaymentSuccessful = true; // Set payment successful flag

              // Log modal state change
              setTimeout(() => {
                console.log(
                  "🎭 Modal state after setState:",
                  showPaymentSuccess
                );
              }, 100);

              // Refresh user details after successful payment
              refreshUserDetails();
            },
            onError: (response) => {
              console.error("❌ === REMITA PAYMENT FAILED ===");
              console.error("📄 Error response:", response);
              console.error("🔢 Transaction ID:", transactionId);

              showToast("Payment failed. Please try again.", "error");
            },
            onClose: () => {
              console.log("🚪 === REMITA PAYMENT CLOSED ===");
              console.log("🔢 Transaction ID:", transactionId);
              console.log("✅ Payment was successful:", isPaymentSuccessful);

              // Only show "Payment was cancelled" if it wasn't successful
              if (!isPaymentSuccessful) {
                showToast("Payment was cancelled", "error");
              } else {
                console.log(
                  "🎉 Payment was successful, not showing cancelled message"
                );
              }
            },
          });

          // Show the payment widget
          paymentEngine.showPaymentWidget();
        } catch (error) {
          console.error("💥 Payment initialization error:", error);
          showToast("Failed to initialize payment", "error");
        }
      };

      // Function to generate RRR (Remita Retrieval Reference)
      const handleGenerateRRR = async () => {
        if (!selectedService?.id) {
          showToast("No service selected for RRR generation", "error");
          return;
        }

        if (passengers.length === 0) {
          showToast("Please add at least one passenger", "error");
          return;
        }

        showLoading("Generating RRR...");

        try {
          // Generate a unique order ID
          const orderId = `ORDER-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}`;

          // Get customer ID from user context
          const customerId = user?.customerId || "FN904439"; // Fallback to default if user not available

          const invoiceRequest = {
            orderId: orderId,
            tariffId: selectedService.id,
            customerId: customerId,
            description: "Payment for Airport Tariff",
          };

          console.log("🚀 === STARTING RRR GENERATION ===");
          console.log("📋 Invoice request:", invoiceRequest);
          console.log("⏰ Request timestamp:", new Date().toISOString());

          const response = await generateInvoice(invoiceRequest);

          if (response && response.status) {
            console.log("🎉 === RRR GENERATED SUCCESSFULLY ===");
            console.log("📄 Response data:", response.data);
            console.log("🔢 RRR:", response.data.rrr);
            console.log("📋 Order ID:", response.data.orderId);
            console.log("👤 Customer ID:", response.data.customerId);
            console.log("💰 Tariff ID:", response.data.tariffId);
            console.log("✅ Status:", response.status);
            console.log("📊 Status Code:", response.statusCode);
            console.log("💬 Message:", response.message);

            // Store the generated RRR
            setGeneratedRRR(response.data.rrr);

            hideLoading();
            showToast(
              `RRR generated successfully: ${response.data.rrr}`,
              "success"
            );
          } else {
            console.log("⚠️ API failed, generating mock RRR");
            // Generate mock RRR if API fails
            const mockRRR = `140${Math.floor(Math.random() * 1000000000)
              .toString()
              .padStart(9, "0")}`;
            setGeneratedRRR(mockRRR);

            hideLoading();
            showToast(`Mock RRR generated: ${mockRRR}`, "success");
          }
        } catch (error) {
          console.error("💥 RRR generation error, generating mock RRR:", error);
          // Generate mock RRR if there's an error
          const mockRRR = `140${Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, "0")}`;
          setGeneratedRRR(mockRRR);

          hideLoading();
          showToast(`Mock RRR generated: ${mockRRR}`, "success");
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
                <button
                  className="booking-add-passenger-btn"
                  type="button"
                  onClick={handleAddPassenger}
                  style={{ marginTop: 12, marginBottom: 0 }}
                >
                  + Add New Passenger
                </button>
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
                          <option value="DELTA">DELTA</option>
                          <option value="ARIK">ARIK</option>
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
                          <option value="DELTA">DELTA</option>
                          <option value="ARIK">ARIK</option>
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
                            <td>{p.specialReq || "none"}</td>
                            <td>
                              <button
                                className="booking-delete-btn"
                                onClick={() => handleDeletePassenger(idx)}
                              >
                                <img
                                  src="/icons/delete-passenger.svg"
                                  alt="Delete"
                                  style={{ width: 20, height: 20 }}
                                />
                                <span
                                  style={{ color: "#BC2600", fontWeight: 700 }}
                                >
                                  Delete
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
                        text="Generate RRR"
                        onClick={handleGenerateRRR}
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
                  {generatedRRR && (
                    <div
                      className="booking-summary-row"
                      style={{
                        background: "#f0fdf4",
                        padding: "12px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      <span style={{ color: "#007948", fontWeight: "600" }}>
                        RRR:
                      </span>
                      <span
                        style={{
                          color: "#007948",
                          fontWeight: "700",
                          fontFamily: "monospace",
                        }}
                      >
                        {generatedRRR}
                      </span>
                    </div>
                  )}
                  <div className="booking-summary-row total">
                    <span>TOTAL</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                  <div style={{ width: "100%" }}>
                    <GradientButton
                      fullWidth
                      onClick={handlePayment}
                      disabled={passengers.length === 0 || !generatedRRR}
                    >
                      PAY
                    </GradientButton>
                    {!generatedRRR && passengers.length > 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        Generate RRR first to enable payment
                      </div>
                    )}
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
                {passengers.length > 0 && (
                  <div className="booking-passengers-actions">
                    <BorderButton
                      text="Generate RRR"
                      onClick={handleGenerateRRR}
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
                {generatedRRR && (
                  <div
                    className="booking-summary-row"
                    style={{
                      background: "#f0fdf4",
                      padding: "12px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: "#007948", fontWeight: "600" }}>
                      RRR:
                    </span>
                    <span
                      style={{
                        color: "#007948",
                        fontWeight: "700",
                        fontFamily: "monospace",
                      }}
                    >
                      {generatedRRR}
                    </span>
                  </div>
                )}
                <div className="booking-summary-row total">
                  <span>TOTAL</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ width: "100%", marginTop: 12 }}>
                <GradientButton
                  fullWidth
                  onClick={handlePayment}
                  disabled={passengers.length === 0 || !generatedRRR}
                >
                  PAY
                </GradientButton>
                {!generatedRRR && passengers.length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    Generate RRR first to enable payment
                  </div>
                )}
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
              setGeneratedRRR(""); // Clear RRR when closing payment success
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
                      setGeneratedRRR(""); // Clear RRR when closing payment success
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
                    <div className="service-index-circle">{idx + 1}.</div>
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
