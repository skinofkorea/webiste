import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface BackButtonProps {
  /** Explicit fallback route if there is no previous history entry (default: '/') */
  fallback?: string;
}

/**
 * Smart back button.
 *
 * Problem with plain navigate(-1):
 *   When the user arrives from an external URL (e.g. bank payment gateway redirect),
 *   the React history stack is empty. navigate(-1) then pops the browser's native
 *   history and lands on whatever was open before the app — often localhost or a
 *   blank tab.
 *
 * Fix:
 *   We track whether the current page was reached by navigating *inside* the app
 *   (React Router sets history.state on every push/replace). If the state is absent,
 *   we know there's no safe entry to go back to and we navigate to `fallback` instead.
 */
const BackButton: React.FC<BackButtonProps> = ({ fallback = '/' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // history.state is set by React Router on every in-app navigation.
    // If it contains the React Router "key", we have a real previous entry.
    const hasHistory =
      window.history.state !== null &&
      (window.history.state?.key !== undefined || window.history.state?.idx > 0);

    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none my-4 transition-colors duration-300"
    >
      <FaArrowLeft className="mr-2" />
      Back
    </button>
  );
};

export default BackButton;

