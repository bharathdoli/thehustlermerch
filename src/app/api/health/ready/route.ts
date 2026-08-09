import { healthCheckUsecase } from "@/src/backend/infrastructure/db/health-check.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { NextResponse } from "next/server";

export async function GET(){

    try {

        await healthCheckUsecase();

        return NextResponse.json({
        success:true,
        message: 'Server is Healthy'
    })
    } catch (error) {
       return handleApiError(error);
    }
}