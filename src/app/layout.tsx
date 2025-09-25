import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdConfigProvider from "@/components/AntdConfigProvider";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
   title: process.env.NEXT_PUBLIC_APP_TITLE,
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className="h-full">
         <body className="flex m-0 p-0 min-h-[95vh]">
            <AntdConfigProvider>{children}</AntdConfigProvider>
         </body>
      </html>
   );
}
