import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication for Admin
      if (email === "admin@faan.gov.ng" && password === "password123") {
        const userData: User = {
          id: "1",
          name: "Kevin Mark",
          email: "admin@faan.gov.ng",
          role: "Admin",
        };
        const token = "mock-jwt-token-" + Date.now();
        setUser(userData);
        localStorage.setItem("faan_user", JSON.stringify(userData));
        localStorage.setItem("faan_token", token);
        return true;
      }
      // Mock authentication for Customer
      if (email === "customer@faan.gov.ng" && password === "customer123") {
        const userData: User = {
          id: "2",
          name: "Jane Doe",
          email: "customer@faan.gov.ng",
          role: "Customer",
        };
        const token = "mock-jwt-token-" + Date.now();
        setUser(userData);
        localStorage.setItem("faan_user", JSON.stringify(userData));
        localStorage.setItem("faan_token", token);
        return true;
      }
      return false;
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
