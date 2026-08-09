import { prisma } from "@/src/lib/db/prisma";

export async function listVariantsUseCase(productId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { price: "asc" },
  });

  return variants;
}