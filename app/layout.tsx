import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sirohipoint.vercel.app",
  ),
  title: "Sirohi Point | The Digital Construction Universe",
  description:
    "India's premium multi-vendor marketplace for hardware, electronics, paint, services, contractors, distributors, and B2B procurement.",
  icons: {
    icon: [{ url: "/logo_sirohi.png", type: "image/png" }],
    shortcut: "/logo_sirohi.png",
    apple: "/logo_sirohi.png",
  },
  openGraph: {
    title: "Sirohi Point | The Digital Construction Universe",
    description:
      "Products, services, installation, contractors, distributors, and bulk RFQ in one intelligent marketplace ecosystem.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sirohi Point | The Digital Construction Universe",
    description:
      "India's complete hardware, electronics, paint, and services marketplace.",
    images: ["/og.png"],
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
