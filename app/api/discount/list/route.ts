import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("📋 Fetching discounts");
    console.log("🔍 Search:", body.search || 'No search term');
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Create form data for backend API
    const formData = new FormData();
    formData.append('search', body.search || '');

    // Forward to backend API
    const response = await fetch(
      `https://ukk-p2.smktelkom-mlg.sch.id/api/showdiskon`,
      {
        method: "POST",
        headers: {
          Authorization: token || "",
          makerID: makerID,
        },
        body: formData,
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
    console.log("✅ Get discounts response:", data);
    console.log("📊 Response structure:", {
      hasData: !!data.data,
      hasDiskon: !!data.diskon,
      isArray: Array.isArray(data),
      keys: Object.keys(data),
      dataType: typeof data,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Get discounts proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch discounts",
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, makerID',
    },
  });
}
