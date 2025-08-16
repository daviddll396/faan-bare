import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/onboarding-image.svg";
import CryptoJS from "crypto-js";
import { Eye, EyeOff } from "lucide-react";
import "./RegisterPage.css";

// API Base URL - configure for different environments
const getApiBaseUrl = (): string => {
  // Detect if we're in production by checking the hostname
  const isProduction =
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("netlify.app") ||
    !window.location.hostname.includes("localhost");

  if (isProduction) {
    // In production (Vercel), use the proxy path
    return "";
  }
  // Local development - use the direct API server
  return "http://197.253.19.78:9091";
};

const API_BASE_URL = getApiBaseUrl();
const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/faan/register`,
};

// AES encryption function (CBC with PKCS5 padding)
const encryptAESCBC = (
  plaintext: string,
  secret: string,
  iv: string
): string => {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return encrypted.toString(); // base64-encoded
};

// AES decryption function (CBC with PKCS5 padding)
const decryptAESCBC = (
  encryptedText: string,
  secret: string,
  iv: string
): string => {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

const roleOptions = [
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Corporate Organization", value: "CORPORATE" },
  { label: "Government Official", value: "GOVERNMENT" },
  { label: "Family", value: "FAMILY" },
];

const meansOfIdOptions = [
  { label: "NIN", value: "nin" },
  // { label: "Driver's License", value: "DRIVERS_LICENSE" },
  // { label: "Passport", value: "PASSPORT" },
  // { label: "Voter's Card", value: "VOTERS_CARD" },
];

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const studentOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const natureOfBusinessOptions = [
  { label: "Financial Services", value: "Financial Services" },
  { label: "Technology", value: "Technology" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Education", value: "Education" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Retail", value: "Retail" },
  { label: "Transportation", value: "Transportation" },
  { label: "Other", value: "Other" },
];

const officeTypeOptions = [
  { label: "State", value: "State" },
  { label: "Federal", value: "Federal" },
  { label: "LGA", value: "LGA" },
];

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const serviceTypeOptions = [
  { label: "Domestic", value: "Domestic" },
  { label: "International", value: "International" },
  { label: "Both", value: "Both" },
];

const initialIndividualForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  meansOfId: "NIN",
  idNumber: "",
  address: "",
  gender: "Male",
  isStudent: "No",
  dob: "",
};

const initialCorporateForm = {
  businessName: "",
  natureOfBusiness: "Financial Services",
  serviceType: "Domestic",
  yearOfIncorporation: "",
  registeredAddress: "",
  registrationNumber: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

const initialGovernmentForm = {
  officeName: "",
  address: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  officeType: "State",
  state: "Lagos",
  serviceType: "Domestic",
};

const initialFamilyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  meansOfId: "NIN",
  idNumber: "",
  address: "",
  gender: "Male",
  isStudent: "No",
  dob: "",
};

const RegisterPage: React.FC = () => {
  const [form] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nin: "",
    phoneNumber: "",
    dob: "",
    address: "",
    customerType: "INDIVIDUAL",
    cacNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const navigate = useNavigate();

  // Configuration for encryption
  const secretKey = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
  const ivKey = "RVFU9+dRKhYkiCZI"; // 16 bytes

  const [step, setStep] = useState<
    "role" | "form" | "credentials" | "documents" | "indemnity"
  >("role");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [individualForm, setIndividualForm] = useState(initialIndividualForm);
  const [corporateForm, setCorporateForm] = useState(initialCorporateForm);
  const [governmentForm, setGovernmentForm] = useState(initialGovernmentForm);
  const [familyForm, setFamilyForm] = useState(initialFamilyForm);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credentialsErrors, setCredentialsErrors] = useState<{
    [key: string]: string;
  }>({});
  const [corporateFormErrors, setCorporateFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [governmentFormErrors, setGovernmentFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showCorporatePassword, setShowCorporatePassword] = useState(false);
  const [showCorporateConfirmPassword, setShowCorporateConfirmPassword] =
    useState(false);
  const [showGovernmentPassword, setShowGovernmentPassword] = useState(false);
  const [showGovernmentConfirmPassword, setShowGovernmentConfirmPassword] =
    useState(false);
  const [familyFormErrors, setFamilyFormErrors] = useState<{
    [key: string]: string;
  }>({});

  // Corporate document upload state
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [fileError, setFileError] = useState<string>("");

  // Improved email regex (RFC 5322 Official Standard)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName": {
        if (!value.trim())
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (value.trim().length < 2)
          return `${
            name === "firstName" ? "First" : "Last"
          } name must be at least 2 characters`;
        if (!/^[a-zA-Z\s'-]+$/.test(value))
          return `${
            name === "firstName" ? "First" : "Last"
          } name can only contain letters, spaces, hyphens, and apostrophes`;
        return "";
      }

      case "email": {
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }

      case "phoneNumber": {
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, "")))
          return "Please enter a valid Nigerian phone number";
        return "";
      }

      case "nin": {
        if (!value.trim()) return "NIN is required";
        if (!/^\d{11}$/.test(value)) return "NIN must be exactly 11 digits";
        return "";
      }

      case "dob": {
        if (!value) return "Date of birth is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return "You must be at least 18 years old";
        if (age > 120) return "Please enter a valid date of birth";
        return "";
      }

      case "address": {
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10)
          return "Please enter a complete address (minimum 10 characters)";
        return "";
      }

      case "password": {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value))
          return "Password must contain at least one number";
        if (!/(?=.*[@$!%*?&])/.test(value))
          return "Password must contain at least one special character";
        return "";
      }

      case "confirmPassword": {
        if (!value) return "Please confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";
      }

      case "cacNumber": {
        if (form.customerType === "CORPORATE") {
          if (!value.trim())
            return "CAC number is required for corporate customers";
          if (!/^(RC|BN|IT)\d{6,7}$/i.test(value))
            return "Please enter a valid CAC number (e.g., RC123456)";
        }
        return "";
      }

      default:
        return "";
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const handleIndividualChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setIndividualForm((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field
    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    // Real-time validation for DOB field
    if (name === "dob" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        setFormErrors((prev) => ({
          ...prev,
          dob: "You must be at least 18 years old",
        }));
      } else if (age > 120) {
        setFormErrors((prev) => ({
          ...prev,
          dob: "Please enter a valid date of birth",
        }));
      }
    }
  };

  const validateIndividualForm = () => {
    const errors: { [key: string]: string } = {};
    if (!individualForm.firstName.trim())
      errors.firstName = "First name is required";
    if (!individualForm.lastName.trim())
      errors.lastName = "Last name is required";
    if (!individualForm.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(individualForm.email))
      errors.email = "Invalid email";
    if (!individualForm.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    if (!individualForm.idNumber.trim())
      errors.idNumber = "ID number is required";
    if (!individualForm.address.trim()) errors.address = "Address is required";
    if (!individualForm.gender) errors.gender = "Gender is required";
    if (!individualForm.isStudent) errors.isStudent = "Required";
    if (!individualForm.dob) errors.dob = "Date of birth is required";
    else {
      const birthDate = new Date(individualForm.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) errors.dob = "You must be at least 18 years old";
    }
    return errors;
  };

  const isIndividualFormValid = () => {
    const errors = validateIndividualForm();
    return Object.keys(errors).length === 0;
  };

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateIndividualForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep("credentials");
  };

  const validateCredentials = () => {
    const errors: { [key: string]: string } = {};
    const passwordError = validateField("password", password);
    if (passwordError) errors.password = passwordError;
    if (!confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const isCredentialsValid = () => {
    const errors = validateCredentials();
    return Object.keys(errors).length === 0;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCredentials();
    setCredentialsErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Prepare customer data for indemnity form based on selected role
    let customerData: any = {
      email: "", // Will be set based on role
      password: password,
      customerType: selectedRole,
    };

    if (selectedRole === "INDIVIDUAL") {
      customerData = {
        firstName: individualForm.firstName,
        lastName: individualForm.lastName,
        email: individualForm.email,
        phoneNumber: individualForm.phoneNumber,
        address: individualForm.address,
        customerType: "INDIVIDUAL",
        password: password,
        nin: individualForm.idNumber,
        dob: individualForm.dob,
        cacNumber: null,
      };
    } else if (selectedRole === "FAMILY") {
      customerData = {
        firstName: familyForm.firstName,
        lastName: familyForm.lastName,
        email: familyForm.email,
        phoneNumber: familyForm.phoneNumber,
        address: familyForm.address,
        customerType: "FAMILY",
        password: password,
        nin: familyForm.idNumber,
        dob: familyForm.dob,
        gender: familyForm.gender,
        isStudent: familyForm.isStudent,
        meansOfId: familyForm.meansOfId,
        cacNumber: null,
      };
    }

    // Store data in sessionStorage for indemnity form
    sessionStorage.setItem("registrationData", JSON.stringify(customerData));

    // Navigate to indemnity form
    navigate("/indemnity-form", { state: { customerData } });
  };

  const handleCorporateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCorporateForm((prev) => ({ ...prev, [name]: value }));
    setCorporateFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateCorporateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!corporateForm.businessName.trim())
      errors.businessName = "Business name is required";

    if (!corporateForm.natureOfBusiness)
      errors.natureOfBusiness = "Nature of business is required";

    if (!corporateForm.serviceType)
      errors.serviceType = "Service type is required";

    if (!corporateForm.yearOfIncorporation.trim())
      errors.yearOfIncorporation = "Year of incorporation is required";
    else {
      const year = parseInt(corporateForm.yearOfIncorporation);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear)
        errors.yearOfIncorporation = "Please enter a valid year";
    }

    if (!corporateForm.registeredAddress.trim())
      errors.registeredAddress = "Registered address is required";
    else if (corporateForm.registeredAddress.trim().length < 10)
      errors.registeredAddress =
        "Please enter a complete address (minimum 10 characters)";

    if (!corporateForm.registrationNumber.trim())
      errors.registrationNumber = "Registration number is required";

    if (!corporateForm.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(corporateForm.email))
      errors.email = "Invalid email";

    if (!corporateForm.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    else {
      const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
      if (!phoneRegex.test(corporateForm.phoneNumber.replace(/\s/g, "")))
        errors.phoneNumber = "Please enter a valid Nigerian phone number";
    }

    const passwordError = validateField("password", corporateForm.password);
    if (passwordError) errors.password = passwordError;

    if (!corporateForm.confirmPassword)
      errors.confirmPassword = "Confirm your password";
    else if (corporateForm.password !== corporateForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const isCorporateFormValid = () => {
    const errors = validateCorporateForm();
    return Object.keys(errors).length === 0;
  };

  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCorporateForm();
    setCorporateFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    // Instead of showing a toast, go to document upload step
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("documents");
    }, 800);
  };

  // File upload handlers for corporate documents
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const files = Array.from(e.target.files || []);
    const newFiles: any[] = [];
    for (const file of files) {
      if (!/(pdf|jpeg|jpg)$/i.test(file.name.split(".").pop() || "")) {
        setFileError("Only PDF or JPEG files are allowed.");
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFileError("File size must not exceed 2MB.");
        continue;
      }
      newFiles.push({
        file,
        name: file.name,
        size: file.size,
        progress: 100, // Simulate instant upload
        type: file.type,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      });
    }
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileError("");
    const files = Array.from(e.dataTransfer.files || []);
    const newFiles: any[] = [];
    for (const file of files) {
      if (!/(pdf|jpeg|jpg)$/i.test(file.name.split(".").pop() || "")) {
        setFileError("Only PDF or JPEG files are allowed.");
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFileError("File size must not exceed 2MB.");
        continue;
      }
      newFiles.push({
        file,
        name: file.name,
        size: file.size,
        progress: 100,
        type: file.type,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      });
    }
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare customer data for indemnity form
    const customerData = {
      firstName: corporateForm.businessName, // Use business name as first name
      lastName: "", // Corporate doesn't have last name
      email: corporateForm.email,
      phoneNumber: corporateForm.phoneNumber,
      address: corporateForm.registeredAddress,
      customerType: "CORPORATE",
      // Store additional data for later registration
      password: corporateForm.password,
      businessName: corporateForm.businessName,
      natureOfBusiness: corporateForm.natureOfBusiness,
      serviceType: corporateForm.serviceType,
      yearOfIncorporation: corporateForm.yearOfIncorporation,
      registrationNumber: corporateForm.registrationNumber,
      cacNumber: corporateForm.registrationNumber,
      nin: "", // Corporate doesn't have NIN
      dob: "", // Corporate doesn't have DOB
    };

    // Store data in sessionStorage for indemnity form
    sessionStorage.setItem("registrationData", JSON.stringify(customerData));

    // Navigate to indemnity form
    navigate("/indemnity-form", { state: { customerData } });
  };

  const handleGovernmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGovernmentForm((prev) => ({ ...prev, [name]: value }));
    setGovernmentFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateGovernmentForm = () => {
    const errors: { [key: string]: string } = {};
    if (!governmentForm.officeName.trim())
      errors.officeName = "Office name is required";
    if (!governmentForm.address.trim()) errors.address = "Address is required";
    if (!governmentForm.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(governmentForm.email))
      errors.email = "Invalid email";
    if (!governmentForm.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    else {
      const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
      if (!phoneRegex.test(governmentForm.phoneNumber.replace(/\s/g, "")))
        errors.phoneNumber = "Please enter a valid Nigerian phone number";
    }
    const passwordError = validateField("password", governmentForm.password);
    if (passwordError) errors.password = passwordError;
    if (!governmentForm.confirmPassword)
      errors.confirmPassword = "Confirm your password";
    else if (governmentForm.password !== governmentForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!governmentForm.officeType)
      errors.officeType = "Office type is required";
    if (!governmentForm.state) errors.state = "State is required";
    if (!governmentForm.serviceType)
      errors.serviceType = "Service type is required";
    return errors;
  };

  const isGovernmentFormValid = () => {
    const errors = validateGovernmentForm();
    return Object.keys(errors).length === 0;
  };

  const handleGovernmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateGovernmentForm();
    setGovernmentFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Prepare customer data for indemnity form
    const customerData = {
      firstName: governmentForm.officeName, // Use office name as first name
      lastName: "", // Government doesn't have last name
      email: governmentForm.email,
      phoneNumber: governmentForm.phoneNumber,
      address: governmentForm.address,
      customerType: "GOVERNMENT",
      // Store additional data for later registration
      password: governmentForm.password,
      officeName: governmentForm.officeName,
      officeType: governmentForm.officeType,
      state: governmentForm.state,
      serviceType: governmentForm.serviceType,
      cacNumber: null, // Government doesn't have CAC
      nin: "", // Government doesn't have NIN
      dob: "", // Government doesn't have DOB
    };

    // Store data in sessionStorage for indemnity form
    sessionStorage.setItem("registrationData", JSON.stringify(customerData));

    // Navigate to indemnity form
    navigate("/indemnity-form", { state: { customerData } });
  };

  const handleFamilyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFamilyForm((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field
    setFamilyFormErrors((prev) => ({ ...prev, [name]: "" }));

    // Real-time validation for DOB field
    if (name === "dob" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        setFamilyFormErrors((prev) => ({
          ...prev,
          dob: "You must be at least 18 years old",
        }));
      } else if (age > 120) {
        setFamilyFormErrors((prev) => ({
          ...prev,
          dob: "Please enter a valid date of birth",
        }));
      }
    }
  };

  const validateFamilyForm = () => {
    const errors: { [key: string]: string } = {};
    if (!familyForm.firstName.trim())
      errors.firstName = "First name is required";
    if (!familyForm.lastName.trim()) errors.lastName = "Last name is required";
    if (!familyForm.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(familyForm.email)) errors.email = "Invalid email";
    if (!familyForm.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    if (!familyForm.idNumber.trim()) errors.idNumber = "ID number is required";
    if (!familyForm.address.trim()) errors.address = "Address is required";
    if (!familyForm.gender) errors.gender = "Gender is required";
    if (!familyForm.isStudent) errors.isStudent = "Required";
    if (!familyForm.dob) errors.dob = "Date of birth is required";
    else {
      const birthDate = new Date(familyForm.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) errors.dob = "You must be at least 18 years old";
    }
    return errors;
  };

  const isFamilyFormValid = () => {
    const errors = validateFamilyForm();
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="auth-split-screen">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <div className="auth-illustration-side">
        <div className="auth-outer-container">
          <div className="auth-inner-container">
            <img
              src={OnboardingImage}
              alt="Airport operations"
              className="auth-background-image"
            />
            <div className="auth-image-overlay">
              <img src={FaanLogo} alt="FAAN Logo" className="auth-logo" />
              <div className="auth-image-text">
                Seamless access to airport operations, services, and staff
                resources <span className="highlight">anytime, anywhere.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        {step === "role" ? (
          <div className="auth-form-modern">
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 24 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="auth-form-link-modern">
                Log In
              </Link>
            </div>
            <div className="auth-form-subtitle-modern select-role-text">
              Select a role to register:
            </div>
            <div className="register-role-options-grid">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`register-role-option-btn${
                    selectedRole === role.value ? " selected" : ""
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <span className="register-role-radio-outer">
                    <span
                      className={`register-role-radio-inner${
                        selectedRole === role.value ? " checked" : ""
                      }`}
                    ></span>
                  </span>
                  <span className="register-role-label">{role.label}</span>
                </button>
              ))}
            </div>
            <GradientButton
              fullWidth
              disabled={!selectedRole}
              onClick={() => setStep("form")}
            >
              CONTINUE
            </GradientButton>
          </div>
        ) : selectedRole === "INDIVIDUAL" && step === "form" ? (
          <form
            key="individual-form"
            className="auth-form-modern long-register-form"
            onSubmit={handleIndividualSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">INDIVIDUAL ACCOUNT</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to role selection"
                onClick={() => setStep("role")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                1/2 Steps Completed
              </span>
            </div>
            <div className="register-individual-grid">
              <div className="form-row-modern">
                <label>First Name</label>
                <input
                  className="form-input-modern"
                  name="firstName"
                  value={individualForm.firstName}
                  onChange={handleIndividualChange}
                  placeholder="First Name"
                  autoComplete="off"
                />
                {formErrors.firstName && (
                  <span className="validation-error">
                    {formErrors.firstName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Last Name</label>
                <input
                  className="form-input-modern"
                  name="lastName"
                  value={individualForm.lastName}
                  onChange={handleIndividualChange}
                  placeholder="Last Name"
                  autoComplete="off"
                />
                {formErrors.lastName && (
                  <span className="validation-error">
                    {formErrors.lastName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={individualForm.email}
                  onChange={handleIndividualChange}
                  placeholder="Email"
                  autoComplete="off"
                />
                {formErrors.email && (
                  <span className="validation-error">{formErrors.email}</span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Phone Number</label>
                <input
                  className="form-input-modern"
                  name="phoneNumber"
                  value={individualForm.phoneNumber}
                  onChange={handleIndividualChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                />
                {formErrors.phoneNumber && (
                  <span className="validation-error">
                    {formErrors.phoneNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Means of Identification</label>
                <select
                  className="form-input-modern"
                  name="meansOfId"
                  value={individualForm.meansOfId}
                  onChange={handleIndividualChange}
                >
                  {meansOfIdOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row-modern">
                <label>Identification Number</label>
                <input
                  className="form-input-modern"
                  name="idNumber"
                  value={individualForm.idNumber}
                  onChange={handleIndividualChange}
                  placeholder="Identification Number"
                  autoComplete="off"
                />
                {formErrors.idNumber && (
                  <span className="validation-error">
                    {formErrors.idNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Address</label>
                <input
                  className="form-input-modern"
                  name="address"
                  value={individualForm.address}
                  onChange={handleIndividualChange}
                  placeholder="Address"
                  autoComplete="off"
                />
                {formErrors.address && (
                  <span className="validation-error">{formErrors.address}</span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Gender</label>
                <select
                  className="form-input-modern"
                  name="gender"
                  value={individualForm.gender}
                  onChange={handleIndividualChange}
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formErrors.gender && (
                  <span className="validation-error">{formErrors.gender}</span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Are you a Student?</label>
                <select
                  className="form-input-modern"
                  name="isStudent"
                  value={individualForm.isStudent}
                  onChange={handleIndividualChange}
                >
                  {studentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formErrors.isStudent && (
                  <span className="validation-error">
                    {formErrors.isStudent}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Date of Birth</label>
                <input
                  className="form-input-modern"
                  name="dob"
                  type="date"
                  value={individualForm.dob}
                  onChange={handleIndividualChange}
                  autoComplete="off"
                />
                {formErrors.dob && (
                  <span className="validation-error">{formErrors.dob}</span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isIndividualFormValid() || isSubmitting}
              loading={isSubmitting}
            >
              CONTINUE
            </GradientButton>
          </form>
        ) : selectedRole === "INDIVIDUAL" && step === "credentials" ? (
          <form
            key="individual-credentials"
            className="auth-form-modern"
            onSubmit={handleCredentialsSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">INDIVIDUAL ACCOUNT</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to previous step"
                onClick={() => setStep("form")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                2/2 Steps Completed
              </span>
            </div>
            <div
              className="register-individual-grid"
              style={{ marginBottom: 32 }}
            >
              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={individualForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setCredentialsErrors((prev) => ({
                        ...prev,
                        password: validateField("password", value),
                        confirmPassword: !confirmPassword
                          ? "Confirm your password"
                          : value !== confirmPassword
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {credentialsErrors.password && (
                  <span className="validation-error">
                    {credentialsErrors.password}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmPassword(value);
                      setCredentialsErrors((prev) => ({
                        ...prev,
                        confirmPassword: !value
                          ? "Confirm your password"
                          : value !== password
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {credentialsErrors.confirmPassword && (
                  <span className="validation-error">
                    {credentialsErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting}
              loading={isSubmitting}
            >
              CREATE ACCOUNT
            </GradientButton>
          </form>
        ) : selectedRole === "CORPORATE" && step === "form" ? (
          <form
            key="corporate-form"
            className="auth-form-modern long-register-form"
            onSubmit={handleCorporateSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">
              CORPORATE ORGANIZATION
            </div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to role selection"
                onClick={() => setStep("role")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                1/2 Steps Completed
              </span>
            </div>
            <div className="register-individual-grid">
              <div className="form-row-modern">
                <label>Business Name</label>
                <input
                  className="form-input-modern"
                  name="businessName"
                  value={corporateForm.businessName}
                  onChange={handleCorporateChange}
                  placeholder="Business Name"
                  autoComplete="off"
                />
                {corporateFormErrors.businessName && (
                  <span className="validation-error">
                    {corporateFormErrors.businessName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Nature of Business</label>
                <select
                  className="form-input-modern"
                  name="natureOfBusiness"
                  value={corporateForm.natureOfBusiness}
                  onChange={handleCorporateChange}
                >
                  {natureOfBusinessOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {corporateFormErrors.natureOfBusiness && (
                  <span className="validation-error">
                    {corporateFormErrors.natureOfBusiness}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Service Type</label>
                <select
                  className="form-input-modern"
                  name="serviceType"
                  value={corporateForm.serviceType}
                  onChange={handleCorporateChange}
                >
                  {serviceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {corporateFormErrors.serviceType && (
                  <span className="validation-error">
                    {corporateFormErrors.serviceType}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Year of Incorporation</label>
                <input
                  className="form-input-modern"
                  name="yearOfIncorporation"
                  value={corporateForm.yearOfIncorporation}
                  onChange={handleCorporateChange}
                  placeholder="Year of Incorporation"
                  autoComplete="off"
                />
                {corporateFormErrors.yearOfIncorporation && (
                  <span className="validation-error">
                    {corporateFormErrors.yearOfIncorporation}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Registered Address</label>
                <input
                  className="form-input-modern"
                  name="registeredAddress"
                  value={corporateForm.registeredAddress}
                  onChange={handleCorporateChange}
                  placeholder="Registered Address"
                  autoComplete="off"
                />
                {corporateFormErrors.registeredAddress && (
                  <span className="validation-error">
                    {corporateFormErrors.registeredAddress}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Registration Number</label>
                <input
                  className="form-input-modern"
                  name="registrationNumber"
                  value={corporateForm.registrationNumber}
                  onChange={handleCorporateChange}
                  placeholder="Registration Number"
                  autoComplete="off"
                />
                {corporateFormErrors.registrationNumber && (
                  <span className="validation-error">
                    {corporateFormErrors.registrationNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={corporateForm.email}
                  onChange={handleCorporateChange}
                  placeholder="Email"
                  autoComplete="off"
                />
                {corporateFormErrors.email && (
                  <span className="validation-error">
                    {corporateFormErrors.email}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Phone Number</label>
                <input
                  className="form-input-modern"
                  name="phoneNumber"
                  value={corporateForm.phoneNumber}
                  onChange={handleCorporateChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                />
                {corporateFormErrors.phoneNumber && (
                  <span className="validation-error">
                    {corporateFormErrors.phoneNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="password"
                    type={showCorporatePassword ? "text" : "password"}
                    value={corporateForm.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCorporateForm((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      setCorporateFormErrors((prev) => ({
                        ...prev,
                        password: validateField("password", value),
                        confirmPassword: !corporateForm.confirmPassword
                          ? "Confirm your password"
                          : value !== corporateForm.confirmPassword
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowCorporatePassword((v) => !v)}
                    aria-label={
                      showCorporatePassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCorporatePassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {corporateFormErrors.password && (
                  <span className="validation-error">
                    {corporateFormErrors.password}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="confirmPassword"
                    type={showCorporateConfirmPassword ? "text" : "password"}
                    value={corporateForm.confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCorporateForm((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }));
                      setCorporateFormErrors((prev) => ({
                        ...prev,
                        confirmPassword: !value
                          ? "Confirm your password"
                          : value !== corporateForm.password
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowCorporateConfirmPassword((v) => !v)}
                    aria-label={
                      showCorporateConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showCorporateConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {corporateFormErrors.confirmPassword && (
                  <span className="validation-error">
                    {corporateFormErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCorporateFormValid() || isSubmitting}
              loading={isSubmitting}
            >
              CONTINUE
            </GradientButton>
          </form>
        ) : selectedRole === "CORPORATE" && step === "documents" ? (
          <form
            key="corporate-documents"
            className="auth-form-modern"
            onSubmit={handleCompleteRegistration}
            autoComplete="off"
            style={{ maxWidth: 700 }}
          >
            <div className="register-badge-individual">
              CORPORATE ORGANIZATION
            </div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to previous step"
                onClick={() => setStep("form")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                2/2 Steps Completed
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 4px 32px rgba(34, 43, 69, 0.08)",
                border: "1px solid #e4e4e4",
                padding: 32,
                width: "100%",
                marginBottom: 32,
                marginTop: 8,
              }}
            >
              <div className="register-file-upload-text">
                Upload your CAC Certificate and other support documents
              </div>
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: "2px dashed #b6e2d6",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  marginBottom: 24,
                  background: uploadedFiles.length === 0 ? "#f8fafc" : "#fff",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  const input = document.getElementById("corporate-file-input");
                  if (input) (input as HTMLInputElement).click();
                }}
              >
                <div
                  style={{ fontSize: 32, color: "#b6e2d6", marginBottom: 8 }}
                >
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 4v16m8-8H4"
                      stroke="#b6e2d6"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="register-file-upload-text">
                  Choose a File or drag & drop it here
                </div>
                <div
                  style={{
                    color: "#6C7278",
                    fontSize: 13,
                    margin: "8px 0 12px 0",
                  }}
                >
                  PDF or JPEG formats with a maximum size of 2MB
                </div>
                <input
                  id="corporate-file-input"
                  type="file"
                  accept=".pdf,.jpeg,.jpg"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
                <button
                  type="button"
                  style={{
                    marginTop: 8,
                    minWidth: 140,
                    color: "#6C7278",
                    background: "transparent",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    padding: "5px 14px",
                    cursor: "pointer",
                    transition: "border 0.2s, color 0.2s",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const input = document.getElementById(
                      "corporate-file-input"
                    );
                    if (input) (input as HTMLInputElement).click();
                  }}
                >
                  Browse Files
                </button>
                {fileError && (
                  <div style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>
                    {fileError}
                  </div>
                )}
              </div>
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e4e4e4",
                        borderRadius: 10,
                        padding: "12px 18px 10px 18px",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        position: "relative",
                      }}
                    >
                      <span style={{ marginRight: 10 }}>
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            width="24"
                            height="24"
                            rx="6"
                            fill="#F87171"
                            fillOpacity="0.13"
                          />
                          <path
                            d="M7 7h6l4 4v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                            stroke="#F87171"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M13 7v4h4"
                            stroke="#F87171"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#222b45",
                          }}
                        >
                          {file.name}
                        </div>
                        <div
                          style={{
                            color: "#6C7278",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          {Math.round(file.size / 1024)}kb of 2MB
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "#e4e4e4",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${file.progress}%`,
                              height: 5,
                              background: "#22c55e",
                            }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: 10,
                          color: "#6C7278",
                          fontSize: 18,
                        }}
                        aria-label="Remove file"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M6 6l8 8M6 14L14 6"
                            stroke="#6C7278"
                            strokeWidth="1"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={uploadedFiles.length === 0 || isSubmitting}
              loading={isSubmitting}
            >
              COMPLETE REGISTRATION
            </GradientButton>
          </form>
        ) : selectedRole === "GOVERNMENT" && step === "form" ? (
          <form
            key="government-form"
            className="auth-form-modern long-register-form"
            onSubmit={handleGovernmentSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">GOVERNMENT OFFICIAL</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to role selection"
                onClick={() => setStep("role")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                1/2 Steps Completed
              </span>
            </div>
            <div className="register-individual-grid">
              <div className="form-row-modern">
                <label>Government Office Name</label>
                <input
                  className="form-input-modern"
                  name="officeName"
                  value={governmentForm.officeName}
                  onChange={handleGovernmentChange}
                  placeholder="Government Office Name"
                  autoComplete="off"
                />
                {governmentFormErrors.officeName && (
                  <span className="validation-error">
                    {governmentFormErrors.officeName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Address</label>
                <input
                  className="form-input-modern"
                  name="address"
                  value={governmentForm.address}
                  onChange={handleGovernmentChange}
                  placeholder="Address"
                  autoComplete="off"
                />
                {governmentFormErrors.address && (
                  <span className="validation-error">
                    {governmentFormErrors.address}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={governmentForm.email}
                  onChange={handleGovernmentChange}
                  placeholder="Email"
                  autoComplete="off"
                />
                {governmentFormErrors.email && (
                  <span className="validation-error">
                    {governmentFormErrors.email}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Phone Number</label>
                <input
                  className="form-input-modern"
                  name="phoneNumber"
                  value={governmentForm.phoneNumber}
                  onChange={handleGovernmentChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                />
                {governmentFormErrors.phoneNumber && (
                  <span className="validation-error">
                    {governmentFormErrors.phoneNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="password"
                    type={showGovernmentPassword ? "text" : "password"}
                    value={governmentForm.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGovernmentForm((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      setGovernmentFormErrors((prev) => ({
                        ...prev,
                        password: validateField("password", value),
                        confirmPassword: !governmentForm.confirmPassword
                          ? "Confirm your password"
                          : value !== governmentForm.confirmPassword
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowGovernmentPassword((v) => !v)}
                    aria-label={
                      showGovernmentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showGovernmentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {governmentFormErrors.password && (
                  <span className="validation-error">
                    {governmentFormErrors.password}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="confirmPassword"
                    type={showGovernmentConfirmPassword ? "text" : "password"}
                    value={governmentForm.confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGovernmentForm((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }));
                      setGovernmentFormErrors((prev) => ({
                        ...prev,
                        confirmPassword: !value
                          ? "Confirm your password"
                          : value !== governmentForm.password
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowGovernmentConfirmPassword((v) => !v)}
                    aria-label={
                      showGovernmentConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showGovernmentConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {governmentFormErrors.confirmPassword && (
                  <span className="validation-error">
                    {governmentFormErrors.confirmPassword}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Select Office Type</label>
                <select
                  className="form-input-modern"
                  name="officeType"
                  value={governmentForm.officeType}
                  onChange={handleGovernmentChange}
                >
                  {officeTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {governmentFormErrors.officeType && (
                  <span className="validation-error">
                    {governmentFormErrors.officeType}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Select State</label>
                <select
                  className="form-input-modern"
                  name="state"
                  value={governmentForm.state}
                  onChange={handleGovernmentChange}
                >
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {governmentFormErrors.state && (
                  <span className="validation-error">
                    {governmentFormErrors.state}
                  </span>
                )}
              </div>
              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <label>Select Service Type</label>
                <select
                  className="form-input-modern"
                  name="serviceType"
                  value={governmentForm.serviceType}
                  onChange={handleGovernmentChange}
                >
                  {serviceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {governmentFormErrors.serviceType && (
                  <span className="validation-error">
                    {governmentFormErrors.serviceType}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isGovernmentFormValid() || isSubmitting}
              loading={isSubmitting}
            >
              CONTINUE
            </GradientButton>
          </form>
        ) : selectedRole === "GOVERNMENT" && step === "credentials" ? (
          <form
            key="government-credentials"
            className="auth-form-modern"
            onSubmit={handleCredentialsSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">GOVERNMENT OFFICIAL</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to previous step"
                onClick={() => setStep("form")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                2/2 Steps Completed
              </span>
            </div>
            <div
              className="register-individual-grid"
              style={{ marginBottom: 32 }}
            >
              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={governmentForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="password"
                    type={showGovernmentPassword ? "text" : "password"}
                    value={governmentForm.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGovernmentForm((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      setGovernmentFormErrors((prev) => ({
                        ...prev,
                        password: validateField("password", value),
                        confirmPassword: !governmentForm.confirmPassword
                          ? "Confirm your password"
                          : value !== governmentForm.confirmPassword
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowGovernmentPassword((v) => !v)}
                    aria-label={
                      showGovernmentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showGovernmentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {governmentFormErrors.password && (
                  <span className="validation-error">
                    {governmentFormErrors.password}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="confirmPassword"
                    type={showGovernmentConfirmPassword ? "text" : "password"}
                    value={governmentForm.confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGovernmentForm((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }));
                      setGovernmentFormErrors((prev) => ({
                        ...prev,
                        confirmPassword: !value
                          ? "Confirm your password"
                          : value !== governmentForm.password
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowGovernmentConfirmPassword((v) => !v)}
                    aria-label={
                      showGovernmentConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showGovernmentConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {governmentFormErrors.confirmPassword && (
                  <span className="validation-error">
                    {governmentFormErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting}
              loading={isSubmitting}
            >
              CREATE ACCOUNT
            </GradientButton>
          </form>
        ) : selectedRole === "FAMILY" && step === "form" ? (
          <form
            key="family-form"
            className="auth-form-modern long-register-form"
            onSubmit={(e) => {
              e.preventDefault();
              const errors = validateFamilyForm();
              setFamilyFormErrors(errors);
              if (Object.keys(errors).length > 0) return;
              setStep("credentials");
            }}
            autoComplete="off"
          >
            <div className="register-badge-individual">FAMILY ACCOUNT</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to role selection"
                onClick={() => setStep("role")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                1/2 Steps Completed
              </span>
            </div>
            <div className="register-individual-grid">
              <div className="form-row-modern">
                <label>First Name</label>
                <input
                  className="form-input-modern"
                  name="firstName"
                  value={familyForm.firstName}
                  onChange={handleFamilyChange}
                  placeholder="First Name"
                  autoComplete="off"
                />
                {familyFormErrors.firstName && (
                  <span className="validation-error">
                    {familyFormErrors.firstName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Last Name</label>
                <input
                  className="form-input-modern"
                  name="lastName"
                  value={familyForm.lastName}
                  onChange={handleFamilyChange}
                  placeholder="Last Name"
                  autoComplete="off"
                />
                {familyFormErrors.lastName && (
                  <span className="validation-error">
                    {familyFormErrors.lastName}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={familyForm.email}
                  onChange={handleFamilyChange}
                  placeholder="Email"
                  autoComplete="off"
                />
                {familyFormErrors.email && (
                  <span className="validation-error">
                    {familyFormErrors.email}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Phone Number</label>
                <input
                  className="form-input-modern"
                  name="phoneNumber"
                  value={familyForm.phoneNumber}
                  onChange={handleFamilyChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                />
                {familyFormErrors.phoneNumber && (
                  <span className="validation-error">
                    {familyFormErrors.phoneNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Means of Identification</label>
                <select
                  className="form-input-modern"
                  name="meansOfId"
                  value={familyForm.meansOfId}
                  onChange={handleFamilyChange}
                >
                  {meansOfIdOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row-modern">
                <label>Identification Number</label>
                <input
                  className="form-input-modern"
                  name="idNumber"
                  value={familyForm.idNumber}
                  onChange={handleFamilyChange}
                  placeholder="Identification Number"
                  autoComplete="off"
                />
                {familyFormErrors.idNumber && (
                  <span className="validation-error">
                    {familyFormErrors.idNumber}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Address</label>
                <input
                  className="form-input-modern"
                  name="address"
                  value={familyForm.address}
                  onChange={handleFamilyChange}
                  placeholder="Address"
                  autoComplete="off"
                />
                {familyFormErrors.address && (
                  <span className="validation-error">
                    {familyFormErrors.address}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Gender</label>
                <select
                  className="form-input-modern"
                  name="gender"
                  value={familyForm.gender}
                  onChange={handleFamilyChange}
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {familyFormErrors.gender && (
                  <span className="validation-error">
                    {familyFormErrors.gender}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Are you a Student?</label>
                <select
                  className="form-input-modern"
                  name="isStudent"
                  value={familyForm.isStudent}
                  onChange={handleFamilyChange}
                >
                  {studentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {familyFormErrors.isStudent && (
                  <span className="validation-error">
                    {familyFormErrors.isStudent}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Date of Birth</label>
                <input
                  className="form-input-modern"
                  name="dob"
                  type="date"
                  value={familyForm.dob}
                  onChange={handleFamilyChange}
                  autoComplete="off"
                />
                {familyFormErrors.dob && (
                  <span className="validation-error">
                    {familyFormErrors.dob}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isFamilyFormValid() || isSubmitting}
              loading={isSubmitting}
            >
              CONTINUE
            </GradientButton>
          </form>
        ) : selectedRole === "FAMILY" && step === "credentials" ? (
          <form
            key="family-credentials"
            className="auth-form-modern"
            onSubmit={handleCredentialsSubmit}
            autoComplete="off"
          >
            <div className="register-badge-individual">FAMILY ACCOUNT</div>
            <h2 className="auth-form-title-modern">Create an account</h2>
            <div
              className="auth-form-subtitle-modern"
              style={{ marginBottom: 4 }}
            >
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">
                Log In
              </Link>
            </div>
            <div className="register-progress-row">
              <span
                className="register-progress-individual clickable"
                aria-label="Back to previous step"
                onClick={() => setStep("form")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{ marginRight: 7, verticalAlign: "middle" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 17L9 11L14 5"
                    stroke="#007948"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                2/2 Steps Completed
              </span>
            </div>
            <div
              className="register-individual-grid"
              style={{ marginBottom: 32 }}
            >
              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <label>Email</label>
                <input
                  className="form-input-modern"
                  name="email"
                  value={familyForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setCredentialsErrors((prev) => ({
                        ...prev,
                        password: validateField("password", value),
                        confirmPassword: !confirmPassword
                          ? "Confirm your password"
                          : value !== confirmPassword
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {credentialsErrors.password && (
                  <span className="validation-error">
                    {credentialsErrors.password}
                  </span>
                )}
              </div>
              <div className="form-row-modern">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="form-input-modern"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmPassword(value);
                      setCredentialsErrors((prev) => ({
                        ...prev,
                        confirmPassword: !value
                          ? "Confirm your password"
                          : value !== password
                          ? "Passwords do not match"
                          : "",
                      }));
                    }}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {credentialsErrors.confirmPassword && (
                  <span className="validation-error">
                    {credentialsErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting}
              loading={isSubmitting}
            >
              CREATE ACCOUNT
            </GradientButton>
          </form>
        ) : (
          <div className="register-form-placeholder">
            {/* Placeholder for the next step, to be implemented */}
            <h2
              style={{
                fontWeight: 600,
                fontSize: 22,
                color: "#222b45",
                marginBottom: 18,
              }}
            >
              Registration Form for{" "}
              {roleOptions.find((r) => r.value === selectedRole)?.label}
            </h2>
            <div style={{ color: "#6C7278", fontSize: 16 }}>
              Form fields will appear here in the next step.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
