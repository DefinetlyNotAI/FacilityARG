'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {checkKeyword, signCookie} from '@/lib/client/utils';
import {cookies, routes} from '@/lib/saveData';
import styles from '@/styles/SaveFile.module.css';

export default function SaveFilePage() {
    const router = useRouter();
    const [keywords, setKeywords] = useState<string[]>(['', '', '', '', '', '']);
    const [validated, setValidated] = useState(false);
    const [validating, setValidating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
        setError('');
    };

    const validateKeywords = async () => {
        setValidating(true);
        setError('');

        try {
            // Check all 6 keywords
            const validationResults = await Promise.all(
                keywords.map((keyword, index) => checkKeyword(keyword, index + 1))
            );

            const allValid = validationResults.every(result => result);

            if (allValid) {
                setValidated(true);
                setSuccess('All keywords validated! You can now restore your save.');
            } else {
                setError('One or more keywords are incorrect. Please try again.');
            }
        } catch (err) {
            setError('Failed to validate keywords. Please try again.');
            console.error(err);
        } finally {
            setValidating(false);
        }
    };

    const restoreSave = async () => {
        setRestoring(true);
        setError('');

        try {
            // Define endgame cookies to set (prioritizing endgame state)
            const endgameCookies = [
                cookies.noCorruption,  // Prioritize over corrupt and corrupting
                cookies.end,           // Prioritize over endQuestion
                cookies.disclaimersAccepted,
                cookies.blackAndWhite,
                cookies.choice,
                cookies.fileConsole,
                cookies.buttons,
                cookies.terminal,
                cookies.tree98,
                cookies.loggedIn,
                cookies.scroll,
                cookies.wifiPanel,
                cookies.wifiPassed,
                cookies.wifiLogin,
                cookies.media,
                cookies.killTAS,
                cookies.tree,
                cookies.hollowPilgrimage,
                cookies.moonTime,
                cookies.interference,
                cookies.chII_passDone,
            ];

            // Set all cookies
            for (const cookieName of endgameCookies) {
                try {
                    const result = await signCookie(`${cookieName}=true`);
                    if (!result.success) {
                        console.error(`Failed to set cookie ${cookieName}:`, result.error);
                    }
                } catch (err) {
                    console.error(`Error setting cookie ${cookieName}:`, err);
                }
            }

            setSuccess('Save restored successfully! Redirecting to the end...');

            // Wait a moment for user to see success message, then redirect
            setTimeout(() => {
                router.push(routes.theEnd);
            }, 2000);
        } catch (err) {
            setError('Failed to restore save. Please try again.');
            console.error(err);
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Save File Recovery</h1>

                <div className={styles.explanation}>
                    <p>
                        Welcome to the Save File Recovery system. This page exists to help you restore your progress
                        if your save data was lost or if you're accessing the facility from a new device.
                    </p>
                    <p>
                        To prove you've completed the journey and restore your save, you must provide all 6 keywords
                        you discovered throughout the facility. These keywords were found in various chapters and
                        represent your progression through the experience.
                    </p>
                    <p className={styles.warning}>
                        ⚠️ All 6 keywords must be correct to proceed with save restoration.
                    </p>
                </div>

                <div className={styles.keywordSection}>
                    <h2>Enter Your Keywords</h2>
                    {keywords.map((keyword, index) => (
                        <div key={index} className={styles.keywordInput}>
                            <label htmlFor={`keyword-${index}`}>
                                Keyword {index + 1}:
                            </label>
                            <input
                                id={`keyword-${index}`}
                                type="text"
                                value={keyword}
                                onChange={(e) => handleKeywordChange(index, e.target.value)}
                                disabled={validated || validating}
                                placeholder={`Enter keyword ${index + 1}`}
                                className={styles.input}
                            />
                        </div>
                    ))}
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <div className={styles.actions}>
                    {!validated ? (
                        <button
                            onClick={validateKeywords}
                            disabled={validating || keywords.some(k => !k.trim())}
                            className={styles.button}
                        >
                            {validating ? 'Validating...' : 'Validate Keywords'}
                        </button>
                    ) : (
                        <button
                            onClick={restoreSave}
                            disabled={restoring}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                            {restoring ? 'Restoring...' : 'Restore All Cookies and Continue'}
                        </button>
                    )}
                </div>

                {validated && !restoring && (
                    <div className={styles.info}>
                        <p>
                            Clicking "Restore All Cookies and Continue" will:
                        </p>
                        <ul>
                            <li>Restore all your progress cookies</li>
                            <li>Set your game state to the endgame configuration</li>
                            <li>Redirect you to the end of the facility</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

