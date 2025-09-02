import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onNeedPasswordReset: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onNeedPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        onNeedPasswordReset(email);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent a password reset code to <span className="font-medium">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">Enter your email to receive a reset code</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending Code...' : 'Send Reset Code'}
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;