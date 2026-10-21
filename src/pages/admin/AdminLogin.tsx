import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { notify } from '../../utils/util';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      notify('Please enter email and password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and admin data
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        
        notify('Login successful!', 'success');
        navigate('/admin/dashboard');
      } else {
        notify(data.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      notify('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#111111] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm border border-neutral-800">
            <FaLock className="text-white text-2xl" />
          </div>
          <img 
            src="/images/skin-of-korea-logo.png" 
            alt="Skin of Korea" 
            className="h-10 w-auto mx-auto mb-3 object-contain" 
          />
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Admin Console</h1>
          <p className="text-xs text-neutral-500 mt-1">Skin of Korea Management Console</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaEnvelope className="text-neutral-400 text-sm" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none transition text-sm text-neutral-900 bg-neutral-50 focus:bg-white"
                  placeholder="admin@skinofkorea.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaLock className="text-neutral-400 text-sm" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none transition text-sm text-neutral-900 bg-neutral-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition shadow-sm ${
                isLoading
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-[#111111] hover:bg-neutral-800 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
            <p className="text-xs text-neutral-600 text-center flex items-center justify-center gap-1.5">
              <FaLock className="text-neutral-400 text-[10px]" />
              Secure administrative access for Skin of Korea staff only.
            </p>
          </div>
        </div>

        {/* Back to Website */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-neutral-500 hover:text-neutral-900 transition font-medium"
          >
            ← Return to storefront
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
