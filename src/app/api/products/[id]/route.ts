import { deleteProductUseCase } from "@/src/backend/application/product/delete-product.usecase";
import { getProductUseCase } from "@/src/backend/application/product/get-product.usecase";
import { updateProductUseCase } from "@/src/backend/application/product/update-product.usecase";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const product = await getProductUseCase(productId);

  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const body = await request.json();

  const product = await updateProductUseCase(productId, body);

  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const result = await deleteProductUseCase(productId);

  return NextResponse.json(result);
}