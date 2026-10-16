import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Job Scorecard",
  description: "Turn a job posting into a clear, structured scorecard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
