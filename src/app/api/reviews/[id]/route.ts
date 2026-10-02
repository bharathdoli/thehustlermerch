import { deleteReviewUseCase } from "@/src/backend/application/review/delete-review.usecase";
import { getReviewUseCase } from "@/src/backend/application/review/get-review.usecase";
import { updateReviewUseCase } from "@/src/backend/application/review/update-review.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const review = await getReviewUseCase(id);

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();

  try {
    const review = await updateReviewUseCase(id, body);

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await deleteReviewUseCase(id);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}