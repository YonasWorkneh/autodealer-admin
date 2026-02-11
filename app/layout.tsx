import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import Protected from "./Protected";
import Providers  from "./Providers";

export const metadata: Metadata = {
  title: "ET-Car-Admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLogged = !!cookieStore.get("access")?.value;

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <Providers>
          <div className="root">
            <Protected isLogged={isLogged}>
              <>{children}</>
            </Protected>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
