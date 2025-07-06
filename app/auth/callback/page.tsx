"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AptosKeylessManager } from "@/lib/aptos-keyless";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("=== KEYLESS CALLBACK DEBUG ===");
        console.log("Current URL:", window.location.href);
        console.log("URL hash:", window.location.hash);
        console.log("URL search:", window.location.search);
        
        setDebugInfo({
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
        });

        const keylessManager = new AptosKeylessManager();
        
        // Handle the keyless callback and create keyless account
        const accountInfo = await keylessManager.handleCallback();
        
        // Set the Google sign-in flag to prevent redirect loop
        window.localStorage.setItem("aptos_google_signed_in", "true");
        window.localStorage.setItem("aptos_user_email", accountInfo.email);
        
        console.log("Keyless account created successfully:", accountInfo);
        
        // Redirect to dashboard with success
        router.push("/?success=true");
      } catch (err) {
        console.error("Error in keyless callback:", err);
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
            
            {debugInfo && (
              <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
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
        
        {debugInfo && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg text-left max-w-md">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 