import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { loginRequest } from "../services/authservice";

type User = {
  nombre: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  logout: () => void;

  isAuthenticated: boolean;

  isLoading: boolean;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem("sgames_token");

      const storedUser =
        localStorage.getItem("sgames_user");

      if (!storedToken || !storedUser) {
        localStorage.removeItem("sgames_token");
        localStorage.removeItem("sgames_user");

        setUser(null);
        return;
      }

      const parsedUser =
        JSON.parse(storedUser) as User;

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("sgames_token");
      localStorage.removeItem("sgames_user");

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response =
        await loginRequest(
          email,
          password
        );

      if (!response.token) {
        return false;
      }

      const userData: User = {
        nombre:
          response.username,

        email:
          response.email,

        role:
          response.role,
      };

      localStorage.setItem(
        "sgames_token",
        response.token
      );

      localStorage.setItem(
        "sgames_user",
        JSON.stringify(userData)
      );

      setUser(userData);

      return true;
    } catch {
      localStorage.removeItem("sgames_token");
      localStorage.removeItem("sgames_user");

      setUser(null);

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(
      "sgames_token"
    );

    localStorage.removeItem(
      "sgames_user"
    );

    setUser(null);

    window.location.href =
      "/admin/login";
  };

  const token =
    localStorage.getItem("sgames_token");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated:
          !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}