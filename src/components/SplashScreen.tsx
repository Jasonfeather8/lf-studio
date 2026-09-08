import React from 'react';
import { motion } from 'motion/react';
import logo from '../assets/logo.png';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center bg-dots">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-48 h-48 mb-8 drop-shadow-2xl">
          <img src={logo} alt="LF Studio" className="w-full h-full object-contain" />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              className="w-2 h-2 rounded-full bg-[#0D9488]"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-[#0D9488]"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-[#0D9488]"
            />
          </div>
          <p className="text-xs font-black text-[#0D9488] uppercase tracking-[0.2em] animate-pulse">
            Carregando...
          </p>
        </div>
      </motion.div>
    </div>
  );
}