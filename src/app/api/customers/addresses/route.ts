import { NextResponse } from "next/server";

import { listAddressesUseCase } from "@/src/backend/application/customer/list-addresses.usecase";
import { createAddressUseCase } from "@/src/backend/application/customer/create-address.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET() {
  try {
    const addresses = await listAddressesUseCase();
  
    return NextResponse.json(addresses);
  } catch (error) {
    return handleApiError(error);
    
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const address = await createAddressUseCase(body);
  
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
      return handleApiError(error);
  }
}