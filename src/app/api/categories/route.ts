import { createCategoryUseCase } from "@/src/backend/application/category/create-category.usecase";
import { NextResponse } from "next/server";
import {listCategoriesUseCase} from "../../../backend/application/category/list-categories.usecase"

export async function POST(request: Request) {

    try {

        const body = await request.json();

        const category = await createCategoryUseCase(body);

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

    const categories = await listCategoriesUseCase();

    return NextResponse.json(categories);

}