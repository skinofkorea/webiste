import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewProductMutation, useCategoriesQuery, useBrandsQuery } from '../../redux/api/product.api';
import { notify } from '../../utils/util';
import BackButton from '../common/BackBtn';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { 
  FaPlus, 
  FaTrash, 
  FaImage, 
  FaUpload, 
  FaStar, 
  FaEye, 
  FaTag, 
  FaLayerGroup,
  FaBoxes,
  FaTimes
} from 'react-icons/fa';

export interface ProductVariantItem {
  id: string | number;
  title: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  available: boolean;
  sku?: string;
  featured_image?: string;
}

const DEFAULT_BRANDS = [
  'Beauty of Joseon',
  'COSRX',
  'Anua',
  'SKIN1004',
  'Haruharu Wonder'
];

const DEFAULT_CATEGORIES = [
  'Cleanser',
  'Toner',
  'Moisturiser',
  'SPF',
  'Masks',
  'Eye Cream'
];

const SUGGESTED_TAGS = [
  'Bestseller',
  'Glass Skin',
  'Hydrating',
  'Viral TikTok',
  'SPF50+',
  'Centella',
  'Niacinamide',
  'Snail Mucin',
  'Sensitive Skin',
  'Vegan',
  'Free Gift'
];

const AdminAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { data: catData } = useCategoriesQuery();
  const { data: brandData } = useBrandsQuery();

  const categories = catData?.categories?.length ? catData.categories : DEFAULT_CATEGORIES;
  const brands = brandData?.brands?.length ? brandData.brands : DEFAULT_BRANDS;

  // Form states
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState(DEFAULT_BRANDS[0]);
  const [customVendor, setCustomVendor] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number | string>('15.00');
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('100');
  const [description, setDescription] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Tags
  const [tags, setTags] = useState<string[]>(['Bestseller']);
  const [tagInput, setTagInput] = useState('');

  // Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  const [createProduct, { isLoading }] = useNewProductMutation();

  // Cloudinary image upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file, 'skinofkorea/products');
      if (result && result.url) {
        setPhotoUrl(result.url);
        notify('Image uploaded successfully to Cloudinary!', 'success');
      } else {
        notify('Failed to upload image', 'error');
      }
    } catch (err: any) {
      notify(err?.message || 'Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Tag helper
  const addTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim();
    if (cleaned && !tags.includes(cleaned)) {
      setTags(prev => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Gallery image helpers
  const addGalleryImage = () => {
    const trimmed = newGalleryInput.trim();
    if (trimmed && !galleryUrls.includes(trimmed)) {
      setGalleryUrls(prev => [...prev, trimmed]);
      setNewGalleryInput('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Variant helpers
  const addVariantRow = () => {
    const newVariant: ProductVariantItem = {
      id: Date.now(),
      title: `Option ${variants.length + 1}`,
      price: Number(price || 15),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      stock: 50,
      available: true,
    };
    setVariants(prev => [...prev, newVariant]);
    setHasVariants(true);
  };

  const updateVariantRow = (index: number, field: keyof ProductVariantItem, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    if (variants.length <= 1) setHasVariants(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify('Please enter a product title', 'error');
      return;
    }

    const finalVendor = vendor === '__custom__' ? customVendor.trim() : vendor;
    if (!finalVendor) {
      notify('Please specify a brand or manufacturer', 'error');
      return;
    }

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    if (!finalCategory) {
      notify('Please specify a category', 'error');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      notify('Please provide a valid price in GBP', 'error');
      return;
    }

    const allImages = [
      ...(photoUrl ? [{ src: photoUrl }] : []),
      ...galleryUrls.map(url => ({ src: url }))
    ];

    const payload = {
      name: name.trim(),
      vendor: finalVendor,
      category: finalCategory,
      price: numericPrice,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock || 100),
      description: description.trim(),
      bodyHtml: bodyHtml.trim() || `<p>${description.trim()}</p>`,
      photo: photoUrl || (allImages[0]?.src || ''),
      images: allImages,
      tags,
      featured,
      isActive,
      variants: hasVariants ? variants : undefined,
    };

    try {
      const res = await createProduct({ productData: payload }).unwrap();
      notify(res.message || 'Product created successfully!', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to create product in catalog', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Add New Skincare Product</h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Create an authentic Korean skincare item for your live storefront catalog.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#111111] hover:bg-neutral-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition shadow-xs"
        >
          {isLoading ? 'Saving Product...' : 'Publish to Storefront'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <FaLayerGroup className="text-neutral-500 text-xs" /> Product Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. COSRX Advanced Snail 96 Mucin Power Essence (100ml)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 placeholder-neutral-400 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand / Vendor */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Brand (K-Beauty Vendor) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Brand...</option>
                </select>
                {vendor === '__custom__' && (
                  <input
                    type="text"
                    value={customVendor}
                    onChange={(e) => setCustomVendor(e.target.value)}
                    placeholder="Enter brand name..."
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 bg-white"
                  />
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Skincare Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Category...</option>
                </select>
                {category === '__custom__' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter category name..."
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 bg-white"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Short Description / Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of product benefits, active ingredients, and skin goals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 placeholder-neutral-400"
              />
            </div>

            {/* Body HTML */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Details (Benefits, Routine steps, How to use HTML)
              </label>
              <textarea
                rows={5}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="<p>Full product writeup with routine instructions...</p>"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-neutral-900 placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Inventory */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <FaBoxes className="text-neutral-500 text-xs" /> Pricing & Inventory (GBP £)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Sale Price (£ GBP) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Compare At / MSRP (£ GBP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-sm">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="Optional original price"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Initial Stock Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>
            </div>

            {/* Sizing & Packaging Variants */}
            <div className="pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Product Variants (Volume / Sizing)</h3>
                  <p className="text-[11px] text-neutral-500">Optional: 50ml, 100ml, 150ml, or shade options</p>
                </div>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition flex items-center gap-1.5"
                >
                  <FaPlus className="text-[10px]" /> Add Option / Size
                </button>
              </div>

              {hasVariants && variants.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="min-w-full divide-y divide-neutral-100 text-xs text-left">
                    <thead className="bg-neutral-50 text-[10px] font-semibold text-neutral-500 uppercase">
                      <tr>
                        <th className="px-3 py-2">Option Title (e.g. 100ml)</th>
                        <th className="px-3 py-2">Price (£)</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {variants.map((v, i) => (
                        <tr key={v.id}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={v.title}
                              onChange={(e) => updateVariantRow(i, 'title', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs w-full text-neutral-900"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">£</span>
                              <input
                                type="number"
                                step="0.01"
                                value={v.price}
                                onChange={(e) => updateVariantRow(i, 'price', Number(e.target.value))}
                                className="pl-5 pr-2 py-1.5 rounded-lg border border-neutral-200 text-xs w-28 text-neutral-900 font-semibold"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariantRow(i, 'stock', Number(e.target.value))}
                              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs w-20 text-neutral-900 font-semibold"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeVariantRow(i)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Images & Media */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <FaImage className="text-neutral-500 text-xs" /> Product Imagery
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Primary Product Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://cdn.shopify.com/... or https://res.cloudinary.com/..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 placeholder-neutral-400"
                />
                <label className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-4 py-2.5 rounded-xl text-xs transition border border-neutral-200 flex items-center gap-1.5 shrink-0">
                  <FaUpload className="text-xs" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {/* Additional gallery URLs */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Additional Gallery Photos
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newGalleryInput}
                  onChange={(e) => setNewGalleryInput(e.target.value)}
                  placeholder="Paste additional product image URL..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition shrink-0"
                >
                  Add Image
                </button>
              </div>

              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-50">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visibility, Tags & Live Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Status & Featured */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Publishing Options
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <div className="flex items-center gap-2.5">
                  <FaEye className={isActive ? 'text-emerald-600' : 'text-neutral-400'} />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Storefront Active</span>
                    <span className="text-[10px] text-neutral-500">Visible to customer shoppers</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-0 accent-neutral-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <div className="flex items-center gap-2.5">
                  <FaStar className={featured ? 'text-amber-500' : 'text-neutral-400'} />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Homepage Featured</span>
                    <span className="text-[10px] text-neutral-500">Showcase in Bestsellers slider</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 accent-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Card: Tags */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <FaTag className="text-neutral-500 text-xs" /> Tags & Highlights
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
              >
                Add
              </button>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-6">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-neutral-400 hover:text-neutral-700">
                    <FaTimes className="text-[9px]" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested Tags */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.filter(s => !tags.includes(s)).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => addTag(st)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 transition"
                  >
                    + {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Live Storefront Preview */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Live Customer Preview
            </h2>

            <div className="border border-neutral-200 rounded-2xl p-3 bg-neutral-50/50">
              <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-3 border border-neutral-200 relative">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs">
                    <FaImage size={24} className="mb-1" />
                    <span>Photo Preview</span>
                  </div>
                )}
                {featured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-400 text-neutral-900 shadow-xs flex items-center gap-1">
                    <FaStar size={8} /> Featured
                  </span>
                )}
              </div>

              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                {vendor === '__custom__' ? customVendor || 'Brand' : vendor}
              </span>
              <h3 className="font-bold text-neutral-900 text-xs mt-0.5 truncate">
                {name || 'Product Title'}
              </h3>
              <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                {description || 'Product description will appear here on the storefront product card.'}
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-900">
                    £{Number(price || 0).toFixed(2)}
                  </span>
                  {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                    <span className="text-xs text-neutral-400 line-through">
                      £{Number(compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {Number(stock || 100) > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
