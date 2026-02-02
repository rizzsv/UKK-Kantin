import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const date = params.date;

    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("💰 Fetching monthly revenue for:", date);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Forward to backend API
    const backendUrl = `https://ukk-p2.smktelkom-mlg.sch.id/api/showpemasukanbybulan/${date}`;
    console.log('🌐 Fetching from backend:', backendUrl);

    const response = await fetch(
      backendUrl,
      {
        method: "GET",
        headers: {
          Authorization: token || "",
          makerID: makerID,
        },
      },
    );

    console.log('📥 Backend response status:', response.status);

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
    console.log("✅ Monthly revenue response status:", response.status);
    console.log("✅ Monthly revenue data:", {
      hasData: !!data,
      hasDataProperty: data?.data !== undefined,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Get monthly revenue proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch monthly revenue",
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
