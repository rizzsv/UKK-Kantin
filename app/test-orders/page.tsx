'use client';

import { useState, useEffect } from 'react';

export default function TestOrdersPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Get token and user data
    const storedToken = localStorage.getItem('authToken') || '';
    setToken(storedToken);

    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    addLog('🔑 Token: ' + (storedToken ? storedToken.substring(0, 30) + '...' : 'No token'));
    addLog('👤 User Data: ' + storedUserData || 'No user data');
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testAPI = async (status: string) => {
    addLog(`\n📋 Testing status: "${status}"`);

    try {
      const encodedStatus = encodeURIComponent(status);
      addLog(`📡 Encoded: "${encodedStatus}"`);

      const response = await fetch(`/api/showorder/${encodedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
      });

      addLog(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Error: ${errorText}`);
        return;
      }

      const data = await response.json();
      addLog(`📦 Response data: ${JSON.stringify(data, null, 2)}`);

      if (data?.data?.order) {
        addLog(`✅ Order found! ID: ${data.data.order.id}, Status: ${data.data.order.status}`);
      } else {
        addLog(`ℹ️ No order in response`);
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`);
    }
  };

  const testAll = async () => {
    const statuses = ['belum dikonfirm', 'dimasak', 'diantar', 'sampai'];

    for (const status of statuses) {
      await testAPI(status);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Orders API</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
            <p><strong>Student ID:</strong> {userData?.id || userData?.user_id || '❌ Not found'}</p>
            <p><strong>Username:</strong> {userData?.username || '❌ Not found'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={testAll}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test All Statuses
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Test All Statuses" to start.</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
