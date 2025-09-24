import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CompatibleAntdRegistry } from "@/components/CompatibleAntdRegistry";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
   title: "Book Store",
   description: "Book Store next app",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className="h-full">
         <body className="flex m-0 p-0 min-h-[95vh]">
            <CompatibleAntdRegistry>{children}</CompatibleAntdRegistry>
         </body>
      </html>
   );
}
