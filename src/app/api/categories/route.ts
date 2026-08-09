import { createCategoryUseCase } from "@/src/backend/application/category/create-category.usecase";
import { NextResponse } from "next/server";
import {listCategoriesUseCase} from "../../../backend/application/category/list-categories.usecase"
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

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

       return  handleApiError(error);
    }

}

export async function GET() {

    try {
        const categories = await listCategoriesUseCase();
    
        return NextResponse.json(categories);
    } catch (error) {
        return  handleApiError(error);
    }

}