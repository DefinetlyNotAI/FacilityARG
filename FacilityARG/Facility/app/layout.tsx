"use client"

import React, {useEffect} from "react";
import {usePathname} from "next/navigation";
import "./globals.css";
import styles from "@/styles/Layout.module.css";
import {TAS} from "@/components/TAS";
import {faviconLoc, tabTitles} from "@/lib/client/data/root";
import {Analytics} from "@vercel/analytics/next"


function getTitle(pathname: string) {
    return tabTitles[pathname] ?? "The Facility";
}

export default function RootLayout({children,}: { children: React.ReactNode; }) {
    const pathname = usePathname();

    useEffect(() => {
        // Set document title
        const title = getTitle(pathname);
        document.title = title === pathname ? "Loading" : title;

        // Check if a favicon <link> already exists
        const hasFavicon = !!document.querySelector('link[rel~="icon"]');

        if (!hasFavicon) {
            // Create and add the default favicon link element
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = faviconLoc;
            document.head.appendChild(link);
        }

        return () => {
            if (!hasFavicon) {
                document.head.querySelector(`link[rel="icon"][href="${faviconLoc}"]`)?.remove();
            }
        }
    }, [pathname]);

    const [isClient, setIsClient] = React.useState(false);

    // Hide loading screen after window load
    useEffect(() => {
        setIsClient(true);
        const hideLoadingScreen = () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }, 500);
                }
            }, 1500);
        };

        if (document.readyState === 'complete') {
            hideLoadingScreen();
        } else {
            window.addEventListener('load', hideLoadingScreen);
        }

        return () => {
            window.removeEventListener('load', hideLoadingScreen);
        };
    }, []);

    return (
        <html lang="en" className="dark" data-scroll-behavior="smooth">
        <head>
            <meta name="robots" content="noindex, nofollow"/>
            <meta name="theme-color" content="#000000"/>
            <meta name="classification" content="RESTRICTED"/>
            <meta name="clearance-level" content="LEVEL-5"/>
            <meta name="facility-id" content="05-B"/>
            <title></title>
        </head>
        <body className={`font-sans antialiased min-h-screen ${styles.body}`}>
        {isClient && (
            <div id="loading-screen" className={styles["loading-screen"]}>
                <div className="text-center">
                    <div className="text-green-400 text-2xl font-mono mb-4">FACILITY OS</div>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        )}
        <div className="scanlines crt-effect">
            {children}
            {process.env.NODE_ENV === "production" && (
                <Analytics/>
            )}
            <TAS/>
        </div>
        </body>
        </html>
    );
}
