'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

export default function Celebration({ trigger, streakIncremented, onComplete }) {
  const [show, setShow] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!trigger) {
      setShow(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setShow(true);
    fireConfetti();

    const timer = setTimeout(() => {
      setShow(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [trigger]);

  const fireConfetti = () => {
    if (typeof window === 'undefined') return;

    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 99999 };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      const particleCount = Math.max(10, 35 * (timeLeft / duration));

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
        })
      );

      confetti(
        Object.assign({}, defaults, {
          particleCount: particleCount * 0.4,
          origin: { x: 0.15, y: 0.5 },
          spread: 100,
          colors: ['#10b981', '#3b82f6', '#fbbf24'],
        })
      );

      confetti(
        Object.assign({}, defaults, {
          particleCount: particleCount * 0.4,
          origin: { x: 0.85, y: 0.5 },
          spread: 100,
          colors: ['#10b981', '#3b82f6', '#fbbf24'],
        })
      );
    }, 250);
  };

  if (!show) return null;

  return (
    <>
      {/* Glow backdrop */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '26rem',
          height: '26rem',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.1) 45%, transparent 70%)',
          zIndex: 99998,
          animation: 'celebration-glow 3s ease-out forwards',
        }}
      />

      {/* Center celebration message */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          animation: 'celebration-anim 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white px-9 py-5 rounded-full shadow-2xl border border-emerald-400/30 text-center whitespace-nowrap">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">Correct!</div>
          <div className="text-sm sm:text-base font-medium text-emerald-100 mt-1">
            {streakIncremented ? 'Streak increased!' : 'Great job!'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes celebration-anim {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 1;
          }
          25% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          85% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0;
          }
        }

        @keyframes celebration-glow {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.3);
          }
        }
      `}</style>
    </>
  );
}
