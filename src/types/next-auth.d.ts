import { DefaultSession } from "next-auth";
import { UserRole } from "@/src/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      employeeId?: string | null;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    employeeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    employeeId?: string | null;
  }
}