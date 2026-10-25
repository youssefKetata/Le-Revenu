import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Communauté Le Revenu",
  description: "L’espace d’échange des lecteurs du Revenu : questions, expériences et discussions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
