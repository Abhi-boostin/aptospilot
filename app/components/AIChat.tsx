"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is the Move language?",
  "How do I create a smart contract on Aptos?",
  "What are the latest Aptos ecosystem updates?",
  "How do keyless accounts work?",
  "What DeFi protocols are available on Aptos?",
  "How do I integrate Petra Wallet?"
];

// Generate unique message ID
const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateMessageId(),
      content: "Hello! I'm your Aptos AI assistant powered by Gemini. I can help you with blockchain queries, smart contract development, Move language, DeFi protocols, and general Aptos ecosystem questions. How can I assist you today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: generateMessageId(),
      content: textToSend,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) {
      setInputValue("");
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: generateMessageId(),
        content: data.response,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: generateMessageId(),
        content: "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment, or check your internet connection.",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[70vh] md:h-[75vh] lg:h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Aptos AI Assistant</h3>
          <p className="text-sm text-gray-500">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === "ai" && (
                  <Bot className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <User className="w-4 h-4 mt-0.5 text-blue-100 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Suggested Questions */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 text-center">Try asking me about:</p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <p className="text-sm text-gray-700">{question}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-gray-600" />
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 sticky bottom-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about Aptos, Move language, smart contracts, DeFi, or blockchain..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 