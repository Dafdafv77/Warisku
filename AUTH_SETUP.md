# Warisku Auth Setup — tanpa mengedit auth-config.js

`auth-config.js` adalah template. Untuk GitHub Pages, nilai konfigurasi dibuat otomatis oleh GitHub Actions saat deployment. Jika file terlihat *read-only*, Anda tidak perlu mengedit file itu.

## 1. Tambahkan konfigurasi Supabase di GitHub

1. Buka repository GitHub Warisku.
2. Pilih **Settings → Secrets and variables → Actions → Variables**.
3. Klik **New repository variable** dua kali, lalu tambahkan:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Project URL dari Supabase, misalnya `https://abcdefgh.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key dari Supabase, atau legacy `anon` key jika itu yang tersedia di dashboard |

Gunakan project URL dan key milik proyek Warisku Anda. Publishable/anon key memang ditujukan untuk frontend; jangan pernah menggunakan `service_role` key atau database password.

Workflow juga dapat membaca dua nama tersebut dari **Actions Secrets** jika sebelumnya sudah disimpan sebagai secrets, tetapi **Variables** lebih mudah untuk nilai frontend yang memang bersifat publik.

## 2. Pastikan Supabase menerima URL situs

Di Supabase **Authentication → URL Configuration**:

- Set **Site URL** ke alamat GitHub Pages, misalnya `https://USERNAME.github.io/NAMA-REPO/`.
- Tambahkan URL itu persis ke daftar **Redirect URLs**.
- Untuk pengembangan lokal boleh tambahkan URL localhost yang digunakan, misalnya `http://localhost:8000/**`.
- Pastikan provider **Email** aktif. Jika confirmation email aktif, pengguna harus mengeklik tautan email sebelum login.

## 3. Commit dan deploy

1. Merge/salin file dari ZIP proyek terbaru ke repository lokal yang sudah ada; jangan hapus `.git`.
2. Commit `.github/workflows/deploy-pages.yml`, `README.md`, dan `AUTH_SETUP.md`. Anda boleh ikut commit `auth-config.js` yang masih berisi placeholder; workflow akan mengganti file tersebut hanya di workspace deployment.
3. Push ke `main`, atau buka **Actions → Deploy Warisku Prototype to GitHub Pages → Run workflow** setelah variables dibuat.
4. Pastikan job di tab Actions berhasil. Jika gagal dengan pesan `Missing Supabase configuration`, periksa nama dan scope repository variables.

Di **Settings → Pages**, source harus menggunakan **GitHub Actions**.

## 4. Google dan Facebook login

Login OAuth memerlukan kredensial provider yang dibuat oleh pemilik aplikasi:

- Masukkan Client ID dan Client Secret Google di Supabase **Authentication → Providers → Google**.
- Masukkan App ID dan App Secret Facebook di Supabase **Authentication → Providers → Facebook**.
- Tambahkan callback Supabase yang ditampilkan dashboard ke konfigurasi OAuth provider masing-masing.
- Tambahkan URL GitHub Pages ke Supabase Redirect URLs.

Jangan menaruh Google Client Secret atau Facebook App Secret dalam repository atau variabel frontend.

## 5. Troubleshooting

- **Login UI muncul tetapi auth config belum siap**: buat `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY`, lalu deploy ulang.
- **Signup berhasil tapi tidak bisa login**: periksa email confirmation dan inbox/spam.
- **Redirect error**: periksa Site URL, Redirect URLs, dan OAuth callback.
- **Login berhasil tetapi dashboard masih data dummy**: autentikasi belum menyambungkan data aset. Sebelum memakai data nyata, database/storage dan Row Level Security (RLS) harus dibangun dan diuji.

Jangan memasukkan KTP atau data aset nyata pada prototipe ini.
