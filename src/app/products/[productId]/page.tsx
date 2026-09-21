import { notFound } from "next/navigation";
import ProductDetail from "@/src/components/Productdetail";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/products/${productId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    notFound();
  }

  const product = await response.json();

  console.log("========== PRODUCT API RESPONSE ==========");
  console.log(JSON.stringify(product, null, 2));
  console.log("==========================================");

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}