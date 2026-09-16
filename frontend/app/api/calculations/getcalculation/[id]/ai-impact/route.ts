import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    /* -------------------------------------------------------------- */
    /* Get access token from cookie                                   */
    /* -------------------------------------------------------------- */

    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token not found",
        },
        {
          status: 401,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Get calculation ID from URL                                    */
    /* -------------------------------------------------------------- */

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Calculation ID is required",
        },
        {
          status: 400,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Call FastAPI AI Impact endpoint                                */
    /* -------------------------------------------------------------- */

    const response = await fetch(
      `${API_URL}/api/v1/calculations/${id}/ai-impact`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      },
    );

    /* -------------------------------------------------------------- */
    /* Read backend response                                          */
    /* -------------------------------------------------------------- */

    const data = await response
      .json()
      .catch(() => null);

    console.log(
      "AI impact backend response:",
      data,
    );

    /* -------------------------------------------------------------- */
    /* Handle FastAPI errors                                          */
    /* -------------------------------------------------------------- */

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.detail ||
            data?.message ||
            data?.error ||
            "Unable to generate AI impact analysis",
        },
        {
          status: response.status,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Return FastAPI response to frontend                            */
    /* -------------------------------------------------------------- */

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "AI impact route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to server",
      },
      {
        status: 500,
      },
    );
  }
}