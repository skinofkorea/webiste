import 'chart.js/auto';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import { useGetStatsQuery } from '../../redux/api/stats.api';
import { useAllProductsQuery } from '../../redux/api/product.api';
import { 
  FaShoppingBag, 
  FaTicketAlt, 
  FaBoxes, 
  FaPlus, 
  FaExclamationTriangle, 
  FaArrowRight,
  FaFileCsv,
  FaSync
} from 'react-icons/fa';
import Papa from 'papaparse';
import { notify } from '../../utils/util';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Data queries
  const { data: statsData, isLoading, isError, refetch: refetchStats } = useGetStatsQuery();
  const { data: productsData, refetch: refetchProducts } = useAllProductsQuery({ 
    page: 1, 
    limit: 100, 
    sortBy: 'newest' 
  });

  const stats = statsData?.stats;
  const products = productsData?.products || [];
  const totalCatalogProducts = productsData?.totalProducts || stats?.totalProducts || 0;
  const totalLowStock = productsData?.totalLowStock ?? 0;

  // Export catalog CSV
  const handleExportCSV = () => {
    if (!products.length) {
      notify('No products available to export', 'error');
      return;
    }
    const exportData = products.map((p) => ({
      ID: p.id || p._id,
      Handle: p.handle || p._id,
      Title: p.name,
      Brand: p.vendor || 'Skin of Korea',
      Category: p.category,
      Price_GBP: Number(p.price || 0).toFixed(2),
      Stock: p.stock,
      Active: p.isActive !== false ? 'Yes' : 'No',
      Featured: p.featured ? 'Yes' : 'No',
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skin-of-korea-catalog-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
    notify(`Exported catalog inventory (${exportData.length} SKUs)`, 'success');
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  // Line chart configuration
  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111111',
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => ` ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(context.raw || 0))}`,
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#9CA3AF' }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#9CA3AF',
          callback: (value: any) => `£${value}`
        }
      }
    }
  }), []);

  const chartData = useMemo(() => {
    const rawData = stats?.revenueByMonth || {};
    return {
      labels: Object.keys(rawData),
      datasets: [
        {
          label: 'Revenue',
          data: Object.values(rawData),
          fill: true,
          backgroundColor: 'rgba(17, 17, 17, 0.04)',
          borderColor: '#111111',
          borderWidth: 2.5,
          pointBackgroundColor: '#111111',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
        },
      ],
    };
  }, [stats]);

  // Doughnut chart configuration
  const doughnutData = useMemo(() => {
    const rawDemo = (stats as any)?.orderStatusDemographic || [];
    const labels = rawDemo.length > 0 ? rawDemo.map((g: any) => g._id) : ['Delivered', 'Processing', 'Pending'];
    const data = rawDemo.length > 0 ? rawDemo.map((g: any) => g.count) : [12, 5, 2];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#111111', '#525252', '#A3A3A3', '#E57A22'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [stats]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#4B5563',
          padding: 14,
          usePointStyle: true,
        }
      }
    }
  }), []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-neutral-500 tracking-wide">Loading dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center shadow-xs max-w-md mx-auto my-12 font-sans">
        <FaExclamationTriangle className="text-amber-500 text-3xl mx-auto mb-3" />
        <h3 className="text-base font-bold text-neutral-900">Dashboard Metrics Unavailable</h3>
        <p className="text-neutral-500 text-xs mt-1 mb-4">Failed to load statistics from the store database.</p>
        <button
          onClick={() => { refetchStats(); refetchProducts(); }}
          className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:bg-neutral-800 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor sales performance, customer orders, and store inventory in real-time.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => { refetchStats(); refetchProducts(); notify('Dashboard data refreshed', 'success'); }}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-neutral-200 shadow-2xs"
            title="Refresh statistics"
          >
            <FaSync className="text-xs text-neutral-400" /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-neutral-200 shadow-2xs"
            title="Download products CSV"
          >
            <FaFileCsv className="text-emerald-600 text-xs" /> Export CSV
          </button>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs"
          >
            <FaPlus className="text-xs" /> Add Product
          </button>
        </div>
      </div>

      {/* ── 4 KPI Metric Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Widget 
          heading="Gross Revenue"
          value={new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats?.totalRevenue || 0)}
          description="Paid customer checkouts"
          icon={<span className="text-base font-bold">£</span>}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Total Orders" 
          value={(stats?.totalOrders || 0).toLocaleString('en-IN')} 
          description="Orders placed to date" 
          icon={<FaShoppingBag className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Total Products" 
          value={totalCatalogProducts.toLocaleString('en-IN')} 
          description="Active catalog listings"
          icon={<FaBoxes className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Active Coupons" 
          value={(stats?.totalCoupons || 0).toLocaleString('en-IN')} 
          description="Available promo discounts" 
          icon={<FaTicketAlt className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
      </section>

      {/* ── Low Stock Alert Banner (conditionally displayed) ── */}
      {totalLowStock > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base shrink-0">
              <FaExclamationTriangle />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Low Stock Alert: {totalLowStock} items have fewer than 10 units remaining
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Restock soon to prevent popular products from going out of stock.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/products?stockFilter=low_stock')}
            className="text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl transition shadow-2xs"
          >
            View Low Stock Items
          </button>
        </div>
      )}

      {/* ── Performance Charts ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Monthly Revenue</h3>
              <p className="text-xs text-neutral-500">Gross sales volume in British Pounds (£ GBP)</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
              All Orders
            </span>
          </div>
          <div className="h-[280px]">
            <Line data={chartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-bold text-neutral-900">Order Status Breakdown</h3>
            <p className="text-xs text-neutral-500">Distribution by fulfillment status</p>
          </div>
          <div className="h-[240px] flex items-center justify-center relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </section>

      {/* ── Recent Orders Table ── */}
      <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Orders</h3>
            <p className="text-xs text-neutral-500">Latest customer purchases requiring fulfillment</p>
          </div>
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-amber-700 transition"
          >
            View All Orders <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {(!stats?.latestOrders || stats.latestOrders.length === 0) ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            No customer orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {stats.latestOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-neutral-900 text-xs">
                      #{order._id ? order._id.slice(0, 8) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {order.createdAt ? dayjs(order.createdAt).format('DD MMM YYYY') : 'Recent'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 font-medium">
                      {order.orderItems?.length || 1} items
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900">
                      {new Intl.NumberFormat(order.currency === 'GBP' ? 'en-GB' : 'en-IN', { style: 'currency', currency: order.currency || 'GBP' }).format(Number(order.total || 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 font-semibold text-xs border border-neutral-200 transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

// Supporting Widget Component
interface WidgetProps {
  heading: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
}

const Widget: React.FC<WidgetProps> = ({ heading, value, description, icon, accentClass }) => (
  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center justify-between group">
    <div className="space-y-1">
      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{heading}</h3>
      <p className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</p>
      <p className="text-[11px] text-neutral-500">{description}</p>
    </div>
    <div className={`p-3 rounded-xl ${accentClass} transition-transform duration-200 group-hover:scale-105`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;
