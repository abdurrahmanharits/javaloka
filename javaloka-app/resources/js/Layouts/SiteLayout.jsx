import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function SiteLayout({ activePage, children, lang, onToggleLang }) {
    const { auth, routes } = usePage().props;
    const user = auth?.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const navItems = [
        { key: 'home', href: routes.home, label: { id: 'Beranda', en: 'Home' } },
        { key: 'products', href: routes.products, label: { id: 'Produk', en: 'Products' } },
        { key: 'about', href: routes.about, label: { id: 'Tentang', en: 'About' } },
        { key: 'contact', href: routes.contact, label: { id: 'Kontak', en: 'Contact' } },
    ];

    const closeMenu = () => setMenuOpen(false);

    return (
        <div className="app-container" data-lang={lang}>
            <header className="site-header scrolled">
                <div className="container nav">
                    <a href={routes.home} className="brand" onClick={closeMenu}>
                        <img src="/assets/images/logo.jpg" alt="Javaloka Coffee Logo" />
                        JAVALOKA <span>COFFEE</span>
                    </a>

                    <div className="nav-actions">
                        <button
                            type="button"
                            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                            onClick={() => setMenuOpen((currentValue) => !currentValue)}
                            aria-label={lang === 'id' ? 'Buka menu navigasi' : 'Open navigation menu'}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
                            {navItems.map((item) => (
                                <a
                                    key={item.key}
                                    href={item.href}
                                    className={item.key === activePage ? 'active' : ''}
                                    onClick={closeMenu}
                                >
                                    {item.label[lang]}
                                </a>
                            ))}
                        </nav>

                        <button type="button" className="lang-switch" onClick={onToggleLang}>
                            {lang === 'id' ? 'ID / EN' : 'EN / ID'}
                        </button>

                        {user ? (
                            <div className="auth-actions">
                                <a
                                    href={routes.adminDashboard}
                                    className="btn ghost btn-sm"
                                    onClick={closeMenu}
                                >
                                    {lang === 'id' ? 'Admin' : 'Admin'}
                                </a>
                                <Link
                                    href={routes.logout}
                                    method="post"
                                    as="button"
                                    className="btn primary btn-sm"
                                    onClick={closeMenu}
                                >
                                    {lang === 'id' ? 'Logout' : 'Logout'}
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="footer">
                <div className="container footer-grid">
                    <div>
                        <div className="footer-brand">
                            <img src="/assets/images/logo.jpg" alt="Javaloka Logo" />
                            JAVALOKA <span>COFFEE</span>
                        </div>
                        <p className="footer-tagline">
                            {lang === 'id' ? 'Kopi Nusantara terbaik, disangrai dengan cinta.' : 'The finest Nusantara coffee, roasted with care.'}
                        </p>
                    </div>
                    <div className="footer-right">
                        <p>Copyright 2026 Javaloka Coffee</p>
                        <div className="footer-social-links">
                            <a href="https://www.instagram.com/javalokacoffee" target="_blank" rel="noreferrer">Instagram</a> / <a href={routes.contact}>{lang === 'id' ? 'Kontak' : 'Contact'}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
