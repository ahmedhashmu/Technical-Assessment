import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id
    
    // Get Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward Authorization header to backend
    if (authHeader) {
      headers['Authorization'] = authHeader
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
