import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const statusCopy = {
    in_stock: {
        id: 'Tersedia',
        en: 'In Stock',
        helper: (availableStock, lang) => lang === 'id' ? `${formatKg(availableStock)} siap dipesan` : `${formatKg(availableStock)} ready to order`,
    },
    low_stock: {
        id: 'Stok Menipis',
        en: 'Low Stock',
        helper: (availableStock, lang) => lang === 'id' ? `Tersisa ${formatKg(availableStock)}` : `${formatKg(availableStock)} left`,
    },
    out_of_stock: {
        id: 'Stok Habis',
        en: 'Out of Stock',
        helper: (_, lang) => lang === 'id' ? 'Stok kilogram untuk produk ini sedang kosong' : 'This product is currently out of stock by weight',
    },
    inactive: {
        id: 'Nonaktif',
        en: 'Inactive',
        helper: (_, lang) => lang === 'id' ? 'Produk sedang disembunyikan dari katalog' : 'This product is currently hidden from the catalog',
    },
};

function formatKg(value) {
    return `${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0))} kg`;
}

export default function ProductCard({ product, lang }) {
    const { routes } = usePage().props;
    const {
        name,
        origin,
        roast_level,
        price,
        weight,
        tasting_notes,
        description_id,
        description_en,
        image_path,
        inventory_status,
        available_stock,
        sku,
    } = product;

    const safeNotes = Array.isArray(tasting_notes) ? tasting_notes : [];
    const formattedPrice = new Intl.NumberFormat('id-ID').format(Number(price ?? 0));
    const orderHref = `${routes.contact}?product=${encodeURIComponent(name)}`;
    const productImage = image_path || '/assets/images/products.png';
    const statusDetails = statusCopy[inventory_status] ?? statusCopy.in_stock;
    const isOrderDisabled = inventory_status === 'out_of_stock' || inventory_status === 'inactive';

    return (
        <div className="card">
            <div className="product-img">
                <div className="product-img-overlay">
                    <span>{lang === 'id' ? 'Lihat Detail' : 'View Details'}</span>
                </div>
                <img src={productImage} alt={name} />
            </div>
            <div className="product-body">
                <div className="product-origin">{origin}</div>
                <h3>{name}</h3>
                <div className="product-meta">
                    <div className={`inventory-pill ${inventory_status.replaceAll('_', '-')}`}>
                        {statusDetails[lang]}
                    </div>
                    <div className="stock-note">{statusDetails.helper(available_stock, lang)}</div>
                </div>
                <div className={`roast-badge roast-${roast_level}`}>
                    {roast_level.charAt(0).toUpperCase() + roast_level.slice(1)} Roast
                </div>
                <div className="product-description">
                    <p>{lang === 'id' ? description_id : description_en}</p>
                </div>
                <div className="tasting-notes">
                    {safeNotes.map((note, index) => (
                        <span key={index} className="note-chip">
                            {note}
                        </span>
                    ))}
                </div>
                <div className="product-footer">
                    <div>
                        <div className="product-price">Rp {formattedPrice}</div>
                        <div className="product-weight">{weight} / {sku}</div>
                    </div>
                    {isOrderDisabled ? (
                        <span className="btn btn-sm btn-disabled">
                            {lang === 'id' ? 'Tidak Tersedia' : 'Unavailable'}
                        </span>
                    ) : (
                        <Link className="btn primary btn-sm" href={orderHref}>
                            <span>{lang === 'id' ? 'Pesan' : 'Order'}</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
