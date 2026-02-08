import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ status: string }> }
) {
  try {
    const { status } = await params;
    
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("📋 Fetching orders with status:", status);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // URL encode status to handle spaces
    const encodedStatus = encodeURIComponent(status).replace(/%20/g, '%20');
    console.log("🔗 Encoded status:", encodedStatus);

    // Forward to backend API
    const backendUrl = `https://ukk-p2.smktelkom-mlg.sch.id/api/getorder/${encodedStatus}`;
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
    console.log("✅ Orders response status:", response.status);
    console.log("✅ Orders data:", {
      hasData: !!data,
      isArray: Array.isArray(data),
      hasDataProperty: data?.data !== undefined,
      dataLength: Array.isArray(data) ? data.length : (Array.isArray(data?.data) ? data.data.length : 0)
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Get order proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
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
