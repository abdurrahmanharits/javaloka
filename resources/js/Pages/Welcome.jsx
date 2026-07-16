import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ProductCard from '../Components/ProductCard';
import SiteLayout from '../Layouts/SiteLayout';
import useLanguage from '../hooks/useLanguage';

export default function Welcome({ featuredProducts = [] }) {
    const { lang, toggleLang } = useLanguage();
    const { routes } = usePage().props;

    return (
        <>
            <Head title={lang === 'id' ? 'Beranda' : 'Home'} />

            <SiteLayout lang={lang} onToggleLang={toggleLang} activePage="home">
                <section className="hero">
                    <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2000')" }}></div>
                    <div className="hero-overlay"></div>

                    <div className="container hero-content">
                        <div className="hero-grid-layout">
                            <div className="hero-text-box">
                                <div className="kicker">
                                    {lang === 'id' ? 'Roastery Kopi Nusantara' : 'Indonesian Coffee Roastery'}
                                </div>
                                <h1>
                                    {lang === 'id' ? <>Dari Kebun ke Cangkir,<br />Dengan Penuh Kasih.</> : <>From Farm to Cup,<br />Crafted with Care.</>}
                                </h1>
                                <p className="lede">
                                    {lang === 'id'
                                        ? 'Javaloka Coffee menghadirkan kopi terbaik dari petani pilihan di seluruh Nusantara - disangrai segar dan dikirim langsung ke tanganmu.'
                                        : 'Javaloka Coffee brings the finest beans from selected farmers across the archipelago - freshly roasted and delivered straight to you.'}
                                </p>
                                <div className="cta-row">
                                    <Link className="btn primary" href={routes.products}>
                                        {lang === 'id' ? 'Lihat Produk' : 'View Products'}
                                    </Link>
                                    <Link className="btn ghost btn-light" href={routes.about}>
                                        {lang === 'id' ? 'Tentang Kami' : 'About Us'}
                                    </Link>
                                </div>
                            </div>

                            <div className="hero-card">
                                <h2 className="badge">
                                    {lang === 'id' ? 'Janji Kami' : 'Our Promise'}
                                </h2>
                                <h3>
                                    {lang === 'id' ? 'Kualitas Tanpa Kompromi' : 'Quality Without Compromise'}
                                </h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Setiap biji dipilih langsung dari petani terpercaya, diproses dengan hati-hati, dan disangrai dalam batch kecil agar cita rasanya tetap utuh.'
                                        : 'Every bean is sourced directly from trusted farmers, processed with care, and roasted in small batches to preserve its full character.'}
                                </p>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div>
                                        <div className="stat-number">12+</div>
                                        <div className="stat-label">{lang === 'id' ? 'Origin Kopi' : 'Coffee Origins'}</div>
                                    </div>
                                    <div>
                                        <div className="stat-number">500+</div>
                                        <div className="stat-label">{lang === 'id' ? 'Pelanggan' : 'Customers'}</div>
                                    </div>
                                    <div>
                                        <div className="stat-number">5+</div>
                                        <div className="stat-label">{lang === 'id' ? 'Tahun' : 'Years'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section reveal active">
                    <div className="container" style={{ textAlign: 'center' }}>
                        <div className="kicker">{lang === 'id' ? 'Filosofi Kami' : 'Our Philosophy'}</div>
                        <h2>{lang === 'id' ? 'Mengapa Javaloka?' : 'Why Javaloka?'}</h2>
                        <p className="lede" style={{ maxWidth: '700px', margin: '0 auto 60px' }}>
                            {lang === 'id'
                                ? 'Kami percaya kopi terbaik lahir dari hubungan yang kuat antara petani, roaster, dan penikmat kopi.'
                                : 'We believe the best coffee comes from strong relationships between farmers, roasters, and coffee lovers.'}
                        </p>

                        <div className="grid three" style={{ textAlign: 'left' }}>
                            <div className="card surface-card">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h3>Direct Trade</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Kami bermitra langsung dengan petani di Aceh, Toraja, Flores, Bali, dan Jawa untuk menjaga mutu dan keadilan sejak dari sumber.'
                                        : 'We work directly with farmers in Aceh, Toraja, Flores, Bali, and Java to protect both quality and fairness at the source.'}
                                </p>
                            </div>
                            <div className="card surface-card">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 10-8 8-8 15a8 8 0 0 0 16 0c0-7-8-5-8-15z"></path></svg>
                                </div>
                                <h3>Small Batch Roasting</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Setiap batch disangrai dalam jumlah kecil untuk menjaga konsistensi rasa dan kesegaran terbaik.'
                                        : 'Each batch is roasted in small quantities to keep flavor consistent and freshness at its best.'}
                                </p>
                            </div>
                            <div className="card surface-card">
                                <div className="feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                </div>
                                <h3>Fresh and Fast</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Produk dikemas segera setelah roasting dan disiapkan untuk pengiriman cepat agar pengalaman minummu tetap maksimal.'
                                        : 'Every order is packed soon after roasting and prepared for fast delivery so the cup stays vibrant.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section" style={{ background: 'var(--bg-2)', padding: '120px 0' }}>
                    <div className="container">
                        <div className="section-header-flex">
                            <div>
                                <h2 style={{ marginBottom: '6px' }}>{lang === 'id' ? 'Produk Pilihan' : 'Featured Products'}</h2>
                                <p style={{ margin: 0 }}>{lang === 'id' ? 'Kopi terbaik pilihan bulan ini' : 'Our top picks this month'}</p>
                            </div>
                            <Link className="btn ghost" href={routes.products}>
                                {lang === 'id' ? 'Lihat Semua' : 'View All'}
                            </Link>
                        </div>
                        <div className="grid three">
                            {featuredProducts.length > 0 ? (
                                featuredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} lang={lang} />
                                ))
                            ) : (
                                <div className="empty-state featured-empty-state">
                                    <p>
                                        {lang === 'id'
                                            ? 'Belum ada produk yang dipilih untuk section ini. Atur dari dashboard admin pada tab Edit Katalog.'
                                            : 'No products have been selected for this section yet. Manage them from the admin dashboard in Edit Catalog.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="section reveal active">
                    <div className="container" style={{ textAlign: 'center' }}>
                        <div className="kicker">{lang === 'id' ? 'Dedikasi Kami' : 'Our Dedication'}</div>
                        <h2>{lang === 'id' ? 'Proses Kami' : 'Our Process'}</h2>
                        <p className="lede" style={{ maxWidth: '700px', margin: '0 auto 60px' }}>
                            {lang === 'id'
                                ? 'Dari kebun petani hingga cangkirmu - setiap tahap dilakukan dengan perhatian penuh.'
                                : 'From farmer to your cup - every step is handled with close attention.'}
                        </p>

                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                </div>
                                <div className="step-title">{lang === 'id' ? 'Seleksi Biji' : 'Bean Selection'}</div>
                                <div className="step-desc">{lang === 'id' ? 'Dipilih langsung dari petani terpercaya' : 'Sourced from trusted farmers'}</div>
                            </div>
                            <div className="process-step">
                                <div className="step-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <div className="step-title">Quality Check</div>
                                <div className="step-desc">{lang === 'id' ? 'Setiap lot dievaluasi sebelum disangrai' : 'Each lot is evaluated before roasting'}</div>
                            </div>
                            <div className="process-step">
                                <div className="step-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 10-8 8-8 15a8 8 0 0 0 16 0c0-7-8-5-8-15z"></path></svg>
                                </div>
                                <div className="step-title">Small Batch Roasting</div>
                                <div className="step-desc">{lang === 'id' ? 'Disangrai dalam batch kecil untuk kesempurnaan' : 'Roasted in small batches for precision'}</div>
                            </div>
                            <div className="process-step">
                                <div className="step-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                </div>
                                <div className="step-title">Fresh Delivery</div>
                                <div className="step-desc">{lang === 'id' ? 'Dikemas dan dikirim secepat mungkin' : 'Packed and shipped as quickly as possible'}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '36px' }}>
                            <Link className="btn ghost" href={routes.about}>
                                {lang === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More'}
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="cta-banner">
                            <h2>{lang === 'id' ? 'Siap Coba Kopi Terbaik Nusantara?' : 'Ready to Try the Best of Nusantara Coffee?'}</h2>
                            <p>
                                {lang === 'id'
                                    ? 'Lihat katalog kami dan pilih kopi yang paling cocok untuk rutinitas harianmu.'
                                    : 'Browse our catalog and choose the coffee that fits your daily ritual.'}
                            </p>
                            <Link className="btn btn-white" href={routes.products}>
                                {lang === 'id' ? 'Belanja Sekarang' : 'Shop Now'}
                            </Link>
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
