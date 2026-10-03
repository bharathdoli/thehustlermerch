import { notFound } from "next/navigation";
import ProductDetail from "@/src/components/Productdetail";

/*
 * NOTE: This is a server component, so it cannot call useToast() (a client
 * hook) and has no buttons of its own. Toasts for Add to Cart / logo upload /
 * quantity etc. belong inside src/components/Productdetail.tsx, which is a
 * client component. Send me that file and I'll wire them in.
 */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  // const baseUrl =
  //   process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(
    `$/api/products/${productId}`,
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