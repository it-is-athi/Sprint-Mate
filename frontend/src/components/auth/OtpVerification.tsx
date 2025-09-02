import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, otp);
    } catch (error: any) {
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;