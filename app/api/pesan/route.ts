import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    const makerID = request.headers.get('makerID') || request.headers.get('makerid') || '1';

    console.log('🔄 Proxying order to backend');
    console.log('📦 Body:', JSON.stringify(body, null, 2));
    console.log('🔑 Token:', token ? `Present (${token.substring(0, 30)}...)` : 'Missing');
    console.log('🏭 MakerID:', makerID);

    if (!body.id_stan || !body.pesan || !Array.isArray(body.pesan)) {
      return NextResponse.json(
        { status: false, message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Prepare headers exactly like Postman
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add Authorization token
    if (token) {
      headers['Authorization'] = token;
    }

    // Add makerID header (case sensitive!)
    headers['makerID'] = makerID;

    console.log('📡 Sending headers:', Object.keys(headers));

    const backendUrl = 'https://ukk-p2.smktelkom-mlg.sch.id/api/pesan';
    console.log('🎯 Target URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('📡 Backend status:', response.status);

    const responseText = await response.text();
    console.log('📄 Backend response (first 500 chars):', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse failed');
      return NextResponse.json(
        { 
          status: false,
          message: 'Backend returned invalid JSON',
          rawResponse: responseText.substring(0, 200)
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        status: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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
