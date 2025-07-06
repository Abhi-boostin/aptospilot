import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  console.log('🚀 AI Chat API called');
  
  try {
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

    console.log('✅ Message validated:', message.substring(0, 50) + '...');

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
            { text: `You are an expert AI assistant specializing in the Aptos blockchain ecosystem. Answer the following user question as an Aptos expert:\n\n${message}` }
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

  } catch (error) {
    console.error('🚨 AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
} 