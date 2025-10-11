import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      {/* SprintMate Logo/Title */}
      <h1 className="text-white text-6xl font-bold mb-12">
        SprintMate
      </h1>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-white text-black font-semibold rounded-lg"
        >
          Login
        </button>
        
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-white text-black font-semibold rounded-lg"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
