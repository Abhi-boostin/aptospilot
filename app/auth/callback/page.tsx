"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { AptosKeylessManager } from "@/lib/aptos-keyless";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // After Google OAuth, just set the sign-in flag and redirect to dashboard
    try {
      // Optionally, parse user info from JWT if needed
      window.localStorage.setItem("aptos_google_signed_in", "true");
      // You can extract and store email/name/avatar here if you want
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete sign-in");
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Signing you in…
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we complete your sign-in.
          </p>
        </div>
        {error && (
          <div className="text-center text-red-600 font-medium">{error}</div>
        )}
      </div>
    </div>
  );
} 