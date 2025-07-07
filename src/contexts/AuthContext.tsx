import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import CryptoJS from "crypto-js";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
      const storedUser = localStorage.getItem("faan_user");
      const storedToken = localStorage.getItem("faan_token");

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem("faan_user");
          localStorage.removeItem("faan_token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Sample config
      const secretKey = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
      const ivKey = "RVFU9+dRKhYkiCZI"; // 16 bytes

      const requestBody = { username: email, password };
      const body = JSON.stringify(requestBody);

      // Encrypt the body
      const encryptedPayload = encryptAESCBC(body, secretKey, ivKey);

      console.log("Original request body:", requestBody);
      console.log("Encrypted payload:", encryptedPayload);
      console.log("Request URL:", "/auth/login");
      console.log("Request method:", "POST");

      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Source": "web",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
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
        if (response.status === 401) {
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
        decryptedResponse = decryptAESCBC(responseText, secretKey, ivKey);
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

      if (data.status && data.statusCode === 200) {
        // Extract user info from token or make another API call to get user details
        // For now, we'll create a basic user object from the email
        const userData: User = {
          id: Date.now().toString(), // You might want to decode the JWT token to get the actual user ID
          name: email.split("@")[0], // Temporary name from email
          email: email,
          role: "Customer", // You might want to get this from the API response or decode from token
        };

        setUser(userData);
        localStorage.setItem("faan_user", JSON.stringify(userData));
        localStorage.setItem("faan_token", data.data.token);
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
    localStorage.removeItem("faan_user");
    localStorage.removeItem("faan_token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
