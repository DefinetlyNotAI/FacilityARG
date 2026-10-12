"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {signCookie} from "@/lib/client/utils";
import {script} from "@/lib/client/data/oArvoreDaCarne";
import {ScriptItem} from "@/types";
import {cookies, routes} from "@/lib/saveData";
import styles from "@/styles/CarnePlay.module.css";

export default function CarnePlay() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        if (Cookies.get(cookies.tree)) {
            router.replace(routes.home);
        }
    }, [router]);

    const handleClick = async () => {
        if (currentIndex < script.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            await signCookie(`${cookies.tree}=BLASPHEMY`);
            router.replace(routes.home);
        }
    };

    const step: ScriptItem = script[currentIndex];
    const className = `${styles.carneStep} ${styles[step.type] || ""}`;

    return (
        <div className={styles.carnePlayBg} onClick={handleClick}>
            <div className={styles.carnePlayContent}>
                <div className={className}>{step.content}</div>
            </div>

            <link
                href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=UnifrakturCook:wght@700&display=swap"
                rel="stylesheet"
            />
        </div>
    );
}
