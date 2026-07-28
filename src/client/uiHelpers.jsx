import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { useApp } from './contexts/AppContext';

export function Head({ title }) {
    document.title = `${title} - Javaloka Coffee`;
    return null;
}

export function useAppPage() {
    const { user, flash } = useApp();
    return { props: { auth: { user }, flash, errors: {}, routes: {
        home: '/', products: '/products', about: '/about', contact: '/contact', login: '/login', logout: '/api/auth/logout', adminDashboard: '/admin',
    } } };
}

export function Link({ href, method, as, children, onClick, ...props }) {
    const navigate = useNavigate();
    const { setUser, setFlash } = useApp();
    if (!method || method.toLowerCase() === 'get') return <RouterLink to={href} onClick={onClick} {...props}>{children}</RouterLink>;
    const submit = async (event) => {
        event.preventDefault();
        try {
            await api[method.toLowerCase()](href.replace('/logout', '/auth/logout'));
            setUser(null); setFlash({ success: 'Kamu sudah logout.' }); navigate('/');
        } catch (error) { setFlash({ error: error.message }); }
        onClick?.(event);
    };
    return React.createElement(as ?? 'button', { ...props, onClick: submit, type: props.type ?? 'button' }, children);
}

function apiPath(path) { return path.startsWith('/admin/') ? `/admin${path.slice('/admin'.length)}` : path; }

export const apiRequests = Object.fromEntries(['post', 'put', 'patch', 'delete'].map((method) => [method, async (path, data, callbacks = {}) => {
    try { const result = await api[method](apiPath(path), data); window.dispatchEvent(new Event('javaloka:data-changed')); callbacks.onSuccess?.(result); }
    catch (error) { callbacks.onError?.(error.errors); }
    finally { callbacks.onFinish?.(); }
}]));

export function useForm(initialData) {
    const [data, setValue] = useState(initialData);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const setData = (field, value) => setValue((current) => ({ ...current, [field]: value }));
    const post = async (path) => {
        setProcessing(true); setErrors({});
        try { await api.post(path.replace('/login', '/auth/login'), data); window.location.assign('/admin'); }
        catch (error) { setErrors(error.errors); }
        finally { setProcessing(false); }
    };
    return useMemo(() => ({ data, setData, post, processing, errors }), [data, processing, errors]);
}
