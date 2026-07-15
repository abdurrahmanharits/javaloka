import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SiteLayout from '../../Layouts/SiteLayout';
import useLanguage from '../../hooks/useLanguage';

export default function About() {
    const { lang, toggleLang } = useLanguage();
    const { routes } = usePage().props;

    return (
        <>
            <Head title={lang === 'id' ? 'Tentang' : 'About'} />

            <SiteLayout lang={lang} onToggleLang={toggleLang} activePage="about">
                <section className="page-hero">
                    <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2000')" }}></div>
                    <div className="container reveal active">
                        <div className="kicker">{lang === 'id' ? 'Cerita Kami' : 'Our Story'}</div>
                        <h1>{lang === 'id' ? 'Membangun Rasa dari Asal yang Jujur' : 'Building Flavor from Honest Origins'}</h1>
                        <p className="lede mx-auto" style={{ maxWidth: '720px' }}>
                            {lang === 'id'
                                ? 'Javaloka lahir dari keinginan untuk menghadirkan kopi Indonesia yang transparan, konsisten, dan terasa dekat dengan orang yang menanamnya.'
                                : 'Javaloka was built to present Indonesian coffee that feels transparent, consistent, and closely connected to the people who grow it.'}
                        </p>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="grid two">
                            <div className="surface-card">
                                <div className="kicker">{lang === 'id' ? 'Visi' : 'Vision'}</div>
                                <h2>{lang === 'id' ? 'Kopi yang punya konteks, bukan cuma rasa' : 'Coffee with context, not only flavor'}</h2>
                                <p>
                                    {lang === 'id'
                                        ? 'Kami ingin setiap kopi yang sampai ke pelanggan membawa cerita asal, proses, dan orang-orang di belakangnya. Karena kualitas terbaik selalu lahir dari hubungan yang sehat di sepanjang rantai nilai.'
                                        : 'We want every coffee we ship to carry the story of its origin, process, and people behind it. The best quality comes from healthy relationships across the entire value chain.'}
                                </p>
                            </div>
                            <div className="surface-card">
                                <div className="kicker">{lang === 'id' ? 'Pendekatan' : 'Approach'}</div>
                                <h2>{lang === 'id' ? 'Kurasi kecil, perhatian besar' : 'Small curation, deep attention'}</h2>
                                <p>
                                    {lang === 'id'
                                        ? 'Kami memilih lot secara selektif, menyimpan profil roasting tetap ringkas, dan fokus pada rasa yang bersih serta mudah dinikmati di rumah maupun di kedai.'
                                        : 'We select lots carefully, keep roasting profiles focused, and aim for cups that stay clean, expressive, and approachable at home or in a cafe.'}
                                </p>
                                <div className="inline-list" style={{ marginTop: '24px' }}>
                                    <span>{lang === 'id' ? 'Kemitraan petani' : 'Farmer partnerships'}</span>
                                    <span>{lang === 'id' ? 'Roasting batch kecil' : 'Small-batch roasting'}</span>
                                    <span>{lang === 'id' ? 'Kirim segar' : 'Fresh delivery'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section" style={{ background: 'var(--bg-2)' }}>
                    <div className="container">
                        <div className="section-header-flex">
                            <div>
                                <div className="kicker">{lang === 'id' ? 'Nilai Utama' : 'Core Values'}</div>
                                <h2>{lang === 'id' ? 'Apa yang kami jaga setiap hari' : 'What we protect every day'}</h2>
                            </div>
                        </div>
                        <div className="grid three">
                            <div className="card surface-card">
                                <h3>{lang === 'id' ? 'Transparansi' : 'Transparency'}</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Kami ingin pelanggan tahu dari mana kopi berasal, bagaimana ia diproses, dan mengapa profil rasanya seperti itu.'
                                        : 'We want customers to know where the coffee comes from, how it is processed, and why the cup tastes the way it does.'}
                                </p>
                            </div>
                            <div className="card surface-card">
                                <h3>{lang === 'id' ? 'Konsistensi' : 'Consistency'}</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Roasting, pengemasan, dan alur kerja kami dibuat sederhana agar hasil akhirnya tetap stabil dari batch ke batch.'
                                        : 'Our roasting, packaging, and workflow stay intentionally simple so results remain steady from batch to batch.'}
                                </p>
                            </div>
                            <div className="card surface-card">
                                <h3>{lang === 'id' ? 'Kedekatan' : 'Closeness'}</h3>
                                <p>
                                    {lang === 'id'
                                        ? 'Kami ingin kopi terasa personal, mudah dipahami, dan dekat dengan kebiasaan minum sehari-hari.'
                                        : 'We want coffee to feel personal, easy to understand, and close to everyday drinking habits.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="grid three">
                            <div className="stat-card card">
                                <div className="stat-number">12+</div>
                                <div className="stat-label">{lang === 'id' ? 'Asal Biji' : 'Origins'}</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-number">48h</div>
                                <div className="stat-label">{lang === 'id' ? 'Target Kirim' : 'Shipping Target'}</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-number">Small</div>
                                <div className="stat-label">{lang === 'id' ? 'Batch Roasting' : 'Batch Roasting'}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="cta-banner">
                            <h2>{lang === 'id' ? 'Lihat bagaimana kopi kami dikurasi' : 'See how our coffees are curated'}</h2>
                            <p>
                                {lang === 'id'
                                    ? 'Jelajahi katalog untuk menemukan origin, roast level, dan profil rasa yang paling sesuai untukmu.'
                                    : 'Browse the catalog to find the origin, roast level, and flavor profile that fits you best.'}
                            </p>
                            <Link className="btn btn-white" href={routes.products}>
                                {lang === 'id' ? 'Buka Katalog' : 'Open Catalog'}
                            </Link>
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
