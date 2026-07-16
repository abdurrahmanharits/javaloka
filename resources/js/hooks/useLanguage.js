import { useEffect, useState } from 'react';

const STORAGE_KEY = 'javaloka-lang';

export default function useLanguage(initialLang = 'id') {
    const [lang, setLang] = useState(initialLang);

    useEffect(() => {
        const storedLang = window.localStorage.getItem(STORAGE_KEY);

        if (storedLang === 'id' || storedLang === 'en') {
            setLang(storedLang);
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.body.dataset.lang = lang;
        window.localStorage.setItem(STORAGE_KEY, lang);
    }, [lang]);

    const toggleLang = () => {
        setLang((currentLang) => (currentLang === 'id' ? 'en' : 'id'));
    };

    return { lang, toggleLang };
}
