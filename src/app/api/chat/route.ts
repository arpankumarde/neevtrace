import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await fetch('https://neevpy.sandbox.feebook.in/rag-recommender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    
    // Try to parse as JSON, fallback to text
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = { response: data };
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}