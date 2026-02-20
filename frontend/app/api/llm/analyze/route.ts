import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // Build prompt for OpenAI
    const prompt = `Analyze the following meeting transcript and extract structured information.

You must respond with valid JSON matching this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": ["topic1", "topic2", ...],
  "objections": ["objection1", ...],
  "commitments": ["commitment1", ...],
  "outcome": "closed" | "follow_up" | "no_interest" | "unknown",
  "summary": "brief summary"
}

Rules:
- sentiment: Overall tone of the meeting
- topics: Main subjects discussed (3-5 items)
- objections: Concerns or hesitations raised (0-5 items)
- commitments: Promises or next steps agreed upon (0-5 items)
- outcome: Meeting result classification
- summary: 2-3 sentence summary

Transcript:
${transcript}

Respond only with valid JSON, no additional text.`

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a meeting analysis assistant. You extract structured information from meeting transcripts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 1000,
    })

    // Parse response
    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const analysis = JSON.parse(content)

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('LLM analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze transcript', details: error.message },
      { status: 500 }
    )
  }
}
