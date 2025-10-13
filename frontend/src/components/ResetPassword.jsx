import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Zap, Shield, Lock } from 'lucide-react';
import Silk from './Silk';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Silk Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Silk speed={5} scale={1} color="#F6A314" noiseIntensity={1.5} rotation={0} />
      </div>
      {/* Main Content */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-500/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-amber-500/50 hover:shadow-2xl group cursor-pointer">
            <Zap className="w-10 h-10 text-white transition-all duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">Reset Password</h1>
          <p className="text-gray-100 text-base drop-shadow-lg">Enter the code and your new password</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8">
          {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-center text-sm">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-center text-sm">{successMsg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Verification Code</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 text-center text-xl tracking-widest disabled:opacity-50"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}