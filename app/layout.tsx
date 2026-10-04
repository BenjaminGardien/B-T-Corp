import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "B&T Corp · Le sport, au bon moment.",
  description:
    "Découvrez les créneaux sportifs près de chez vous. Prototype de démonstration B&T Corp à La Roche-sur-Yon.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
