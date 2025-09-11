import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Zap, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccessMsg('OTP sent to your email!');
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>
      {/* Main Content */}
      <div className="w-full max-w-md bg-black bg-opacity-40 backdrop-blur-md rounded-3xl border border-white border-opacity-20 shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Zap className="w-10 h-10 text-emerald-500 mb-2" />
          <h2 className="text-white text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-gray-400 text-sm text-center">Enter your email to receive an OTP for password reset.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && <div className="text-red-400 text-center font-semibold">{errorMsg}</div>}
          {successMsg && <div className="text-emerald-400 text-center font-semibold">{successMsg}</div>}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-emerald-400 font-medium transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}