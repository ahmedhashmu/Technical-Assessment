import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'NOT SET (fallback: gpt-4o-mini)',
    timestamp: new Date().toISOString(),
    deployment: 'latest'
  })
}