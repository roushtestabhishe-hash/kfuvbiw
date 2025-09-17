// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@getpara/react-sdk/styles.css";
import { AppWrapper } from "./Components/AppWrapper";
import { supercell } from "./fonts/supercell";

export const metadata: Metadata = {
  title: "KAZAR Games",
  description: "Play and Roll",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={supercell.variable}>
      <body className={supercell.className}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
