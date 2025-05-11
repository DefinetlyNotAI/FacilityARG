"use client"

import type React from "react"
import {createContext, useEffect, useState} from "react"
import type {Theme} from "@/lib/types"

type ThemeProviderProps = {
    children: React.ReactNode
}

type ThemeContextType = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({children}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>("dark")

    useEffect(() => {
        // Check for saved theme in cookies
        const savedTheme = getCookie("theme") as Theme | null
        if (savedTheme) {
            setTheme(savedTheme)
        } else {
            // Default to dark theme
            setTheme("dark")
            setCookie("theme", "dark", 365)
        }
    }, [])

    useEffect(() => {
        // Apply theme to document
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(theme)

        // Save theme to cookie
        setCookie("theme", theme, 365)
    }, [theme])

    return <ThemeContext.Provider value={{theme, setTheme}}>{children}</ThemeContext.Provider>
}

/*
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
*/

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number) {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

function getCookie(name: string): string | null {
    const nameEQ = `${name}=`
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === " ") c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}
