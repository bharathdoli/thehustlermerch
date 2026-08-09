import { NextResponse } from "next/server";
import { createProductUseCase } from "@/src/backend/application/product/create-product.usecase";
import { listProductUseCase } from "@/src/backend/application/product/list-products.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function POST(request: Request) {

    try {

        const body = await request.json();

        const category = await createProductUseCase(body);

        return NextResponse.json(
            category,
            {
                status: 201
            }
        );

    } catch (error) {

        return handleApiError(error);

}
}

export async function GET() {

    try {
        const products = await listProductUseCase();
    
        return NextResponse.json(products);
    } catch (error) {
      return  handleApiError(error);
    }

}