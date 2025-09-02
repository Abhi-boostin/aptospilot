import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Simple in-memory rate limit (per-process)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateBucket: Record<string, { count: number; ts: number }> = {};

function rateLimit(ip: string) {
  const now = Date.now();
  const slot = rateBucket[ip] ?? { count: 0, ts: now };
  if (now - slot.ts > RATE_LIMIT_WINDOW_MS) {
    rateBucket[ip] = { count: 1, ts: now };
    return;
  }
  if (slot.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error('Rate limit exceeded');
  }
  slot.count += 1;
  rateBucket[ip] = slot;
}

export async function POST(request: NextRequest) {
  console.log('🚀 AI Chat API called');
  
  try {
    // Throttle per IP
    const ip = request.ip || 'unknown';
    rateLimit(ip);

    const body = await request.json();
    console.log('📨 Request body:', body);
    
    const { message } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message:', { message, type: typeof message });
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Cap input length
    const trimmed = message.trim().slice(0, 1_000);

    console.log('✅ Message validated:', trimmed.substring(0, 50) + '...');

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      );
    }

    console.log('✅ API key found, length:', process.env.GEMINI_API_KEY.length);

    // Initialize Gemini AI with the new SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Use the latest available model (e.g., gemini-1.5-flash or gemini-1.5-pro)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are an expert AI assistant specializing in the Aptos blockchain ecosystem. Answer the following user question as an Aptos expert:\n\n${trimmed}` }
          ]
        }
      ]
    });

    // Extract the text response
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';

    console.log('🎉 Success! Returning Gemini response');
    return NextResponse.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    const msg = error?.message || 'Failed to process AI request';
    const status = msg.includes('Rate limit') ? 429 : 500;
    console.error('🚨 AI Chat API Error:', msg);
    return NextResponse.json(
      { error: msg },
      { status }
    );
  }
} 