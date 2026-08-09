import { prisma } from "@/src/lib/db/prisma";
import { requireUser } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function deleteAddressUseCase(addressId: string) {
  const currentUser = await requireUser();

  const existingAddress = await prisma.address.findUnique({
    where: { addressId },
  });

  if (!existingAddress) {
    throw new AppError("Address not found.",404);
  }

  if (existingAddress.userId !== currentUser.id && currentUser.role !== "Admin") {
    throw new AppError("You are not allowed to delete this address.",403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { addressId } });

    // If the deleted address was the default, promote another one —
    // never leave a customer with zero default addresses if they have any left.
    if (existingAddress.isDefault) {
      const nextAddress = await tx.address.findFirst({
        where: { userId: existingAddress.userId },
        orderBy: { addressId: "asc" },
      });

      if (nextAddress) {
        await tx.address.update({
          where: { addressId: nextAddress.addressId },
          data: { isDefault: true },
        });
      }
    }
  });

  return { success: true };
}