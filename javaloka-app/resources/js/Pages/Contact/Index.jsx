import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SiteLayout from '../../Layouts/SiteLayout';
import useLanguage from '../../hooks/useLanguage';

export default function Contact({ selectedProduct }) {
    const { lang, toggleLang } = useLanguage();
    const { routes } = usePage().props;
    const hasSelectedProduct = Boolean(selectedProduct);

    return (
        <>
            <Head title={lang === 'id' ? 'Kontak' : 'Contact'} />

            <SiteLayout lang={lang} onToggleLang={toggleLang} activePage="contact">
                <section className="page-hero">
                    <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000')" }}></div>
                    <div className="container reveal active">
                        <div className="kicker">{lang === 'id' ? 'Hubungi Kami' : 'Get in Touch'}</div>
                        <h1>{lang === 'id' ? 'Kami bantu pilih kopi yang tepat' : 'We will help you find the right coffee'}</h1>
                        <p className="lede mx-auto" style={{ maxWidth: '720px' }}>
                            {hasSelectedProduct
                                ? (lang === 'id'
                                    ? `Kamu tertarik dengan "${selectedProduct}". Lanjutkan percakapan dengan tim kami agar kebutuhan roast dan jumlahnya bisa kami bantu arahkan.`
                                    : `You are interested in "${selectedProduct}". Continue the conversation with our team so we can help with roast preference and quantity.`)
                                : (lang === 'id'
                                    ? 'Butuh bantuan memilih kopi, memahami profil rasa, atau menyiapkan order? Kami siap bantu.'
                                    : 'Need help choosing a coffee, understanding flavor profiles, or preparing an order? We are ready to help.')}
                        </p>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="grid two contact-grid">
                            <div className="content-stack">
                                <div className="card contact-info-card surface-card">
                                    <div className="info-block">
                                        <div className="info-icon">01</div>
                                        <div>
                                            <div className="info-label">Instagram</div>
                                            <div className="info-text">
                                                {lang === 'id'
                                                    ? 'Kirim DM ke akun resmi kami untuk tanya stok, origin, atau rekomendasi kopi.'
                                                    : 'Send a DM to our official account to ask about stock, origins, or coffee recommendations.'}
                                            </div>
                                        </div>
                                    </div>
                                    <a className="btn ghost" href="https://www.instagram.com/javalokacoffee" target="_blank" rel="noreferrer">
                                        {lang === 'id' ? 'Buka Instagram' : 'Open Instagram'}
                                    </a>
                                </div>

                                <div className="card contact-info-card surface-card">
                                    <div className="info-block">
                                        <div className="info-icon">02</div>
                                        <div>
                                            <div className="info-label">{lang === 'id' ? 'Proses Order' : 'Order Flow'}</div>
                                            <div className="info-text">
                                                {lang === 'id'
                                                    ? 'Sebutkan nama kopi, jumlah, dan preferensi roast. Kami akan bantu arahkan langkah berikutnya secara manual.'
                                                    : 'Share the coffee name, quantity, and roast preference. We will guide the next step manually.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card contact-info-card surface-card">
                                    <div className="info-block">
                                        <div className="info-icon">03</div>
                                        <div>
                                            <div className="info-label">{lang === 'id' ? 'Respon' : 'Response'}</div>
                                            <div className="info-text">
                                                {lang === 'id'
                                                    ? 'Kami usahakan merespons secepat mungkin pada jam operasional roastery.'
                                                    : 'We aim to reply as quickly as possible during roastery working hours.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card quick-order-card">
                                <div className="kicker">{lang === 'id' ? 'Bantuan Cepat' : 'Quick Help'}</div>
                                <h3>{hasSelectedProduct ? selectedProduct : (lang === 'id' ? 'Mulai dari kebutuhanmu' : 'Start with your need')}</h3>
                                <p>
                                    {hasSelectedProduct
                                        ? (lang === 'id'
                                            ? 'Simpan nama produk ini saat menghubungi kami agar tim bisa langsung memberi rekomendasi paling relevan.'
                                            : 'Keep this product name when you contact us so the team can jump straight into the best recommendation.')
                                        : (lang === 'id'
                                            ? 'Kalau belum yakin mau pilih yang mana, mulai dari katalog lalu bandingkan origin, roast level, dan tasting notes.'
                                            : 'If you are not sure what to choose yet, start from the catalog and compare origin, roast level, and tasting notes.')}
                                </p>
                                <div className="cta-row">
                                    <a className="btn btn-white" href="https://www.instagram.com/javalokacoffee" target="_blank" rel="noreferrer">
                                        {lang === 'id' ? 'DM Instagram' : 'DM on Instagram'}
                                    </a>
                                    <Link className="btn btn-light" href={routes.products}>
                                        {lang === 'id' ? 'Lihat Produk' : 'View Products'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
