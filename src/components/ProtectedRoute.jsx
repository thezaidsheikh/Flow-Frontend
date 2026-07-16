import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
