import { prisma } from "@/src/lib/db/prisma";
import { requireUser } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function getProfileUseCase() {
  const currentUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { uid: currentUser.id },
    select: {
      uid: true,
      uname: true,
      email: true,
      phoneNo: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.",404);
  }

  return user;
}