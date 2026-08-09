import { NextResponse } from "next/server";

import { getProfileUseCase } from "@/src/backend/application/customer/get-profile.usecase";
import { updateProfileUseCase } from "@/src/backend/application/customer/update-profile.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET() {
  try {
    const profile = await getProfileUseCase();
  
    return NextResponse.json(profile);
  } catch (error) {
     return handleApiError(error);
    
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

 try {
     const profile = await updateProfileUseCase(body);
   
     return NextResponse.json(profile);
 } catch (error) {
   return  handleApiError(error);
    
 }
}