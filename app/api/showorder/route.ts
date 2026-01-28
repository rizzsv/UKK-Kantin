import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("📋 Fetching user orders");
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Try to fetch from all status endpoints and combine
    const statuses = ['belum dikonfirmasi', 'dimasak', 'diantar', 'sampai'];
    const allOrders: any[] = [];

    for (const status of statuses) {
      try {
        const encodedStatus = encodeURIComponent(status);
        console.log(`🔍 Fetching status: ${status} (encoded: ${encodedStatus})`);

        const response = await fetch(
          `https://ukk-p2.smktelkom-mlg.sch.id/api/getorder/${encodedStatus}`,
          {
            method: "GET",
            headers: {
              Authorization: token || "",
              makerID: makerID,
            },
          },
        );

        console.log(`📡 Response status for ${status}:`, response.status);

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            const ordersArray = Array.isArray(data) ? data : (data?.data || []);
            console.log(`✅ Fetched ${ordersArray.length} orders for status: ${status}`);
            allOrders.push(...ordersArray);
          }
        } else {
          console.error(`❌ Failed to fetch ${status}:`, response.status, response.statusText);
        }
      } catch (err) {
        console.error(`Error fetching status ${status}:`, err);
      }
    }

    console.log("✅ Total orders fetched:", allOrders.length);
    
    return NextResponse.json({ data: allOrders }, { status: 200 });


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
