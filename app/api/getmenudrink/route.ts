import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const search = formData.get('search') || '';

    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("🥤 Fetching drink menu with search:", search);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Create form data for backend API
    const backendFormData = new FormData();
    backendFormData.append('search', search as string);

    // Forward to backend API
    const response = await fetch(
      "https://ukk-p2.smktelkom-mlg.sch.id/api/getmenudrink",
      {
        method: "POST",
        headers: {
          Authorization: token || "",
          makerID: makerID,
        },
        body: backendFormData,
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
    console.log("✅ Drink menu response status:", response.status);
    console.log("✅ Drink menu data structure:", {
      hasData: !!data,
      isArray: Array.isArray(data),
      hasDataProperty: data?.data !== undefined,
      dataLength: Array.isArray(data) ? data.length : (Array.isArray(data?.data) ? data.data.length : 0)
    });
    
    // Log first item if exists
    const items = Array.isArray(data) ? data : (data?.data || []);
    if (items.length > 0) {
      console.log("✅ First drink item:", JSON.stringify(items[0], null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Drink menu proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch drink menu",
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
