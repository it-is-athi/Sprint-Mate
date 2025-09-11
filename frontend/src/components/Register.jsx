import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Zap, Eye, EyeOff, Lock, Shield, User } from 'lucide-react';

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
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">SprintMate</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-white">
          <button 
            onClick={() => navigate('/')}
            className="hover:text-emerald-400 transition-colors duration-200"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="hover:text-emerald-400 transition-colors duration-200"
          >
            About Us
          </button>
          <button className="hover:text-emerald-400 transition-colors duration-200">Register</button>
          <button 
            onClick={() => navigate('/contact')}
            className="hover:text-emerald-400 transition-colors duration-200"
          >
            Contact
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] px-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Register Form Card */}
          <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-3xl border border-white border-opacity-20 overflow-hidden shadow-2xl">
            <div className="px-8 pt-8 pb-6">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {errorMsg && (
                  <div className="mb-4 text-red-400 text-center font-semibold">{errorMsg}</div>
                )}

                {/* Name Field */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-200" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    disabled={showOtp || isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:bg-opacity-10 disabled:text-gray-400 text-white placeholder-gray-400 hover:bg-opacity-20"
                  />
                </div>

                {/* Email Field */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-200" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={showOtp || isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:bg-opacity-10 disabled:text-gray-400 text-white placeholder-gray-400 hover:bg-opacity-20"
                  />
                </div>

                {/* Password Field */}
                {!showOtp && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-200" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 hover:bg-opacity-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {/* OTP Field */}
                {showOtp && (
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-200" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest text-white placeholder-gray-400 hover:bg-opacity-20"
                      maxLength={6}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-lg tracking-wide"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{showOtp ? 'VERIFYING...' : 'SIGNING UP...'}</span>
                    </div>
                  ) : (
                    <span>{showOtp ? 'VERIFY OTP' : 'SIGN UP'}</span>
                  )}
                </button>

                {/* Back to Register */}
                {showOtp && (
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-gray-300 hover:text-white font-medium py-2 transition-colors duration-200"
                  >
                    ← Back to Register
                  </button>
                )}
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-white border-opacity-10">
              <div className="flex items-center justify-center space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="text-white hover:text-emerald-400 font-semibold transition-colors duration-200 text-sm tracking-wide"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => navigate('/help')}
                  className="text-white hover:text-emerald-400 font-semibold transition-colors duration-200 text-sm tracking-wide"
                >
                  NEED HELP?
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-gray-400 text-xs">
              <button 
                onClick={() => navigate('/about')}
                className="hover:text-white transition-colors duration-200"
              >
                About Us
              </button>
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-white transition-colors duration-200"
              >
                Terms Of Use
              </button>
            </div>
            <div className="mt-4 text-gray-500 text-xs">
              © 2019 SprintMate. All Rights Reserved | Design By W3layouts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}