import React, { useState } from 'react';
import {
  FaBullhorn,
  FaCloudUploadAlt,
  FaEdit,
  FaEye,
  FaGift,
  FaImage,
  FaPlay,
  FaPlus,
  FaRedo,
  FaSlidersH,
  FaTrash,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaVideo
} from 'react-icons/fa';
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetAdminBannersQuery,
  useSeedDefaultBannersMutation,
  useToggleBannerMutation,
  useUpdateBannerMutation
} from '../../redux/api/banner.api';
import { BannerType, StoreBanner } from '../../types/api-types';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { notify } from '../../utils/util';
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

const BANNER_TYPES: { type: BannerType; label: string; icon: any; description: string }[] = [
  {
    type: 'hero',
    label: 'Hero Slides',
    icon: FaImage,
    description: 'Rotating full-width showcase carousel at top of homepage'
  },
  {
    type: 'festival_banner',
    label: 'Seasonal & Promos',
    icon: FaGift,
    description: 'High-impact seasonal promotion cards with discount coupons'
  },
  {
    type: 'showcase_banner',
    label: 'Brand Showcase',
    icon: FaSlidersH,
    description: 'Full-width visual brand showcase near page footer'
  },
  {
    type: 'story_video',
    label: 'UGC & Reels',
    icon: FaVideo,
    description: 'YouTube Shorts and vertical reels displayed in the video carousel'
  },
  {
    type: 'announcement',
    label: 'Announcement Ticker',
    icon: FaBullhorn,
    description: 'Top scrolling marquee banner for shipping & store alerts'
  },
];

const emptyBanner: Partial<StoreBanner> = {
  type: 'hero',
  title: '',
  subtitle: '',
  tagline: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '/products',
  buttonText: 'Explore Now',
  badge: '',
  theme: 'dark',
  backgroundColor: '#111111',
  textColor: '#FFFFFF',
  displayOrder: 1,
  isActive: true,
};

const AdminBanners: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<StoreBanner>>(emptyBanner);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const { data, isLoading, refetch } = useGetAdminBannersQuery(
    selectedTypeFilter === 'all' ? undefined : selectedTypeFilter
  );

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [toggleBanner] = useToggleBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [seedDefaults, { isLoading: isSeeding }] = useSeedDefaultBannersMutation();

  const banners = data?.banners || [];

  const handleOpenAddModal = (presetType: BannerType = 'hero') => {
    setEditingBanner({
      ...emptyBanner,
      type: presetType,
      displayOrder: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: StoreBanner) => {
    setEditingBanner({ ...banner });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(emptyBanner);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isMobile) setIsUploadingMobile(true);
    else setIsUploading(true);

    try {
      const res = await uploadToCloudinary(file, 'skinofkorea/banners');
      if (isMobile) {
        setEditingBanner((prev) => ({ ...prev, mobileImageUrl: res.url }));
      } else {
        setEditingBanner((prev) => ({ ...prev, imageUrl: res.url }));
      }
      notify('Image uploaded to Cloudinary successfully!', 'success');
    } catch (err: any) {
      notify(err.message || 'Image upload failed', 'error');
    } finally {
      if (isMobile) setIsUploadingMobile(false);
      else setIsUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner.title?.trim()) {
      notify('Please enter a banner title', 'error');
      return;
    }
    if (editingBanner.type !== 'announcement' && editingBanner.type !== 'story_video' && !editingBanner.imageUrl?.trim()) {
      notify('Please upload or provide an image URL', 'error');
      return;
    }
    if (editingBanner.type === 'story_video' && !editingBanner.linkUrl?.trim()) {
      notify('Please enter a YouTube video URL or ID', 'error');
      return;
    }

    const payload = { ...editingBanner };
    if (editingBanner.type === 'story_video') {
      const ytid = getYouTubeId(editingBanner.linkUrl || '');
      payload.linkUrl = ytid;
      if (!payload.imageUrl) {
        payload.imageUrl = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
      }
    }

    try {
      if (editingBanner.id && !editingBanner.id.startsWith('banner_')) {
        await updateBanner({ id: editingBanner.id, banner: payload }).unwrap();
        notify('Banner campaign updated successfully!', 'success');
      } else {
        await createBanner(payload).unwrap();
        notify('New campaign banner created!', 'success');
      }
      handleCloseModal();
      refetch();
    } catch (err: any) {
      notify(err?.data?.message || 'Failed to save banner', 'error');
    }
  };

  const handleToggleStatus = async (banner: StoreBanner) => {
    try {
      await toggleBanner(banner.id).unwrap();
      notify(`Campaign "${banner.title}" status toggled`, 'success');
      refetch();
    } catch (err) {
      notify('Failed to toggle status', 'error');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBanner(id).unwrap();
      notify('Banner removed successfully', 'success');
      refetch();
    } catch (err) {
      notify('Failed to delete banner', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Reset all campaigns to curated default Skin of Korea templates?')) return;
    try {
      await seedDefaults().unwrap();
      notify('Default campaign templates restored!', 'success');
      refetch();
    } catch (err) {
      notify('Failed to seed defaults', 'error');
    }
  };

  const filteredBanners = banners.filter((b) => {
    if (selectedTypeFilter === 'all') return true;
    return b.type === selectedTypeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-[#111111] text-white p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/10">
              STOREFRONT CUSTOMIZER
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Banners & Seasonal Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Control hero carousels, seasonal promotional cards, brand showcases, and top alert tickers instantly without altering code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenAddModal('hero')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#111111] text-xs font-bold tracking-wide transition shadow-sm hover:scale-105"
            >
              <FaPlus />
              <span>Create Campaign</span>
            </button>
            <button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700 transition"
              title="Restore standard Skin of Korea templates"
            >
              <FaRedo className={isSeeding ? 'animate-spin' : ''} />
              <span>Reset Defaults</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700 transition"
            >
              <FaEye />
              <span>Preview Store</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedTypeFilter === 'all'
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
        >
          All ({banners.length})
        </button>
        {BANNER_TYPES.map((t) => {
          const count = banners.filter((b) => b.type === t.type).length;
          const Icon = t.icon;
          const isActiveTab = selectedTypeFilter === t.type;
          return (
            <button
              key={t.type}
              onClick={() => setSelectedTypeFilter(t.type)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${isActiveTab
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
            >
              <Icon className="text-xs" />
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActiveTab ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Campaign Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-neutral-400 text-sm">
          Loading storefront campaigns...
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
            <FaImage size={24} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No campaigns found in this view</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You can create a new campaign or click "Reset Defaults" to restore curated store banners.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenAddModal('hero')}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#E57A22] transition"
            >
              Create Banner
            </button>
            <button
              onClick={handleSeedDefaults}
              className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition"
            >
              Seed Defaults
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => {
            const isAnnouncement = banner.type === 'announcement';

            return (
              <div
                key={banner.id}
                className={`bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${!banner.isActive ? 'opacity-70 grayscale-[20%]' : ''
                  }`}
              >
                <div>
                  {/* Visual Header / Image Preview */}
                  {isAnnouncement ? (
                    <div className="bg-[#111111] text-white p-6 min-h-[140px] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#E57A22] font-semibold flex items-center gap-1.5">
                          <FaBullhorn /> Top Ticker
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          #{banner.displayOrder}
                        </span>
                      </div>
                      <p className="text-sm font-semibold tracking-wide text-neutral-100 line-clamp-2">
                        {banner.title}
                      </p>
                    </div>
                  ) : banner.type === 'story_video' ? (
                    <div className="relative aspect-[9/16] max-h-60 bg-neutral-900 mx-auto overflow-hidden rounded-2xl group my-3 border border-neutral-200 shadow-xs">
                      <img
                        src={banner.imageUrl || `https://img.youtube.com/vi/${getYouTubeId(banner.linkUrl || '')}/hqdefault.jpg`}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <FaPlay size={12} className="ml-0.5 text-[#E57A22]" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <FaVideo size={10} /> UGCReel
                        </span>
                        <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                          #{banner.displayOrder}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <h4 className="font-bold text-xs leading-snug drop-shadow line-clamp-1">
                          {banner.title}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden group">
                      <img
                        src={banner.imageUrl || '/placeholder.png'}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 uppercase tracking-wider">
                          {banner.type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                          #{banner.displayOrder}
                        </span>
                      </div>

                      {/* Bottom Banner Title */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        {banner.badge && (
                          <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E57A22] text-white mb-1 tracking-wider">
                            {banner.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-sm leading-snug drop-shadow line-clamp-1">
                          {banner.title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {!isAnnouncement && (
                      <>
                        <h4 className="font-bold text-neutral-900 text-sm leading-snug">
                          {banner.title}
                        </h4>
                        {banner.subtitle && (
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {banner.subtitle}
                          </p>
                        )}
                      </>
                    )}

                    {banner.linkUrl && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono truncate">
                        <span className="text-neutral-500 font-semibold">Link:</span>
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-700 hover:text-black hover:underline truncate"
                        >
                          {banner.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="flex items-center gap-1.5 text-xs font-semibold transition"
                      title={banner.isActive ? 'Disable Campaign' : 'Enable Campaign'}
                    >
                      {banner.isActive ? (
                        <>
                          <FaToggleOn className="text-emerald-500 text-lg" />
                          <span className="text-emerald-700 text-[11px] font-bold">Active</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="text-neutral-400 text-lg" />
                          <span className="text-neutral-500 text-[11px]">Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 transition"
                      title="Edit Campaign"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id, banner.title)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Campaign"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-hidden"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed at Top */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  {editingBanner.id && !editingBanner.id.startsWith('banner_')
                    ? 'Edit Campaign Banner'
                    : 'Create New Campaign Banner'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Directly manageable storefront element for Skin of Korea
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition"
                title="Close"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Form - Scrollable Body */}
            <form onSubmit={handleSaveBanner} className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:thin]">
                {/* Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Campaign Area & Placement
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BANNER_TYPES.map((t) => {
                      const isSelected = editingBanner.type === t.type;
                      const Icon = t.icon;
                      return (
                        <button
                          type="button"
                          key={t.type}
                          onClick={() => setEditingBanner((prev) => ({ ...prev, type: t.type }))}
                          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          <Icon className="text-sm" />
                          <div>
                            <p className="text-xs font-bold leading-tight">{t.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Story Video Input (Dedicated YouTube section) */}
                {editingBanner.type === 'story_video' && (
                  <div className="space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        YouTube Video / Shorts Link or Video ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. https://www.youtube.com/shorts/aN2sDNVf-Js or aN2sDNVf-Js"
                        value={editingBanner.linkUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const ytid = getYouTubeId(val);
                          setEditingBanner((prev) => ({
                            ...prev,
                            linkUrl: val,
                            imageUrl: ytid ? `https://img.youtube.com/vi/${ytid}/hqdefault.jpg` : prev.imageUrl,
                          }));
                        }}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition font-mono"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Paste any YouTube Shorts URL or 11-character video ID. Video ID will be extracted automatically.
                      </p>
                    </div>

                    {/* Live Video Preview in Modal */}
                    {editingBanner.linkUrl && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 text-center">
                          Live Embedded Player Preview
                        </label>
                        <div className="aspect-[9/16] w-44 mx-auto rounded-2xl overflow-hidden bg-black border border-neutral-300 shadow-md">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(editingBanner.linkUrl)}?autoplay=0&controls=1`}
                            title="Video Preview"
                            className="w-full h-full border-0"
                            allow="encrypted-media"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Image Upload Area */}
                {editingBanner.type !== 'announcement' && editingBanner.type !== 'story_video' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        Desktop Banner Image
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Image Preview */}
                        <div className="w-full sm:w-48 h-28 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                          {editingBanner.imageUrl ? (
                            <img
                              src={editingBanner.imageUrl}
                              alt="Banner Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-3 text-neutral-400">
                              <FaImage size={24} className="mx-auto mb-1" />
                              <span className="text-[10px]">No image uploaded</span>
                            </div>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                              Uploading...
                            </div>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-2 w-full">
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#1f5133] text-white text-xs font-semibold cursor-pointer transition shadow-xs">
                            <FaCloudUploadAlt />
                            <span>Upload Banner Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, false)}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[11px] text-neutral-400">
                            Recommended: 1920x800px (Hero) or 1600x600px (Promotions).
                          </p>
                          <input
                            type="text"
                            placeholder="Or paste image URL directly..."
                            value={editingBanner.imageUrl || ''}
                            onChange={(e) =>
                              setEditingBanner((prev) => ({ ...prev, imageUrl: e.target.value }))
                            }
                            className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Optional Mobile Image */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Mobile Banner Image (Optional)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Mobile optimized image URL (optional)..."
                          value={editingBanner.mobileImageUrl || ''}
                          onChange={(e) =>
                            setEditingBanner((prev) => ({ ...prev, mobileImageUrl: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
                        />
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold cursor-pointer transition">
                          <FaCloudUploadAlt />
                          <span>{isUploadingMobile ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Campaign Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ✨ Glass Skin Radiance: Curated Autumn Essentials"
                      value={editingBanner.title || ''}
                      onChange={(e) => setEditingBanner((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Subtitle / Promotional Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Deep hydration with COSRX Snail Mucin, Anua Heartleaf, and Beauty of Joseon Relief Sun. Use coupon GLOW15 for 15% off!"
                      value={editingBanner.subtitle || ''}
                      onChange={(e) => setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                    />
                  </div>

                  {editingBanner.type !== 'story_video' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Badge Text (e.g. BESTSELLER, CODE: GLOW15)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. K-BEAUTY SPECIAL"
                          value={editingBanner.badge || ''}
                          onChange={(e) => setEditingBanner((prev) => ({ ...prev, badge: e.target.value }))}
                          className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Tagline / Sub-note
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CODE: GLOW15 • UP TO 15% OFF"
                          value={editingBanner.tagline || ''}
                          onChange={(e) => setEditingBanner((prev) => ({ ...prev, tagline: e.target.value }))}
                          className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Destination Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. /products or /products?category=Serums"
                          value={editingBanner.linkUrl || ''}
                          onChange={(e) => setEditingBanner((prev) => ({ ...prev, linkUrl: e.target.value }))}
                          className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Button CTA Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shop K-Beauty Now"
                          value={editingBanner.buttonText || ''}
                          onChange={(e) => setEditingBanner((prev) => ({ ...prev, buttonText: e.target.value }))}
                          className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Display Order (Rank)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingBanner.displayOrder || 1}
                      onChange={(e) =>
                        setEditingBanner((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 1 }))
                      }
                      className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingBanner.isActive !== false}
                        onChange={(e) =>
                          setEditingBanner((prev) => ({ ...prev, isActive: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <span className="text-xs font-bold text-neutral-800">
                      Campaign is Active & Visible
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Buttons - Fixed at Bottom */}
              <div className="p-4 px-6 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-[#1f5133] text-white text-xs font-bold transition shadow-sm"
                >
                  {isCreating || isUpdating ? 'Saving Campaign...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
