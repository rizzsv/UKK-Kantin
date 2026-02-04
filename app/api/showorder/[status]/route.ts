import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { status: string } }
) {
  try {
    // Decode the status parameter (Next.js auto-decodes route params)
    const status = decodeURIComponent(params.status);

    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log(`📋 Fetching order with status: "${status}"`);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Forward to backend API - use the exact status without encoding
    // The backend expects: /api/showorder/dimasak (with space if needed)
    const backendUrl = `https://ukk-p2.smktelkom-mlg.sch.id/api/showorder/${status}`;
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

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: "Backend API error",
          status: response.status,
          message: errorText,
        },
        { status: response.status },
      );
    }

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
    console.log("✅ Show order response:", {
      status: data?.status,
      message: data?.message,
      hasData: !!data?.data,
    });

    // Log the order data if available
    if (data?.data?.order) {
      console.log("📦 Order found:", {
        id: data.data.order.id,
        order_status: data.data.order.status,
        student_id: data.data.order.id_siswa,
        items_count: data.data.detail?.length || 0,
      });
    } else {
      console.log("ℹ️ No order data in response");
    }

    // Return the data as-is from backend
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Show order proxy error:", error);
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
