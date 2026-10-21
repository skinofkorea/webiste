import React, { useEffect, useState } from 'react';
import { useAllProductsQuery, useFeatureProductMutation } from '../../redux/api/product.api';

interface AddFeaturedProductModalProps {
    closeModal: () => void;
    featuredProducts: any[];
    setFeaturedProducts: (products: any[]) => void;
}

const AddFeaturedProductModal: React.FC<AddFeaturedProductModalProps> = ({
    closeModal,
    featuredProducts,
    setFeaturedProducts,
}) => {
    const { data: allProductsData, isLoading: isAllProductsLoading } = useAllProductsQuery({ page: 1, limit: 10, sortBy: { id: '', desc: false } });
    const [featureProduct] = useFeatureProductMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (allProductsData && allProductsData.products) {
            const nonFeaturedProducts = allProductsData.products.filter(product => !product.featured);
            setFilteredProducts(nonFeaturedProducts);
        }
    }, [allProductsData]);

    const handleAddFeature = async (productId: string) => {
        try {
            await featureProduct({ productId }).unwrap();
            const updatedProduct = allProductsData.products.find(product => product._id === productId);
            if (updatedProduct) {
                setFeaturedProducts([...featuredProducts, { ...updatedProduct, featured: true }]);
                setFilteredProducts(filteredProducts.filter(product => product._id !== productId));
            }
        } catch (error) {
            console.error('Error updating featured status', error);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        const filtered = allProductsData.products.filter(product =>
            product.name.toLowerCase().includes(e.target.value.toLowerCase()) && !product.featured
        );
        setFilteredProducts(filtered);
    };

    if (isAllProductsLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-3xl overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Add Featured Product</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Spotlight items for the homepage showcase</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 focus:bg-white transition-all mb-4"
                    />

                    <div className="max-h-96 overflow-y-auto rounded-xl border border-neutral-200">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                <tr>
                                    <th className="py-3 px-4">Product</th>
                                    <th className="py-3 px-4">Category / Price</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-neutral-400 text-sm">
                                            No eligible products found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <tr key={product._id} className="hover:bg-neutral-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.photoUrl || (product.images && product.images[0]) || '/placeholder.png'}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-neutral-200"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-neutral-900 leading-snug">{product.name}</p>
                                                        <span className="text-[11px] font-mono text-neutral-400">ID: {product._id?.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-xs text-neutral-600 font-medium">{product.category || 'General'}</p>
                                                <p className="text-xs font-semibold text-neutral-900">₹{product.price}</p>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    className="bg-[#111111] hover:bg-[#E57A22] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                                    onClick={() => handleAddFeature(product._id)}
                                                >
                                                    Feature
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                    <button
                        className="px-5 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                        onClick={closeModal}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddFeaturedProductModal;

