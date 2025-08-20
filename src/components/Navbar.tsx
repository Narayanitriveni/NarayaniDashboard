"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Use Clerk user data directly
  const displayUser = isLoaded && clerkUser ? {
    fullName: clerkUser.fullName || undefined,
    role: clerkUser.publicMetadata?.role as string || undefined
  } : { fullName: undefined, role: undefined };

  return (
    <>
      <div className="flex items-center justify-between p-4 sm:p-6 bg-white border-b border-gray-100">
        {/* HAMBURGER MENU - Mobile only */}
        <button 
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
            <div className={`w-5 h-1 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-1 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-1 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
        
        {/* Empty space for search bar */}
        <div className="flex-1 max-w-xs sm:max-w-[200px]"></div>
        
        {/* ICONS AND USER - Mobile optimized */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button className="bg-white rounded-full w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow touch-manipulation">
            <Image src="/message.png" alt="Messages" width={18} height={18} className="sm:w-5 sm:h-5" />
          </button>
          <button className="bg-white rounded-full w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center cursor-pointer relative shadow-sm hover:shadow-md transition-shadow touch-manipulation">
            <Image src="/announcement.png" alt="Announcements" width={18} height={18} className="sm:w-5 sm:h-5" />
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-medium">
              1
            </div>
          </button>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs leading-3 font-medium">{displayUser?.fullName}</span>
            <span className="text-[10px] text-gray-500 text-right">
              {displayUser?.role}
            </span>
          </div>
          <UserButton />
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMenu}>
                     <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
             <MobileMenu user={displayUser} onClose={toggleMenu} />
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
