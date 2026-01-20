import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Get headers
    const token = request.headers.get('authorization');
    const makerID = request.headers.get('makerID') || '1';

    console.log('🔄 Proxying order to backend:', body);

    // Forward to backend API
    const response = await fetch('https://ukk-p2.smktelkom-mlg.sch.id/api/pesan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
        'makerID': makerID,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('✅ Backend response:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
