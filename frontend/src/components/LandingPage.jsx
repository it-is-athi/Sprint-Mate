import React from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from './Particles';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Particles background (absolute) */}
      <Particles
        particleCount={250}
        particleSpread={12}
        speed={0.06}
        particleColors={["#ffffff"]}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        alphaParticles={false}
        particleBaseSize={60}
        sizeRandomness={0.8}
        cameraDistance={18}
      />

      {/* Foreground content */}
      <div className="relative z-10 text-center">
        {/* SprintMate Logo/Title */}
        <h1 className="text-white text-6xl font-bold mb-12">
          SprintMate
        </h1>

        {/* Buttons */}
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full shadow-lg"
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-transparent border border-white/30 text-white font-semibold rounded-full"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
