import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import CryptoJS from "crypto-js";
import { logger } from "../utils/logger";
import { apiFetch, abortPendingRequests } from "../utils/apiClient";

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
  // Local development - use Vite proxy (empty string)
  return "";
};

const API_BASE_URL = getApiBaseUrl();

// Constants
const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/faan/login`,
  USER_DETAILS: `${API_BASE_URL}/api/faan/customers/profile`,
  FUND_WALLET: `${API_BASE_URL}/api/faan/transactions/fund-wallet`,
  GET_ALL_TARIFFS: `${API_BASE_URL}/api/faan/transactions/tariffs`,
  MAKE_PAYMENT: `${API_BASE_URL}/api/faan/transactions/make-payment`,
  GENERATE_INVOICE: `${API_BASE_URL}/api/faan/transactions/generate-invoice`,
  CREATE_TARIFF: `${API_BASE_URL}/api/faan/transactions/create-tariff`,
  ADMIN_TRANSACTION_HISTORY: `${API_BASE_URL}/api/faan/transactions/history-admin`,
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/faan/transactions/stat`,
  CUSTOMER_SEARCH: `${API_BASE_URL}/api/faan/customers/search`,
  GET_ALL_CUSTOMERS: `${API_BASE_URL}/api/faan/customers`,
  CHANGE_CUSTOMER_STATUS: `${API_BASE_URL}/api/faan/customers`,
  CREATE_CUSTOMER: `${API_BASE_URL}/auth/faan/register`,
  SUBMIT_FEEDBACK: `${API_BASE_URL}/api/faan/feedbacks`,
  GET_CUSTOMER_FEEDBACK: `${API_BASE_URL}/api/faan/feedbacks`,
  GET_ADMIN_FEEDBACK: `${API_BASE_URL}/api/faan/feedbacks/admin-fetch`,
  SUBMIT_DISPUTE: `${API_BASE_URL}/api/faan/disputes`,
  CUSTOMER_DISPUTES: `${API_BASE_URL}/api/faan/disputes`,
  ADMIN_DISPUTES: `${API_BASE_URL}/api/faan/disputes/admin-fetch`,
  UPDATE_DISPUTE_STATUS: `${API_BASE_URL}/api/faan/disputes`,
};

const ENCRYPTION_CONFIG = {
  SECRET_KEY: "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/",
  IV_KEY: "RVFU9+dRKhYkiCZI",
};

const REQUEST_HEADERS = {
  CONTENT_TYPE: "application/json",
  X_SOURCE: "web",
  CLIENT_AUTH: "Basic dGVzdDp0ZXN0",
};

const STORAGE_KEYS = {
  USER: "faan_user",
  TOKEN: "faan_token",
};

// Key used to persist recent funding records locally
const FUNDING_STORAGE_KEY = "faan_funding_records";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
};

interface User {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  name: string; // Full name (firstName + lastName)
  email: string;
  phoneNumber: string;
  nin?: string;
  dob?: string;
  address?: string;
  customerType?: string;
  role: string;
  walletBalance?: number;
  transactionStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
}

// Define interface for individual tariff object
interface Tariff {
  id: number;
  name: string;
  description: string;
  amount: number;
}

// Define interface for tariffs API response
interface TariffsResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Tariff[]; // Array of tariff objects
}

interface TransactionHistoryItem {
  customerId: string;
  tariffId: number;
  tariffName: string;
  amount: number;
  status: string;
  createdAt: string;
  id: number;
}

interface AdminTransactionHistoryItem {
  id: number;
  customerId: string;
  tariffId: number;
  tariffName: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  reference?: string;
}

interface GenerateInvoiceRequest {
  orderId: string;
  tariffId: number;
  customerId: string;
  description: string;
}

interface GenerateInvoiceResponse {
  status: boolean;
  statusCode: number;
  data: {
    orderId: string;
    customerId: string;
    rrr: string;
    tariffId: number;
  };
  message: string;
}

interface CreateTariffRequest {
  name: string;
  amount: number;
  description: string;
}

interface CreateTariffResponse {
  status: boolean;
  statusCode: number;
  data: {
    id: number;
    name: string;
    amount: number;
    description: string;
  };
  message: string;
}

interface AdminDashboardStats {
  status: boolean;
  statusCode: number;
  data: {
    customerProfile: unknown | null;
    walletBalance: number | null;
    transactionStats: {
      total: number; // Total bookings/bills
      completed: number; // Completed/successful payments
      pending: number; // Pending payments
      cancelled: number; // Failed/cancelled payments
    };
  };
  message: string;
}

interface CustomerSearchResponse {
  status: boolean;
  statusCode: number;
  data: Array<{
    id: number;
    firstName: string;
    lastName: string;
    idNo: string;
    phone: string;
    email: string;
    address?: string;
    nin?: string;
  }>;
  message: string;
}

interface GetAllCustomersResponse {
  status: boolean;
  statusCode: number;
  data: Array<{
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
  }>;
  message: string;
}

interface ChangeCustomerStatusRequest {
  customerId: string;
  status: "PENDING" | "APPROVED";
}

interface ChangeCustomerStatusResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: number;
    status: string;
  };
}

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  address: string;
  password: string;
  email: string;
  nin: string;
  userType: "CUSTOMER" | "ADMIN";
  creationType: "ADMIN" | "CUSTOMER";
  customerType: "INDIVIDUAL" | "CORPORATE" | "GOVERNMENT" | "FAMILY";
}

interface CreateCustomerResponse {
  status: boolean;
  message: string;
  data?: {
    customerId: string;
    email: string;
  };
}

interface UpdateProfileRequest {
  phoneNumber?: string;
  address?: string;
}

interface UpdateProfileResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    customerId: string;
  };
}

// Feedback interfaces
interface SubmitFeedbackRequest {
  category: string;
  message: string;
}

interface SubmitFeedbackResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: string;
    message: string;
    category: string;
    createdAt: string;
  };
}

interface CustomerFeedbackResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Array<{
    id: string;
    message: string;
    category: string;
    status: "Submitted" | "In Review" | "Resolved";
    createdAt: string;
  }>;
}

interface AdminFeedbackResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Array<{
    id: string;
    message: string;
    category: string;
    status: "Submitted" | "In Review" | "Resolved";
    createdAt: string;
    customerId: string;
    customerName?: string;
  }>;
}

// Dispute interfaces
interface SubmitDisputeRequest {
  invoiceId?: string;
  paymentId?: string;
  reason: string;
  comments?: string;
  attachment?: string;
}

interface SubmitDisputeResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: string;
    reference: string;
    invoiceId?: string;
    paymentId?: string;
    reason: string;
    comments?: string;
    status: string;
    createdAt: string;
  };
}

interface CustomerDisputesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Array<{
    id: string;
    reference: string;
    invoiceId?: string;
    paymentId?: string;
    reason: string;
    category: string;
    comments?: string;
    status: "Pending" | "In Review" | "Resolved" | "Closed";
    resolutionNotes?: string;
    createdAt: string;
    updatedAt: string;
    attachmentUrl?: string;
  }>;
}

interface AdminDisputesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Array<{
    id: string;
    reference: string;
    invoiceId?: string;
    paymentId?: string;
    reason: string;
    category?: string;
    comments?: string;
    status: "Pending" | "In Review" | "Resolved" | "Closed";
    resolutionNotes?: string;
    customerId: string;
    customerName?: string;
    createdAt: string;
    updatedAt: string;
    attachmentUrl?: string;
  }>;
}

interface UpdateDisputeStatusRequest {
  disputeId: string;
  status: "IN_REVIEW" | "RESOLVED" | "CLOSED";
}

interface UpdateDisputeStatusResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: string;
    status: string;
    resolutionNotes?: string;
    updatedAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setGuestUser: (formData: GuestFormData) => void;
  fundWallet: (
    amount: number,
    externalReference?: string,
    providerResponse?: unknown
  ) => Promise<boolean>;
  getAllTariffs: () => Promise<TariffsResponse | null>;
  makePayment: (
    reference: string,
    tariffId: number
  ) => Promise<{ success: boolean; message?: string }>;
  generateInvoice: (
    request: GenerateInvoiceRequest
  ) => Promise<GenerateInvoiceResponse | null>;
  createTariff: (
    request: CreateTariffRequest
  ) => Promise<CreateTariffResponse | null>;
  refreshUserDetails: () => Promise<boolean>;
  getTransactionHistory: (
    startDate: string,
    endDate: string
  ) => Promise<TransactionHistoryItem[] | null>;
  getAdminTransactionHistory: () => Promise<
    AdminTransactionHistoryItem[] | null
  >;
  getAdminDashboardStats: () => Promise<AdminDashboardStats | null>;
  searchCustomers: (
    nin?: string,
    firstName?: string,
    lastName?: string
  ) => Promise<CustomerSearchResponse | null>;
  getAllCustomers: (status?: string) => Promise<GetAllCustomersResponse | null>;
  changeCustomerStatus: (
    customerId: string,
    status: "PENDING" | "APPROVED"
  ) => Promise<ChangeCustomerStatusResponse | null>;
  createCustomer: (
    request: CreateCustomerRequest
  ) => Promise<CreateCustomerResponse | null>;
  updateProfile: (
    request: UpdateProfileRequest
  ) => Promise<UpdateProfileResponse | null>;
  submitFeedback: (
    request: SubmitFeedbackRequest
  ) => Promise<SubmitFeedbackResponse | null>;
  getCustomerFeedback: () => Promise<CustomerFeedbackResponse | null>;
  getAdminFeedback: (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    status?: string;
    category?: string;
  }) => Promise<AdminFeedbackResponse | null>;
  submitDispute: (
    request: SubmitDisputeRequest
  ) => Promise<SubmitDisputeResponse | null>;
  getCustomerDisputes: () => Promise<CustomerDisputesResponse | null>;
  getAdminDisputes: (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    status?: string;
    invoiceId?: string;
    paymentId?: string;
  }) => Promise<AdminDisputesResponse | null>;
  updateDisputeStatus: (
    disputeId: string,
    request: UpdateDisputeStatusRequest
  ) => Promise<UpdateDisputeStatusResponse | null>;
}

// AES encryption function (CBC with PKCS5 padding)
function encryptAESCBC(plaintext: string, secret: string, iv: string): string {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return encrypted.toString(); // base64-encoded
}

// AES decryption function (CBC with PKCS5 padding)
function decryptAESCBC(
  encryptedText: string,
  secret: string,
  iv: string
): string {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock credentials
const MOCK_ADMIN_CREDENTIALS = {
  email: "sadmin@faan.gov.ng",
  password: "spassword123",
};

const MOCK_CUSTOMER_CREDENTIALS = {
  email: "customer@faan.gov.ng",
  password: "customer123",
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tariffsCacheRef = useRef<TariffsResponse | null>(null);
  const tariffsInFlightRef = useRef<Promise<TariffsResponse | null> | null>(
    null
  );

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);

          // Check if token is expired (mock tokens don't expire, but real ones would)
          if (storedToken.startsWith("mock-")) {
            // Mock tokens don't expire
            setUser(userData);
          } else {
            // For real tokens, check if they're expired
            // You can implement JWT expiration checking here if needed
            // For now, we'll assume real tokens are valid if they exist
            setUser(userData);
          }
        } catch (error) {
          logger.error("Auth", "Error parsing stored user data", error);
          // Clear corrupted data
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          // Don't redirect here - just clear the data and let user stay on current page
        }
      } else {
        // No stored credentials - this is normal for new users or logged out users
        // Don't redirect, just ensure user state is null
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Function to fetch user details using Bearer token
  const fetchUserDetails = async (
    token: string,
    userRole?: string
  ): Promise<User | null> => {
    try {
      logger.info("Auth", "Fetching user details...");

      const response = await apiFetch(API_ENDPOINTS.USER_DETAILS, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      logger.apiResponse(API_ENDPOINTS.USER_DETAILS, response.status);

      if (!response.ok) {
        logger.error(
          "Auth",
          `Failed to fetch user details: ${response.status}`
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }

      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        logger.warn("Auth", "Empty user details response");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
        logger.debug("Auth", "User details parsed successfully");
      } catch (error) {
        logger.error("Auth", "Failed to parse user details JSON", error);
        return null;
      }

      // Accept success when the API explicitly returns status=true OR
      // when the API uses a non-HTTP numeric/string statusCode (e.g. '00')
      if (
        data &&
        (data.status === true ||
          data.statusCode === HTTP_STATUS.OK ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0")
      ) {
        // Create user object from API response
        const profile = data.data.customerProfile;
        const userData: User = {
          id: profile.customerId,
          customerId: profile.customerId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          nin: profile.nin,
          dob: profile.dob,
          address: profile.address,
          customerType: profile.customerType,
          role: userRole || "Customer", // Use provided role or default to Customer
          walletBalance: data.data.walletBalance,
          transactionStats: data.data.transactionStats,
        };

        logger.success("Auth", "User details fetched", {
          customerId: userData.customerId,
          role: userData.role,
          walletBalance: data.data.walletBalance,
        });
        return userData;
      } else {
        logger.error("Auth", "Failed to get user details", data.message);
        return null;
      }
    } catch (error) {
      logger.error("Auth", "Error fetching user details", error);
      return null;
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Abort any pending API requests to avoid using stale tokens/responses
      abortPendingRequests();
      // Check for mock admin credentials first
      if (
        email === MOCK_ADMIN_CREDENTIALS.email &&
        password === MOCK_ADMIN_CREDENTIALS.password
      ) {
        logger.info("Auth", "Mock admin login detected");

        // Create mock admin user
        const mockAdminUser: User = {
          id: "admin-001",
          customerId: "ADMIN-001",
          firstName: "System",
          lastName: "Administrator",
          name: "System Administrator",
          email: "admin@faan.gov.ng",
          phoneNumber: "+234-800-ADMIN",
          nin: "00000000000",
          dob: "1980-01-01",
          address: "FAAN Headquarters, Lagos",
          customerType: "ADMIN",
          role: "Admin",
          walletBalance: 0,
          transactionStats: {
            total: 0,
            completed: 0,
            pending: 0,
            cancelled: 0,
          },
        };

        // Generate a mock token for admin
        const mockToken = `mock-admin-token-${Date.now()}`;

        // Store admin user and token
        setUser(mockAdminUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockAdminUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

        logger.success("Auth", "Mock admin user created");
        return { success: true };
      }

      // Check for mock customer credentials
      if (
        email === MOCK_CUSTOMER_CREDENTIALS.email &&
        password === MOCK_CUSTOMER_CREDENTIALS.password
      ) {
        logger.info("Auth", "Mock customer login detected");

        // Create mock customer user
        const mockCustomerUser: User = {
          id: "customer-001",
          customerId: "CUST-001",
          firstName: "John",
          lastName: "Customer",
          name: "John Customer",
          email: "customer@faan.gov.ng",
          phoneNumber: "+234-800-CUSTOMER",
          nin: "12345678901",
          dob: "1990-05-15",
          address: "123 Customer Street, Lagos",
          customerType: "INDIVIDUAL",
          role: "Customer",
          walletBalance: 50000,
          transactionStats: {
            total: 5,
            completed: 3,
            pending: 1,
            cancelled: 1,
          },
        };

        // Generate a mock token for customer
        const mockToken = `mock-customer-token-${Date.now()}`;

        // Store customer user and token
        setUser(mockCustomerUser);
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(mockCustomerUser)
        );
        localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

        logger.success("Auth", "Mock customer user created");
        return { success: true };
      }

      // If not mock credentials, proceed with API login
      const requestBody = { username: email, password };
      const body = JSON.stringify(requestBody);

      // Encrypt the body
      const encryptedPayload = encryptAESCBC(
        body,
        ENCRYPTION_CONFIG.SECRET_KEY,
        ENCRYPTION_CONFIG.IV_KEY
      );

      logger.group("Auth", "Login Request", () => {
        logger.info("Auth", "Endpoint", API_ENDPOINTS.LOGIN);
        logger.debug("Auth", "Request body", requestBody);
        logger.debug(
          "Auth",
          "Encrypted payload length",
          encryptedPayload.length
        );
      });

      const response = await apiFetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "X-Source": REQUEST_HEADERS.X_SOURCE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        },
        body: encryptedPayload,
      });

      // Log response text for debugging
      const responseText = await response.text();

      logger.apiResponse(API_ENDPOINTS.LOGIN, response.status, {
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyLength: responseText.length,
      });

      // Check if response is ok and has content
      if (!response.ok) {
        logger.error("Auth", `HTTP Error: ${response.status}`, responseText);
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          return { success: false, message: "Invalid credentials" };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        logger.warn("Auth", "Empty response body received");
        return { success: false, message: "Empty response from server" };
      }

      // Decrypt the response
      let decryptedResponse;
      try {
        decryptedResponse = decryptAESCBC(
          responseText,
          ENCRYPTION_CONFIG.SECRET_KEY,
          ENCRYPTION_CONFIG.IV_KEY
        );
        logger.debug("Auth", "Response decrypted successfully");
      } catch (error) {
        logger.error("Auth", "Failed to decrypt response", error);
        return { success: false, message: "Failed to decrypt server response" };
      }

      let data;
      try {
        data = JSON.parse(decryptedResponse);
        logger.debug("Auth", "Response parsed successfully", data);
      } catch (error) {
        logger.error("Auth", "Failed to parse JSON", {
          error,
          decryptedResponse,
        });
        return { success: false, message: "Invalid server response format" };
      }

      // Treat login as successful when API explicitly returns status=true
      // or when it uses non-HTTP status codes like '00' for success.
      if (
        data &&
        (data.status === true ||
          data.statusCode === HTTP_STATUS.OK ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0")
      ) {
        // Shape the login response to a typed object to include userType
        interface LoginResponse {
          status: boolean;
          statusCode: number;
          message: string;
          data: {
            token: string;
            customerId: string;
            userType?: "ADMIN" | "CUSTOMER" | "GUEST" | string;
          };
        }
        const loginResp = data as LoginResponse;
        const userTypeRaw = loginResp.data.userType;
        const normalizedRole: string =
          userTypeRaw === "ADMIN"
            ? "Admin"
            : userTypeRaw === "CUSTOMER"
            ? "Customer"
            : userTypeRaw === "GUEST"
            ? "Guest"
            : "Customer";

        logger.success("Auth", "Login successful", {
          customerId: data.data.customerId,
          userType: userTypeRaw,
          role: normalizedRole,
          tokenLength: data.data.token?.length,
        });

        // Store the token first
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);

        // Now fetch user details using the token
        logger.info("Auth", "Fetching user details...");
        const userDetails = await fetchUserDetails(
          loginResp.data.token,
          normalizedRole
        );

        if (userDetails) {
          // Use the real user details from the API (role is already set correctly in fetchUserDetails)
          const completeUserData: User = {
            ...userDetails,
            customerId: loginResp.data.customerId,
          };
          setUser(completeUserData);
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(completeUserData)
          );
          logger.success("Auth", "User data stored", {
            customerId: completeUserData.customerId,
          });
        } else {
          // Fallback to basic user object if user details fetch fails
          logger.warn("Auth", "User details fetch failed, using fallback");
          const fallbackUserData: User = {
            id: loginResp.data.customerId || Date.now().toString(),
            customerId: loginResp.data.customerId,
            firstName: email.split("@")[0],
            lastName: "",
            name: email.split("@")[0],
            email: email,
            phoneNumber: "",
            role: normalizedRole,
            transactionStats: {
              total: 0,
              completed: 0,
              pending: 0,
              cancelled: 0,
            },
          };
          setUser(fallbackUserData);
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(fallbackUserData)
          );
        }

        return { success: true };
      } else {
        logger.error("Auth", "Login failed", data.message);
        return { success: false, message: data?.message ?? "Login failed" };
      }
    } catch (error) {
      logger.error("Auth", "Login error", error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, message };
    }
  };

  const logout = () => {
    // Abort any pending API requests to ensure no in-flight calls continue with old token
    abortPendingRequests();
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  // Stable check for token expiration that redirects to login when necessary
  const checkTokenAndRedirect = useCallback(
    (response: Response): boolean => {
      if (response.status === HTTP_STATUS.UNAUTHORIZED && user) {
        logger.warn("Auth", "Token expired, redirecting to login");
        // Clear local user and token directly rather than calling logout to keep this function stable
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return true;
      }
      return false;
    },
    [user]
  );

  const fundWallet = async (
    amount: number,
    externalReference?: string,
    providerResponse?: unknown
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        logger.error("Wallet", "No token found for wallet funding");
        return false;
      }

      logger.group("Wallet", "Fund Wallet", () => {
        logger.info("Wallet", "Funding amount", amount);
        logger.info("Wallet", "Endpoint", API_ENDPOINTS.FUND_WALLET);
      });

      // Generate a unique reference for the transaction
      const reference = `fund-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8)}`;

      // Prevent duplicate fund calls for the same reference (idempotency guard)
      // Use a module-scoped set on globalThis to track in-flight references
      type PendingRefsHolder = { _pendingFundRefs?: Set<string> };
      const holder = globalThis as unknown as PendingRefsHolder;
      if (!holder._pendingFundRefs) {
        holder._pendingFundRefs = new Set<string>();
      }
      const pendingFundRefs: Set<string> =
        holder._pendingFundRefs as Set<string>;

      const refToUse = externalReference ?? reference;

      // If this reference is already being processed, avoid duplicate POST
      if (pendingFundRefs.has(refToUse)) {
        logger.warn(
          "Wallet",
          "Duplicate fundWallet call prevented for:",
          refToUse
        );
        return true;
      }
      // Also check persisted funding records to skip re-submission if already recorded
      try {
        const stored = localStorage.getItem(FUNDING_STORAGE_KEY);
        if (stored) {
          const existing = JSON.parse(stored) as { reference?: string }[];
          if (existing.some((r) => r.reference === refToUse)) {
            logger.info(
              "Wallet",
              "Funding already recorded locally, skipping:",
              refToUse
            );
            return true;
          }
        }
      } catch {
        // ignore parsing errors
      }

      pendingFundRefs.add(refToUse);

      try {
        // Prefer amount from providerResponse if available (ensure we record actual paid amount)
        // Safely inspect providerResponse without using `any` by treating it as a Record
        let paidAmount: number = amount;
        if (providerResponse && typeof providerResponse === "object") {
          const resp = providerResponse as Record<string, unknown>;
          if (
            Object.prototype.hasOwnProperty.call(resp, "amount") &&
            typeof resp.amount === "number"
          ) {
            paidAmount = resp.amount as number;
          }
        }

        const requestBody: Record<string, unknown> = {
          reference: externalReference ?? reference,
          amount: paidAmount,
        };
        if (providerResponse !== undefined) {
          requestBody.providerResponse = providerResponse;
        }

        logger.debug("Wallet", "Request details", {
          reference: externalReference ?? reference,
          amount: paidAmount,
        });

        const response = await apiFetch(API_ENDPOINTS.FUND_WALLET, {
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        logger.apiResponse(API_ENDPOINTS.FUND_WALLET, response.status);

        if (!response.ok) {
          logger.error("Wallet", `Failed to fund wallet: ${response.status}`);

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return false;
          }

          return false;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Wallet", "Empty fund wallet response");
          return false;
        }

        let data;
        try {
          data = JSON.parse(responseText);
          logger.debug("Wallet", "Response parsed successfully");
        } catch (error) {
          logger.error("Wallet", "Failed to parse fund wallet JSON", error);
          return false;
        }

        if (
          data &&
          (data.status === true ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0" ||
            Number(data.statusCode) === HTTP_STATUS.OK)
        ) {
          logger.success("Wallet", "Wallet funded successfully", {
            reference,
            newBalance: data.data.balance,
          });

          // Update user's wallet balance from the API response
          if (user && data.data?.balance !== undefined) {
            const updatedUser: User = {
              ...user,
              walletBalance: data.data.balance,
            };
            setUser(updatedUser);
            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(updatedUser)
            );
          }

          return true;
        } else {
          logger.error("Wallet", "Wallet funding failed", data.message);
          return false;
        }
      } finally {
        // always remove pending ref so future attempts can proceed
        pendingFundRefs.delete(refToUse);
      }
      // outer try/catch will handle errors
    } catch (error) {
      logger.error("Wallet", "Wallet funding error", error);
      return false;
    }
  };

  const getAllTariffs =
    useCallback(async (): Promise<TariffsResponse | null> => {
      // Return cached result if available
      if (tariffsCacheRef.current) {
        return tariffsCacheRef.current;
      }
      // If a request is already in flight, await it
      if (tariffsInFlightRef.current) {
        return tariffsInFlightRef.current;
      }

      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Service", "No token found for fetching tariffs");
          return null;
        }

        logger.info(
          "Service",
          "Fetching tariffs",
          API_ENDPOINTS.GET_ALL_TARIFFS
        );

        const requestPromise = apiFetch(API_ENDPOINTS.GET_ALL_TARIFFS, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });
        tariffsInFlightRef.current = requestPromise.then(async (response) => {
          logger.apiResponse(API_ENDPOINTS.GET_ALL_TARIFFS, response.status);

          if (!response.ok) {
            logger.error(
              "Service",
              `Failed to fetch tariffs: ${response.status}`
            );

            // Check if token is expired and redirect if needed
            if (checkTokenAndRedirect(response)) {
              return null;
            }

            const errorText = await response.text();
            logger.error("Service", "Tariff fetch error response", errorText);
            return null;
          }

          const responseText = await response.text();

          if (!responseText || responseText.trim() === "") {
            logger.warn("Service", "Empty tariffs response");
            return null;
          }

          let data: TariffsResponse;
          try {
            data = JSON.parse(responseText);
            logger.success("Service", "Tariffs loaded", {
              count: data.data?.length,
            });
          } catch (error) {
            logger.error("Service", "Failed to parse tariffs JSON", error);
            return null;
          }

          return data;
        });

        const data = await tariffsInFlightRef.current;
        // Cache the successful result
        if (data && data.status && Array.isArray(data.data)) {
          tariffsCacheRef.current = data;
        }
        // Clear in-flight reference
        tariffsInFlightRef.current = null;
        return data;
      } catch (error) {
        logger.error("Service", "Get all tariffs error", error);
        tariffsInFlightRef.current = null;
        return null;
      }
    }, [checkTokenAndRedirect]);

  const createTariff = useCallback(
    async (
      request: CreateTariffRequest
    ): Promise<CreateTariffResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Service", "No token found for creating tariff");
          return null;
        }

        logger.info("Service", "Creating tariff", request);

        const response = await apiFetch(API_ENDPOINTS.CREATE_TARIFF, {
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        });

        logger.apiResponse(API_ENDPOINTS.CREATE_TARIFF, response.status);

        if (!response.ok) {
          logger.error(
            "Service",
            `Failed to create tariff: ${response.status}`
          );
          if (checkTokenAndRedirect(response)) {
            return null;
          }
          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Service", "Empty create tariff response");
          return null;
        }

        let data: CreateTariffResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Service", "Tariff created", data);
        } catch (error) {
          logger.error("Service", "Failed to parse create tariff JSON", error);
          return null;
        }

        // Clear tariffs cache to force refresh on next getAllTariffs call
        tariffsCacheRef.current = null;

        return data;
      } catch (error) {
        logger.error("Service", "Create tariff error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const makePayment = async (
    reference: string,
    tariffId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for making payment");
        return { success: false, message: "Authentication token not found" };
      }

      console.log("🚀 === STARTING MAKE PAYMENT REQUEST ===");
      console.log("📍 Request URL:", API_ENDPOINTS.MAKE_PAYMENT);
      console.log("🔑 Using token:", token);
      console.log("📋 Payment reference:", reference);
      console.log("🎯 Tariff ID:", tariffId);
      console.log("⏰ Request timestamp:", new Date().toISOString());

      const requestBody = {
        reference: reference,
        tariffId: tariffId,
      };

      console.log("📤 Request body:", requestBody);

      const response = await apiFetch(API_ENDPOINTS.MAKE_PAYMENT, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Make payment response status:", response.status);
      console.log("📥 Make payment response status text:", response.statusText);
      console.log("📥 Response timestamp:", new Date().toISOString());
      console.log("🔧 Make payment request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to make payment:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return { success: false, message: "Authentication expired" };
        }

        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const responseText = await response.text();
      console.log("📄 Raw make payment response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty make payment response");
        return { success: false, message: "Empty response from server" };
      }

      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed make payment data:", data);
        console.log("✅ Data structure:", typeof data);
        if (data && typeof data === "object") {
          console.log("✅ Data keys:", Object.keys(data));
          if (data.data) {
            console.log("✅ Data.data type:", typeof data.data);
            console.log("✅ Data.data content:", data.data);
          }
        }
      } catch (error) {
        console.error("❌ Failed to parse make payment JSON:", error);
        console.error("❌ Raw response that failed to parse:", responseText);
        return {
          success: false,
          message: "Invalid response format from server",
        };
      }

      if (
        data &&
        (data.status === true ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0" ||
          Number(data.statusCode) === HTTP_STATUS.OK)
      ) {
        console.log("🎉 === MAKE PAYMENT COMPLETED SUCCESSFULLY ===");
        return { success: true };
      } else {
        console.error("❌ Payment failed:", data.message);
        return { success: false, message: data.message || "Payment failed" };
      }
    } catch (error) {
      console.error("💥 Make payment error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const generateInvoice = async (
    request: GenerateInvoiceRequest
  ): Promise<GenerateInvoiceResponse | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for generating invoice");
        return null;
      }

      console.log("🚀 === STARTING GENERATE INVOICE REQUEST ===");
      console.log("📍 Request URL:", API_ENDPOINTS.GENERATE_INVOICE);
      console.log("🔑 Using token:", token);
      console.log("📋 Invoice request:", request);
      console.log("⏰ Request timestamp:", new Date().toISOString());

      const requestBody = {
        orderId: request.orderId,
        tariffId: request.tariffId,
        customerId: request.customerId,
        description: request.description,
      };

      console.log("📤 Request body:", requestBody);

      const response = await apiFetch(API_ENDPOINTS.GENERATE_INVOICE, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Generate invoice response status:", response.status);
      console.log(
        "📥 Generate invoice response status text:",
        response.statusText
      );
      console.log("📥 Response timestamp:", new Date().toISOString());
      console.log("🔧 Generate invoice request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to generate invoice:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return null;
      }

      const responseText = await response.text();
      console.log("📄 Raw generate invoice response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty generate invoice response");
        return null;
      }

      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed generate invoice data:", data);
        console.log("✅ Data structure:", typeof data);
        if (data && typeof data === "object") {
          console.log("✅ Data keys:", Object.keys(data));
          if (data.data) {
            console.log("✅ Data.data type:", typeof data.data);
            console.log("✅ Data.data content:", data.data);
          }
        }
      } catch (error) {
        console.error("❌ Failed to parse generate invoice JSON:", error);
        console.error("❌ Raw response that failed to parse:", responseText);
        return null;
      }

      if (
        data.status &&
        (data.statusCode === HTTP_STATUS.OK ||
          data.statusCode === HTTP_STATUS.CREATED)
      ) {
        console.log("🎉 === GENERATE INVOICE COMPLETED SUCCESSFULLY ===");
        return data as GenerateInvoiceResponse;
      } else {
        console.error("❌ Invoice generation failed:", data.message);
        return null;
      }
    } catch (error) {
      console.error("💥 Generate invoice error:", error);
      return null;
    }
  };

  const refreshUserDetails = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for refreshing user details");
        return false;
      }

      console.log("=== STARTING REFRESH USER DETAILS REQUEST ===");
      console.log("📍 Request URL:", API_ENDPOINTS.USER_DETAILS);
      console.log("🔑 Using token:", token);
      console.log("⏰ Request timestamp:", new Date().toISOString());

      const response = await apiFetch(API_ENDPOINTS.USER_DETAILS, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Refresh user details response status:", response.status);
      console.log(
        "📥 Refresh user details response status text:",
        response.statusText
      );
      console.log("📥 Response timestamp:", new Date().toISOString());
      console.log("🔧 Refresh user details request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to refresh user details:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return false;
        }

        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return false;
      }

      const responseText = await response.text();
      console.log("📄 Raw refresh user details response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty refresh user details response");
        return false;
      }

      // Parse the JSON response directly (no decryption needed for this endpoint)
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed refresh user details data:", data);
      } catch (error) {
        console.error("❌ Failed to parse refresh user details JSON:", error);
        console.error("❌ Raw response that failed to parse:", responseText);
        return false;
      }

      if (
        data &&
        (data.status === true ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0" ||
          Number(data.statusCode) === HTTP_STATUS.OK)
      ) {
        console.log("🎉 === REFRESH USER DETAILS COMPLETED SUCCESSFULLY ===");
        // Update user's details from the API response
        if (user && data.data.customerProfile) {
          const updatedUser: User = {
            ...user,
            id: data.data.customerProfile.customerId,
            customerId: data.data.customerProfile.customerId,
            firstName: data.data.customerProfile.firstName,
            lastName: data.data.customerProfile.lastName,
            name: `${data.data.customerProfile.firstName} ${data.data.customerProfile.lastName}`,
            email: data.data.customerProfile.email,
            phoneNumber: data.data.customerProfile.phoneNumber,
            nin: data.data.customerProfile.nin,
            dob: data.data.customerProfile.dob,
            address: data.data.customerProfile.address,
            customerType: data.data.customerProfile.customerType,
            // Preserve the existing role - don't overwrite it
            role: user.role,
            walletBalance: data.data.walletBalance,
            transactionStats: data.data.transactionStats,
          };
          setUser(updatedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          console.log("Updated user details stored:", updatedUser);
        }
        return true;
      } else {
        console.error("❌ Refresh user details failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("💥 Refresh user details error:", error);
      return false;
    }
  };

  const getTransactionHistory = async (
    startDate: string,
    endDate: string
  ): Promise<TransactionHistoryItem[] | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for fetching transaction history");
        return null;
      }
      const url = `${API_BASE_URL}/api/faan/transactions/history?startdate=${startDate}&&enddate=${endDate}`;
      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error(
          "Failed to fetch transaction history:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }
      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") {
        return null;
      }
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Failed to parse transaction history JSON:", error);
        return null;
      }
      if (Array.isArray(data)) {
        return data as TransactionHistoryItem[];
      } else if (Array.isArray(data.data)) {
        return data.data as TransactionHistoryItem[];
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return null;
    }
  };

  const getAdminTransactionHistory = async (): Promise<
    AdminTransactionHistoryItem[] | null
  > => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for fetching admin transaction history");
        return null;
      }

      console.log("🚀 === FETCHING ADMIN TRANSACTION HISTORY ===");
      console.log("📍 Request URL:", API_ENDPOINTS.ADMIN_TRANSACTION_HISTORY);

      const response = await apiFetch(API_ENDPOINTS.ADMIN_TRANSACTION_HISTORY, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to fetch admin transaction history:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty response from admin transaction history API");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "💥 Failed to parse admin transaction history JSON:",
          error
        );
        return null;
      }

      console.log("📄 Admin transaction history response:", data);

      if (Array.isArray(data)) {
        console.log("✅ Admin transaction history data (direct array):", data);
        return data as AdminTransactionHistoryItem[];
      } else if (Array.isArray(data.data)) {
        console.log(
          "✅ Admin transaction history data (nested array):",
          data.data
        );
        return data.data as AdminTransactionHistoryItem[];
      } else {
        console.log(
          "⚠️ Admin transaction history data structure not recognized:",
          data
        );
        return null;
      }
    } catch (error) {
      console.error("💥 Error fetching admin transaction history:", error);
      return null;
    }
  };

  const getAdminDashboardStats =
    async (): Promise<AdminDashboardStats | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          console.error("No token found for fetching admin dashboard stats");
          return null;
        }

        console.log("🚀 === FETCHING ADMIN DASHBOARD STATS ===");
        console.log("📍 Request URL:", API_ENDPOINTS.ADMIN_DASHBOARD_STATS);

        const response = await apiFetch(API_ENDPOINTS.ADMIN_DASHBOARD_STATS, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error(
            "❌ Failed to fetch admin dashboard stats:",
            response.status,
            response.statusText
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();
        if (!responseText || responseText.trim() === "") {
          console.log("⚠️ Empty response from admin dashboard stats API");
          return null;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error(
            "💥 Failed to parse admin dashboard stats JSON:",
            error
          );
          return null;
        }

        console.log("📄 === ADMIN DASHBOARD STATS RESPONSE ===");
        console.log("📊 Raw API Response:", data);
        console.log("🔍 Response Type:", typeof data);
        console.log("📋 Response Keys:", Object.keys(data || {}));

        if (data && typeof data === "object" && data.status !== undefined) {
          console.log("✅ Admin dashboard stats data structure:", data);
          return data as AdminDashboardStats;
        } else {
          console.log(
            "⚠️ Admin dashboard stats data structure not recognized:",
            data
          );
          return null;
        }
      } catch (error) {
        console.error("💥 Error fetching admin dashboard stats:", error);
        return null;
      }
    };

  const searchCustomers = async (
    nin?: string,
    firstName?: string,
    lastName?: string
  ): Promise<CustomerSearchResponse | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for customer search");
        return null;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (nin) params.append("nin", nin);
      if (firstName) params.append("firsName", firstName); // Note: API uses "firsName" (typo in API)
      if (lastName) params.append("lastName", lastName);

      const searchUrl = `${API_ENDPOINTS.CUSTOMER_SEARCH}?${params.toString()}`;

      console.log("🚀 === SEARCHING CUSTOMERS ===");
      console.log("📍 Request URL:", searchUrl);
      console.log("🔍 Search Parameters:", { nin, firstName, lastName });

      const response = await apiFetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to search customers:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty response from customer search API");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("💥 Failed to parse customer search JSON:", error);
        return null;
      }

      console.log("📄 === CUSTOMER SEARCH RESPONSE ===");
      console.log("📊 Raw API Response:", data);
      console.log("🔍 Response Type:", typeof data);
      console.log("📋 Response Keys:", Object.keys(data || {}));

      if (data && typeof data === "object" && data.status !== undefined) {
        console.log("✅ Customer search data structure:", data);
        return data as CustomerSearchResponse;
      } else {
        console.log("⚠️ Customer search data structure not recognized:", data);
        return null;
      }
    } catch (error) {
      console.error("💥 Error searching customers:", error);
      return null;
    }
  };

  const getAllCustomers = async (
    status?: string
  ): Promise<GetAllCustomersResponse | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for fetching all customers");
        return null;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const customersUrl = `${
        API_ENDPOINTS.GET_ALL_CUSTOMERS
      }?${params.toString()}`;

      console.log("🚀 === FETCHING ALL CUSTOMERS ===");
      console.log("📍 Request URL:", customersUrl);
      console.log("🔍 Status Filter:", status);

      const response = await apiFetch(customersUrl, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to fetch all customers:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty response from get all customers API");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("💥 Failed to parse get all customers JSON:", error);
        return null;
      }

      console.log("📄 === GET ALL CUSTOMERS RESPONSE ===");
      console.log("📊 Raw API Response:", data);
      console.log("🔍 Response Type:", typeof data);
      console.log("📋 Response Keys:", Object.keys(data || {}));

      if (data && typeof data === "object" && data.status !== undefined) {
        console.log("✅ Get all customers data structure:", data);

        // Handle case where status is false but it's a valid response (no customers found)
        if (data.status === false && data.statusCode === 404) {
          console.log("ℹ️ No customers found - returning empty array");
          return {
            status: true, // Convert to success for our app logic
            statusCode: 200,
            data: [], // Empty array
            message: data.message || "No customers found",
          } as GetAllCustomersResponse;
        }

        return data as GetAllCustomersResponse;
      } else {
        console.log(
          "⚠️ Get all customers data structure not recognized:",
          data
        );
        return null;
      }
    } catch (error) {
      console.error("💥 Error fetching all customers:", error);
      return null;
    }
  };

  const changeCustomerStatus = async (
    customerId: string,
    status: "PENDING" | "APPROVED"
  ): Promise<ChangeCustomerStatusResponse | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for changing customer status");
        return null;
      }

      // New API: POST /api/faan/customers/change-status with payload { customerId, status }
      const changeStatusUrl = `${API_ENDPOINTS.CHANGE_CUSTOMER_STATUS}/change-status`;
      const requestBody: ChangeCustomerStatusRequest = { customerId, status };

      console.log("🚀 === CHANGING CUSTOMER STATUS (payload) ===");
      console.log("📍 Request URL:", changeStatusUrl);
      console.log("🔍 Customer ID:", customerId);
      console.log("📋 New Status:", status);
      console.log("📤 Request Body:", requestBody);

      const response = await apiFetch(changeStatusUrl, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Change status response status:", response.status);
      console.log(
        "📥 Change status response status text:",
        response.statusText
      );

      if (!response.ok) {
        console.error(
          "❌ Failed to change customer status:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return null;
        }

        return null;
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty response from change customer status API");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("💥 Failed to parse change customer status JSON:", error);
        return null;
      }

      console.log("📄 === CHANGE CUSTOMER STATUS RESPONSE ===");
      console.log("📊 Raw API Response:", data);
      console.log("🔍 Response Type:", typeof data);
      console.log("📋 Response Keys:", Object.keys(data || {}));

      if (data && typeof data === "object" && data.status !== undefined) {
        console.log("✅ Change customer status data structure:", data);
        return data as ChangeCustomerStatusResponse;
      } else {
        console.log(
          "⚠️ Change customer status data structure not recognized:",
          data
        );
        return null;
      }
    } catch (error) {
      console.error("💥 Error changing customer status:", error);
      return null;
    }
  };

  const setGuestUser = (formData: GuestFormData) => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      customerId: `GUEST-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role: "Guest",
      walletBalance: 0,
      transactionStats: {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      },
    };

    setUser(guestUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, `guest-token-${Date.now()}`);
    console.log("Guest user created:", guestUser);
  };

  const createCustomer = async (
    request: CreateCustomerRequest
  ): Promise<CreateCustomerResponse | null> => {
    try {
      console.log("=== STARTING CREATE CUSTOMER REQUEST ===");
      console.log("📍 Request URL:", API_ENDPOINTS.CREATE_CUSTOMER);
      console.log("📝 Customer data (before encryption):", request);
      console.log("⏰ Request timestamp:", new Date().toISOString());

      // Encrypt the payload
      const payload = JSON.stringify(request);
      const encryptedPayload = encryptAESCBC(
        payload,
        ENCRYPTION_CONFIG.SECRET_KEY,
        ENCRYPTION_CONFIG.IV_KEY
      );

      console.log("🔐 Encrypted payload length:", encryptedPayload.length);

      // Make the API call
      const response = await apiFetch(API_ENDPOINTS.CREATE_CUSTOMER, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "X-Source": REQUEST_HEADERS.X_SOURCE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        },
        body: encryptedPayload,
      });

      const rawResponseText = await response.text();
      console.log("🚨 Raw response text:", rawResponseText);

      // Decrypt the response
      const decryptedResponse = CryptoJS.AES.decrypt(
        rawResponseText,
        CryptoJS.enc.Utf8.parse(ENCRYPTION_CONFIG.SECRET_KEY),
        {
          iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_CONFIG.IV_KEY),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      ).toString(CryptoJS.enc.Utf8);

      console.log("🚨 Decrypted response:", decryptedResponse);

      const data = JSON.parse(decryptedResponse);
      console.log("🚨 Parsed response data:", data);

      if (response.ok && data.status) {
        console.log("✅ Customer created successfully:", data);
        return data;
      } else {
        console.error("🚨 Customer creation failed:", data);
        return data; // Return the error response
      }
    } catch (error) {
      console.error("💥 Error creating customer:", error);
      return null;
    }
  };

  const updateProfile = async (
    request: UpdateProfileRequest
  ): Promise<UpdateProfileResponse | null> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for updating profile");
        return null;
      }

      console.log("🚀 === STARTING UPDATE PROFILE REQUEST ===");
      console.log("📍 Request URL:", API_ENDPOINTS.USER_DETAILS);
      console.log("🔑 Using token:", token);
      console.log("📋 Profile update data:", request);
      console.log("⏰ Request timestamp:", new Date().toISOString());
      console.log("🔧 Request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "X-Source": REQUEST_HEADERS.X_SOURCE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      const response = await apiFetch(API_ENDPOINTS.USER_DETAILS, {
        method: "PATCH",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "X-Source": REQUEST_HEADERS.X_SOURCE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      console.log("📥 Update profile response status:", response.status);
      console.log(
        "📥 Update profile response status text:",
        response.statusText
      );
      console.log("📥 Response timestamp:", new Date().toISOString());

      if (!response.ok) {
        console.error(
          "❌ Failed to update profile:",
          response.status,
          response.statusText
        );

        // Get the error text first to see what the actual error is
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        console.error("❌ Full response details:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        });

        // TEMPORARILY DISABLED: Don't redirect on this specific error so we can debug
        // if (checkTokenAndRedirect(response)) {
        //   return null;
        // }

        return null;
      }

      const responseText = await response.text();
      console.log("📄 Raw update profile response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty update profile response");
        return null;
      }

      // Parse the JSON response directly (no decryption needed for this endpoint)
      let data: UpdateProfileResponse;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed update profile data:", data);
      } catch (error) {
        console.error("❌ Failed to parse update profile JSON:", error);
        console.error("❌ Raw response that failed to parse:", responseText);
        return null;
      }

      // Check for success
      if (
        data &&
        (data.status === true ||
          data.statusCode === HTTP_STATUS.OK ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0")
      ) {
        console.log("🎉 === UPDATE PROFILE COMPLETED SUCCESSFULLY ===");

        // Update user's profile data in local storage if successful
        if (user && data.data) {
          const updatedUser: User = {
            ...user,
            phoneNumber: data.data.phoneNumber || user.phoneNumber,
            address: data.data.address || user.address,
          };
          setUser(updatedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          console.log("Updated user profile stored:", updatedUser);
        }

        return data;
      } else {
        console.error("❌ Profile update failed:", data.message);
        return data; // Return the response even if failed so we can show the error message
      }
    } catch (error) {
      console.error("💥 Update profile error:", error);
      return null;
    }
  };

  // removed duplicate declaration (kept useCallback version above)

  // Feedback & Disputes methods
  const submitFeedback = useCallback(
    async (
      request: SubmitFeedbackRequest
    ): Promise<SubmitFeedbackResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Feedback", "No token found for submitting feedback");
          return null;
        }

        console.log("🌐 === AUTHCONTEXT: MAKING API CALL ===");
        console.log("📍 Endpoint:", API_ENDPOINTS.SUBMIT_FEEDBACK);
        console.log("📤 Request payload:", request);
        console.log("📋 JSON body:", JSON.stringify(request));
        console.log(
          "🔑 Token (first 20 chars):",
          token.substring(0, 20) + "..."
        );

        logger.info("Feedback", "Submitting feedback", request);
        logger.info("Feedback", "Request details", {
          endpoint: API_ENDPOINTS.SUBMIT_FEEDBACK,
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token.substring(0, 20)}...`,
          },
          body: JSON.stringify(request),
        });

        const response = await apiFetch(API_ENDPOINTS.SUBMIT_FEEDBACK, {
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        });

        logger.apiResponse(API_ENDPOINTS.SUBMIT_FEEDBACK, response.status);

        if (!response.ok) {
          logger.error(
            "Feedback",
            `Failed to submit feedback: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        console.log("📥 === API RESPONSE RECEIVED ===");
        console.log("📊 Status:", response.status);
        console.log("📄 Status Text:", response.statusText);
        console.log("📏 Response Length:", responseText.length);
        console.log("📋 Response Preview:", responseText.substring(0, 200));
        console.log("📄 Full Response:", responseText);

        logger.info("Feedback", "Raw response", {
          status: response.status,
          statusText: response.statusText,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200),
        });

        if (!responseText || responseText.trim() === "") {
          logger.warn("Feedback", "Empty feedback response");
          return null;
        }

        let data: SubmitFeedbackResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Feedback", "Feedback submitted successfully", {
            status: data.status,
            statusCode: data.statusCode,
            message: data.message,
            data: data.data,
          });
        } catch (error) {
          logger.error("Feedback", "Failed to parse feedback response", error);
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            data.statusCode === HTTP_STATUS.CREATED ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error("Feedback", "Feedback submission failed", data.message);
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Feedback", "Submit feedback error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const getCustomerFeedback =
    useCallback(async (): Promise<CustomerFeedbackResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error(
            "Feedback",
            "No token found for fetching customer feedback"
          );
          return null;
        }

        logger.info("Feedback", "Fetching customer feedback");

        const response = await apiFetch(API_ENDPOINTS.GET_CUSTOMER_FEEDBACK, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });

        logger.apiResponse(
          API_ENDPOINTS.GET_CUSTOMER_FEEDBACK,
          response.status
        );

        if (!response.ok) {
          logger.error(
            "Feedback",
            `Failed to fetch customer feedback: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Feedback", "Empty customer feedback response");
          return null;
        }

        let data: CustomerFeedbackResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Feedback", "Customer feedback loaded", {
            count: data.data?.length,
            status: data.status,
            statusCode: data.statusCode,
            message: data.message,
          });
        } catch (error) {
          logger.error("Feedback", "Failed to parse customer feedback", {
            error: error instanceof Error ? error.message : String(error),
            responsePreview: responseText.substring(0, 200),
          });
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error(
            "Feedback",
            "Failed to fetch customer feedback",
            data.message
          );
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Feedback", "Get customer feedback error", error);
        return null;
      }
    }, [checkTokenAndRedirect]);

  const getAdminFeedback = useCallback(
    async (filters?: {
      startDate?: string;
      endDate?: string;
      customerId?: string;
      status?: string;
      category?: string;
    }): Promise<AdminFeedbackResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error(
            "Feedback",
            "No token found for fetching admin feedback"
          );
          return null;
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.customerId)
          params.append("customerId", filters.customerId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.category) params.append("category", filters.category);

        const url = `${API_ENDPOINTS.GET_ADMIN_FEEDBACK}?${params.toString()}`;

        logger.info("Feedback", "Fetching admin feedback", filters);

        const response = await apiFetch(url, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });

        logger.apiResponse(API_ENDPOINTS.GET_ADMIN_FEEDBACK, response.status);

        if (!response.ok) {
          logger.error(
            "Feedback",
            `Failed to fetch admin feedback: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Feedback", "Empty admin feedback response");
          return null;
        }

        let data: AdminFeedbackResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Feedback", "Admin feedback loaded", {
            count: data.data?.length,
            filters,
          });
        } catch (error) {
          logger.error("Feedback", "Failed to parse admin feedback", error);
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error(
            "Feedback",
            "Failed to fetch admin feedback",
            data.message
          );
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Feedback", "Get admin feedback error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const submitDispute = useCallback(
    async (
      request: SubmitDisputeRequest
    ): Promise<SubmitDisputeResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Dispute", "No token found for submitting dispute");
          return null;
        }

        logger.info("Dispute", "Submitting dispute", request);

        const response = await apiFetch(API_ENDPOINTS.SUBMIT_DISPUTE, {
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        });

        logger.apiResponse(API_ENDPOINTS.SUBMIT_DISPUTE, response.status);

        if (!response.ok) {
          logger.error(
            "Dispute",
            `Failed to submit dispute: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Dispute", "Empty dispute response");
          return null;
        }

        let data: SubmitDisputeResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Dispute", "Dispute submitted successfully", data);
        } catch (error) {
          logger.error("Dispute", "Failed to parse dispute response", error);
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            data.statusCode === HTTP_STATUS.CREATED ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error("Dispute", "Dispute submission failed", data.message);
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Dispute", "Submit dispute error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const getCustomerDisputes =
    useCallback(async (): Promise<CustomerDisputesResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error(
            "Dispute",
            "No token found for fetching customer disputes"
          );
          return null;
        }

        logger.info("Dispute", "Fetching customer disputes");

        const response = await apiFetch(API_ENDPOINTS.CUSTOMER_DISPUTES, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });

        logger.apiResponse(API_ENDPOINTS.CUSTOMER_DISPUTES, response.status);

        if (!response.ok) {
          logger.error(
            "Dispute",
            `Failed to fetch customer disputes: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Dispute", "Empty customer disputes response");
          return null;
        }

        // Debug: Log the raw response to see what we're getting
        logger.debug("Dispute", "Raw customer disputes response", {
          length: responseText.length,
          startsWith: responseText.substring(0, 100),
          isHTML: responseText.includes("<!DOCTYPE"),
        });

        let data: CustomerDisputesResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Dispute", "Customer disputes loaded", {
            count: data.data?.length,
          });
        } catch (error) {
          logger.error("Dispute", "Failed to parse customer disputes", {
            error: error instanceof Error ? error.message : String(error),
            responsePreview: responseText.substring(0, 200),
          });
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error(
            "Dispute",
            "Failed to fetch customer disputes",
            data.message
          );
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Dispute", "Get customer disputes error", error);
        return null;
      }
    }, [checkTokenAndRedirect]);

  const getAdminDisputes = useCallback(
    async (filters?: {
      startDate?: string;
      endDate?: string;
      customerId?: string;
      status?: string;
      invoiceId?: string;
      paymentId?: string;
    }): Promise<AdminDisputesResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Dispute", "No token found for fetching admin disputes");
          return null;
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.customerId)
          params.append("customerId", filters.customerId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.invoiceId) params.append("invoiceId", filters.invoiceId);
        if (filters?.paymentId) params.append("paymentId", filters.paymentId);

        const url = `${API_ENDPOINTS.ADMIN_DISPUTES}?${params.toString()}`;

        logger.info("Dispute", "Fetching admin disputes", filters);

        const response = await apiFetch(url, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });

        logger.apiResponse(API_ENDPOINTS.ADMIN_DISPUTES, response.status);

        if (!response.ok) {
          logger.error(
            "Dispute",
            `Failed to fetch admin disputes: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Dispute", "Empty admin disputes response");
          return null;
        }

        let data: AdminDisputesResponse;
        try {
          data = JSON.parse(responseText);
          logger.success("Dispute", "Admin disputes loaded", {
            count: data.data?.length,
            filters,
          });
        } catch (error) {
          logger.error("Dispute", "Failed to parse admin disputes", error);
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error(
            "Dispute",
            "Failed to fetch admin disputes",
            data.message
          );
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Dispute", "Get admin disputes error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const updateDisputeStatus = useCallback(
    async (
      disputeId: string,
      request: UpdateDisputeStatusRequest
    ): Promise<UpdateDisputeStatusResponse | null> => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          logger.error("Dispute", "No token found for updating dispute status");
          return null;
        }

        logger.info("Dispute", "Updating dispute status", {
          disputeId,
          request,
        });

        // Create the request body with disputeId included
        const requestBody = {
          disputeId: disputeId,
          status: request.status,
        };

        const response = await apiFetch(API_ENDPOINTS.UPDATE_DISPUTE_STATUS, {
          method: "PATCH",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        logger.apiResponse(
          API_ENDPOINTS.UPDATE_DISPUTE_STATUS,
          response.status
        );

        if (!response.ok) {
          logger.error(
            "Dispute",
            `Failed to update dispute status: ${response.status}`
          );

          // Check if token is expired and redirect if needed
          if (checkTokenAndRedirect(response)) {
            return null;
          }

          return null;
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          logger.warn("Dispute", "Empty update dispute status response");
          return null;
        }

        let data: UpdateDisputeStatusResponse;
        try {
          data = JSON.parse(responseText);
          logger.success(
            "Dispute",
            "Dispute status updated successfully",
            data
          );
        } catch (error) {
          logger.error(
            "Dispute",
            "Failed to parse update dispute status response",
            error
          );
          return null;
        }

        // Check if the API response indicates success
        if (
          data &&
          (data.status === true ||
            data.statusCode === HTTP_STATUS.OK ||
            String(data.statusCode) === "00" ||
            String(data.statusCode) === "0")
        ) {
          return data;
        } else {
          logger.error(
            "Dispute",
            "Failed to update dispute status",
            data.message
          );
          return data; // Return the response even if failed so we can show the error message
        }
      } catch (error) {
        logger.error("Dispute", "Update dispute status error", error);
        return null;
      }
    },
    [checkTokenAndRedirect]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setGuestUser,
    fundWallet,
    getAllTariffs,
    makePayment,
    generateInvoice,
    createTariff,
    refreshUserDetails,
    getTransactionHistory,
    getAdminTransactionHistory,
    getAdminDashboardStats,
    searchCustomers,
    getAllCustomers,
    changeCustomerStatus,
    createCustomer,
    updateProfile,
    submitFeedback,
    getCustomerFeedback,
    getAdminFeedback,
    submitDispute,
    getCustomerDisputes,
    getAdminDisputes,
    updateDisputeStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
