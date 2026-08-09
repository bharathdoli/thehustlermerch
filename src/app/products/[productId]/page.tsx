import { notFound } from "next/navigation";
import { getProductById } from "@/src/lib/productdata";
import ProductDetail from "@/src/components/Productdetail";

// Replace with: const product = await prisma.product.findUnique({ where: { productId }, include: { variants: true } });
export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = getProductById(productId);
  if (!product) return notFound();

  return <ProductDetail product={product} />;
}