import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academix Cloud",
  description: "Next.js School Management System",
  icons: {
    icon: "./favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorText: "#1e293b",
          colorTextSecondary: "#64748b",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
        },
        elements: {
          formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
          socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
          card: "shadow-lg rounded-2xl",
          headerTitle: "text-slate-800",
          headerSubtitle: "text-slate-500",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400",
          formFieldLabel: "text-slate-700",
          footerActionText: "text-slate-500",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { fontSize: "0.875rem" },
              duration: 3000,
              className: "text-sm",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
