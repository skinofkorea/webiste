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
  FaExternalLinkAlt, 
  FaArrowRight,
  FaImage
} from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading, isError, refetch } = useGetStatsQuery();
  const { data: productsData } = useAllProductsQuery({ page: 1, limit: 100, sortBy: { id: '', desc: false } });
  const stats = statsData?.stats;

  // Low stock alert items
  const lowStockProducts = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter(
      (p) => Number(p.stock || 0) < 10 && p.isActive !== false
    );
  }, [productsData]);

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
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Line chart options
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

  // Revenue chart data
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

  // Order demographic doughnut chart
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center shadow-xs max-w-md mx-auto my-12 font-sans">
        <p className="text-red-600 font-semibold mb-2 text-sm">Error loading dashboard statistics.</p>
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
      {/* Top Banner & Quick Actions Bar */}
      <div className="bg-[#111111] text-white p-6 md:p-8 rounded-3xl shadow-md border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-bold uppercase tracking-widest mb-1">
            <span>Store Operations Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            URVA Marketplace
          </h1>
          <p className="text-xs text-neutral-400">
            Monitor real-time sales, manage catalog availability, and fulfill customer orders.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/banners')}
            className="flex items-center gap-2 bg-[#E57A22] hover:bg-[#d46d1a] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
          >
            <FaImage /> Campaigns & Banners
          </button>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 bg-white hover:bg-neutral-150 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
          >
            <FaPlus /> Add Product
          </button>
          <button
            onClick={() => navigate('/admin/coupons')}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-neutral-700"
          >
            <FaTicketAlt /> New Coupon
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-neutral-700"
          >
            <FaExternalLinkAlt /> Live Store
          </a>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-neutral-800/40 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Widgets section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Widget 
          heading="GBP Revenue"
          value={new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats?.totalRevenue || 0)}
          description="Paid GBP orders"
          icon={<span className="text-base font-semibold">£</span>}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Total Orders" 
          value={(stats?.totalOrders || 0).toLocaleString('en-IN')} 
          description="Customer orders placed" 
          icon={<FaShoppingBag className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Active Coupons" 
          value={(stats?.totalCoupons || 0).toLocaleString('en-IN')} 
          description="Available promo codes" 
          icon={<FaTicketAlt className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
        <Widget 
          heading="Total Products" 
          value={(productsData?.products?.length || stats?.totalProducts || 0).toLocaleString('en-IN')} 
          description="Catalog inventory"
          icon={<FaBoxes className="text-base" />}
          accentClass="bg-neutral-100 text-neutral-900 border border-neutral-200"
        />
      </section>

      {/* Low Stock Alert Notification Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
                <FaExclamationTriangle />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-xs">
                  Low Stock Alert ({lowStockProducts.length} items need restock)
                </h3>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Some products are running low (&lt; 10 units in catalog).
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition shadow-2xs"
            >
              Manage Inventory
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {lowStockProducts.slice(0, 5).map((p) => (
              <span
                key={p._id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-neutral-800 font-medium shrink-0 text-[11px]"
              >
                <span>{p.name}:</span>
                <span className="font-bold text-amber-700">{p.stock} left</span>
              </span>
            ))}
            {lowStockProducts.length > 5 && (
              <span className="text-amber-700 font-semibold text-xs shrink-0">
                +{lowStockProducts.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Charts section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Revenue Performance</h3>
              <p className="text-xs text-neutral-500">Monthly gross sales overview</p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
              Annual Overview
            </span>
          </div>
          <div className="h-[280px]">
            <Line data={chartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-bold text-neutral-900">Order Status Demographic</h3>
            <p className="text-xs text-neutral-500">Distribution by fulfillment status</p>
          </div>
          <div className="h-[240px] flex items-center justify-center relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </section>

      {/* Latest Orders section */}
      <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Latest Customer Orders</h2>
            <p className="text-xs text-neutral-500">Recent purchases needing processing or dispatch</p>
          </div>
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition"
          >
            View All Orders <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {(!stats?.latestOrders || stats.latestOrders.length === 0) ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            No recent orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {stats.latestOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-neutral-900 text-xs">
                      #{order._id ? order._id.slice(0, 8) : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {order.createdAt ? dayjs(order.createdAt).format('DD MMM YYYY') : 'Recent'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-700 font-medium">
                      {order.orderItems?.length || 1} items
                    </td>
                    <td className="px-5 py-3.5 font-bold text-neutral-900">
                      {new Intl.NumberFormat(order.currency === 'GBP' ? 'en-GB' : 'en-IN', { style: 'currency', currency: order.currency || 'INR' }).format(Number(order.total || 0))}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-xs border border-neutral-200 transition"
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

// Widget component
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
