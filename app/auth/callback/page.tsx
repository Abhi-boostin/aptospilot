"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AptosKeylessManager } from "@/lib/aptos-keyless";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const keylessManager = new AptosKeylessManager();
        
        // Handle the OIDC callback and create keyless account
        const accountInfo = await keylessManager.handleCallback();
        
        // Set the Google sign-in flag to prevent redirect loop
        window.localStorage.setItem("aptos_google_signed_in", "true");
        
        console.log("Keyless account created successfully:", accountInfo);
        
        // Redirect to dashboard with success
        router.push("/?success=true");
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError(err instanceof Error ? err.message : "Failed to create keyless account");
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating your keyless account...</p>
      </div>
    </div>
  );
} 