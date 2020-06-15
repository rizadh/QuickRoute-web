import { useEffect, useState } from 'react';
import { useDarkMode } from './useDarkMode';

const accentColorFromDocument = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

export const useAccentColor = () => {
    const darkMode = useDarkMode();
    const [accentColor, setAccentColor] = useState(accentColorFromDocument());

    useEffect(() => setAccentColor(accentColorFromDocument()), [darkMode]);

    return accentColor;
};
