# Deploy ZIP ke Hostinger

Konfigurasi lokal saat ini sudah disesuaikan supaya lebih aman untuk shared hosting:

- `SESSION_DRIVER=cookie`
- `CACHE_STORE=array`
- `QUEUE_CONNECTION=sync`

Artinya request web tidak lagi bergantung pada tabel `sessions`, `cache`, atau `jobs`, yang sering menjadi penyebab `500` saat deploy pertama.

## File yang harus ikut di ZIP

Pastikan arsip upload kamu tetap menyertakan:

- `vendor/`
- `public/build/`
- `storage/`
- `database/database.sqlite`
- `.env`

`node_modules/` tidak perlu ikut.

File mode development seperti `public/hot` juga jangan ikut.

## Checklist server

1. Gunakan PHP `8.3` atau lebih baru.
2. Pastikan folder `storage/` dan `bootstrap/cache/` writable.
3. Kalau tetap memakai SQLite, pastikan `database/database.sqlite` ada di server dan writable.
4. Kalau nanti pindah ke MySQL Hostinger, ubah `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database
```

## Kalau domain belum diarahkan ke folder `public`

Cara paling aman adalah menjadikan folder `public` sebagai document root domain.

Repo ini sekarang juga punya fallback root [`.htaccess`](D:/Side%20Hustle/Javaloka/javaloka/.htaccess) supaya kalau seluruh project diextract langsung ke web root Apache, request akan diarahkan ke folder `public` dan folder sensitif tetap diblok.

Kalau setup hosting kamu mengharuskan `public_html` sebagai root, extract seluruh isi project ke sana dan pastikan Apache membaca file `.htaccess`.
