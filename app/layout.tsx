import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Provider } from "@/components/theme/provider";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { Indicator } from "@/components/theme/indicator";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Pherus Drive",
  description: "Own cloud drive self hosted and capable of being used by multiple users",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-visual',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Provider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex h-screen flex-col w-screen">
            <div className="flex-1">{children}</div>
            <Toaster />
            <Indicator />
          </main>
        </Provider>
      </body>
    </html>
  );
}
