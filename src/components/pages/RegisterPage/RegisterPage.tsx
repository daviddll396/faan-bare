import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import Input from "../../reusables/Input/Input";
import InputUpload from "../../reusables/InputUpload/InputUpload";
import ListBox, { type ListBoxOption } from "../../reusables/ListBox/ListBox";
import Modal from "../../reusables/Modal/Modal";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/boarding1.jpg";
import CryptoJS from "crypto-js";
import DatePicker from "../../reusables/DatePicker/DatePicker";
import "./RegisterPage.css";

// API Base URL - configure for different environments
// const getApiBaseUrl = (): string => {
//   // Detect if we're in production by checking the hostname
//   const isProduction =
//     window.location.hostname.includes("vercel.app") ||
//     window.location.hostname.includes("netlify.app") ||
//     !window.location.hostname.includes("localhost");

//   if (isProduction) {
//     // In production (Vercel), use the proxy path
//     return "";
//   }
//   // Local development - use the direct API server
//   return "http://197.253.19.78:9091";
// };

// const API_BASE_URL = getApiBaseUrl();
// const API_ENDPOINTS = {
//   REGISTER: `${API_BASE_URL}/auth/faan/register`,
// };

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
  tinNumber: "",
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

// AES keys for encrypt/decrypt (shared with Indemnity page)
const AES_SECRET_KEY = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
const AES_IV = "RVFU9+dRKhYkiCZI"; // 16 bytes

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

  const [step, setStep] = useState<
    "role" | "form" | "credentials" | "documents" | "indemnity"
  >("role");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [individualForm, setIndividualForm] = useState(initialIndividualForm);
  const [corporateForm, setCorporateForm] = useState(initialCorporateForm);
  const [governmentForm, setGovernmentForm] = useState(initialGovernmentForm);
  const [familyForm, setFamilyForm] = useState(initialFamilyForm);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
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
  const [familyFormErrors, setFamilyFormErrors] = useState<{
    [key: string]: string;
  }>({});

  // Corporate document upload state
  const handleTinFiles = (files: File[]) => {
    // Validate and add uploaded TIN file to uploadedFiles (separate from TIN text input)
    const newFiles: UploadedFile[] = [];
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
    if (newFiles.length > 0) setUploadedFiles((prev) => [...prev, ...newFiles]);
  };
  interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: number;
    progress: number;
    type: string;
  }

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string>("");

  // Indemnity form modal state
  const [showIndemnityModal, setShowIndemnityModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  // Function to download FAAN form
  const downloadFaanForm = () => {
    const link = document.createElement("a");
    link.href = "/FAAN_FORM"; // Path to the Word document
    link.download = `FAAN_Form_${new Date().toISOString().split("T")[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCredentials();
    setCredentialsErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Prepare customer data for registration based on selected role
    let customerData: Record<string, unknown> = {
      email: "", // Will be set based on role
      password: password,
      customerType: selectedRole,
    };

    if (selectedRole === "INDIVIDUAL") {
      customerData = {
        firstName: individualForm.firstName,
        lastName: individualForm.lastName,
        dob: individualForm.dob,
        phoneNumber: individualForm.phoneNumber,
        address: individualForm.address,
        password: password,
        email: individualForm.email,
        nin: individualForm.idNumber,
        userType: "CUSTOMER", // Set userType for individual customers
        creationType: "CUSTOMER", // Set creationType for customer registration
        customerType: "INDIVIDUAL",
      };
    } else if (selectedRole === "FAMILY") {
      customerData = {
        firstName: familyForm.firstName,
        lastName: familyForm.lastName,
        dob: familyForm.dob,
        phoneNumber: familyForm.phoneNumber,
        address: familyForm.address,
        password: password,
        email: familyForm.email,
        nin: familyForm.idNumber,
        userType: "CUSTOMER", // Set userType for family customers
        creationType: "CUSTOMER", // Set creationType for customer registration
        customerType: "FAMILY",
        gender: familyForm.gender,
        isStudent: familyForm.isStudent,
        meansOfId: familyForm.meansOfId,
      };
    } else if (selectedRole === "GOVERNMENT") {
      customerData = {
        firstName: governmentForm.officeName, // Use office name as first name
        lastName: "", // Government doesn't have last name
        email: governmentForm.email,
        phoneNumber: governmentForm.phoneNumber,
        address: governmentForm.address,
        password: password,
        customerType: "GOVERNMENT",
        officeName: governmentForm.officeName,
        officeType: governmentForm.officeType,
        state: governmentForm.state,
        serviceType: governmentForm.serviceType,
        cacNumber: null, // Government doesn't have CAC
        nin: "", // Government doesn't have NIN
        dob: "", // Government doesn't have DOB
        userType: "CUSTOMER",
        creationType: "CUSTOMER",
      };
    }

    setIsSubmitting(true);

    try {
      // Encrypt and POST to register endpoint (same approach used on Indemnity page)
      const payload = JSON.stringify(customerData);
      console.log("📝 Registration payload (before encryption):", customerData);
      console.log("📝 Registration payload (JSON string):", payload);
      const encryptedPayload = encryptAESCBC(payload, AES_SECRET_KEY, AES_IV);
      console.log("🔐 Encrypted payload length:", encryptedPayload.length);

      const resp = await fetch("/auth/faan/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
          "X-Source": "web",
        },
        body: encryptedPayload,
      });

      // Read raw encrypted response text
      const rawResponseText = await resp.text();

      // Attempt to decrypt and parse
      let decryptedResponse = "";
      let responseData: Record<string, unknown> | null = null;
      try {
        decryptedResponse = decryptAESCBC(
          String(rawResponseText),
          AES_SECRET_KEY,
          AES_IV
        );
        console.log(
          "🔐 Decrypted registration response (raw string):",
          decryptedResponse
        );
        responseData = JSON.parse(String(decryptedResponse));
        console.log(
          "🧾 Decrypted registration response (parsed):",
          responseData
        );
      } catch (err) {
        console.warn(
          "Failed to decrypt/parse registration response, raw text:",
          rawResponseText,
          err
        );
      }

      // If server returned non-OK HTTP, surface error (use decrypted message if available)
      if (!resp.ok) {
        console.error("🚨 Registration failed - HTTP Status:", resp.status);
        console.error("🚨 Raw response text:", rawResponseText);
        console.error("🚨 Decrypted response:", decryptedResponse);
        console.error("🚨 Parsed response data:", responseData);

        const errMsg = String(
          responseData?.message ?? rawResponseText ?? `HTTP ${resp.status}`
        );
        console.error("Registration failed:", resp.status, errMsg);
        throw new Error(errMsg);
      }

      // Use decrypted response to decide success if available
      const success =
        responseData?.status === true ||
        resp.status === 200 ||
        resp.status === 201;
      if (success) {
        // On success, download FAAN form and notify user
        downloadFaanForm();

        setToast({
          message: "Account created successfully! FAAN form downloaded.",
          type: "success",
          isVisible: true,
        });

        // Navigate to login after a short delay
        setTimeout(() => {
          setIsSubmitting(false);
          navigate("/login");
        }, 1200);
      } else {
        const errMsg = String(responseData?.message ?? "Registration failed");
        throw new Error(errMsg);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Failed to create account. Please try again.");
      setToast({
        message,
        type: "error",
        isVisible: true,
      });
      setIsSubmitting(false);
    }
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
    const files = Array.from(e.target.files || []) as File[];
    const newFiles: UploadedFile[] = [];
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
    const files = Array.from(e.dataTransfer.files || []) as File[];
    const newFiles: UploadedFile[] = [];
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

    // Prepare customer data for registration
    const customerData = {
      firstName: corporateForm.businessName, // Use business name as first name
      lastName: "", // Corporate doesn't have last name
      email: corporateForm.email,
      phoneNumber: corporateForm.phoneNumber,
      address: corporateForm.registeredAddress,
      password: corporateForm.password,
      customerType: "CORPORATE",
      businessName: corporateForm.businessName,
      natureOfBusiness: corporateForm.natureOfBusiness,
      serviceType: corporateForm.serviceType,
      yearOfIncorporation: corporateForm.yearOfIncorporation,
      registrationNumber: corporateForm.registrationNumber,
      cacNumber: corporateForm.registrationNumber,
      nin: "", // Corporate doesn't have NIN
      dob: "", // Corporate doesn't have DOB
      userType: "CUSTOMER",
      creationType: "CUSTOMER",
    };

    setIsSubmitting(true);

    try {
      // Encrypt and POST to register endpoint (same approach used on Indemnity page)
      const payload = JSON.stringify(customerData);
      console.log(
        "📝 Corporate registration payload (before encryption):",
        customerData
      );
      console.log("📝 Corporate registration payload (JSON string):", payload);
      const encryptedPayload = encryptAESCBC(payload, AES_SECRET_KEY, AES_IV);
      console.log("🔐 Encrypted payload length:", encryptedPayload.length);

      const resp = await fetch("/auth/faan/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
          "X-Source": "web",
        },
        body: encryptedPayload,
      });

      // Read raw encrypted response text
      const rawResponseText = await resp.text();

      // Attempt to decrypt and parse
      let decryptedResponse = "";
      let responseData: Record<string, unknown> | null = null;
      try {
        decryptedResponse = decryptAESCBC(
          String(rawResponseText),
          AES_SECRET_KEY,
          AES_IV
        );
        console.log(
          "🔐 Decrypted corporate registration response (raw string):",
          decryptedResponse
        );
        responseData = JSON.parse(String(decryptedResponse));
        console.log(
          "🧾 Decrypted corporate registration response (parsed):",
          responseData
        );
      } catch (err) {
        console.warn(
          "Failed to decrypt/parse corporate registration response, raw text:",
          rawResponseText,
          err
        );
      }

      // If server returned non-OK HTTP, surface error (use decrypted message if available)
      if (!resp.ok) {
        console.error(
          "🚨 Corporate registration failed - HTTP Status:",
          resp.status
        );
        console.error("🚨 Raw response text:", rawResponseText);
        console.error("🚨 Decrypted response:", decryptedResponse);
        console.error("🚨 Parsed response data:", responseData);

        const errMsg = String(
          responseData?.message ?? rawResponseText ?? `HTTP ${resp.status}`
        );
        console.error("Corporate registration failed:", resp.status, errMsg);
        throw new Error(errMsg);
      }

      // Use decrypted response to decide success if available
      const success =
        responseData?.status === true ||
        resp.status === 200 ||
        resp.status === 201;
      if (success) {
        // On success, download FAAN form and notify user
        downloadFaanForm();

        setToast({
          message:
            "Corporate account created successfully! FAAN form downloaded.",
          type: "success",
          isVisible: true,
        });

        // Navigate to login after a short delay
        setTimeout(() => {
          setIsSubmitting(false);
          navigate("/login");
        }, 1200);
      } else {
        const errMsg = String(responseData?.message ?? "Registration failed");
        throw new Error(errMsg);
      }
    } catch (error) {
      console.error("Error creating corporate account:", error);
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Failed to create account. Please try again.");
      setToast({
        message,
        type: "error",
        isVisible: true,
      });
      setIsSubmitting(false);
    }
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
    setStep("credentials");
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

  // (removed unused credentialErrors variable)

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
                <Input
                  label="First Name"
                  name="firstName"
                  value={individualForm.firstName}
                  onChange={handleIndividualChange}
                  placeholder="First Name"
                  autoComplete="off"
                  error={formErrors.firstName || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Last Name"
                  name="lastName"
                  value={individualForm.lastName}
                  onChange={handleIndividualChange}
                  placeholder="Last Name"
                  autoComplete="off"
                  error={formErrors.lastName || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Email"
                  name="email"
                  value={individualForm.email}
                  onChange={handleIndividualChange}
                  placeholder="Email"
                  autoComplete="off"
                  error={formErrors.email || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={individualForm.phoneNumber}
                  onChange={handleIndividualChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                  error={formErrors.phoneNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Means of Identification"
                  options={meansOfIdOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (meansOfIdOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === individualForm.meansOfId
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setIndividualForm((prev) => ({
                      ...prev,
                      meansOfId: opt.value,
                    }))
                  }
                  placeholder="Select item"
                  className="bill-item-listbox"
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Identification Number"
                  name="idNumber"
                  value={individualForm.idNumber}
                  onChange={handleIndividualChange}
                  placeholder="Identification Number"
                  autoComplete="off"
                  error={formErrors.idNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Address"
                  name="address"
                  value={individualForm.address}
                  onChange={handleIndividualChange}
                  placeholder="Address"
                  autoComplete="off"
                  error={formErrors.address || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Gender"
                  options={genderOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (genderOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === individualForm.gender
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setIndividualForm((prev) => ({
                      ...prev,
                      gender: opt.value,
                    }))
                  }
                  className="bill-item-listbox"
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Are you a Student?"
                  options={studentOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (studentOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === individualForm.isStudent
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setIndividualForm((prev) => ({
                      ...prev,
                      isStudent: opt.value,
                    }))
                  }
                  className="bill-item-listbox"
                />
              </div>
              <div className="form-row-modern">
                <DatePicker
                  value={individualForm.dob}
                  onChange={(v) =>
                    setIndividualForm((prev) => ({ ...prev, dob: v }))
                  }
                  label="Date of Birth"
                  error={formErrors.dob || false}
                  max={
                    new Date(
                      new Date().getFullYear() - 18,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={
                !isIndividualFormValid() ||
                isSubmitting ||
                Object.values(formErrors).some(Boolean)
              }
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
                <Input
                  label="Email"
                  name="email"
                  value={individualForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Password"
                  name="password"
                  type="password"
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
                  passwordToggle
                  error={credentialsErrors.password || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
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
                  passwordToggle
                  error={credentialsErrors.confirmPassword || false}
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="form-row-modern">
              <div className="terms-checkbox-container">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="acceptTerms" className="terms-label">
                  I accept the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowIndemnityModal(true)}
                  >
                    terms and conditions
                  </button>{" "}
                  here and FAAN is indemnified against any claims or demands
                </label>
              </div>
            </div>

            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting || !acceptedTerms}
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
                <Input
                  label="Business Name"
                  name="businessName"
                  value={corporateForm.businessName}
                  onChange={handleCorporateChange}
                  placeholder="Business Name"
                  autoComplete="off"
                  error={corporateFormErrors.businessName || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Nature of Business"
                  options={natureOfBusinessOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (natureOfBusinessOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === corporateForm.natureOfBusiness
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setCorporateForm((prev) => ({
                      ...prev,
                      natureOfBusiness: opt.value,
                    }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Service Type"
                  options={serviceTypeOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (serviceTypeOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === corporateForm.serviceType
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setCorporateForm((prev) => ({
                      ...prev,
                      serviceType: opt.value,
                    }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Year of Incorporation"
                  name="yearOfIncorporation"
                  value={corporateForm.yearOfIncorporation}
                  onChange={handleCorporateChange}
                  placeholder="Year of Incorporation"
                  autoComplete="off"
                  error={corporateFormErrors.yearOfIncorporation || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Registered Address"
                  name="registeredAddress"
                  value={corporateForm.registeredAddress}
                  onChange={handleCorporateChange}
                  placeholder="Registered Address"
                  autoComplete="off"
                  error={corporateFormErrors.registeredAddress || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Registration Number"
                  name="registrationNumber"
                  value={corporateForm.registrationNumber}
                  onChange={handleCorporateChange}
                  placeholder="Registration Number"
                  autoComplete="off"
                  error={corporateFormErrors.registrationNumber || false}
                />
              </div>

              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <InputUpload
                  label={
                    <span>
                      TIN
                    </span>
                  }
                  name="tinNumber"
                  value={corporateForm.tinNumber}
                  onChange={handleCorporateChange}
                  onFilesChange={handleTinFiles}
                  placeholder="Enter TIN and upload document"
                  accept=".pdf,.jpg,.jpeg"
                  multiple={false}
                  error={
                    corporateFormErrors.tinNumber ||
                    (fileError ? fileError : false)
                  }
                  className="booking-form-input"
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Email"
                  name="email"
                  value={corporateForm.email}
                  onChange={handleCorporateChange}
                  placeholder="Email"
                  autoComplete="off"
                  error={corporateFormErrors.email || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={corporateForm.phoneNumber}
                  onChange={handleCorporateChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                  error={corporateFormErrors.phoneNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={corporateForm.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCorporateForm((prev) => ({ ...prev, password: value }));
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
                  passwordToggle
                  error={corporateFormErrors.password || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
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
                  passwordToggle
                  error={corporateFormErrors.confirmPassword || false}
                />
              </div>
            </div>
            <GradientButton
              type="submit"
              fullWidth
              disabled={
                !isCorporateFormValid() ||
                isSubmitting ||
                Object.values(corporateFormErrors).some(Boolean)
              }
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
                borderRadius: 5,
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
                  borderRadius: 5,
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
                    borderRadius: 5,
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
                        borderRadius: 5,
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
                            color: "#000",
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

            {/* Terms and Conditions Checkbox */}
            <div className="form-row-modern">
              <div className="terms-checkbox-container">
                <input
                  type="checkbox"
                  id="acceptTermsCorporate"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="acceptTermsCorporate" className="terms-label">
                  I accept the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowIndemnityModal(true)}
                  >
                    terms and conditions
                  </button>
                  here and FAAN is indemnified against any claims or demands
                </label>
              </div>
            </div>

            <GradientButton
              type="submit"
              fullWidth
              disabled={
                uploadedFiles.length === 0 || isSubmitting || !acceptedTerms
              }
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
                <Input
                  label="Government Office Name"
                  name="officeName"
                  value={governmentForm.officeName}
                  onChange={handleGovernmentChange}
                  placeholder="Government Office Name"
                  autoComplete="off"
                  error={governmentFormErrors.officeName || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Address"
                  name="address"
                  value={governmentForm.address}
                  onChange={handleGovernmentChange}
                  placeholder="Address"
                  autoComplete="off"
                  error={governmentFormErrors.address || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Email"
                  name="email"
                  value={governmentForm.email}
                  onChange={handleGovernmentChange}
                  placeholder="Email"
                  autoComplete="off"
                  error={governmentFormErrors.email || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={governmentForm.phoneNumber}
                  onChange={handleGovernmentChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                  error={governmentFormErrors.phoneNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={governmentForm.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Keep both the government form and the shared credential state in sync
                    setGovernmentForm((prev) => ({ ...prev, password: value }));
                    setPassword(value);
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
                  passwordToggle
                  error={governmentFormErrors.password || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={governmentForm.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Keep both the government form and the shared credential state in sync
                    setGovernmentForm((prev) => ({
                      ...prev,
                      confirmPassword: value,
                    }));
                    setConfirmPassword(value);
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
                  passwordToggle
                  error={governmentFormErrors.confirmPassword || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Office Type"
                  options={officeTypeOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (officeTypeOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === governmentForm.officeType
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setGovernmentForm((prev) => ({
                      ...prev,
                      officeType: opt.value,
                    }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="State"
                  options={nigerianStates.map((s, i) => ({
                    id: i,
                    name: s,
                    value: s,
                  }))}
                  selected={
                    (nigerianStates
                      .map((s, i) => ({ id: i, name: s, value: s }))
                      .find(
                        (opt) => opt.value === governmentForm.state
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setGovernmentForm((prev) => ({ ...prev, state: opt.value }))
                  }
                />
              </div>
              <div
                className="form-row-modern"
                style={{ gridColumn: "1 / span 2" }}
              >
                <ListBox
                  label="Service Type"
                  options={serviceTypeOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (serviceTypeOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === governmentForm.serviceType
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setGovernmentForm((prev) => ({
                      ...prev,
                      serviceType: opt.value,
                    }))
                  }
                />
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
        ) : selectedRole === "FAMILY" && step === "form" ? (
          <form
            key="family-form"
            className="auth-form-modern long-register-form"
            onSubmit={async (e) => {
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
                <Input
                  label="First Name"
                  name="firstName"
                  value={familyForm.firstName}
                  onChange={handleFamilyChange}
                  placeholder="First Name"
                  autoComplete="off"
                  error={familyFormErrors.firstName || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Last Name"
                  name="lastName"
                  value={familyForm.lastName}
                  onChange={handleFamilyChange}
                  placeholder="Last Name"
                  autoComplete="off"
                  error={familyFormErrors.lastName || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Email"
                  name="email"
                  value={familyForm.email}
                  onChange={handleFamilyChange}
                  placeholder="Email"
                  autoComplete="off"
                  error={familyFormErrors.email || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={familyForm.phoneNumber}
                  onChange={handleFamilyChange}
                  placeholder="Phone Number"
                  autoComplete="off"
                  error={familyFormErrors.phoneNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Means of Identification"
                  options={meansOfIdOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (meansOfIdOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === familyForm.meansOfId
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setFamilyForm((prev) => ({ ...prev, meansOfId: opt.value }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Identification Number"
                  name="idNumber"
                  value={familyForm.idNumber}
                  onChange={handleFamilyChange}
                  placeholder="Identification Number"
                  autoComplete="off"
                  error={familyFormErrors.idNumber || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Address"
                  name="address"
                  value={familyForm.address}
                  onChange={handleFamilyChange}
                  placeholder="Address"
                  autoComplete="off"
                  error={familyFormErrors.address || false}
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Gender"
                  options={genderOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (genderOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === familyForm.gender
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setFamilyForm((prev) => ({ ...prev, gender: opt.value }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <ListBox
                  label="Are you a Student?"
                  options={studentOptions.map((o, i) => ({
                    id: i,
                    name: o.label,
                    value: o.value,
                  }))}
                  selected={
                    (studentOptions
                      .map((o, i) => ({ id: i, name: o.label, value: o.value }))
                      .find(
                        (opt) => opt.value === familyForm.isStudent
                      ) as ListBoxOption) ?? null
                  }
                  onChange={(opt) =>
                    setFamilyForm((prev) => ({ ...prev, isStudent: opt.value }))
                  }
                />
              </div>
              <div className="form-row-modern">
                <DatePicker
                  value={familyForm.dob}
                  onChange={(v) =>
                    setFamilyForm((prev) => ({ ...prev, dob: v }))
                  }
                  label="Date of Birth"
                  error={familyFormErrors.dob || false}
                  max={
                    new Date(
                      new Date().getFullYear() - 18,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
            </div>

            <GradientButton
              type="submit"
              fullWidth
              disabled={
                !isFamilyFormValid() ||
                isSubmitting ||
                Object.values(familyFormErrors).some(Boolean)
              }
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
                <Input
                  label="Email"
                  name="email"
                  value={familyForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Password"
                  name="password"
                  type="password"
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
                  passwordToggle
                  error={credentialsErrors.password || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
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
                  passwordToggle
                  error={credentialsErrors.confirmPassword || false}
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="form-row-modern">
              <div className="terms-checkbox-container">
                <input
                  type="checkbox"
                  id="acceptTermsFamily"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="acceptTermsFamily" className="terms-label">
                  I accept the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowIndemnityModal(true)}
                  >
                    terms and conditions
                  </button>{" "}
                  here and FAAN is indemnified against any claims or demands
                </label>
              </div>
            </div>

            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting || !acceptedTerms}
              loading={isSubmitting}
            >
              CREATE ACCOUNT
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
                <Input
                  label="Email"
                  name="email"
                  value={governmentForm.email}
                  disabled
                  style={{ background: "#f7f7f7", color: "#b0b0b0" }}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={governmentForm.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    // sync with shared credential state so validators work
                    setGovernmentForm((prev) => ({
                      ...prev,
                      password: value,
                    }));
                    setPassword(value);
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
                  passwordToggle
                  error={governmentFormErrors.password || false}
                />
              </div>
              <div className="form-row-modern">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={governmentForm.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setGovernmentForm((prev) => ({
                      ...prev,
                      confirmPassword: value,
                    }));
                    setConfirmPassword(value);
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
                  passwordToggle
                  error={governmentFormErrors.confirmPassword || false}
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="form-row-modern">
              <div className="terms-checkbox-container">
                <input
                  type="checkbox"
                  id="acceptTermsGovernment"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="acceptTermsGovernment" className="terms-label">
                  I accept the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowIndemnityModal(true)}
                  >
                    terms and conditions
                  </button>{" "}
                  here and FAAN is indemnified against any claims or demands
                </label>
              </div>
            </div>

            <GradientButton
              type="submit"
              fullWidth
              disabled={!isCredentialsValid() || isSubmitting || !acceptedTerms}
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
                color: "#000",
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

      {/* Indemnity Form Modal */}
      <Modal
        isOpen={showIndemnityModal}
        onClose={() => setShowIndemnityModal(false)}
        showHeader={true}
        headerTitle="Indemnity Form"
        className="indemnity-form-modal"
      >
        <div className="indemnity-paper">
          <div className="indemnity-letterhead">
            <div className="indemnity-logo-wrap">
              <img src={FaanLogo} alt="FAAN" className="indemnity-logo" />
            </div>
            <div className="indemnity-org">
              <div className="org-name">
                FEDERAL AIRPORTS AUTHORITY OF NIGERIA
              </div>
              <div className="form-code">FORM: AC-AWS001L</div>
              <div className="org-address">
                Corporate Headquarters Murtala Mohammed Int'l Airport, Domestic
                Wing, Lagos, Nigeria
              </div>
            </div>
          </div>
          <div className="indemnity-title">INDEMNITY</div>
          <div className="indemnity-body">
            <p>
              Pursuant to Part 4.2.1.7 Federal Airports Regulations 2xxx (Nig
              CARs),
            </p>
            <p>
              I/We{" "}
              <span className="inline-blank">
                {selectedRole === "INDIVIDUAL"
                  ? `${individualForm.firstName} ${individualForm.lastName}`
                  : selectedRole === "CORPORATE"
                  ? corporateForm.businessName
                  : selectedRole === "GOVERNMENT"
                  ? governmentForm.officeName
                  : selectedRole === "FAMILY"
                  ? `${familyForm.firstName} ${familyForm.lastName}`
                  : "User"}
              </span>
              <span>do hereby</span> unconditionally undertake to defend the
              Federal Airports Authority of Nigeria (FAAN) or any of its
              Directors or Officers against any suit or action howsoever arising
              out of the registration or deregistration of the protocol
              services.
            </p>
            <p>
              I/We further covenant and agree to hold the FAAN, its Directors or
              Officers harmless against any claim, demands and charges by
              <span className="inline-blank">
                {selectedRole === "INDIVIDUAL"
                  ? `${individualForm.firstName} ${individualForm.lastName}`
                  : selectedRole === "CORPORATE"
                  ? corporateForm.businessName
                  : selectedRole === "GOVERNMENT"
                  ? governmentForm.officeName
                  : selectedRole === "FAMILY"
                  ? `${familyForm.firstName} ${familyForm.lastName}`
                  : "User"}
              </span>{" "}
              or any third persons for damages arising out of the registration
              or deregistration of services.
            </p>
            <p className="given-this">
              Given this{" "}
              <span className="inline-blank small">{new Date().getDate()}</span>{" "}
              day of
              <span className="inline-blank small">
                {" "}
                {new Date().toLocaleString("default", {
                  month: "long",
                })}{" "}
              </span>
              <span className="inline-blank small">
                {new Date().getFullYear()}
              </span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;
