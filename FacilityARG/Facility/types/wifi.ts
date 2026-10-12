import React from "react";

export type FinaleMessage = {
    text: string;
    style?: React.CSSProperties;
    type?: 'title' | 'body' | 'loading'; // optional, for styling or logic
};
type FormField = {
    title: string;
    placeholder: string;
    min?: number;
    max?: number;
};
export type FormFields = {
    username: FormField;
    password: FormField;
};
