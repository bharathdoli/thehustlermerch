import { UserRole } from "@/src/generated/prisma/enums";
import { auth } from "../../infrastructure/auth/auth";



export async function requireAdmin(){
    const session = await auth();

if (!session) {
  throw new Error("Unauthorized");
}

if (session.user.role !== UserRole.Admin) {
  throw new Error("Forbidden");
}
}