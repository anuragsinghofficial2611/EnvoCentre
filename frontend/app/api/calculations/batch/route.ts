import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function POST(request: NextRequest) {
  try {

    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          detail: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/calculations/batch`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(body),

        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return NextResponse.json(
        data,
        {
          status: response.status,
        }
      );
    }


    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "[server] Batch calculation request failed:",
      error
    );

    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to communicate with the calculation backend.",
      },
      {
        status: 500,
      }
    );
  }
}