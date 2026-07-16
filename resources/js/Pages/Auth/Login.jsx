import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Login({ intended }) {
    const { routes } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (event) => {
        event.preventDefault();

        const url = intended ? `${routes.login}?redirect=${encodeURIComponent(intended)}` : routes.login;

        post(url);
    };

    return (
        <>
            <Head title="Login" />

            <div className="auth-shell">
                <div className="auth-card">
                    <div className="kicker">Akses Admin</div>
                    <h1>Login Admin Javaloka</h1>
                    <p className="lede">
                        Halaman ini dipakai khusus untuk masuk ke dashboard admin agar katalog, stok, dan akun pengelola bisa diatur dari satu tempat.
                    </p>

                    <form className="auth-form" onSubmit={submit}>
                        <label className="form-field">
                            <span>Email</span>
                            <input
                                className="input"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                autoComplete="email"
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </label>

                        <label className="form-field">
                            <span>Password</span>
                            <input
                                className="input"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                autoComplete="current-password"
                            />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </label>

                        <label className="check-row">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                            />
                            <span>Ingat saya di perangkat ini</span>
                        </label>

                        <button type="submit" className="btn primary btn-full" disabled={processing}>
                            {processing ? 'Masuk...' : 'Login'}
                        </button>
                    </form>

                    <div className="auth-footer muted">
                        Admin demo: <code>admin@javaloka.test</code> / <code>password123</code>
                    </div>
                </div>
            </div>
        </>
    );
}
