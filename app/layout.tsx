import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trail-Mate",
  description: "Barebones Appalachian Trail trip planner prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
