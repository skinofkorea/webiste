import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useGetAllFeaturedProductsQuery, 
  useFeatureProductMutation,
  useAllProductsQuery,
  useCategoriesQuery,
  useBrandsQuery
} from '../../redux/api/product.api';
import { Product } from '../../types/api-types';
import { notify } from '../../utils/util';
import { 
  FaStar, 
  FaTrash, 
  FaSearch, 
  FaPlus, 
  FaExternalLinkAlt, 
  FaArrowUp, 
  FaArrowDown, 
  FaTimes, 
  FaExclamationTriangle, 
  FaDownload, 
  FaSyncAlt, 
  FaEdit, 
  FaCheckSquare, 
  FaSquare,
  FaCheckCircle,
  FaChevronRight
} from 'react-icons/fa';

const FALLBACK_LOGO = '/images/skin-of-korea-logo.png';

const AdminFeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const { data: featuredData, isLoading: isFeaturedLoading, isFetching: isFeaturedFetching, refetch: refetchFeatured } = useGetAllFeaturedProductsQuery('');
  const [featureProduct, { isLoading: isFeaturing }] = useFeatureProductMutation();

  const { data: categoriesData } = useCategoriesQuery();
  const { data: brandsData } = useBrandsQuery();

  // Primary list state with local sequence support
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  useEffect(() => {
    if (featuredData?.products) {
      setFeaturedProducts(featuredData.products);
    }
  }, [featuredData]);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-desc'>('rank');

  // Multi-selection for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Add Products Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalBrand, setModalBrand] = useState('All');
  const [modalCategory, setModalCategory] = useState('All');
  const [modalSelectedIds, setModalSelectedIds] = useState<string[]>([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Catalog query for modal
  const { data: catalogData, isFetching: isCatalogLoading } = useAllProductsQuery(
    { page: 1, limit: 100, search: modalSearch, brand: modalBrand === 'All' ? '' : modalBrand, category: modalCategory === 'All' ? '' : modalCategory },
    { skip: !isModalOpen }
  );

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = featuredProducts.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    featuredProducts.forEach((p) => {
      const stock = Number(p.stock || 0);
      const price = Number(p.price || 0);
      totalValue += price;

      if (stock === 0) outOfStock++;
      else if (stock < 10) lowStock++;
      else inStock++;
    });

    const avgPrice = total > 0 ? (totalValue / total).toFixed(2) : '0.00';

    return { total, inStock, lowStock, outOfStock, avgPrice };
  }, [featuredProducts]);

  // Filtered featured items
  const filteredFeaturedProducts = useMemo(() => {
    return featuredProducts.filter((product) => {
      // Tab filter
      const stock = Number(product.stock || 0);
      if (activeTab === 'in_stock' && stock === 0) return false;
      if (activeTab === 'low_stock' && (stock === 0 || stock >= 10)) return false;
      if (activeTab === 'out_of_stock' && stock > 0) return false;

      // Brand filter
      if (selectedBrand !== 'All' && product.vendor !== selectedBrand) return false;

      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          (product.name && product.name.toLowerCase().includes(q)) ||
          (product.vendor && product.vendor.toLowerCase().includes(q)) ||
          (product.category && product.category.toLowerCase().includes(q)) ||
          (product.handle && product.handle.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'stock-desc') return Number(b.stock || 0) - Number(a.stock || 0);
      return 0; // Rank order by default
    });
  }, [featuredProducts, activeTab, selectedBrand, selectedCategory, searchQuery, sortBy]);

  // Toggle single item feature status
  const handleRemoveFeatured = async (product: Product) => {
    const id = product.handle || product._id;
    try {
      await featureProduct({ productId: id }).unwrap();
      notify(`Removed "${product.name}" from featured showcase`, 'success');
      setFeaturedProducts(prev => prev.filter(p => (p.handle || p._id) !== id));
      setSelectedProductIds(prev => prev.filter(item => item !== id));
      refetchFeatured();
    } catch (err) {
      notify('Failed to update product', 'error');
    }
  };

  // Move product position in sequence
  const handleMoveSequence = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= featuredProducts.length) return;

    const updated = [...featuredProducts];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setFeaturedProducts(updated);
    notify(`Moved "${temp.name}" to position #${newIdx + 1}`, 'success');
  };

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredFeaturedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredFeaturedProducts.map(p => (p.handle || p._id) as string));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk Remove from Featured
  const handleBulkUnfeature = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Remove ${selectedProductIds.length} products from the homepage featured showcase?`)) return;

    try {
      for (const id of selectedProductIds) {
        await featureProduct({ productId: id }).unwrap();
      }
      notify(`Removed ${selectedProductIds.length} items from featured showcase`, 'success');
      setFeaturedProducts(prev => prev.filter(p => !selectedProductIds.includes((p.handle || p._id) as string)));
      setSelectedProductIds([]);
      refetchFeatured();
    } catch (err) {
      notify('Error updating some items', 'error');
    }
  };

  // Bulk Add in Modal
  const handleApplyModalSelection = async () => {
    if (modalSelectedIds.length === 0) {
      setIsModalOpen(false);
      return;
    }

    setIsSubmittingBatch(true);
    try {
      let addedCount = 0;
      for (const id of modalSelectedIds) {
        // If not already featured, feature it
        const isAlready = featuredProducts.some(fp => (fp.handle || fp._id) === id);
        if (!isAlready) {
          await featureProduct({ productId: id }).unwrap();
          addedCount++;
        }
      }
      notify(`Added ${addedCount} product(s) to homepage featured showcase`, 'success');
      setIsModalOpen(false);
      setModalSelectedIds([]);
      refetchFeatured();
    } catch (err) {
      notify('Failed to add some products', 'error');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredFeaturedProducts.length === 0) {
      notify('No items to export', 'error');
      return;
    }
    const headers = ['Rank', 'Name', 'Handle', 'Brand', 'Category', 'Price (GBP)', 'Stock', 'Status'];
    const rows = filteredFeaturedProducts.map((p, i) => [
      i + 1,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.handle || p._id || '',
      `"${p.vendor || 'Skin of Korea'}"`,
      `"${p.category || 'Skincare'}"`,
      Number(p.price || 0).toFixed(2),
      p.stock || 0,
      Number(p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skinofkorea-featured-products-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Exported featured products to CSV', 'success');
  };

  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* ─── Breadcrumbs & Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
            <Link to="/admin/dashboard" className="hover:text-neutral-900 transition font-medium">Dashboard</Link>
            <FaChevronRight className="text-[9px] text-neutral-400" />
            <Link to="/admin/products" className="hover:text-neutral-900 transition font-medium">Catalog</Link>
            <FaChevronRight className="text-[9px] text-neutral-400" />
            <span className="text-neutral-900 font-semibold">Featured & Bestsellers</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
              Featured Showcase & Bestsellers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              {featuredProducts.length} Items Live
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Curate and sequence products spotlighted in the homepage hero slider, trending carousels, and viral K-beauty product grids.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => refetchFeatured()}
            disabled={isFeaturedFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition shadow-2xs"
            title="Refresh list"
          >
            <FaSyncAlt className={`text-xs ${isFeaturedFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition shadow-2xs"
          >
            <FaDownload className="text-xs text-neutral-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setModalSelectedIds([]);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-xs active:scale-[0.99]"
          >
            <FaPlus className="text-xs" />
            <span>Add Products to Featured</span>
          </button>
        </div>
      </div>

      {/* ─── Executive KPI Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Featured */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Featured</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm border border-amber-200">
              <FaStar />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">{metrics.total}</span>
            <span className="text-xs text-neutral-500 block mt-0.5">Showcase products on storefront</span>
          </div>
        </div>

        {/* In Stock & Purchasable */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Ready to Buy</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm border border-emerald-200">
              <FaCheckCircle />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-800 tracking-tight">{metrics.inStock}</span>
            <span className="text-xs text-emerald-600 block mt-0.5">In stock & available to checkout</span>
          </div>
        </div>

        {/* Out of Stock Warning */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Out of Stock</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-sm border border-rose-200">
              <FaExclamationTriangle />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-800 tracking-tight">{metrics.outOfStock}</span>
            <span className="text-xs text-rose-600 block mt-0.5">
              {metrics.outOfStock > 0 ? 'Action needed: restock or replace' : 'All featured items in stock'}
            </span>
          </div>
        </div>

        {/* Average Value */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Average Price</span>
            <span className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs font-bold border border-neutral-200">
              £
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">£{metrics.avgPrice}</span>
            <span className="text-xs text-neutral-500 block mt-0.5">Avg basket price of showcase</span>
          </div>
        </div>
      </div>

      {/* ─── Standard E-Commerce Filter Tabs ─── */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs p-1.5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            All Featured ({metrics.total})
          </button>
          <button
            onClick={() => setActiveTab('in_stock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'in_stock'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            In Stock ({metrics.inStock})
          </button>
          <button
            onClick={() => setActiveTab('low_stock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'low_stock'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Low Stock &lt;10 ({metrics.lowStock})
          </button>
          <button
            onClick={() => setActiveTab('out_of_stock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'out_of_stock'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Out of Stock ({metrics.outOfStock})
          </button>
        </div>

        <span className="text-[11px] text-neutral-400 hidden sm:block pr-3">
          Showing {filteredFeaturedProducts.length} of {featuredProducts.length} items
        </span>
      </div>

      {/* ─── Search & Dimension Filters ─── */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search featured items..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 placeholder-neutral-400 bg-neutral-50/50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="All">All K-Beauty Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="rank">Sort: Sequence / Rank Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="stock-desc">Highest Stock First</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip if rows selected */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">
                {selectedProductIds.length} item{selectedProductIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkUnfeature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-2xs"
              >
                <FaTrash className="text-[10px]" />
                <span>Remove From Featured</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Merchandising Data Grid ─── */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
        {isFeaturedLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-500">Loading featured showcase...</p>
          </div>
        ) : filteredFeaturedProducts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3.5 text-xl border border-amber-200">
              <FaStar />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">No featured products found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
              {searchQuery || selectedBrand !== 'All' || selectedCategory !== 'All' || activeTab !== 'all'
                ? 'No featured items match your current filter criteria. Try resetting filters.'
                : 'Your homepage showcase is currently empty. Add products from the catalog to spotlight them.'}
            </p>
            <button
              onClick={() => {
                setModalSelectedIds([]);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-neutral-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition"
            >
              <FaPlus /> Add Products to Featured
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="w-10 px-4 py-3.5 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-neutral-400 hover:text-neutral-700 transition"
                      title="Select all"
                    >
                      {selectedProductIds.length === filteredFeaturedProducts.length && filteredFeaturedProducts.length > 0 ? (
                        <FaCheckSquare className="text-neutral-900 text-sm" />
                      ) : (
                        <FaSquare className="text-neutral-300 text-sm" />
                      )}
                    </button>
                  </th>
                  <th className="w-24 px-3 py-3.5">Sequence</th>
                  <th className="px-4 py-3.5">Product & SKU</th>
                  <th className="px-4 py-3.5">Brand / Vendor</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Inventory</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredFeaturedProducts.map((product, index) => {
                  const id = (product.handle || product._id) as string;
                  const isSelected = selectedProductIds.includes(id);
                  const stock = Number(product.stock || 0);

                  return (
                    <tr 
                      key={id}
                      className={`hover:bg-neutral-50/70 transition-colors group ${
                        isSelected ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(id)}
                          className="text-neutral-400 hover:text-neutral-700 transition"
                        >
                          {isSelected ? (
                            <FaCheckSquare className="text-neutral-900 text-sm" />
                          ) : (
                            <FaSquare className="text-neutral-300 text-sm" />
                          )}
                        </button>
                      </td>

                      {/* Rank & Move Order */}
                      <td className="w-24 px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                            #{index + 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveSequence(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition"
                              title="Move up in carousel"
                            >
                              <FaArrowUp size={8} />
                            </button>
                            <button
                              onClick={() => handleMoveSequence(index, 'down')}
                              disabled={index === featuredProducts.length - 1}
                              className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition"
                              title="Move down in carousel"
                            >
                              <FaArrowDown size={8} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 p-1">
                            <img
                              src={product.photo || FALLBACK_LOGO}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_LOGO;
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <Link
                              to={`/admin/products/${product.handle || product._id}`}
                              className="font-semibold text-xs text-neutral-900 hover:text-amber-800 transition block truncate"
                              title={product.name}
                            >
                              {product.name}
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-mono block mt-0.5 truncate">
                              SKU / Handle: {product.handle || product._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 whitespace-nowrap">
                          {product.vendor || 'Skin of Korea'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
                          {product.category || 'Skincare'}
                        </span>
                      </td>

                      {/* Inventory */}
                      <td className="px-4 py-3.5">
                        {stock === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Out of Stock
                          </span>
                        ) : stock < 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Low: {stock} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            In Stock ({stock})
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-900 text-xs">
                            £{Number(product.price || 0).toFixed(2)}
                          </span>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <span className="text-[10px] text-neutral-400 line-through block">
                              £{Number(product.compareAtPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live preview */}
                          <a
                            href={`/product/${product.handle || product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
                            title="Preview on live storefront"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/admin/products/${product.handle || product._id}`)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
                            title="Edit Product Details"
                          >
                            <FaEdit className="text-xs" />
                          </button>

                          {/* Unfeature */}
                          <button
                            onClick={() => handleRemoveFeatured(product)}
                            disabled={isFeaturing}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                            title="Remove from featured carousel"
                          >
                            <FaTrash className="text-[10px]" />
                            <span>Remove</span>
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
      </div>

      {/* ─── ADD PRODUCTS TO FEATURED MODAL (Shopify Style) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <FaStar className="text-amber-500 text-sm" /> Add Products to Featured Showcase
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select products from the Skin of Korea catalog to display prominently on your storefront homepage.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 border-b border-neutral-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search by title, brand, or SKU..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 placeholder-neutral-400 bg-neutral-50"
                  autoFocus
                />
              </div>

              <div>
                <select
                  value={modalBrand}
                  onChange={(e) => setModalBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50 focus:bg-white"
                >
                  <option value="All">All Brands</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 bg-neutral-50 focus:bg-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
              {isCatalogLoading ? (
                <div className="py-16 text-center text-xs text-neutral-400">
                  <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Searching catalog...
                </div>
              ) : !catalogData?.products || catalogData.products.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-400">
                  No products found matching "{modalSearch}".
                </div>
              ) : (
                catalogData.products.map((p) => {
                  const id = (p.handle || p._id) as string;
                  const isAlreadyFeatured = featuredProducts.some(fp => (fp.handle || fp._id) === id);
                  const isSelected = modalSelectedIds.includes(id);

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        if (isAlreadyFeatured) return;
                        setModalSelectedIds(prev => 
                          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                        isAlreadyFeatured
                          ? 'opacity-60 bg-neutral-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-50/60 border border-amber-200'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <div className="shrink-0 text-sm">
                          {isAlreadyFeatured ? (
                            <FaCheckCircle className="text-amber-500" title="Already in featured showcase" />
                          ) : isSelected ? (
                            <FaCheckSquare className="text-neutral-900" />
                          ) : (
                            <FaSquare className="text-neutral-300" />
                          )}
                        </div>

                        {/* Image */}
                        <div className="w-10 h-10 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 p-0.5 shrink-0">
                          <img
                            src={p.photo || FALLBACK_LOGO}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_LOGO;
                            }}
                          />
                        </div>

                        {/* Title & metadata */}
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-neutral-900 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500">
                            <span className="font-medium text-neutral-700">{p.vendor || 'Skin of Korea'}</span>
                            <span>•</span>
                            <span>{p.category || 'Skincare'}</span>
                            <span>•</span>
                            <span className="font-bold text-neutral-900">£{Number(p.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right badge */}
                      <div className="shrink-0 text-right">
                        {isAlreadyFeatured ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Already Featured
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-full border border-neutral-300">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <span className="text-xs text-neutral-600 font-medium">
                {modalSelectedIds.length} product{modalSelectedIds.length !== 1 ? 's' : ''} selected
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyModalSelection}
                  disabled={modalSelectedIds.length === 0 || isSubmittingBatch}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 transition shadow-xs"
                >
                  {isSubmittingBatch ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding to Showcase...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-xs" />
                      <span>Add Selected ({modalSelectedIds.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedProducts;
