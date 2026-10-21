import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FilterOptionsProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    minPrice?: number | undefined;
    setMinPrice?: (price: number) => void;
    maxPrice?: number | undefined;
    setMaxPrice?: (price: number) => void;
    sort: 'asc' | 'desc' | 'relevance';
    setSort: (sort: 'asc' | 'desc' | 'relevance') => void;
    clearFilters: () => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    sort,
    setSort,
    clearFilters,
}) => {
    const [showCategories, setShowCategories] = useState(true);

    return (
        <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-5 shadow-xs">
            {/* Sort options */}
            <div>
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                    Sort By
                </label>
                <select
                    className="w-full px-3 py-2 text-xs font-sans font-medium text-neutral-800 bg-[#FAFAFA] border border-neutral-200 focus:outline-none focus:border-black rounded-lg"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | 'relevance')}
                >
                    <option value="relevance">Featured & Relevant</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                </select>
            </div>

            {/* Category filter */}
            <div>
                <div 
                    className="flex items-center justify-between cursor-pointer py-1" 
                    onClick={() => setShowCategories(!showCategories)}
                >
                    <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                        Categories
                    </h3>
                    {showCategories ? <FaChevronUp className="h-3 w-3 text-neutral-500" /> : <FaChevronDown className="h-3 w-3 text-neutral-500" />}
                </div>

                {showCategories && (
                    <ul className="mt-2 space-y-1">
                        <li
                            className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                selectedCategory === ''
                                    ? 'bg-black text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                            }`}
                            onClick={() => setSelectedCategory('')}
                        >
                            All Categories
                        </li>
                        {categories.map((category) => (
                            <li
                                key={category}
                                className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-black text-white'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                                }`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Clear filters button */}
            <button
                className="w-full bg-[#FAFAFA] text-neutral-800 border border-neutral-200 py-2 rounded-lg text-xs font-medium hover:bg-black hover:text-white transition-colors duration-200"
                onClick={clearFilters}
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterOptions;
