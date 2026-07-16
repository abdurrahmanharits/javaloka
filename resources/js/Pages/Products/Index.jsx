import React, { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import SiteLayout from '../../Layouts/SiteLayout';
import useLanguage from '../../hooks/useLanguage';

const filterLabels = {
    all: { id: 'Semua', en: 'All' },
    'single-origin': { id: 'Single Origin', en: 'Single Origin' },
    blend: { id: 'Blend', en: 'Blend' },
    light: { id: 'Light Roast', en: 'Light Roast' },
    medium: { id: 'Medium Roast', en: 'Medium Roast' },
    dark: { id: 'Dark Roast', en: 'Dark Roast' },
};

export default function Index({ products }) {
    const [filter, setFilter] = useState('all');
    const { lang, toggleLang } = useLanguage();
    const { routes } = usePage().props;

    const filteredProducts = useMemo(() => {
        if (filter === 'all') {
            return products;
        }

        return products.filter((product) => product.roast_level === filter || product.type === filter);
    }, [filter, products]);

    return (
        <>
            <Head title={lang === 'id' ? 'Produk' : 'Products'} />

            <SiteLayout lang={lang} onToggleLang={toggleLang} activePage="products">
                <section className="page-hero">
                    <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000')" }}></div>
                    <div className="container reveal active">
                        <div className="kicker">{lang === 'id' ? 'Koleksi Kami' : 'Our Collection'}</div>
                        <h1>{lang === 'id' ? 'Produk Kopi Javaloka' : 'Javaloka Coffee Products'}</h1>
                        <p className="lede mx-auto" style={{ maxWidth: '600px' }}>
                            {lang === 'id'
                                ? 'Setiap produk kini menampilkan status inventaris secara langsung, jadi kamu bisa tahu mana yang siap dipesan, menipis, atau sedang habis.'
                                : 'Every product now shows its live inventory status, so you can instantly see what is ready to order, running low, or currently out.'}
                        </p>

                        <div className="tags flex-center" style={{ marginTop: '40px' }}>
                            {Object.keys(filterLabels).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`tag ${filter === value ? 'active' : ''}`}
                                    onClick={() => setFilter(value)}
                                >
                                    {filterLabels[value][lang]}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section bg-sand">
                    <div className="container">
                        {filteredProducts.length > 0 ? (
                            <div className="grid three">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} lang={lang} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>{lang === 'id' ? 'Tidak ada produk yang cocok dengan filter ini.' : 'No products match this filter yet.'}</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="section bg-linen">
                    <div className="container">
                        <div className="card order-info-card surface-card">
                            <div className="grid two" style={{ alignItems: 'center' }}>
                                <div className="order-info-text">
                                    <h3>{lang === 'id' ? 'Cara Memesan' : 'How to Order'}</h3>
                                    <p>
                                        {lang === 'id'
                                            ? 'Produk dengan stok tersedia bisa langsung diarahkan ke halaman kontak. Untuk stok menipis, sebaiknya segera hubungi kami agar unitnya tidak terlewat.'
                                            : 'Products with available stock can go straight to the contact page. For low stock items, it is best to reach out quickly before the remaining units are gone.'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <Link href={routes.contact} className="btn primary">
                                        {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
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
