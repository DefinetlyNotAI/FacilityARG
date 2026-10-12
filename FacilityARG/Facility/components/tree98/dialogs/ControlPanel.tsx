'use client';
import React, {useEffect, useState} from 'react';
import {controlPanelData, sysConfigDefaults} from '@/lib/client/data/tree98';
import {getIcon} from "@/components/tree98/icons";
import {localStorageKeys} from "@/lib/saveData";
import {ControlPanelData} from "@/types";
import {detectOsBrowser} from "@/lib/client/utils";

const InfoItem = ({label, value}: { label: string; value: string | number | boolean }) => (
    <div className="flex justify-between text-xs border-b py-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-900 break-all text-right">{value?.toString()}</span>
    </div>
);

export const ControlPanel: React.FC = () => {
    const [data, setData] = useState<ControlPanelData>({
        dateTime: '',
        resolution: '',
        userAgent: '',
        language: '',
        platform: '',
        isOnline: navigator.onLine,
        batteryInfo: null,
        cookieCount: 0,
        refreshCount: 'N/A',
        sessionId: 'N/A'
    });

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            setData(prev => ({...prev, dateTime: now.toLocaleString()}));
        };

        updateDate();
        const interval = setInterval(updateDate, 1000);

        const cookieSize = document.cookie.length;
        const cookieCount = document.cookie.split(';').filter(c => c.trim()).length;
        const {os} = detectOsBrowser(navigator.userAgent)

        setData(prev => ({
            ...prev,
            resolution: `${window.screen.width}x${window.screen.height}`,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: os,
            cookieCount,
            sessionId: localStorage.getItem(localStorageKeys.sessionId) || 'N/A',
            refreshCount: localStorage.getItem(localStorageKeys.refreshCount) || 'N/A',
            cookieSize
        }));

        window.addEventListener('online', () => setData(prev => ({...prev, isOnline: true})));
        window.addEventListener('offline', () => setData(prev => ({...prev, isOnline: false})));

        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: {
                level: number;
                charging: boolean;
                addEventListener: Function;
            }) => {
                const updateBattery = () => {
                    setData(prev => ({
                        ...prev,
                        batteryInfo: {
                            level: Math.round(battery.level * 100),
                            charging: battery.charging
                        }
                    }));
                };
                updateBattery();
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);
            });
        }

        return () => clearInterval(interval);
    }, []);

    const groupedSections = controlPanelData.reduce((acc, field) => {
        const value = (field.key === 'cookieSize')
            ? document.cookie.length
            : (data as any)[field.key];

        if (field.condition && !field.condition(data)) return acc;

        const formattedValue = field.format ? field.format(value) : value;
        if (!acc[field.section]) acc[field.section] = [];
        acc[field.section].push({
            label: field.label,
            value: formattedValue,
            icon: field.icon
        });

        return acc;
    }, {} as Record<string, { label: string; value: string; icon: string }[]>);

    return (
        <div className="p-4 bg-white min-h-screen" style={{fontFamily: sysConfigDefaults.fonts.system}}>
            <div className="text-sm font-bold mb-4">Control Panel</div>
            {Object.entries(groupedSections).map(([section, items]) => (
                <div key={section} className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6">{getIcon(items[0]?.icon) ?? getIcon('settings')}</div>
                        <span className="text-xs font-semibold">{section}</span>
                    </div>
                    {items.map(({label, value}) => (
                        <InfoItem key={label} label={label} value={value}/>
                    ))}
                </div>
            ))}
        </div>
    );
};
