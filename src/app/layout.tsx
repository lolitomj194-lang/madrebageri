import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ENTRE CORTES | Asado a domicilio en Paraná",
    template: "%s | ENTRE CORTES",
  },
  description:
    "Cortes vacunos, achuras, embutidos y combos para asado con delivery en Paraná, Entre Ríos. Armá tu asado por porciones y pedí por WhatsApp. Vos poné el fuego. Nosotros, el asado.",
  keywords: [
    "asado a domicilio Paraná",
    "delivery de carne Paraná",
    "combos de asado Paraná",
    "carnicería delivery Paraná",
    "cortes de carne a domicilio",
    "achuras Paraná",
    "carbón y leña a domicilio",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "ENTRE CORTES",
    title: "ENTRE CORTES | Vos poné el fuego. Nosotros, el asado.",
    description: "Armá tu asado completo y recibilo en tu casa en Paraná. Delivery express, programado o retiro por local.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
