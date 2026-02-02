import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("🔄 Updating order status for order:", orderId);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Try to parse request body
    let status: string | null = null;

    const contentType = request.headers.get("content-type");
    console.log("📦 Content-Type from client:", contentType);

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      status = body.status;
      console.log("📝 Status from JSON:", status);
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const urlParams = new URLSearchParams(text);
      status = urlParams.get('status');
      console.log("📝 Status from URL-encoded:", status);
    } else {
      // Try FormData
      const formData = await request.formData();
      status = formData.get('status') as string;
      console.log("📝 Status from FormData:", status);
    }

    if (!status) {
      console.error("❌ No status provided");
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Send as URL-encoded form data (x-www-form-urlencoded)
    const urlParams = new URLSearchParams();
    urlParams.append('status', status);

    console.log("🌐 Sending to backend with URL-encoded data:", urlParams.toString());

    const response = await fetch(
      `https://ukk-p2.smktelkom-mlg.sch.id/api/updatestatus/${orderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: token || "",
          makerID: makerID,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlParams.toString(),
      },
    );

    console.log("📥 Backend response status:", response.status);

    // Check if response is JSON
    const responseContentType = response.headers.get("content-type");
    if (!responseContentType || !responseContentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Backend returned non-JSON:", text.substring(0, 500));
      return NextResponse.json(
        {
          error: "Backend error",
          details: "Server returned invalid response",
          status: response.status,
          rawResponse: text.substring(0, 500),
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("✅ Update status response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Update status proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to update order status",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, makerID',
    },
  });
}
