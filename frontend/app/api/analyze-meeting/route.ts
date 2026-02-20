import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Use model from env var or fallback to gpt-4o-mini
    let model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    
    // Debug logging to see what model is being used
    console.log('OPENAI_MODEL env var:', process.env.OPENAI_MODEL)
    console.log('Initial model:', model)
    
    // Validate model to prevent invalid model names
    const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
    if (!validModels.includes(model)) {
      console.error(`Invalid model "${model}", falling back to gpt-4o-mini`)
      model = 'gpt-4o-mini'
    }
    console.log('Final model:', model)

    const openai = new OpenAI({ apiKey })

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

    const response = await openai.chat.completions.create({
      model: model,
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
