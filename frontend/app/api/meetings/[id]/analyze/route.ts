import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id
    
    // Extract Authorization header from incoming request
    const authorization = request.headers.get('authorization')
    
    // Build headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Forward Authorization header if present
    if (authorization) {
      headers['Authorization'] = authorization
    }
    
    const response = await fetch(`${BACKEND_URL}/api/meetings/${meetingId}/analyze`, {
      method: 'POST',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error analyzing meeting:', error)
    return NextResponse.json(
      { detail: { code: 'INTERNAL_ERROR', message: 'Failed to analyze meeting' } },
      { status: 500 }
    )
  }
}
