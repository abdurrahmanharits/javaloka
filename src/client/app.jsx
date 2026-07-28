import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Products from './pages/Products/Index';
import About from './pages/About/Index';
import Contact from './pages/Contact/Index';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Admin/Dashboard';
import { useApp } from './contexts/AppContext';
import { api } from './services/api';

function DataPage({ endpoint, children }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(() => api.get(endpoint).then(setData).catch(setError), [endpoint]);
    useEffect(() => { load(); }, [load]);
    useEffect(() => { window.addEventListener('javaloka:data-changed', load); return () => window.removeEventListener('javaloka:data-changed', load); }, [load]);
    if (error) return <div className="empty-state"><p>{error.message}</p></div>;
    if (!data) return <div className="empty-state"><p>Memuat...</p></div>;
    return children(data);
}

function ContactRoute() {
    const selectedProduct = new URLSearchParams(useLocation().search).get('product') ?? '';
    return <Contact selectedProduct={selectedProduct} />;
}

function AdminRoute() {
    const { user, authReady } = useApp();
    if (!authReady) return <div className="empty-state"><p>Memuat...</p></div>;
    if (!user) return <Navigate to="/login?redirect=/admin" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return <DataPage endpoint="/admin/dashboard">{(data) => <Dashboard {...data} />}</DataPage>;
}

export default function App() {
    return <Routes>
        <Route path="/" element={<DataPage endpoint="/products/featured">{({ products }) => <Welcome featuredProducts={products} />}</DataPage>} />
        <Route path="/products" element={<DataPage endpoint="/products">{({ products }) => <Products products={products} />}</DataPage>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/login" element={<Login intended={new URLSearchParams(window.location.search).get('redirect') ?? ''} />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>;
}
