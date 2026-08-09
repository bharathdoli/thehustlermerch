import { UserRole } from "@/src/generated/prisma/enums";
import { auth } from "../../infrastructure/auth/auth";
import { AppError } from "../errors/api/AppError";



export async function requireAdmin(){
    const session = await auth();

if (!session) {
  throw new AppError("Unauthorized",401);
}

if (session.user.role !== UserRole.Admin) {
  throw new AppError("Forbidden",403);
}
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    throw new AppError("Unauthorized. Please log in.",401);
  }

  return session.user;
}