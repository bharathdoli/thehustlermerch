import { NextResponse } from "next/server";

import { registerUser } from "../../../../backend/infrastructure/auth/register.usecase";

export async function POST(request: Request) {

  try {

    const body = await request.json();

    const user = await registerUser(body);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        data: user,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 400,
      }
    );

  }

}