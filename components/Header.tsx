'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      className="text-center py-5 bg-black/30 backdrop-blur border-b-2 border-primary-gold relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="logo-container mb-4">
        <div className="flex items-center justify-center">
          <div className="logo mr-4">
            <div className="w-15 h-15 bg-primary-gold rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">🏠</span>
            </div>
          </div>
          <div className="brand-text text-4xl font-bold text-primary-gold text-shadow">
            RooflineIQ
          </div>
        </div>
      </div>
      
      <motion.h1 
        className="text-5xl font-bold text-shadow mb-3"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        🧭 PRO ROOFLINE MEASURER 📏
      </motion.h1>
      
      <motion.p 
        className="text-xl opacity-90 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        AI-Powered Multi-Color Light Design & Measurement System
      </motion.p>
      
      {/* FireflyiQ Integration Badge */}
      <motion.div 
        className="absolute top-5 right-5 bg-primary-gold/20 p-3 rounded-full border-2 border-primary-gold flex items-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center mr-3">
          <span className="text-lg">💡</span>
        </div>
        <span className="text-primary-gold font-bold text-sm">
          Powered by FireflyiQ
        </span>
      </motion.div>
    </motion.header>
  );
}
