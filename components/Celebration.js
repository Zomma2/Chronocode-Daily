import { useEffect, useState } from 'react';

export default function Celebration({ trigger, streakIncremented, questionsAnswered }) {
  const [particles, setParticles] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      
      // Generate particles for celebration
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.2,
        duration: 2 + Math.random() * 1,
      }));
      
      setParticles(newParticles);
      
      // Hide celebration after animation
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            animation: `fall ${particle.duration}s linear forwards`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
          }}
        />
      ))}

      {/* Center celebration message */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{
          animation: show ? 'bounce 0.6s ease-out' : 'none',
        }}
      >
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full shadow-2xl text-center">
          <div className="text-4xl font-bold">✨ Correct! ✨</div>
          <div className="text-lg mt-2">
            {streakIncremented && '🎉 Streak increased! Keep it up!'}
            {questionsAnswered % 4 === 0 && questionsAnswered > 0 && !streakIncremented && (
              <span>Questions today: {questionsAnswered}/4</span>
            )}
          </div>
        </div>
      </div>

      {/* Rainbow effect */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)`,
          animation: 'pulse 1s ease-out',
        }}
      />

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0% {
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
