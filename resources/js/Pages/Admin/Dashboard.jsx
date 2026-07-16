import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    inactive: 'Inactive',
};

const movementLabels = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    reserved: 'Reserved',
    released: 'Released',
    adjusted: 'Adjusted',
};

const weightOptions = ['200g', '500g', '1kg'];

const blankCatalogForm = {
    name: '',
    sku: '',
    origin: '',
    roast_level: 'medium',
    type: 'single-origin',
    price: '0',
    weight: '200g',
    description_id: '',
    description_en: '',
    tasting_notes: '',
    image_path: '',
    stock: '0',
    low_stock_threshold: '5',
    is_active: true,
    is_featured: false,
    note: '',
};

const blankAccountForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

function serializeNotes(notes) {
    return Array.isArray(notes) ? notes.join(', ') : '';
}

function parseWeightSelections(weightValue) {
    return String(weightValue ?? '')
        .split(',')
        .map((weight) => weight.trim())
        .filter(Boolean);
}

function serializeWeightSelections(weights) {
    return weights.join(', ');
}

function resolveWeightOptions(currentWeight) {
    return Array.from(new Set([
        ...weightOptions,
        ...parseWeightSelections(currentWeight),
    ]));
}

function toggleWeightSelection(currentWeight, nextWeight) {
    const selectedWeights = parseWeightSelections(currentWeight);
    const nextSelections = selectedWeights.includes(nextWeight)
        ? selectedWeights.filter((weight) => weight !== nextWeight)
        : [...selectedWeights, nextWeight];

    return serializeWeightSelections(nextSelections);
}

function makeProductDrafts(products) {
    return Object.fromEntries(products.map((product) => [
        product.id,
        {
            name: product.name,
            sku: product.sku,
            origin: product.origin,
            roast_level: product.roast_level,
            type: product.type,
            price: String(product.price),
            weight: product.weight,
            description_id: product.description_id,
            description_en: product.description_en,
            tasting_notes: serializeNotes(product.tasting_notes),
            image_path: product.image_path || '',
            stock: String(product.stock),
            low_stock_threshold: String(product.low_stock_threshold),
            is_active: product.is_active,
            is_featured: product.is_featured,
            note: '',
        },
    ]));
}

function makeAccountDrafts(users) {
    return Object.fromEntries(users.map((user) => [
        user.id,
        {
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        },
    ]));
}

function formatDate(value) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatKg(value) {
    return `${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0))} kg`;
}

export default function Dashboard({ products, users, recentMovements, stats }) {
    const { auth, flash, errors } = usePage().props;
    const currentUser = auth?.user;
    const [activeTab, setActiveTab] = useState('inventory');
    const [productDrafts, setProductDrafts] = useState(() => makeProductDrafts(products));
    const [accountDrafts, setAccountDrafts] = useState(() => makeAccountDrafts(users));
    const [createProductDraft, setCreateProductDraft] = useState(blankCatalogForm);
    const [createAccountDraft, setCreateAccountDraft] = useState(blankAccountForm);
    const [submittingKey, setSubmittingKey] = useState(null);

    useEffect(() => {
        setProductDrafts(makeProductDrafts(products));
        setCreateProductDraft(blankCatalogForm);
    }, [products]);

    useEffect(() => {
        setAccountDrafts(makeAccountDrafts(users));
        setCreateAccountDraft(blankAccountForm);
    }, [users]);

    const errorList = useMemo(() => Object.values(errors ?? {}), [errors]);
    const adminCount = useMemo(
        () => users.length,
        [users],
    );

    const updateProductDraft = (productId, field, value) => {
        setProductDrafts((currentDrafts) => ({
            ...currentDrafts,
            [productId]: {
                ...currentDrafts[productId],
                [field]: value,
            },
        }));
    };

    const updateAccountDraft = (userId, field, value) => {
        setAccountDrafts((currentDrafts) => ({
            ...currentDrafts,
            [userId]: {
                ...currentDrafts[userId],
                [field]: value,
            },
        }));
    };

    const updateCreateProductDraft = (field, value) => {
        setCreateProductDraft((currentDraft) => ({
            ...currentDraft,
            [field]: value,
        }));
    };

    const updateCreateAccountDraft = (field, value) => {
        setCreateAccountDraft((currentDraft) => ({
            ...currentDraft,
            [field]: value,
        }));
    };

    const submitInventory = (productId) => {
        const draft = productDrafts[productId];
        const submitKey = `inventory-${productId}`;

        setSubmittingKey(submitKey);

        router.patch(`/admin/products/${productId}/inventory`, {
            stock: Number(draft.stock),
            low_stock_threshold: Number(draft.low_stock_threshold),
            is_active: draft.is_active,
            note: draft.note,
        }, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const submitCatalogUpdate = (productId) => {
        const draft = productDrafts[productId];
        const submitKey = `catalog-${productId}`;

        setSubmittingKey(submitKey);

        router.put(`/admin/products/${productId}`, {
            ...draft,
            stock: Number(draft.stock),
            low_stock_threshold: Number(draft.low_stock_threshold),
        }, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const submitCatalogCreate = (event) => {
        event.preventDefault();

        setSubmittingKey('create-product');

        router.post('/admin/products', {
            ...createProductDraft,
            stock: Number(createProductDraft.stock),
            low_stock_threshold: Number(createProductDraft.low_stock_threshold),
        }, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const deleteProduct = (productId, productName) => {
        if (! window.confirm(`Hapus produk "${productName}"? Riwayat stoknya juga akan ikut terhapus.`)) {
            return;
        }

        const submitKey = `delete-${productId}`;
        setSubmittingKey(submitKey);

        router.delete(`/admin/products/${productId}`, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const submitAccountCreate = (event) => {
        event.preventDefault();

        setSubmittingKey('create-account');

        router.post('/admin/accounts', createAccountDraft, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const submitAccountUpdate = (userId) => {
        const draft = accountDrafts[userId];
        const submitKey = `account-${userId}`;

        setSubmittingKey(submitKey);

        router.put(`/admin/accounts/${userId}`, draft, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    const deleteAccount = (userId, userName) => {
        if (! window.confirm(`Hapus akun "${userName}"? Tindakan ini tidak bisa dibatalkan.`)) {
            return;
        }

        const submitKey = `delete-account-${userId}`;
        setSubmittingKey(submitKey);

        router.delete(`/admin/accounts/${userId}`, {
            preserveScroll: true,
            onFinish: () => setSubmittingKey(null),
        });
    };

    return (
        <div className="admin-dashboard bg-sand" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <Head title="Admin Dashboard" />

            <nav className="site-header scrolled">
                <div className="container nav">
                    <div className="brand">
                        <img src="/assets/images/logo.jpg" alt="Logo" />
                        ADMIN <span>PANEL</span>
                    </div>
                    <div className="nav-actions">
                        <Link href="/" className="btn ghost btn-sm">Lihat Situs</Link>
                        <Link href="/logout" method="post" as="button" className="btn primary btn-sm">Logout</Link>
                    </div>
                </div>
            </nav>

            <main className="container" style={{ paddingTop: '120px' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1>Ringkasan Operasional Javaloka</h1>
                    <p className="lede">Dashboard admin inventaris, katalog produk, dan akun pengelola</p>
                </header>

                {flash?.success && <div className="admin-flash success">{flash.success}</div>}
                {flash?.error && <div className="admin-flash error">{flash.error}</div>}
                {errorList.length > 0 && (
                    <div className="admin-flash error">
                        {errorList.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </div>
                )}

                <div className="admin-summary-grid">
                    <div className="admin-summary-card">
                        <div className="stat-label">Total Produk</div>
                        <div className="stat-number">{stats.total_products}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Produk Aktif</div>
                        <div className="stat-number">{stats.active_products}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Stok Menipis</div>
                        <div className="stat-number">{stats.low_stock_products}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Stok Habis</div>
                        <div className="stat-number">{stats.out_of_stock_products}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Stok Fisik (kg)</div>
                        <div className="stat-number">{formatKg(stats.total_units)}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Reserved (kg)</div>
                        <div className="stat-number">{formatKg(stats.reserved_units)}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Akun Admin</div>
                        <div className="stat-number">{stats.total_accounts}</div>
                    </div>
                    <div className="admin-summary-card">
                        <div className="stat-label">Produk Pilihan</div>
                        <div className="stat-number">{stats.featured_products}</div>
                    </div>
                </div>

                <div className="tags admin-tab-strip" style={{ marginBottom: '32px' }}>
                    <button type="button" className={`tag ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                        Manajemen Stok
                    </button>
                    <button type="button" className={`tag ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
                        Edit Katalog
                    </button>
                    <button type="button" className={`tag ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
                        Kelola Admin
                    </button>
                    <button type="button" className={`tag ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>
                        Riwayat Pergerakan
                    </button>
                </div>

                <div className="admin-panel">
                    {activeTab === 'inventory' && (
                        <div>
                            <div className="admin-panel-header">
                                <div>
                                    <h3>Kontrol Inventaris</h3>
                                    <p className="inventory-helper-text">Atur stok fisik dalam kilogram, threshold stok menipis, dan status aktif setiap produk.</p>
                                </div>
                            </div>

                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>SKU</th>
                                            <th>Fisik (kg)</th>
                                            <th>Reserved (kg)</th>
                                            <th>Tersedia (kg)</th>
                                            <th>Threshold (kg)</th>
                                            <th>Status</th>
                                            <th>Catatan</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => {
                                            const draft = productDrafts[product.id];

                                            return (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="inventory-product-name">{product.name}</div>
                                                        <div className="inventory-helper-text">{product.origin}</div>
                                                    </td>
                                                    <td>{product.sku}</td>
                                                    <td>
                                                        <input className="inventory-input" type="number" min="0" step="0.01" value={draft.stock} onChange={(event) => updateProductDraft(product.id, 'stock', event.target.value)} />
                                                    </td>
                                                    <td>{formatKg(product.reserved_stock)}</td>
                                                    <td>{formatKg(product.available_stock)}</td>
                                                    <td>
                                                        <input className="inventory-input" type="number" min="0" step="0.01" value={draft.low_stock_threshold} onChange={(event) => updateProductDraft(product.id, 'low_stock_threshold', event.target.value)} />
                                                    </td>
                                                    <td>
                                                        <div className="inventory-status-cell">
                                                            <span className={`inventory-pill ${product.inventory_status.replaceAll('_', '-')}`}>
                                                                {statusLabels[product.inventory_status]}
                                                            </span>
                                                            <label className="inventory-checkbox">
                                                                <input type="checkbox" checked={draft.is_active} onChange={(event) => updateProductDraft(product.id, 'is_active', event.target.checked)} />
                                                                <span>Aktif</span>
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input className="inventory-note" type="text" value={draft.note} placeholder="Contoh: stock opname mingguan" onChange={(event) => updateProductDraft(product.id, 'note', event.target.value)} />
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                            <button type="button" className="btn primary btn-sm" onClick={() => submitInventory(product.id)} disabled={submittingKey === `inventory-${product.id}`}>
                                                                {submittingKey === `inventory-${product.id}` ? 'Menyimpan...' : 'Simpan'}
                                                            </button>
                                                            <button type="button" className="btn ghost btn-sm danger-ghost" onClick={() => deleteProduct(product.id, product.name)} disabled={submittingKey === `delete-${product.id}`}>
                                                                {submittingKey === `delete-${product.id}` ? 'Menghapus...' : 'Hapus'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'catalog' && (
                        <div className="catalog-stack">
                            <div className="surface-card">
                                <div className="admin-panel-header">
                                    <div>
                                        <h3>Tambah Produk Baru</h3>
                                        <p className="inventory-helper-text">Gunakan form ini untuk menambah produk baru lengkap dengan SKU unik, detail katalog, dan stok awal dalam kilogram.</p>
                                    </div>
                                </div>

                                <div className="admin-flash" style={{ marginBottom: '24px' }}>
                                    SKU dipakai sebagai kode unik produk. Stok dan threshold diisi dalam satuan kilogram. Centang produk pilihan untuk menampilkannya di section unggulan beranda.
                                </div>

                                <form className="catalog-form-grid" onSubmit={submitCatalogCreate}>
                                    <label className="form-field">
                                        <span>Nama Produk</span>
                                        <input className="input" type="text" value={createProductDraft.name} onChange={(event) => updateCreateProductDraft('name', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>SKU</span>
                                        <input className="input" type="text" value={createProductDraft.sku} onChange={(event) => updateCreateProductDraft('sku', event.target.value)} placeholder="Contoh: JVL-GAYO-200" />
                                    </label>
                                    <label className="form-field">
                                        <span>Origin</span>
                                        <input className="input" type="text" value={createProductDraft.origin} onChange={(event) => updateCreateProductDraft('origin', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Roast Level</span>
                                        <select className="select" value={createProductDraft.roast_level} onChange={(event) => updateCreateProductDraft('roast_level', event.target.value)}>
                                            <option value="light">Light</option>
                                            <option value="medium">Medium</option>
                                            <option value="dark">Dark</option>
                                        </select>
                                    </label>
                                    <label className="form-field">
                                        <span>Tipe</span>
                                        <select className="select" value={createProductDraft.type} onChange={(event) => updateCreateProductDraft('type', event.target.value)}>
                                            <option value="single-origin">Single Origin</option>
                                            <option value="blend">Blend</option>
                                        </select>
                                    </label>
                                    <label className="form-field">
                                        <span>Harga</span>
                                        <input className="input" type="number" min="0" step="1000" value={createProductDraft.price} onChange={(event) => updateCreateProductDraft('price', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Berat</span>
                                        <select className="select" value={createProductDraft.weight} onChange={(event) => updateCreateProductDraft('weight', event.target.value)}>
                                            {weightOptions.map((weightOption) => (
                                                <option key={weightOption} value={weightOption}>
                                                    {weightOption}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="form-field">
                                        <span>Stok Awal (kg)</span>
                                        <input className="input" type="number" min="0" step="0.01" value={createProductDraft.stock} onChange={(event) => updateCreateProductDraft('stock', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Threshold (kg)</span>
                                        <input className="input" type="number" min="0" step="0.01" value={createProductDraft.low_stock_threshold} onChange={(event) => updateCreateProductDraft('low_stock_threshold', event.target.value)} />
                                    </label>
                                    <label className="form-field catalog-full">
                                        <span>Image Path</span>
                                        <input className="input" type="text" value={createProductDraft.image_path} onChange={(event) => updateCreateProductDraft('image_path', event.target.value)} placeholder="/assets/images/example.jpg" />
                                    </label>
                                    <label className="form-field catalog-full">
                                        <span>Deskripsi ID</span>
                                        <textarea className="textarea" rows="4" value={createProductDraft.description_id} onChange={(event) => updateCreateProductDraft('description_id', event.target.value)}></textarea>
                                    </label>
                                    <label className="form-field catalog-full">
                                        <span>Deskripsi EN</span>
                                        <textarea className="textarea" rows="4" value={createProductDraft.description_en} onChange={(event) => updateCreateProductDraft('description_en', event.target.value)}></textarea>
                                    </label>
                                    <label className="form-field catalog-full">
                                        <span>Tasting Notes</span>
                                        <input className="input" type="text" value={createProductDraft.tasting_notes} onChange={(event) => updateCreateProductDraft('tasting_notes', event.target.value)} placeholder="Chocolate, Citrus, Floral" />
                                    </label>
                                    <label className="inventory-checkbox">
                                        <input type="checkbox" checked={createProductDraft.is_active} onChange={(event) => updateCreateProductDraft('is_active', event.target.checked)} />
                                        <span>Produk aktif dan tampil di katalog</span>
                                    </label>
                                    <label className="inventory-checkbox">
                                        <input type="checkbox" checked={createProductDraft.is_featured} onChange={(event) => updateCreateProductDraft('is_featured', event.target.checked)} />
                                        <span>Tampilkan di Produk Pilihan beranda</span>
                                    </label>
                                    <div className="catalog-actions catalog-full">
                                        <button type="submit" className="btn primary" disabled={submittingKey === 'create-product'}>
                                            {submittingKey === 'create-product' ? 'Menyimpan...' : 'Tambah Produk'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="catalog-list">
                                {products.map((product) => {
                                    const draft = productDrafts[product.id];
                                    const availableWeightOptions = resolveWeightOptions(draft.weight);
                                    const selectedWeights = parseWeightSelections(draft.weight);
                                    const isFeaturedDraft = Boolean(draft.is_featured);

                                    return (
                                        <div key={product.id} className="surface-card catalog-editor-card">
                                            <div className="catalog-editor-header">
                                                <div>
                                                    <div className="inventory-product-name">{product.name}</div>
                                                    <div className="inventory-helper-text">{product.sku} / {product.origin}</div>
                                                </div>
                                                <div className="catalog-editor-status-cluster">
                                                    {isFeaturedDraft && (
                                                        <span className="featured-product-pill">Produk Pilihan</span>
                                                    )}
                                                    <div className={`inventory-pill ${product.inventory_status.replaceAll('_', '-')}`}>
                                                        {statusLabels[product.inventory_status]}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="catalog-form-grid">
                                                <label className="form-field">
                                                    <span>Nama Produk</span>
                                                    <input className="input" type="text" value={draft.name} onChange={(event) => updateProductDraft(product.id, 'name', event.target.value)} />
                                                </label>
                                                <label className="form-field">
                                                    <span>SKU</span>
                                                    <input className="input" type="text" value={draft.sku} onChange={(event) => updateProductDraft(product.id, 'sku', event.target.value)} placeholder="Contoh: JVL-GAYO-200" />
                                                </label>
                                                <label className="form-field">
                                                    <span>Origin</span>
                                                    <input className="input" type="text" value={draft.origin} onChange={(event) => updateProductDraft(product.id, 'origin', event.target.value)} />
                                                </label>
                                                <label className="form-field">
                                                    <span>Roast Level</span>
                                                    <select className="select" value={draft.roast_level} onChange={(event) => updateProductDraft(product.id, 'roast_level', event.target.value)}>
                                                        <option value="light">Light</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="dark">Dark</option>
                                                    </select>
                                                </label>
                                                <label className="form-field">
                                                    <span>Tipe</span>
                                                    <select className="select" value={draft.type} onChange={(event) => updateProductDraft(product.id, 'type', event.target.value)}>
                                                        <option value="single-origin">Single Origin</option>
                                                        <option value="blend">Blend</option>
                                                    </select>
                                                </label>
                                                <label className="form-field">
                                                    <span>Harga</span>
                                                    <input className="input" type="number" min="0" step="1000" value={draft.price} onChange={(event) => updateProductDraft(product.id, 'price', event.target.value)} />
                                                </label>
                                                <label className="form-field">
                                                    <span>Berat</span>
                                                    <div className="weight-choice-group">
                                                        {availableWeightOptions.map((weightOption) => (
                                                            <label key={weightOption} className="weight-choice-option">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedWeights.includes(weightOption)}
                                                                    onChange={() => updateProductDraft(
                                                                        product.id,
                                                                        'weight',
                                                                        toggleWeightSelection(draft.weight, weightOption),
                                                                    )}
                                                                />
                                                                <span>{weightOption}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </label>
                                                <label className="form-field">
                                                    <span>Image Path</span>
                                                    <input className="input" type="text" value={draft.image_path} onChange={(event) => updateProductDraft(product.id, 'image_path', event.target.value)} />
                                                </label>
                                                <label className="form-field catalog-full">
                                                    <span>Deskripsi ID</span>
                                                    <textarea className="textarea" rows="4" value={draft.description_id} onChange={(event) => updateProductDraft(product.id, 'description_id', event.target.value)}></textarea>
                                                </label>
                                                <label className="form-field catalog-full">
                                                    <span>Deskripsi EN</span>
                                                    <textarea className="textarea" rows="4" value={draft.description_en} onChange={(event) => updateProductDraft(product.id, 'description_en', event.target.value)}></textarea>
                                                </label>
                                                <label className="form-field catalog-full">
                                                    <span>Tasting Notes</span>
                                                    <input className="input" type="text" value={draft.tasting_notes} onChange={(event) => updateProductDraft(product.id, 'tasting_notes', event.target.value)} />
                                                </label>
                                                <label className="inventory-checkbox catalog-full">
                                                    <input type="checkbox" checked={draft.is_featured} onChange={(event) => updateProductDraft(product.id, 'is_featured', event.target.checked)} />
                                                    <span>Tampilkan produk ini di section Produk Pilihan beranda</span>
                                                </label>
                                                <div className="catalog-actions catalog-full">
                                                    <button type="button" className="btn primary btn-sm" onClick={() => submitCatalogUpdate(product.id)} disabled={submittingKey === `catalog-${product.id}`}>
                                                        {submittingKey === `catalog-${product.id}` ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                    </button>
                                                    <button type="button" className="btn ghost btn-sm danger-ghost" onClick={() => deleteProduct(product.id, product.name)} disabled={submittingKey === `delete-${product.id}`}>
                                                        {submittingKey === `delete-${product.id}` ? 'Menghapus...' : 'Hapus Produk'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="catalog-stack">
                            <div className="surface-card">
                                <div className="admin-panel-header">
                                    <div>
                                        <h3>Tambah Admin Baru</h3>
                                        <p className="inventory-helper-text">Buat akun admin langsung dari dashboard, lalu kelola nama, email, dan password-nya di bawah.</p>
                                    </div>
                                </div>

                                <form className="catalog-form-grid" onSubmit={submitAccountCreate}>
                                    <label className="form-field">
                                        <span>Nama</span>
                                        <input className="input" type="text" value={createAccountDraft.name} onChange={(event) => updateCreateAccountDraft('name', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Email</span>
                                        <input className="input" type="email" value={createAccountDraft.email} onChange={(event) => updateCreateAccountDraft('email', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Password</span>
                                        <input className="input" type="password" value={createAccountDraft.password} onChange={(event) => updateCreateAccountDraft('password', event.target.value)} />
                                    </label>
                                    <label className="form-field">
                                        <span>Konfirmasi Password</span>
                                        <input className="input" type="password" value={createAccountDraft.password_confirmation} onChange={(event) => updateCreateAccountDraft('password_confirmation', event.target.value)} />
                                    </label>
                                    <div className="catalog-actions catalog-full">
                                        <button type="submit" className="btn primary" disabled={submittingKey === 'create-account'}>
                                            {submittingKey === 'create-account' ? 'Menyimpan...' : 'Tambah Admin'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="catalog-list">
                                {users.map((user) => {
                                    const draft = accountDrafts[user.id];
                                    const isCurrentUser = Number(currentUser?.id) === Number(user.id);
                                    const isSoleAdmin = adminCount === 1;

                                    return (
                                        <div key={user.id} className="surface-card catalog-editor-card">
                                            <div className="catalog-editor-header">
                                                <div>
                                                    <div className="inventory-product-name">{user.name}</div>
                                                    <div className="inventory-helper-text">{user.email}</div>
                                                </div>
                                                <div className="account-badges">
                                                    {isCurrentUser && <span className="account-role-pill account-role-current">Akun Anda</span>}
                                                    <span className="account-role-pill account-role-admin">Admin</span>
                                                </div>
                                            </div>

                                            <div className="catalog-form-grid">
                                                <label className="form-field">
                                                    <span>Nama</span>
                                                    <input className="input" type="text" value={draft.name} onChange={(event) => updateAccountDraft(user.id, 'name', event.target.value)} />
                                                </label>
                                                <label className="form-field">
                                                    <span>Email</span>
                                                    <input className="input" type="email" value={draft.email} onChange={(event) => updateAccountDraft(user.id, 'email', event.target.value)} />
                                                </label>
                                                <label className="form-field">
                                                    <span>Password Baru</span>
                                                    <input className="input" type="password" value={draft.password} onChange={(event) => updateAccountDraft(user.id, 'password', event.target.value)} placeholder="Kosongkan jika tidak diganti" />
                                                </label>
                                                <label className="form-field">
                                                    <span>Konfirmasi Password</span>
                                                    <input className="input" type="password" value={draft.password_confirmation} onChange={(event) => updateAccountDraft(user.id, 'password_confirmation', event.target.value)} placeholder="Ulangi password baru" />
                                                </label>
                                                <div className="catalog-full account-note-row">
                                                    <p className="inventory-helper-text">Terdaftar: {formatDate(user.created_at)}</p>
                                                    {isCurrentUser && (
                                                        <p className="inventory-helper-text">Akun yang sedang Anda pakai tidak bisa dihapus dari sesi admin ini.</p>
                                                    )}
                                                    {isSoleAdmin && (
                                                        <p className="inventory-helper-text">Admin terakhir tidak bisa dihapus sampai ada admin lain.</p>
                                                    )}
                                                </div>
                                                <div className="catalog-actions catalog-full">
                                                    <button type="button" className="btn primary btn-sm" onClick={() => submitAccountUpdate(user.id)} disabled={submittingKey === `account-${user.id}`}>
                                                        {submittingKey === `account-${user.id}` ? 'Menyimpan...' : 'Simpan Akun'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn ghost btn-sm danger-ghost"
                                                        onClick={() => deleteAccount(user.id, user.name)}
                                                        disabled={isCurrentUser || isSoleAdmin || submittingKey === `delete-account-${user.id}`}
                                                    >
                                                        {submittingKey === `delete-account-${user.id}` ? 'Menghapus...' : 'Hapus Akun'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'movements' && (
                        <div>
                            <div className="admin-panel-header">
                                <div>
                                    <h3>Riwayat Pergerakan Stok</h3>
                                    <p className="inventory-helper-text">Setiap perubahan stok disimpan sebagai jejak audit sederhana untuk kebutuhan operasional.</p>
                                </div>
                            </div>

                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Waktu</th>
                                            <th>Produk</th>
                                            <th>Tipe</th>
                                            <th>Kuantitas (kg)</th>
                                            <th>Stok Setelah (kg)</th>
                                            <th>Reserved Setelah (kg)</th>
                                            <th>Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentMovements.length > 0 ? (
                                            recentMovements.map((movement) => (
                                                <tr key={movement.id}>
                                                    <td>{formatDate(movement.created_at)}</td>
                                                    <td>
                                                        <div className="inventory-product-name">{movement.product?.name ?? 'Produk tidak ditemukan'}</div>
                                                        <div className="inventory-helper-text">{movement.product?.sku ?? '-'}</div>
                                                    </td>
                                                    <td>{movementLabels[movement.type] ?? movement.type}</td>
                                                    <td>{formatKg(movement.quantity)}</td>
                                                    <td>{formatKg(movement.stock_after)}</td>
                                                    <td>{formatKg(movement.reserved_after)}</td>
                                                    <td>{movement.note || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7">
                                                    <div className="empty-state">
                                                        <p>Belum ada pergerakan stok yang tercatat.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
