import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export async function POST(request: NextRequest) {
  try {
          const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if(!token) return NextResponse.json({
    success: "false",
    message: "token not found"
  },{
    status: 401
  })

    const body = await request.json();
    console.log(body,"this request is being send")

    // if (!name || !calculation_type || !description || !value || !unit) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Every Credentials are required",
    //     },
    //     { status: 400 }
    //   );
    // }

    console.log('request is being to server...')
    const response = await fetch(`${API_URL}/api/v1/calculations/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(
        body
      ),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    console.log("backend data: ",data);
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.detail ||
            data?.message ||
            data?.error ||
            "Invalid email or password",
        },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(
      {
  success: true,
  message: "Comparison created successfully",
  data,
},{
    status: 200
}
    );

    return nextResponse;
  } catch (error) {
    console.error("Login route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to server",
      },
      { status: 500 }
    );
  }
}