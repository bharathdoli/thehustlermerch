"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  phoneNo?: string;
  role?: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signup: (
    name: string,
    email: string,
    password: string,
    phoneNo: string,
    role?: "Customer" | "Admin"
  ) => Promise<AuthResult>;

  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const SESSION_KEY = "hustler-session";
const TOKEN_KEY = "hustler-token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);

      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // Ignore invalid localStorage data
    }
  }, []);

  function persistSession(
    sessionUser: User,
    token?: string
  ) {
    setUser(sessionUser);

    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(sessionUser)
      );

      if (token) {
        window.localStorage.setItem(
          TOKEN_KEY,
          token
        );
      }
    } catch {
      // Ignore storage errors
    }
  }

  async function login(
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error:
            data.message ??
            "Invalid email or password.",
        };
      }

      persistSession(
        data.user,
        data.token
      );

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error:
          "Could not reach the server. Please try again.",
      };
    }
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    phoneNo: string,
    role: "Customer" | "Admin" = "Customer"
  ): Promise<AuthResult> {
    try {
      const res = await fetch(
        "/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            phoneNo,
            role,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error:
            data.message ??
            "Something went wrong.",
        };
      }

      persistSession(
        data.user,
        data.token
      );

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error:
          "Could not reach the server. Please try again.",
      };
    }
  }

  function logout() {
    setUser(null);

    try {
      window.localStorage.removeItem(
        SESSION_KEY
      );

      window.localStorage.removeItem(
        TOKEN_KEY
      );
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth() must be called inside <AuthProvider>"
    );
  }

  return ctx;
}