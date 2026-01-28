import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("📋 Fetching ALL orders");
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Try multiple endpoints to get all orders
    const statuses = ['belum%20dikonfirm', 'dimasak', 'diantar', 'sampai'];
    const endpoints = statuses.map(status => 
      `https://ukk-p2.smktelkom-mlg.sch.id/api/getorder/${status}`
    );

    const allOrders: any[] = [];

    // Fetch from all status endpoints
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: token || "",
            makerID: makerID,
          },
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            const ordersArray = Array.isArray(data) ? data : (data?.data || []);
            allOrders.push(...ordersArray);
          }
        }
      } catch (err) {
        console.error(`Error fetching from ${endpoint}:`, err);
      }
    }

    console.log(`✅ Total orders fetched: ${allOrders.length}`);

    // Now fetch details for each order to get items and prices
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        try {
          // Try multiple possible endpoints for order detail
          const endpoints = [
            `https://ukk-p2.smktelkom-mlg.sch.id/api/detailorder/${order.id}`,
            `https://ukk-p2.smktelkom-mlg.sch.id/api/showorder?id=${order.id}`,
            `https://ukk-p2.smktelkom-mlg.sch.id/api/order/${order.id}`,
          ];

          for (const endpoint of endpoints) {
            try {
              const detailResponse = await fetch(endpoint, {
                method: "GET",
                headers: {
                  Authorization: token || "",
                  makerID: makerID,
                },
              });

              console.log(`🔍 Trying ${endpoint} - Status: ${detailResponse.status}`);

              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                console.log(`📦 Detail for order #${order.id} from ${endpoint}:`, detailData);
                
                // Merge detail data into order
                return {
                  ...order,
                  detail: detailData.detail || detailData.data?.detail || [],
                  total_harga: detailData.total_harga || detailData.data?.total_harga || order.total_harga,
                  order_items: detailData.order_items || detailData.data?.order_items || detailData.detail || [],
                };
              }
            } catch (err) {
              console.error(`Error with ${endpoint}:`, err);
            }
          }
        } catch (err) {
          console.error(`Error fetching detail for order #${order.id}:`, err);
        }
        return order;
      })
    );

    console.log(`✅ Orders with details processed: ${ordersWithDetails.length}`);
    if (ordersWithDetails.length > 0) {
      console.log('📦 Sample order with details:', ordersWithDetails[0]);
    }

    return NextResponse.json({ data: ordersWithDetails }, { status: 200 });
  } catch (error) {
    console.error("❌ Get all orders proxy error:", error);
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
