import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Zap, Eye, EyeOff, Lock, Shield, User, ArrowRight } from 'lucide-react';
import Silk from './Silk';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        await api.post('/auth/register', { name, email, password });
        setShowOtp(true);
      } else {
        await api.post('/auth/verify-otp', { email, otp });
        await checkAuth(); // Fetch user data after OTP verification
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Silk Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Silk speed={5} scale={1} color="#F6A314" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-500/30 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-amber-500/50 hover:shadow-2xl group cursor-pointer">
              <Zap className="w-10 h-10 text-white transition-all duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
            </div>
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-2xl">Create Account</h1>
            <p className="text-gray-100 text-lg drop-shadow-lg">Start your journey today</p>
          </div>

          {/* Register Form Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="px-8 pt-8 pb-6">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-center text-sm">{errorMsg}</div>
                )}

                {!showOtp ? (
                  <>
                    {/* Name Field */}
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Email Address</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          required
                          disabled={isLoading}
                          className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
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
                        placeholder="Enter 6-digit code"
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 text-center text-xl tracking-widest disabled:opacity-50"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>{showOtp ? 'Verifying...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{showOtp ? 'Verify Code' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Back to Register */}
                {showOtp && (
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    ← Back to Register
                  </button>
                )}
              </form>

              {/* Login Link */}
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white hover:text-gray-300 font-semibold transition-colors duration-200">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}