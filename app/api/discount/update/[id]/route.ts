import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discountId = params.id;
    const body = await request.json();
    
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("🔄 Updating discount:", discountId);
    console.log("📝 Update data:", body);
    console.log("🔑 Token:", token ? token.substring(0, 20) + '...' : 'No token');
    console.log("🏪 MakerID:", makerID);

    // Create form data for backend API
    const formData = new FormData();
    formData.append('nama_diskon', body.nama_diskon);
    formData.append('persentase_diskon', body.persentase_diskon.toString());
    formData.append('tanggal_awal', body.tanggal_awal);
    formData.append('tanggal_akhir', body.tanggal_akhir);

    // Forward to backend API
    const response = await fetch(
      `https://ukk-p2.smktelkom-mlg.sch.id/api/updatediskon/${discountId}`,
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
    console.log("✅ Update discount response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Update discount proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to update discount",
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
