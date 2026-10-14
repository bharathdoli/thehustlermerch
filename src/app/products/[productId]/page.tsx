import { notFound } from "next/navigation";
import ProductDetail from "@/src/components/Productdetail";

/*
 * Server component: it can't call useToast() or use the theme hooks.
 * Toasts and styling for Add to Cart / logo upload / quantity belong inside
 * src/components/Productdetail.tsx (a client component).
 *
 * IMPORTANT: a server-side fetch needs an absolute URL. Set
 * NEXT_PUBLIC_APP_URL in your environment (e.g. https://yourdomain.com).
 */
const baseUrl = process.env.APP_URL || "http://localhost:3000";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const response = await fetch(`${baseUrl}/api/products/${productId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const product = await response.json();

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}