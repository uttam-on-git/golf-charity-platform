'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface User {
  id: string;
  full_name: string;
  role: string;
  subscriptions: { status: string; plan: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-gray-400 text-sm mb-8">All registered users</p>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 px-5 py-3 font-medium">Name</th>
                <th className="text-left text-gray-500 px-5 py-3 font-medium">Role</th>
                <th className="text-left text-gray-500 px-5 py-3 font-medium">Subscription</th>
                <th className="text-left text-gray-500 px-5 py-3 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const sub = u.subscriptions?.[0];
                return (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-5 py-3 text-white">{u.full_name || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sub?.status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {sub?.status || 'none'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 capitalize">{sub?.plan || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}