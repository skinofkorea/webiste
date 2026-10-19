import React, { useMemo, useState } from 'react';
import { useGetAllUsersQuery } from '../../redux/api/user.api';
import { User as UserType } from '../../types/api-types';
import { 
  FaUsers, 
  FaSearch, 
  FaEnvelope, 
  FaWhatsapp, 
  FaUserCheck, 
  FaMapMarkerAlt 
} from 'react-icons/fa';
import dayjs from 'dayjs';

const AdminCustomers: React.FC = () => {
  const { data, error, isLoading, refetch } = useGetAllUsersQuery('');
  const users: UserType[] = useMemo(() => data?.users || [], [data]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u as any).phone?.toLowerCase().includes(q) ||
        (u as any).location?.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center shadow-xs max-w-md mx-auto my-12 font-sans">
        <p className="text-red-600 font-semibold mb-2 text-sm">Error loading customer profiles.</p>
        <button
          onClick={() => refetch()}
          className="bg-neutral-900 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:bg-neutral-800 transition mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Customer Accounts</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View registered customer profiles, contact info, and order engagement history.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-4 py-2 rounded-xl text-xs border border-neutral-200 transition"
        >
          Refresh Customers
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Customers</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1 tracking-tight">{users.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center text-base">
            <FaUsers />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Verified Profiles</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1 tracking-tight">
              {users.filter(u => u.email).length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
            <FaUserCheck />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active Geographic Base</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1 tracking-tight">Pan India</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center text-base">
            <FaMapMarkerAlt />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-2xs flex items-center gap-3">
        <FaSearch className="text-neutral-400 text-xs pl-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email address, phone or city..."
          className="flex-1 text-xs bg-transparent focus:outline-none placeholder-neutral-400 text-neutral-900"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-neutral-400 hover:text-neutral-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-bold text-neutral-900 text-sm tracking-tight">
            Customers ({filteredUsers.length})
          </h2>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              Reset Search
            </button>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 text-xl flex items-center justify-center mx-auto mb-2.5">
              <FaUsers />
            </div>
            <p className="text-neutral-900 font-semibold text-sm mb-1">No customers found</p>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Customers will automatically appear here as users register or place orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Contact Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredUsers.map((user) => {
                  const phone = (user as any).phone || '';
                  const location = (user as any).location || 'United Kingdom';
                  const initials = (user.name || 'C').slice(0, 2).toUpperCase();

                  const uAny = user as any;
                  const userId = user._id || uAny.id || 'N/A';
                  const createdAt = uAny.createdAt || uAny.created_at;

                  return (
                    <tr key={user._id || uAny.id || user.email} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Avatar & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#111111] text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block text-xs">
                              {user.name || 'Customer'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                              ID: {String(userId).slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 font-mono text-neutral-600 text-xs">
                        {user.email || 'No email registered'}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5 font-mono text-neutral-700 text-xs font-semibold">
                        {phone || '—'}
                      </td>

                      {/* Location */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                          📍 {location}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="px-5 py-3.5 text-neutral-500 text-xs">
                        {createdAt ? dayjs(createdAt).format('DD MMM YYYY') : 'Member'}
                      </td>

                      {/* Quick Contact Buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.email && (
                            <a
                              href={`mailto:${user.email}?subject=Mii%20Korean%20Skincare`}
                              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 transition text-xs"
                              title="Send Email"
                            >
                              <FaEnvelope />
                            </a>
                          )}
                          {phone && (
                            <a
                              href={`https://wa.me/44${phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(user.name || '')},%20greetings%20from%20Mii%20Korean!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition text-xs"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;

