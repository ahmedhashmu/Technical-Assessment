import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'user', content: 'Say "LLM is working!"' }
      ],
      max_tokens: 10,
    })

    return NextResponse.json({
      success: true,
      message: response.choices[0].message.content,
      model: model
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
