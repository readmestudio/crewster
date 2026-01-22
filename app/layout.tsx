import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crewster - Build your own Avengers team",
  description: "Build and manage your AI crew team. Create specialized AI agents and collaborate seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
