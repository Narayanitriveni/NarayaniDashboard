"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lamaSkyLight to-blue-200 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => {
          const positions = [
            { top: '15%', left: '15%' },
            { top: '15%', left: '85%' },
            { top: '85%', left: '15%' },
            { top: '85%', left: '85%' },
            { top: '30%', left: '50%' },
            { top: '70%', left: '50%' },
            { top: '50%', left: '30%' },
            { top: '50%', left: '70%' },
          ];
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200,
                top: positions[i].top,
                left: positions[i].left,
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1, 0.8, 1],
                x: [0, i % 2 === 0 ? 50 : -50, i % 2 === 0 ? -20 : 20, 0],
                y: [0, i % 2 === 0 ? -50 : 50, i % 2 === 0 ? 20 : -20, 0],
              }}
              transition={{ 
                duration: 15 + (i * 3),
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.8,
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image src="/logo.png" alt="Academix Cloud Logo" fill className="object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Academix Cloud
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your comprehensive school management solution for seamless education administration
          </p>
        </motion.div>

        <motion.button
          onClick={() => router.push('/auth/sign-in')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 mx-auto transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
          <FiArrowRight className="ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
} 