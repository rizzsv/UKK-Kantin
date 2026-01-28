import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("🏷️ Fetching menu with discounts for students");
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Forward to backend API
    const response = await fetch(
      `https://ukk-p2.smktelkom-mlg.sch.id/api/getmenudiskonsiswa`,
      {
        method: "GET",
        headers: {
          Authorization: token || "",
          makerID: makerID,
        },
      },
    );

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Backend returned non-JSON:", text.substring(0, 200));
      return NextResponse.json(
        {
          error: "Backend error",
          details: "Server returned invalid response",
          status: response.status,
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("✅ Menu discount response:", data);
    console.log("📊 Total discounts:", data?.data?.length || 0);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Get menu discount proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch menu discounts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, makerID',
    },
  });
}
