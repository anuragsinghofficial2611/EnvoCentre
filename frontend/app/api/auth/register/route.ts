import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.detail || data?.message || "Unable to register",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: response.status },
    );
  } catch (error) {
    console.error("Registration route error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to connect to authentication server" },
      { status: 500 },
    );
  }
}