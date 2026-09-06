import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: 'swap',
  variable: '--font-noto-sans-thai',
});

export const metadata: Metadata = {
  title: "KepKep",
  description: "LINE to Cloud Storage Backup",
};

export default function RootLayout({ children }: any) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} h-full antialiased`}
    >
      <body className={`${notoSansThai.className} min-h-full flex flex-col`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
