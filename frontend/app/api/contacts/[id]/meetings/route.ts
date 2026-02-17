import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id
    
    // Extract role header from incoming request
    const userRole = request.headers.get('x-user-role')
    
    // Build headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Forward role header if present
    if (userRole) {
      headers['x-user-role'] = userRole
    }
    
    const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}/meetings`, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching contact meetings:', error)
    return NextResponse.json(
      { detail: { code: 'INTERNAL_ERROR', message: 'Failed to fetch meetings' } },
      { status: 500 }
    )
  }
}
