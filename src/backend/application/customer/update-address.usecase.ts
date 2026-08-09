import { prisma } from "@/src/lib/db/prisma";
import { UpdateAddressInput, UpdateAddressSchema } from "@/src/schema/customer.schema";
import { requireUser } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function updateAddressUseCase(
  addressId: string,
  input: UpdateAddressInput
) {
  const currentUser = await requireUser();

  const data = UpdateAddressSchema.parse(input);

  const existingAddress = await prisma.address.findUnique({
    where: { addressId },
  });

  if (!existingAddress) {
    throw new AppError("Address not found.",404);
  }

  if (existingAddress.userId !== currentUser.id && currentUser.role !== "Admin") {
    throw new AppError("You are not allowed to modify this address.",403);
  }

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.address.updateMany({
        where: {
          userId: existingAddress.userId,
          isDefault: true,
          NOT: { addressId },
        },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { addressId },
      data,
    });
  });

  return address;
}