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

    const { facility_area_m2,gpu_model,gpu_count,hours_used,renewable_energy_percent } = body;

    if (
      facility_area_m2 === undefined ||
      facility_area_m2 === null ||
      !gpu_model ||
      gpu_count === undefined ||
      gpu_count === null ||
      hours_used === undefined ||
      hours_used === null ||
      renewable_energy_percent === undefined ||
      renewable_energy_percent === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Every Credentials arfe required",
        },
        { status: 400 }
      );
    }

    // Send login request to FastAPI
    const response = await fetch(`${API_URL}/api/v1/calculations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },  
      body: JSON.stringify({
        facility_area_m2,gpu_model,gpu_count,hours_used,renewable_energy_percent
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

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
        message: "Calculation created successful",
        data
      },
      { status: 200 }
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