import { NextResponse } from "next/server";

import { updateAddressUseCase } from "@/src/backend/application/customer/update-address.usecase";
import { deleteAddressUseCase } from "@/src/backend/application/customer/delete-address.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;

  const body = await request.json();

  try {
    const address = await updateAddressUseCase(addressId, body);
  
    return NextResponse.json(address);
  } catch (error) {
     return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;

  try {
    const result = await deleteAddressUseCase(addressId);
  
    return NextResponse.json(result);
  } catch (error) {
     return handleApiError(error);
  }
}