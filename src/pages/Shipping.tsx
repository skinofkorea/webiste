import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingInfo } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { notify } from '../utils/util';
import BackButton from '../components/common/BackBtn';
import { FaTruck, FaShieldAlt } from 'react-icons/fa';
import { usePageSEO } from '../hooks/usePageSEO';

const Shipping: React.FC = () => {
    usePageSEO({
        title: 'Delivery Address | Skin of Korea',
        description: 'Enter your delivery address for your Skin of Korea order.',
        canonical: '/shipping',
        noIndex: true,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.user);
    const { shippingInfo, cartItems } = useSelector((state: RootState) => state.cart);
    const supportedCountries = ['United Kingdom', 'Isle of Man', 'Jersey', 'Guernsey'];
    const hasSupportedSavedAddress = supportedCountries.includes(shippingInfo.country);

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 || cartItems.some((item) => (item.currency || 'INR') !== 'GBP')) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const [name, setName] = useState(shippingInfo.name || user?.name || '');
    const [email, setEmail] = useState(shippingInfo.email || user?.email || '');
    const [address, setAddress] = useState(hasSupportedSavedAddress ? shippingInfo.address || '' : '');
    const [landmark, setLandmark] = useState(hasSupportedSavedAddress ? shippingInfo.landmark || '' : '');
    const [city, setCity] = useState(hasSupportedSavedAddress ? shippingInfo.city || '' : '');
    const [state, setState] = useState(hasSupportedSavedAddress ? shippingInfo.state || '' : '');
    const [country, setCountry] = useState(hasSupportedSavedAddress ? shippingInfo.country : 'United Kingdom');
    const [pinCode, setPinCode] = useState(hasSupportedSavedAddress ? shippingInfo.pinCode || '' : '');
    const [phone, setPhone] = useState(shippingInfo.phone || '');

    const latitude = shippingInfo.latitude;
    const longitude = shippingInfo.longitude;

    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName || !email || !phone || !address || !city || !pinCode || !country) {
            notify('Please fill all required fields', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            notify('Please enter a valid email address', 'error');
            return;
        }
        if (!/^\+?[\d\s()-]{10,20}$/.test(phone.trim())) {
            notify('Please enter a valid phone number', 'error');
            return;
        }
        const normalizedPostcode = pinCode.trim().toUpperCase();
        if (!/^(GIR 0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/.test(normalizedPostcode)) {
            notify('Please enter a valid UK postcode', 'error');
            return;
        }

        dispatch(saveShippingInfo({
            name: trimmedName,
            email,
            address,
            landmark,
            city,
            state,
            country,
            pinCode: normalizedPostcode,
            phone,
            couponCode: shippingInfo.couponCode,
            latitude,
            longitude,
            deliveryType: 'nearest_landmark',
        }));

        navigate('/checkout');
    };

    const inputClass = "w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-400";
    const labelClass = "block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5";

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <BackButton />

                {/* Page Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-[#111111]">
                        Delivery Address
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                        Enter your shipping details for order delivery
                    </p>
                </div>

                {/* Main Form Box */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">

                    {/* Standard E-Commerce Address Form */}
                    <form onSubmit={submitHandler} className="space-y-4">
                        {/* Name & Email Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="Order confirmation email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone / WhatsApp Number */}
                        <div>
                            <label className={labelClass}>Phone number <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={inputClass}
                                placeholder="e.g. 07123 456789"
                                required
                            />
                        </div>

                        {/* Flat / House No. & Street Address */}
                        <div>
                            <label className={labelClass}>
                                Flat, House No., Building & Street <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={inputClass}
                                placeholder="House number and street"
                                required
                            />
                        </div>

                        {/* Landmark Field */}
                        <div>
                            <label className={labelClass}>Landmark (Optional)</label>
                            <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                className={inputClass}
                                placeholder="Optional delivery instructions"
                            />
                        </div>

                        {/* City, State & Pincode Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>City <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className={inputClass}
                                    placeholder="Town or city"
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>County / region</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className={inputClass}
                                    placeholder="County (optional)"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Postcode <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                                    className={inputClass}
                                    placeholder="e.g. S9 1EP"
                                    maxLength={8}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Country <span className="text-red-500">*</span></label>
                            <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} required>
                                {supportedCountries.map((supportedCountry) => <option key={supportedCountry}>{supportedCountry}</option>)}
                            </select>
                        </div>

                        {/* Security / Delivery Trust Info */}
                        <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-200">
                            <span className="flex items-center gap-1.5 text-neutral-800 font-medium">
                                <FaTruck /> Tracked UK delivery
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                <FaShieldAlt /> Safe Checkout
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-lg uppercase tracking-wider transition-colors shadow-xs text-xs mt-4 flex items-center justify-center gap-2"
                        >
                            <span>Continue to payment ➔</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
