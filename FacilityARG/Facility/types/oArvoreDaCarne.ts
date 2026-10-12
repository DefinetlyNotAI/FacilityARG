import React from "react";

export interface ScriptItem {
    content: React.ReactNode;
    type: "title" | "fade" | "chant" | "quote" | "final";
}