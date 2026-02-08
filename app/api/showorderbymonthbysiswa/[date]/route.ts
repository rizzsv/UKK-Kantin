import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { date } = await params;
    
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log(`📅 Fetching student orders for date/month: "${date}"`);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    if (!token) {
      return NextResponse.json(
        { 
          status: false, 
          message: "Authorization token is required" 
        },
        { status: 401 }
      );
    }

    // Forward to backend API
    const backendUrl = `https://ukk-p2.smktelkom-mlg.sch.id/api/showorderbymonthbysiswa/${date}`;
    console.log('🌐 Fetching from backend:', backendUrl);

    const response = await fetch(
      backendUrl,
      {
        method: "GET",
        headers: {
          Authorization: token,
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
          status: false,
          message: "Failed to fetch student orders by date",
          details: errorText,
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
          status: false,
          message: "Invalid response from backend",
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("✅ Student orders by month response:", {
      status: data?.status,
      message: data?.message,
      hasData: !!data?.data,
      dataLength: Array.isArray(data?.data) ? data.data.length : 'N/A',
    });

    // Return the data as-is from backend
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Show order by month proxy error:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch student orders by date",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
