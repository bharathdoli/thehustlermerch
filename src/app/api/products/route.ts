import { NextResponse } from "next/server";
import { createProductUseCase } from "@/src/backend/application/product/create-product.usecase";
import { listProductUseCase } from "@/src/backend/application/product/list-products.usecase";

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

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error"
            },
            {
                status: 400
            }
        );

    }

}

export async function GET() {

    const products = await listProductUseCase();

    return NextResponse.json(products);

}