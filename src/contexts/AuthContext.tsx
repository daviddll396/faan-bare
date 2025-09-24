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
          console.error("Error parsing stored user data:", error);
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
  const fetchUserDetails = async (token: string): Promise<User | null> => {
    try {
      console.log("Fetching user details with token:", token);
      console.log("Request URL:", API_ENDPOINTS.USER_DETAILS);

      const response = await fetch(API_ENDPOINTS.USER_DETAILS, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User details response status:", response.status);
      console.log("User details response status text:", response.statusText);
      console.log("User details request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch user details:",
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
      console.log("Raw user details response:", responseText);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("Empty user details response");
        return null;
      }

      // Parse the JSON response directly (no decryption needed for this endpoint)
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed user details data:", data);
      } catch (error) {
        console.error("Failed to parse user details JSON:", error);
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
          role: "Customer",
          walletBalance: data.data.walletBalance,
          transactionStats: data.data.transactionStats,
        };

        console.log("User details fetched successfully:", userData);
        console.log("Wallet balance:", data.data.walletBalance);
        console.log("Transaction stats:", data.data.transactionStats);
        return userData;
      } else {
        console.error("Failed to get user details:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check for mock admin credentials first
      if (
        email === MOCK_ADMIN_CREDENTIALS.email &&
        password === MOCK_ADMIN_CREDENTIALS.password
      ) {
        console.log("Mock admin login detected");

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

        console.log("Mock admin user created and stored:", mockAdminUser);
        return { success: true };
      }

      // Check for mock customer credentials
      if (
        email === MOCK_CUSTOMER_CREDENTIALS.email &&
        password === MOCK_CUSTOMER_CREDENTIALS.password
      ) {
        console.log("Mock customer login detected");

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

        console.log("Mock customer user created and stored:", mockCustomerUser);
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

      console.log("Original request body:", requestBody);
      console.log("Encrypted payload:", encryptedPayload);
      console.log("Request URL:", API_ENDPOINTS.LOGIN);
      console.log("Request method:", "POST");

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "X-Source": REQUEST_HEADERS.X_SOURCE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        },
        body: encryptedPayload,
      });

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Log response text for debugging
      const responseText = await response.text();
      console.log("Raw encrypted response text:", responseText);

      // Check if response is ok and has content
      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        console.error("Error response body:", responseText);
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          return { success: false, message: "Invalid credentials" };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("Empty response body");
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
        console.log("Decrypted response:", decryptedResponse);
      } catch (error) {
        console.error("Failed to decrypt response:", error);
        console.error(
          "Encrypted response that failed to decrypt:",
          responseText
        );
        return { success: false, message: "Failed to decrypt server response" };
      }

      let data;
      try {
        data = JSON.parse(decryptedResponse);
        console.log("Parsed response data:", data);
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error(
          "Decrypted response that failed to parse:",
          decryptedResponse
        );
        return { success: false, message: "Invalid server response format" };
      }

      // Debugging: log exact types/values so we can understand why success check fails
      console.log(
        "Login response status check =>",
        "status:",
        data?.status,
        "(type:",
        typeof data?.status,
        ")",
        "statusCode:",
        data?.statusCode,
        "(type:",
        typeof data?.statusCode,
        ")"
      );

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

        // Log the token and customerId we received
        console.log("Login successful! Token received:", data.data.token);
        console.log("Customer ID received:", data.data.customerId);
        console.log("User Type received:", userTypeRaw);
        console.log("Token type:", typeof data.data.token);
        console.log("Token length:", data.data.token?.length);

        // Store the token first
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
        console.log("Token stored in localStorage");

        // Now fetch user details using the token
        console.log("=== STARTING CUSTOMER DETAILS FETCH ===");
        console.log("Fetching user details...");
        console.log("Using token:", data.data.token);
        console.log("For customer ID:", data.data.customerId);
        const userDetails = await fetchUserDetails(loginResp.data.token);
        console.log("=== CUSTOMER DETAILS FETCH COMPLETED ===");

        if (userDetails) {
          // Use the real user details from the API and add customerId
          const completeUserData: User = {
            ...userDetails,
            customerId: loginResp.data.customerId,
            // Override role using accountType from login response
            role: normalizedRole,
          };
          setUser(completeUserData);
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(completeUserData)
          );
          console.log("Real user details stored:", completeUserData);
        } else {
          // Fallback to basic user object if user details fetch fails
          console.log("User details fetch failed, using fallback user data");
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
          console.log("Fallback user data stored:", fallbackUserData);
        }

        return { success: true };
      } else {
        console.error("Login failed:", data.message);
        // Surface server message when available (e.g., "Customer account not approved")
        return { success: false, message: data?.message ?? "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  // Stable check for token expiration that redirects to login when necessary
  const checkTokenAndRedirect = useCallback(
    (response: Response): boolean => {
      if (response.status === HTTP_STATUS.UNAUTHORIZED && user) {
        console.log("Token expired or invalid, redirecting to login");
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
        console.error("No token found for wallet funding");
        return false;
      }

      console.log("=== STARTING WALLET FUNDING ===");
      console.log("Funding amount:", amount);
      console.log("Request URL:", API_ENDPOINTS.FUND_WALLET);

      // Generate a unique reference for the transaction
      const reference = `fund-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8)}`;

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

      console.log("Fund wallet request body:", requestBody);
      console.log("Generated reference:", reference);

      const response = await fetch(API_ENDPOINTS.FUND_WALLET, {
        method: "POST",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Fund wallet response status:", response.status);
      console.log("Fund wallet response status text:", response.statusText);
      console.log("Fund wallet request headers:", {
        "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
        "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
        Authorization: `Bearer ${token}`,
      });

      if (!response.ok) {
        console.error(
          "Failed to fund wallet:",
          response.status,
          response.statusText
        );

        // Check if token is expired and redirect if needed
        if (checkTokenAndRedirect(response)) {
          return false;
        }

        return false;
      }

      const responseText = await response.text();
      console.log("Raw fund wallet response:", responseText);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("Empty fund wallet response");
        return false;
      }

      // Parse the JSON response directly (no decryption needed for this endpoint)
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed fund wallet data:", data);
      } catch (error) {
        console.error("Failed to parse fund wallet JSON:", error);
        return false;
      }

      // Treat login as successful when API explicitly returns status=true
      // or when it uses non-HTTP status codes like '00' for success.
      if (
        data &&
        (data.status === true ||
          String(data.statusCode) === "00" ||
          String(data.statusCode) === "0" ||
          Number(data.statusCode) === HTTP_STATUS.OK)
      ) {
        console.log("Wallet funding successful!");
        console.log("Transaction reference:", reference);
        console.log("New wallet balance:", data.data.balance);

        // Update user's wallet balance from the API response
        if (user && data.data?.balance !== undefined) {
          const updatedUser: User = {
            ...user,
            walletBalance: data.data.balance,
          };
          setUser(updatedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          console.log("Updated wallet balance:", data.data.balance);
        }

        console.log("=== WALLET FUNDING COMPLETED ===");
        return true;
      } else {
        console.error("Wallet funding failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Wallet funding error:", error);
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
          console.error("No token found for fetching tariffs");
          return null;
        }

        console.log("🚀 === STARTING GET ALL TARIFFS REQUEST ===");
        console.log("📍 Request URL:", API_ENDPOINTS.GET_ALL_TARIFFS);
        console.log("🔑 Using token:", token);
        console.log("⏰ Request timestamp:", new Date().toISOString());

        const requestPromise = fetch(API_ENDPOINTS.GET_ALL_TARIFFS, {
          method: "GET",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
        });
        tariffsInFlightRef.current = requestPromise.then(async (response) => {
          console.log("📥 Get all tariffs response status:", response.status);
          console.log(
            "📥 Get all tariffs response status text:",
            response.statusText
          );
          console.log("📥 Response timestamp:", new Date().toISOString());
          console.log("🔧 Get all tariffs request headers:", {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          });

          if (!response.ok) {
            console.error(
              "❌ Failed to fetch tariffs:",
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
          console.log("📄 Raw get all tariffs response:", responseText);
          console.log("📏 Response length:", responseText.length);

          if (!responseText || responseText.trim() === "") {
            console.log("⚠️ Empty get all tariffs response");
            return null;
          }

          let data: TariffsResponse;
          try {
            data = JSON.parse(responseText);
            console.log("✅ Parsed get all tariffs data:", data);
          } catch (error) {
            console.error("❌ Failed to parse get all tariffs JSON:", error);
            console.error(
              "❌ Raw response that failed to parse:",
              responseText
            );
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
        console.log("🎉 === GET ALL TARIFFS COMPLETED SUCCESSFULLY ===");
        return data;
      } catch (error) {
        console.error("💥 Get all tariffs error:", error);
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
          console.error("No token found for creating tariff");
          return null;
        }

        console.log("🚀 === STARTING CREATE TARIFF REQUEST ===");
        console.log("📍 Request URL:", API_ENDPOINTS.CREATE_TARIFF);
        console.log("📋 Request payload:", request);
        console.log("🔑 Using token:", token);
        console.log("⏰ Request timestamp:", new Date().toISOString());

        const response = await fetch(API_ENDPOINTS.CREATE_TARIFF, {
          method: "POST",
          headers: {
            "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
            "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        });

        console.log("📥 Create tariff response status:", response.status);
        console.log(
          "📥 Create tariff response status text:",
          response.statusText
        );

        if (!response.ok) {
          console.error(
            "❌ Failed to create tariff:",
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
        console.log("📄 Raw create tariff response:", responseText);

        if (!responseText || responseText.trim() === "") {
          console.log("⚠️ Empty create tariff response");
          return null;
        }

        let data: CreateTariffResponse;
        try {
          data = JSON.parse(responseText);
          console.log("✅ Parsed create tariff data:", data);
        } catch (error) {
          console.error("❌ Failed to parse create tariff JSON:", error);
          console.error("❌ Raw response that failed to parse:", responseText);
          return null;
        }

        // Clear tariffs cache to force refresh on next getAllTariffs call
        tariffsCacheRef.current = null;

        console.log("🎉 === CREATE TARIFF COMPLETED SUCCESSFULLY ===");
        return data;
      } catch (error) {
        console.error("💥 Create tariff error:", error);
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

      const response = await fetch(API_ENDPOINTS.MAKE_PAYMENT, {
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

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
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

      const response = await fetch(API_ENDPOINTS.GENERATE_INVOICE, {
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

      const response = await fetch(API_ENDPOINTS.USER_DETAILS, {
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

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
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
            role: "Customer",
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
      const response = await fetch(url, {
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

      const response = await fetch(API_ENDPOINTS.ADMIN_TRANSACTION_HISTORY, {
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

        const response = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD_STATS, {
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

      const response = await fetch(searchUrl, {
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

      const response = await fetch(customersUrl, {
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

      const response = await fetch(changeStatusUrl, {
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
      const response = await fetch(API_ENDPOINTS.CREATE_CUSTOMER, {
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

      const response = await fetch(API_ENDPOINTS.USER_DETAILS, {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
