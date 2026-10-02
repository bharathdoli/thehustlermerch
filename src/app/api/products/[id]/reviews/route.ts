import { listReviewsUseCase } from "@/src/backend/application/review/list-reviews.usecase";
import { createReviewUseCase } from "@/src/backend/application/review/create-review.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  try {
    const reviews = await listReviewsUseCase(id, { page, limit });

    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();

  try {
    const review = await createReviewUseCase(id, body);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}