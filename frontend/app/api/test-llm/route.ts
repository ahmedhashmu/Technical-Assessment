import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

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
