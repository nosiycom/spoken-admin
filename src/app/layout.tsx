import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { 
  ClerkProvider, 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { LoggingProvider } from '@/components/providers/LoggingProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spoken",
  description: "Admin portal for AI-powered French learning mobile app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="p-4 border-b flex justify-between items-center">
            <h1 className="text-2xl font-bold">Spoken Admin</h1>
            <div className="flex gap-2">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <PostHogProvider>
            <LoggingProvider>
              {children}
            </LoggingProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
