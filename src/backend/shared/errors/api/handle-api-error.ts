import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./AppError";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  console.error(error);

  return NextResponse.json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
  );
}