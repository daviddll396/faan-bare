import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import CryptoJS from "crypto-js";

// Constants
const API_BASE_URL = "http://197.253.19.78:9091";
const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/faan/login`,
  USER_DETAILS: `${API_BASE_URL}/api/faan/customers/profile`,
  FUND_WALLET: `${API_BASE_URL}/api/faan/transactions/fund-wallet`,
  GET_ALL_TARIFFS: `${API_BASE_URL}/api/faan/transactions/tariffs`,
  MAKE_PAYMENT: `${API_BASE_URL}/api/faan/transactions/make-payment`,
};

const ENCRYPTION_CONFIG = {
  SECRET_KEY: "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/", // 32 bytes (AES-256)
  IV_KEY: "RVFU9+dRKhYkiCZI", // 16 bytes
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fundWallet: (amount: number) => Promise<boolean>;
  getAllTariffs: () => Promise<TariffsResponse | null>;
  makePayment: (reference: string, tariffId: number) => Promise<boolean>;
  refreshUserDetails: () => Promise<boolean>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
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

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
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
          return false; // Invalid credentials
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("Empty response body");
        return false;
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
        return false;
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
        return false;
      }

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
        // Log the token and customerId we received
        console.log("Login successful! Token received:", data.data.token);
        console.log("Customer ID received:", data.data.customerId);
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
        const userDetails = await fetchUserDetails(data.data.token);
        console.log("=== CUSTOMER DETAILS FETCH COMPLETED ===");

        if (userDetails) {
          // Use the real user details from the API and add customerId
          const completeUserData: User = {
            ...userDetails,
            customerId: data.data.customerId,
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
            id: data.data.customerId || Date.now().toString(),
            customerId: data.data.customerId,
            firstName: email.split("@")[0],
            lastName: "",
            name: email.split("@")[0],
            email: email,
            phoneNumber: "",
            role: "Customer",
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

        return true;
      } else {
        console.error("Login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  const fundWallet = async (amount: number): Promise<boolean> => {
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

      const requestBody = {
        reference: reference,
        amount: amount,
      };

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

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
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

  const getAllTariffs = async (): Promise<TariffsResponse | null> => {
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

      const response = await fetch(API_ENDPOINTS.GET_ALL_TARIFFS, {
        method: "GET",
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE,
          "Client-Auth": REQUEST_HEADERS.CLIENT_AUTH,
          Authorization: `Bearer ${token}`,
        },
      });

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
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return null;
      }

      const responseText = await response.text();
      console.log("📄 Raw get all tariffs response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty get all tariffs response");
        return null;
      }

      // Parse the JSON response directly (no decryption needed for this endpoint)
      let data: TariffsResponse;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed get all tariffs data:", data);
        console.log("✅ Data structure:", typeof data);
        if (data && typeof data === "object") {
          console.log("✅ Data keys:", Object.keys(data));
          if (data.data) {
            console.log("✅ Data.data type:", typeof data.data);
            console.log("✅ Data.data content:", data.data);
          }
        }
      } catch (error) {
        console.error("❌ Failed to parse get all tariffs JSON:", error);
        console.error("❌ Raw response that failed to parse:", responseText);
        return null;
      }

      console.log("🎉 === GET ALL TARIFFS COMPLETED SUCCESSFULLY ===");
      return data;
    } catch (error) {
      console.error("💥 Get all tariffs error:", error);
      return null;
    }
  };

  const makePayment = async (
    reference: string,
    tariffId: number
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("No token found for making payment");
        return false;
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
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return false;
      }

      const responseText = await response.text();
      console.log("📄 Raw make payment response:", responseText);
      console.log("📏 Response length:", responseText.length);

      // Check if response has content
      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Empty make payment response");
        return false;
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
        return false;
      }

      if (data.status && data.statusCode === HTTP_STATUS.OK) {
        console.log("🎉 === MAKE PAYMENT COMPLETED SUCCESSFULLY ===");
        return true;
      } else {
        console.error("❌ Payment failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("💥 Make payment error:", error);
      return false;
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    fundWallet,
    getAllTariffs,
    makePayment,
    refreshUserDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
