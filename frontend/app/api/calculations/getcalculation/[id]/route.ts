import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token not found",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Calculation ID is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/calculations/${id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    console.log(
      "Calculation detail backend response:",
      data,
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.detail ||
            data?.message ||
            data?.error ||
            "Unable to fetch calculation",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "Calculation detail route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to server",
      },
      { status: 500 },
    );
  }
}