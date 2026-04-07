import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book } from '@phosphor-icons/react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#FF6B35] via-[#FFD54F] to-[#00E676] flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8 inline-block"
        >
          <div className="bg-white p-8 rounded-3xl border-4 border-[#1A237E] shadow-[12px_12px_0px_#1A237E]">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Book size={80} weight="bold" className="text-[#FF6B35]" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-black text-white mb-4 font-heading"
        >
          Sansthaein Aur Samvidhan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-white/90 mb-8 font-medium"
        >
          Master Indian Constitution through Gamified Learning
        </motion.p>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="bg-white/30 h-3 rounded-full border-2 border-white overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white font-bold mt-2">{progress}%</p>
        </div>
      </div>
    </div>
  );
}
