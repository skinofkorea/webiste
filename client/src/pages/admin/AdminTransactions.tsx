import React, { useMemo, useState } from 'react';
import { 
  FaCreditCard, 
  FaFileCsv, 
  FaSearch, 
  FaCheckCircle, 
  FaShieldAlt
} from 'react-icons/fa';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { useAllOrdersQuery } from '../../redux/api/order.api';
import { useNavigate } from 'react-router-dom';
import { notify } from '../../utils/util';

const AdminTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { data: ordersData, isLoading } = useAllOrdersQuery('');

  const orders = useMemo(() => ordersData?.orders || [], [ordersData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter === 'paid') {
      list = list.filter((o) => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'shipped');
    } else if (statusFilter === 'pending') {
      list = list.filter((o) => o.status?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'pending');
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((o) => 
      o._id?.toLowerCase().includes(q) ||
      (o as any).user?.name?.toLowerCase().includes(q) ||
      (o as any).shippingInfo?.city?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery, statusFilter]);

  const totalGrossGBP = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    if (!orders.length) return 0;
    return totalGrossGBP / orders.length;
  }, [orders, totalGrossGBP]);

  const exportCSV = () => {
    if (!orders.length) {
      notify('No transactions to export', 'error');
      return;
    }
    const data = orders.map((o) => ({
      Transaction_ID: o._id,
      Date: dayjs(o.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      Amount_GBP: Number(o.total || 0).toFixed(2),
      Currency: o.currency || 'GBP',
      Payment_Status: o.status === 'Cancelled' ? 'Failed' : 'Settled / Captured',
      Order_Status: o.status,
      Items_Count: o.orderItems?.length || 1,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-ledger-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
    notify(`Exported ${data.length} transactions to CSV`, 'success');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Transactions & Settlement Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
              GBP Merchant Ledger
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit captured payments, refunds, order settlement logs, and transaction status in British Pounds (£).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-neutral-200 shadow-2xs"
          >
            <FaFileCsv className="text-emerald-600 text-sm" /> Export Statement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Gross Settlement Volume</span>
            <FaCreditCard className="text-neutral-700" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalGrossGBP)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Total online checkout volume</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Captured Transactions</span>
            <FaCheckCircle className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{orders.length}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Verified customer payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Average Order Value (AOV)</span>
            <span className="text-xs font-bold text-neutral-700">£</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(avgOrderValue)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Average checkout basket</p>
        </div>
      </div>

      {/* Search & Ledger Table */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction / Order ID, Customer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950/20 bg-neutral-50 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                statusFilter === 'paid'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Settled / Dispatched
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Pending Settlement
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Transaction Ref</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Settlement Status</th>
                <th className="px-4 py-3">Amount (GBP)</th>
                <th className="px-4 py-3 text-right">Order Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-neutral-900">
                      TXN-{order._id?.slice(0, 10).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500">
                      {dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-700 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] font-mono">
                        <FaShieldAlt className="text-neutral-500 text-[9px]" /> Stripe / Card
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FaCheckCircle className="text-[9px]" /> Captured
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-neutral-900 text-sm">
                      {new Intl.NumberFormat('en-GB', { style: 'currency', currency: order.currency || 'GBP' }).format(Number(order.total || 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 font-semibold text-xs border border-neutral-200 transition"
                      >
                        Inspect Order
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
