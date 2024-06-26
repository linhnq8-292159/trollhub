import Script from "next/script";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";

import "@/globals.css";
// context
import authOptions from "@/lib/auth";
import SettingsProvider from "@/contexts/SettingsContext";
// components
import Header from "@/components/Header";
import SettingsDialog from "@/components/SettingsDialog";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextAuthProvider } from "@/components/sections/AuthProvider";
const PTOAds = dynamic(() => import("@/components/ads/PTOAds"));
const FlyiconAds = dynamic(() => import("@/components/ads/FlyiconAds"));

import {
  PTO_ADS_ID,
  METADATA_BASE,
  FLYICON_ADS_ID,
  GA_MEASUREMENT_ID,
  GALAKSION_ADS_SRC,
} from "@/config";

const inter = Inter({ subsets: ["latin"] });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
  title: "Troll with Fuhu",
  description: "Generated by pendev.cc",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>

        {GALAKSION_ADS_SRC && (
          <Script
            async
            data-cfasync="false"
            src={GALAKSION_ADS_SRC}
            strategy="afterInteractive"
          />
        )}
      </head>

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="google-analytics">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
 
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
          </Script>
        </>
      )}

      <body className={inter.className} suppressHydrationWarning>
        {PTO_ADS_ID && <PTOAds id={PTO_ADS_ID} />}
        {FLYICON_ADS_ID && <FlyiconAds id={FLYICON_ADS_ID} />}

        {/* {GOOGLE_ADSENSE_ID && (
          <amp-auto-ads
            type="adsense"
            data-ad-client={GOOGLE_ADSENSE_ID}
          ></amp-auto-ads>
        )} */}

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider session={session}>
            <SettingsProvider>
              <SettingsDialog />
              <div className="relative flex flex-col">
                <Header />

                {/* {GOOGLE_ADSENSE_ID && (
                  <AdBanner
                    dataAdFormat="auto"
                    gaId={GOOGLE_ADSENSE_ID}
                    dataAdSlot="4086433053"
                    dataFullwidthResponsive
                  />
                )} */}

                {children}
              </div>
            </SettingsProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
