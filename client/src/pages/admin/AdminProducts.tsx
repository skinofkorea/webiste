import Papa from 'papaparse';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  FaEdit, 
  FaFileCsv, 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaBoxes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaStar,
  FaRegStar,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { 
  useAllProductsQuery, 
  useDeleteProductMutation, 
  useToggleActiveProductMutation,
  useFeatureProductMutation
} from '../../redux/api/product.api';
import { CustomError } from '../../types/api-types';
import { notify } from '../../utils/util';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Filter states initialized from URL params
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState(() => searchParams.get('brand') || 'All');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'disabled'>(
    () => (searchParams.get('stockFilter') as any) || 'all'
  );
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(() => searchParams.get('featured') === 'true');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sync state if URL query params change
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const catParam = searchParams.get('category');
    const stockParam = searchParams.get('stockFilter');
    const featuredParam = searchParams.get('featured');
    const qParam = searchParams.get('search');

    if (brandParam) setSelectedBrand(brandParam);
    if (catParam) setSelectedCategory(catParam);
    if (stockParam) setSelectedStockFilter(stockParam as any);
    if (featuredParam !== null) setFeaturedOnly(featuredParam === 'true');
    if (qParam !== null) {
      setSearchQuery(qParam);
      setDebouncedSearch(qParam);
    }
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrand, selectedStockFilter, featuredOnly, sortBy, pageSize]);

  // Query API
  const { data: productsData, isLoading, isFetching, isError, error, refetch } = useAllProductsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
    category: selectedCategory,
    brand: selectedBrand,
    stockFilter: selectedStockFilter,
    featured: featuredOnly ? 'true' : undefined,
    sortBy,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActiveProduct] = useToggleActiveProductMutation();
  const [featureProduct] = useFeatureProductMutation();

  const products = productsData?.products || [];
  const totalProducts = productsData?.totalProducts ?? 0;
  const totalPages = productsData?.totalPages ?? 1;
  const categories = useMemo(() => ['All', ...(productsData?.categories || [])], [productsData?.categories]);
  const brands = useMemo(() => ['All', ...(productsData?.brands || [])], [productsData?.brands]);

  // Notification on error
  useEffect(() => {
    if (isError && error) {
      const err = error as CustomError;
      notify(err.data?.message || 'Failed to load products from catalog', 'error');
    }
  }, [isError, error]);

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?\n\nThis will permanently remove it from the Skin of Korea catalog.`)) {
      try {
        const res = await deleteProduct({ productId }).unwrap();
        notify(res.message || 'Product deleted successfully', 'success');
        refetch();
      } catch (err: any) {
        notify(err?.data?.message || 'Failed to delete product', 'error');
      }
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean | undefined) => {
    try {
      const res = await toggleActiveProduct({ productId }).unwrap();
      notify(res.message || `Product ${currentStatus !== false ? 'disabled' : 'enabled'} successfully`, 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to update product visibility', 'error');
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean | undefined) => {
    try {
      const res = await featureProduct({ productId }).unwrap();
      notify(res.message || `Product ${currentFeatured ? 'unfeatured' : 'featured'} successfully`, 'success');
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to update featured status', 'error');
    }
  };

  const getStockBadge = (stock: number, isActive: boolean) => {
    if (!isActive) return { bg: 'bg-neutral-100 text-neutral-600 border-neutral-200', text: 'Disabled' };
    if (stock === 0) return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Out of Stock' };
    if (stock < 10) return { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: `Low Stock (${stock})` };
    return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: `In Stock (${stock})` };
  };

  const exportToCSV = () => {
    const exportData = products.map(p => ({
      ID: p.id || p._id,
      Handle: p.handle || p._id,
      Title: p.name,
      Brand: p.vendor || 'Skin of Korea',
      Category: p.category,
      Price_GBP: Number(p.price || 0).toFixed(2),
      Compare_At_Price_GBP: p.compareAtPrice ? Number(p.compareAtPrice).toFixed(2) : '',
      Stock: p.stock,
      Active: p.isActive !== false ? 'Yes' : 'No',
      Featured: p.featured ? 'Yes' : 'No',
      Tags: (p.tags || []).join(', '),
      Photo_URL: p.photo
    }));
    const csvData = Papa.unparse(exportData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skinofkorea-products-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    notify(`Exported ${exportData.length} products to CSV`, 'success');
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedStockFilter('all');
    setFeaturedOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All' || selectedStockFilter !== 'all' || featuredOnly;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Products Catalog</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
              {totalProducts} products
            </span>
            {isFetching && (
              <span className="inline-flex items-center text-xs text-neutral-400 gap-1 animate-pulse">
                <FaSync className="animate-spin text-[10px]" /> Syncing...
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage all authentic Korean skincare products, live inventory, variants, and GBP pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition border border-neutral-200 shadow-2xs"
            title="Refresh from store catalog"
          >
            <FaSync className={`text-xs ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition border border-neutral-200 shadow-2xs"
            title="Download CSV spreadsheet"
          >
            <FaFileCsv className="text-emerald-600 text-sm" /> Export CSV
          </button>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-xs"
          >
            <FaPlus className="text-xs" /> Add Product
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => { setSelectedStockFilter('all'); setSelectedCategory('All'); setSelectedBrand('All'); setFeaturedOnly(false); }}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs ${
            selectedStockFilter === 'all' && selectedCategory === 'All' && selectedBrand === 'All' && !featuredOnly ? 'border-neutral-900 ring-2 ring-neutral-900/10' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Catalog</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs">
              <FaBoxes />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2 tracking-tight">{productsData?.totalProducts ?? products.length}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Across {categories.length - 1} categories</p>
        </div>

        <div 
          onClick={() => setSelectedStockFilter('in_stock')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs ${
            selectedStockFilter === 'in_stock' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">In Stock</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
              <FaCheckCircle />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 tracking-tight">
            {productsData?.totalActive ? (productsData.totalActive - (productsData.totalLowStock || 0) - (productsData.totalOutOfStock || 0)) : products.filter(p => Number(p.stock || 0) >= 10 && p.isActive !== false).length}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Ready for purchase</p>
        </div>

        <div 
          onClick={() => setSelectedStockFilter('low_stock')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs ${
            selectedStockFilter === 'low_stock' ? 'border-amber-600 ring-2 ring-amber-600/10' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Low Stock</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs">
              <FaExclamationTriangle />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 tracking-tight">{productsData?.totalLowStock ?? 0}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">&lt; 10 units left</p>
        </div>

        <div 
          onClick={() => setSelectedStockFilter('out_of_stock')}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs ${
            selectedStockFilter === 'out_of_stock' ? 'border-rose-600 ring-2 ring-rose-600/10' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Out of Stock</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-xs">
              <FaTimesCircle />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2 tracking-tight">{productsData?.totalOutOfStock ?? 0}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Needs restocking</p>
        </div>

        <div 
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-xs col-span-2 sm:col-span-1 ${
            featuredOnly ? 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-50/20' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Featured Items</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center text-xs">
              <FaStar />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-800 mt-2 tracking-tight">
            {products.filter(p => p.featured).length}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{featuredOnly ? 'Showing featured' : 'Bestsellers & spotlights'}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, brand (COSRX, Anua), category, or handle..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10 bg-neutral-50 focus:bg-white placeholder-neutral-400 transition text-neutral-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 p-1"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Brand Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="All">All Brands ({brands.length - 1})</option>
              {brands.filter(b => b !== 'All').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="All">All Categories ({categories.length - 1})</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <FaFilter className="text-[9px]" /> Stock:
            </span>
            {(['all', 'in_stock', 'low_stock', 'out_of_stock', 'disabled'] as const).map(status => {
              const labels = {
                all: 'All Status',
                in_stock: 'In Stock',
                low_stock: 'Low Stock (<10)',
                out_of_stock: 'Out of Stock',
                disabled: 'Disabled'
              };
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStockFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs transition ${
                    selectedStockFilter === status
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {labels[status]}
                </button>
              );
            })}

            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-3 py-1 rounded-full text-xs transition flex items-center gap-1 ml-1 ${
                featuredOnly
                  ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <FaStar className="text-[10px]" /> Featured
            </button>
          </div>

          {/* Active filter count & reset */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <FaTimes className="text-[10px]" /> Reset Filters
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-800"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader rows={8} columns={7} height={45} className="mb-2" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 text-xl flex items-center justify-center mx-auto mb-3">
              <FaBoxes />
            </div>
            <p className="text-neutral-900 font-semibold mb-1 text-sm">No products found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              {hasActiveFilters 
                ? 'No catalog items match your search or filter criteria. Try clearing some filters.'
                : 'The Skin of Korea product catalog is currently loading or empty.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Product & Details</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price (GBP)</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5 text-center">Featured</th>
                  <th className="px-4 py-3.5 text-center">Visibility</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {products.map((p) => {
                  const isActive = p.isActive !== false;
                  const isFeatured = Boolean(p.featured);
                  const stock = Number(p.stock ?? 100);
                  const stockBadge = getStockBadge(stock, isActive);
                  const hasVariants = Array.isArray(p.variants) && p.variants.length > 1;

                  return (
                    <tr key={p.handle || p._id || p.id} className="hover:bg-neutral-50/70 transition-colors group">
                      {/* Product Name & Photo */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-2xs">
                            <img
                              src={p.photo || '/images/skin-of-korea-logo.png'}
                              alt={p.name}
                              className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/skin-of-korea-logo.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <span className="font-semibold text-neutral-900 block truncate text-xs group-hover:text-amber-800 transition-colors" title={p.name}>
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                              <span className="font-mono text-neutral-400 truncate">
                                {p.handle || (p._id ? p._id.slice(0, 14) : 'item')}
                              </span>
                              {hasVariants && (
                                <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-medium">
                                  {p.variants!.length} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand (Vendor) */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 whitespace-nowrap">
                          {p.vendor || 'Skin of Korea'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
                          {p.category || 'Skincare'}
                        </span>
                      </td>

                      {/* Price (GBP) */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-neutral-900 text-xs">
                            £{Number(p.price || 0).toFixed(2)}
                          </span>
                          {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                            <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                              £{Number(p.compareAtPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${stockBadge.bg}`}>
                          {stockBadge.text}
                        </span>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p.handle || p._id, isFeatured)}
                          className={`p-1.5 rounded-lg transition ${
                            isFeatured ? 'text-amber-500 hover:bg-amber-50' : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                          }`}
                          title={isFeatured ? 'Featured on storefront (click to remove)' : 'Click to feature on homepage'}
                        >
                          {isFeatured ? <FaStar size={14} /> : <FaRegStar size={14} />}
                        </button>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(p.handle || p._id, isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border-neutral-300'
                          }`}
                          title={isActive ? 'Product is visible on storefront (click to hide)' : 'Product is hidden (click to show)'}
                        >
                          {isActive ? (
                            <>
                              <FaEye className="text-emerald-600 text-[10px]" /> Active
                            </>
                          ) : (
                            <>
                              <FaEyeSlash className="text-neutral-400 text-[10px]" /> Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/product/${p.handle || p._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
                            title="Preview live on storefront"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                          <button
                            onClick={() => navigate(`/admin/products/${p.handle || p._id}`)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-xs border border-neutral-200 transition flex items-center gap-1.5"
                            title="Edit product details & variants"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.handle || p._id, p.name)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition text-xs"
                            title="Permanently delete product"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalProducts > 0 && (
          <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 bg-neutral-50/50">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                Showing <span className="font-semibold text-neutral-900">{Math.min((page - 1) * pageSize + 1, totalProducts)}</span> to{' '}
                <span className="font-semibold text-neutral-900">{Math.min(page * pageSize, totalProducts)}</span> of{' '}
                <span className="font-semibold text-neutral-900">{totalProducts}</span> products
              </div>
              <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                <span className="text-[11px] text-neutral-400">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-0.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-800"
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 font-medium text-neutral-700"
              >
                <FaChevronLeft className="text-[9px]" /> Prev
              </button>

              {/* Page Number Chips */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 7) {
                    if (page > 4 && page < totalPages - 2) {
                      pNum = page - 3 + i;
                    } else if (page >= totalPages - 2) {
                      pNum = totalPages - 6 + i;
                    }
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        page === pNum
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 font-medium text-neutral-700"
              >
                Next <FaChevronRight className="text-[9px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
