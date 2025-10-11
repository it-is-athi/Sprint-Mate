import React from 'react';

const SilkBackground = () => {
  return (
    <div className="silk-background">
      <style>{`
        @keyframes silk-wave {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes silk-wave-2 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) rotate(-360deg) scale(1.2);
          }
        }

        @keyframes silk-wave-3 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(0.8);
          }
        }

        .silk-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000000;
          z-index: 0;
        }

        .silk-background::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150%;
          height: 150%;
          background: radial-gradient(
            ellipse at center,
            rgba(212, 165, 116, 0.4) 0%,
            rgba(212, 165, 116, 0.3) 20%,
            rgba(139, 90, 43, 0.2) 40%,
            transparent 70%
          );
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          animation: silk-wave 25s linear infinite;
          filter: blur(60px);
        }

        .silk-background::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140%;
          height: 140%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 193, 7, 0.3) 0%,
            rgba(212, 165, 116, 0.25) 25%,
            rgba(184, 134, 11, 0.15) 50%,
            transparent 70%
          );
          border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
          animation: silk-wave-2 30s linear infinite;
          filter: blur(80px);
        }

        .silk-layer-1,
        .silk-layer-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120%;
          height: 120%;
        }

        .silk-layer-1 {
          background: radial-gradient(
            circle at center,
            rgba(218, 165, 32, 0.25) 0%,
            rgba(212, 165, 116, 0.2) 30%,
            transparent 60%
          );
          border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%;
          animation: silk-wave-3 20s linear infinite;
          filter: blur(70px);
        }

        .silk-layer-2 {
          background: radial-gradient(
            ellipse at center,
            rgba(255, 215, 0, 0.2) 0%,
            rgba(218, 165, 32, 0.15) 35%,
            transparent 65%
          );
          border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%;
          animation: silk-wave 35s linear infinite reverse;
          filter: blur(90px);
        }
      `}</style>
      <div className="silk-layer-1"></div>
      <div className="silk-layer-2"></div>
    </div>
  );
};

export default SilkBackground;
