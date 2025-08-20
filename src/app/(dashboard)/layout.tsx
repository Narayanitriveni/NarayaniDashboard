import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import GlobalErrorDisplay from "@/components/ui/global-error-display";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* LEFT SIDEBAR - Hidden on mobile */}
      <div className="hidden lg:block w-[16%] xl:w-[14%] p-4">
        <Link
          href="/"
          className="flex items-center justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={50} height={37} />
          <span className="font-bold">Academix Cloud</span>
        </Link>
        <Menu />
      </div>
      {/* MAIN CONTENT - Full width on mobile */}
      <div className="w-full lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
      
      {/* Global Error Display */}
      <GlobalErrorDisplay />
    </div>
  );
}
