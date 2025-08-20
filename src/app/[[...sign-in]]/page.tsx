"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMoon, FiSun, FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [darkMode, setDarkMode] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Handle page load
  useEffect(() => {
    setIsPageLoaded(true);
    const savedLoginTheme = localStorage.getItem("loginTheme");
    if (savedLoginTheme === "dark" || 
        (!savedLoginTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
    }
  }, []);

  // Handle authentication state
  useEffect(() => {
    const handleAuth = async () => {
      if (isLoaded && isSignedIn) {
        const role = user?.publicMetadata?.role as string;
        if (role) {
          // Force a hard navigation to the role-based route
          window.location.href = `/${role}`;
        }
      }
    };

    handleAuth();
  }, [isLoaded, isSignedIn, user]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("loginTheme", darkMode ? "light" : "dark");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading state until Clerk has loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is already signed in, show loading
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Make sure we've completely loaded the page before rendering form
  if (!isPageLoaded) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      darkMode ? 'from-gray-900 to-gray-800 text-white' : 'from-lamaSkyLight to-blue-200'
    } transition-colors duration-500 overflow-hidden relative`}>
      {/* Theme toggle - positioned for mobile */}
      <motion.button
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-3 sm:p-2 rounded-full ${
          darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-800'
        } shadow-lg z-20 touch-manipulation`}
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {darkMode ? <FiSun size={20} className="sm:w-6 sm:h-6" /> : <FiMoon size={20} className="sm:w-6 sm:h-6" />}
      </motion.button>

      {/* Native app container */}
      <div className="flex flex-col min-h-screen">
        {/* Header space for mobile */}
        <div className="h-16 sm:h-20 flex-shrink-0"></div>
        
        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm sm:max-w-md"
          >
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800/95 border border-gray-700/50' : 'bg-white/95 backdrop-blur-sm'
              } p-6 sm:p-8 md:p-12 rounded-3xl sm:rounded-2xl shadow-2xl w-full relative overflow-hidden`}
            >
          <SignIn.Root>
            <SignIn.Step
              name="start"
              className="flex flex-col gap-4"
            >
              {/* Logo and branding - mobile optimized */}
              <motion.div 
                className="flex flex-col items-center justify-center mb-6 sm:mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4"
                >
                  <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </motion.div>
                <h1 className={`text-2xl sm:text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Academix Cloud
                </h1>
                <h2 className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-sm sm:text-base`}>
                  Sign in to your account
                </h2>
              </motion.div>
              
              <Clerk.GlobalError className="text-sm text-red-400" />
              
              {/* Username field - mobile optimized */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Clerk.Field name="identifier" className="flex flex-col gap-3 mb-6">
                  <Clerk.Label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Username
                  </Clerk.Label>
                  <Clerk.Input
                    type="text"
                    required
                    className={`p-4 sm:p-3 rounded-xl sm:rounded-lg text-base sm:text-sm ${
                      darkMode 
                        ? 'bg-gray-700/80 text-white ring-1 ring-gray-600/50 focus:ring-2 focus:ring-blue-500/50' 
                        : 'bg-gray-50/80 ring-1 ring-gray-300/50 focus:ring-2 focus:ring-blue-500/50'
                    } focus:outline-none transition-all duration-300 touch-manipulation`}
                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                  />
                  <Clerk.FieldError className="text-sm text-red-400 px-1" />
                </Clerk.Field>
              </motion.div>
              
              {/* Password field - mobile optimized */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Clerk.Field name="password" className="flex flex-col gap-3 mb-8">
                  <Clerk.Label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Password
                  </Clerk.Label>
                  <div className="relative">
                    <Clerk.Input
                      type={showPassword ? "text" : "password"}
                      required
                      className={`p-4 pr-14 sm:p-3 sm:pr-12 rounded-xl sm:rounded-lg w-full text-base sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700/80 text-white ring-1 ring-gray-600/50 focus:ring-2 focus:ring-blue-500/50' 
                          : 'bg-gray-50/80 ring-1 ring-gray-300/50 focus:ring-2 focus:ring-blue-500/50'
                      } focus:outline-none transition-all duration-300 touch-manipulation`}
                      style={{ fontSize: '16px' }} // Prevents zoom on iOS
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 sm:p-1 rounded-lg transition-colors duration-200 touch-manipulation ${
                        darkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50 active:bg-gray-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 active:bg-gray-200'
                      }`}
                    >
                      {showPassword ? <FiEyeOff size={20} className="sm:w-4 sm:h-4" /> : <FiEye size={20} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  <Clerk.FieldError className="text-sm text-red-400 px-1" />
                </Clerk.Field>
              </motion.div>
              
              {/* Sign in button - native app style */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SignIn.Action
                  submit
                  className={`w-full py-4 sm:py-3 rounded-2xl sm:rounded-xl font-semibold text-white text-base sm:text-sm ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                  } transition-all duration-300 touch-manipulation active:shadow-md`}
                >
                  Sign In
                </SignIn.Action>
              </motion.div>
              
              {/* Terms text - mobile friendly */}
              <motion.p 
                className={`text-center text-xs sm:text-sm mt-6 px-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                By signing in, you agree to our{" "}
                <span className="underline">Terms of Service</span> and{" "}
                <span className="underline">Privacy Policy</span>
              </motion.p>
            </SignIn.Step>
          </SignIn.Root>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
