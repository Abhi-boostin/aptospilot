"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Shield } from "lucide-react";

interface AuthSectionProps {
  onSignOut: () => void;
}

export default function AuthSection({ onSignOut }: AuthSectionProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const signedIn = window.localStorage.getItem("aptos_google_signed_in");
    const email = window.localStorage.getItem("aptos_user_email");
    setIsSignedIn(!!signedIn);
    setUserEmail(email || "");
  }, []);

  const handleGoogleSignIn = () => {
    // Start the real Google OAuth flow
    const { AptosKeylessManager } = require("@/lib/aptos-keyless");
    const keylessManager = new AptosKeylessManager();
    const loginUrl = keylessManager.startKeylessFlow();
    window.location.href = loginUrl;
  };

  const handleSignOutClick = () => {
    window.localStorage.removeItem("aptos_google_signed_in");
    window.localStorage.removeItem("aptos_user_email");
    setIsSignedIn(false);
    setUserEmail("");
    onSignOut();
  };

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AptosPilot</h2>
          <p className="text-gray-600 mb-6">Sign in with Google to access your Aptos wallet</p>
          <button
            onClick={handleGoogleSignIn}
            className="inline-flex items-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{userEmail}</p>
            <p className="text-sm text-gray-500">Signed in with Google</p>
          </div>
        </div>
        <button
          onClick={handleSignOutClick}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
} 