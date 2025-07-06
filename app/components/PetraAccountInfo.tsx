"use client";

interface PetraAccountInfoProps {
  address: string;
  balance: string;
}

export default function PetraAccountInfo({ address, balance }: PetraAccountInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Account Address</h3>
            <p className="text-sm font-mono text-gray-900 break-all">{address}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Balance</h3>
            <p className="text-lg font-semibold text-gray-900">{parseFloat(balance) / 100000000} APT</p>
          </div>
        </div>
      </div>
    </div>
  );
} 