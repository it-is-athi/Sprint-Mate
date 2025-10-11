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
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Welcome Back</h1>
          <p className="text-white/60 text-lg">Sign in to continue your journey</p>
        </div>

        <div className="relative bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showOtp ? (
              <>
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-amber-300 hover:text-amber-200 transition-colors duration-200 font-medium">
                    Forgot Password?
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">Verification Code</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/70" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all duration-300 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
                <p className="text-white/50 text-xs mt-2 text-center">Enter the 6-digit code sent to your email</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
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
                className="w-full text-white/70 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                 Back to Login
              </button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors duration-200">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
