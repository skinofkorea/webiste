import React from 'react';
import { WeightVariant } from '../../utils/weightVariants';

type Props = {
  variants: WeightVariant[];
  selectedVariantId?: string;
  onSelect: (id: string) => void;
};

const VariantSelector: React.FC<Props> = ({ variants, selectedVariantId, onSelect }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="my-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2.5">
      <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider">
        Select Pack Quantity / Weight:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {variants.map((variant) => {
          const isVariantOutOfStock = variant.inStock === false;
          const isSelected = selectedVariantId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => !isVariantOutOfStock && onSelect(variant.id)}
              disabled={isVariantOutOfStock}
              aria-pressed={isSelected}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                isVariantOutOfStock
                  ? 'border-neutral-200 bg-neutral-100 cursor-not-allowed opacity-50 text-neutral-400'
                  : isSelected
                    ? 'border-2 border-black bg-black text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-black'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className={`text-xs font-semibold ${isVariantOutOfStock ? 'text-neutral-400' : isSelected ? 'text-white' : 'text-[#111111]'}`}>
                  {variant.label || variant.pack || variant.name}
                </span>

                {isVariantOutOfStock ? (
                  <span className="text-[9px] font-medium text-neutral-400 mt-1">Out of Stock</span>
                ) : (
                  <>
                    <span className={`text-base font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-[#111111]'}`}>₹{variant.salePrice ?? variant.price ?? 0}</span>
                    {variant.mrp > (variant.salePrice ?? variant.price ?? 0) && (
                      <span className={`text-[10px] line-through ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        MRP ₹{variant.mrp}
                      </span>
                    )}
                    {variant.bulkPrice && (
                      <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Bulk: ₹{variant.bulkPrice} (MOQ {variant.bulkMOQ ?? '—'})
                      </span>
                    )}
                    {variant.pack && (
                      <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {variant.pack}
                      </span>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;
