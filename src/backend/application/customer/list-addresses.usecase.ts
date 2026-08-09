import { prisma } from "@/src/lib/db/prisma";
import { requireUser } from "../../shared/auth/session-validation";

export async function listAddressesUseCase() {
  const currentUser = await requireUser();

  const addresses = await prisma.address.findMany({
    where: { userId: currentUser.id },
    orderBy: [{ isDefault: "desc" }, { addressId: "asc" }],
  });

  return addresses;
}