import { NextResponse } from "next/server";

import { registerUser } from "../../../../backend/infrastructure/auth/register.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Default role to Customer when no role is provided.
    // If the frontend explicitly sends "Admin", keep it as Admin.
    const registerData = {
      ...body,
      role: body.role ?? "Customer",
    };

    const user = await registerUser(registerData);

    console.log(user);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        data: {
          user,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}