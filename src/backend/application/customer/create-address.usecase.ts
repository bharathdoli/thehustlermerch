import { prisma } from "@/src/lib/db/prisma";
import { CreateAddressInput, CreateAddressSchema } from "@/src/schema/customer.schema";
import { requireUser } from "../../shared/auth/session-validation";

export async function createAddressUseCase(input: CreateAddressInput) {
  const currentUser = await requireUser();

  const data = CreateAddressSchema.parse(input);

  const existingCount = await prisma.address.count({
    where: { userId: currentUser.id },
  });

  // First address is always default, regardless of what was submitted
  const shouldBeDefault = data.isDefault || existingCount === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId: currentUser.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        ...data,
        isDefault: shouldBeDefault,
        userId: currentUser.id,
      },
    });
  });

  return address;
}