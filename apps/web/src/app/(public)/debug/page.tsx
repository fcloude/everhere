'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function DebugPage() {
  const [result, setResult] = useState<string>('Click "Test Connection" to check API');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing...');

    try {
      const healthUrl = API_BASE.replace('/api/v1', '/health');
      const res = await fetch(healthUrl, { method: 'GET' });
      const data = await res.json();
      setResult(`✅ API is reachable!\nStatus: ${res.status}\nResponse: ${JSON.stringify(data, null, 2)}\nAPI URL: ${API_BASE}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResult(`❌ Cannot reach API!\nError: ${msg}\n\nConfigured API URL: ${API_BASE}\n\nThis means your NEXT_PUBLIC_API_URL env var is either:\n1. Not set (defaulting to localhost)\n2. Set incorrectly\n3. Being blocked by CORS`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card max-w-lg w-full">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Connection Debug</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Tests if your browser can reach the EVERHERE API server.
        </p>

        <div className="p-3 rounded-lg bg-neutral-100 mb-4">
          <p className="text-xs text-neutral-500 mb-1">Configured API URL:</p>
          <p className="text-sm font-mono text-neutral-800 break-all">{API_BASE}</p>
        </div>

        <button
          onClick={testConnection}
          disabled={testing}
          className="btn-primary w-full mb-4"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        <pre className="p-3 rounded-lg bg-neutral-900 text-green-400 text-xs whitespace-pre-wrap font-mono overflow-auto max-h-64">
          {result}
        </pre>
      </div>
    </div>
  );
}
