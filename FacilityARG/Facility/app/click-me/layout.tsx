import React from "react";
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'click',
};

export default function ClickMeLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    body {
                        all: unset !important;
                        display: block !important;
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-family: initial !important;
                        font-size: medium !important;
                        line-height: normal !important;
                    }
                    #__next {
                        all: unset !important;
                        display: block !important;
                    }
                    * {
                        font-family: initial !important;
                        background: transparent !important;
                        color: inherit !important;
                    }
                    a {
                        color: blue !important;
                        text-decoration: underline !important;
                        cursor: pointer !important;
                    }
                `
            }}/>
            {children}
        </>
    );
}

