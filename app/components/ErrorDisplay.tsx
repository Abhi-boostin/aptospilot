"use client";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onSignOut: () => void;
}

export default function ErrorDisplay({ error, onRetry, onSignOut }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
          >
            Retry
          </button>
          <button
            onClick={onSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 