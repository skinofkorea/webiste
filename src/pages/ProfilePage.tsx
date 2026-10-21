import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { userNotExists } from '../redux/reducers/user.reducer';
import { RootState } from '../redux/store';
import { notify } from '../utils/util';
import { supabase } from '../supabaseConfig';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = async () => {
    localStorage.removeItem('user');
    await supabase.auth.signOut();
    dispatch(userNotExists());
    notify('Logged out successfully', 'info');
  };

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f6f1e7] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-md mb-4">
        <BackButton />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#ede3cf] max-w-md w-full text-center">
        {user ? (
          <div>
            {/* Avatar Circle with Initial or Photo */}
            <div className="flex justify-center mb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name || 'User Profile'}
                  className="h-20 w-20 rounded-full object-cover shadow-xs border border-neutral-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center shadow-xs">
                  {getInitial(user.name)}
                </div>
              )}
            </div>

            {/* User Info */}
            <h1 className="text-xl font-sans font-semibold text-[#111111] mb-1">
              {user.name || 'URVA Customer'}
            </h1>
            <p className="text-neutral-500 text-xs mb-6 font-normal">{user.email}</p>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <Link
                to="/my-orders"
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                📦 View My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <p className="text-neutral-500 text-xs mb-4">You are not logged in.</p>
            <Link
              to="/auth"
              className="inline-block bg-black text-white font-medium py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
