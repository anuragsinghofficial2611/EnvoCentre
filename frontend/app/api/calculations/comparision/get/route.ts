import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function GET(request: NextRequest) {
  try {
      const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if(!token) return NextResponse.json({
    success: "false",
    message: "token not found"
  },{
    status: 401
  })
  const left_id = 0;
  const right_id = 0;
    const response = await fetch(`${API_URL}/api/v1/calculations/compare/${left_id}/${right_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    console.log(data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.detail ||
            data?.message ||
            data?.error ||
            "",
        },
        { status: response.status }
      );
    }
    const nextResponse = NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 200 }
    );

    return nextResponse;
  } catch (error) {
    console.error("Cannot get comparisions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to fetch data from server",
      },
      { status: 500 }
    );
  }
}