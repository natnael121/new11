import React from 'react';
import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export function Unauthorized() {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleReturnToLogin = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator.
          </p>
          <button
            onClick={handleReturnToLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}