import { prisma } from "@/src/lib/db/prisma";
import { UpdateProfileInput, UpdateProfileSchema } from "@/src/schema/customer.schema";
import { requireUser } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function updateProfileUseCase(input: UpdateProfileInput) {
  const currentUser = await requireUser();

  const data = UpdateProfileSchema.parse(input);

  if (data.phoneNo) {
    const duplicate = await prisma.user.findFirst({
      where: {
        phoneNo: data.phoneNo,
        NOT: { uid: currentUser.id },
      },
    });

    if (duplicate) {
      throw new AppError("This phone number is already in use.",409);
    }
  }

  const user = await prisma.user.update({
    where: { uid: currentUser.id },
    data,
    select: {
      uid: true,
      uname: true,
      email: true,
      phoneNo: true,
      role: true,
    },
  });

  return user;
}