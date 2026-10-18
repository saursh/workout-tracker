import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Form — Workout Tracker",
  description: "A focused workout tracker for strength training, history, and progress.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
