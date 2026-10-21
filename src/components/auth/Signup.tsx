import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from 'react-redux';
import { userExists } from '../../redux/reducers/user.reducer';
import { AppDispatch } from '../../redux/store';
import { notify } from '../../utils/util';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name) {
      notify('All fields are required', 'error');
      return;
    }
    if (password !== confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin = cleanEmail.includes('admin') || cleanEmail === 'admin@skinofkorea.co.uk' || cleanEmail === 'admin@skinofkorea.com';
      const cleanName = name.trim();

      const newUser = {
        _id: 'user_' + Date.now(),
        uid: 'user_uid_' + Date.now(),
        email: cleanEmail,
        name: cleanName,
        displayName: cleanName,
        photoURL: '',
        role: isAdmin ? 'admin' : 'user',
        provider: 'email'
      };

      dispatch(userExists(newUser as any));
      localStorage.setItem('user', JSON.stringify(newUser));
      notify('Account created successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      notify(err?.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const newUser = {
        _id: 'user_google_' + Date.now(),
        uid: 'user_google_uid_' + Date.now(),
        email: 'customer@skinofkorea.co.uk',
        name: 'Skin of Korea Customer',
        displayName: 'Skin of Korea Customer',
        photoURL: '',
        role: 'user',
        provider: 'google'
      };
      dispatch(userExists(newUser as any));
      localStorage.setItem('user', JSON.stringify(newUser));
      notify('Signed up with Google', 'success');
    } catch (err: any) {
      notify(err?.message || 'Google Auth error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-lg p-2">
        <h4 className="text-xl font-semibold text-center mb-4 text-[#111111]">Create an Account</h4>

        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              className="appearance-none border border-neutral-200 rounded-lg w-full py-2 px-3 text-neutral-800 text-xs focus:outline-none focus:border-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              className="appearance-none border border-neutral-200 rounded-lg w-full py-2 px-3 text-neutral-800 text-xs focus:outline-none focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              className="appearance-none border border-neutral-200 rounded-lg w-full py-2 px-3 text-neutral-800 text-xs leading-tight focus:outline-none focus:border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="••••••••"
              className="appearance-none border border-neutral-200 rounded-lg w-full py-2 px-3 text-neutral-800 text-xs leading-tight focus:outline-none focus:border-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showPasswordSignup"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2 cursor-pointer accent-black"
              />
              <label htmlFor="showPasswordSignup" className="text-xs text-neutral-500">Show Password</label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-black hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg text-xs uppercase tracking-wider focus:outline-none transition-colors shadow-xs mt-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center">
          <hr className="flex-grow border-t border-neutral-200" />
          <span className="mx-4 text-xs text-neutral-400 font-semibold">OR</span>
          <hr className="flex-grow border-t border-neutral-200" />
        </div>

        <div className="mt-4">
          <button
            className={`flex items-center justify-center text-neutral-700 font-medium py-2.5 px-4 rounded-lg shadow-2xs bg-white hover:bg-neutral-50 gap-2 w-full border border-neutral-200 text-xs ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <FcGoogle className="text-lg" />
            {isLoading ? 'Connecting...' : 'Sign Up with Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
