import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { LoginForm } from '../../components/Auth/LoginForm';
import { useAuthContext } from '../../context/AuthContext';

export function Login() {
  const { user, loading, signIn } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    // Redirect based on role
    const roleRedirects = {
      admin: '/dashboard',
      doctor: '/patients',
      receptionist: '/patients',
      triage_officer: '/triage',
      lab_technician: '/lab-tests',
      pharmacist: '/prescriptions',
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return <LoginForm onLogin={signIn} loading={loading} />;
}