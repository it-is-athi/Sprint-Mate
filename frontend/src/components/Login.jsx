import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Zap, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import Silk from './Silk';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (!showOtp) {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.requiresOtp || /not verified/i.test(res.data.message || '')) {
          setShowOtp(true);
        } else {
          await checkAuth();
          navigate('/dashboard');
        }
      } else {
        await api.post('/auth/verify-otp', { email, otp });
        await checkAuth();
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
      if (/not verified/i.test(err.response?.data?.message || '') && !showOtp) setShowOtp(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Silk Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Silk speed={5} scale={1} color="#F6A314" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* Login Form Content */}
      <div className="relative z-10 w-full max-w-md px-4">
      {/* Logo Section */}
      <div className="relative z-10 text-center mb-8">
        <div className="w-20 h-20 bg-gray-500/30 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-amber-500/50 hover:shadow-2xl group cursor-pointer">
          <Zap className="w-10 h-10 text-white transition-all duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
        </div>
        <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-2xl">Welcome Back</h1>
        <p className="text-gray-100 text-lg drop-shadow-lg">Sign in to continue your journey</p>
      </div>        <div className="relative bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-center text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!showOtp ? (
              <>
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                    Forgot Password?
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Verification Code</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 text-center text-xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">Enter the 6-digit code sent to your email</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>{showOtp ? 'Verifying...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{showOtp ? 'Verify Code' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {showOtp && (
              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="w-full text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                ← Back to Login
              </button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:text-gray-300 font-semibold transition-colors duration-200">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
