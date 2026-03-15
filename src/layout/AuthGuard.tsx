import { Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function AuthGuard() {
  const { isAuthenticated, isAuthLoading } = useAppContext();

  // Optionally, you might want a small loading state here if validation is pending
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the primary external login platform
    window.location.href = 'https://link-gps-frontend.vercel.app/login';
    return null;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}
