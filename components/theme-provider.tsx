"use client"

import type React from "react"
import { useEffect } from "react"

type ThemeProviderProps = {
    children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    useEffect(() => {
        document.documentElement.classList.remove("light")
        document.documentElement.classList.add("dark")
    }, [])

    return <>{children}</>
}
