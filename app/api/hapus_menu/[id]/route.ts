import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get headers
    const token = request.headers.get("authorization");
    const makerID = request.headers.get("makerID") || "1";

    console.log("🗑️ Deleting menu item");
    console.log("🆔 Menu ID:", id);
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
    const response = await fetch(
      `https://ukk-p2.smktelkom-mlg.sch.id/api/hapus_menu/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
          makerID: makerID,
        },
      },
    );

    console.log("📡 Backend response status:", response.status);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.log("⚠️ Non-JSON response:", text.substring(0, 200));
      return NextResponse.json(
        { 
          status: false, 
          message: "Invalid response from backend" 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Backend response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: data.message || "Failed to delete menu item",
          data: null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error deleting menu:", error);
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
