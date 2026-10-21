# Warisku — Interactive Prototype + Real Authentication

Prototipe statis **Warisku: Family Continuity Platform** dengan autentikasi nyata melalui **Supabase Auth**:

- Daftar akun dengan nama, email, dan password.
- Login email/password.
- Konfirmasi email (jika diaktifkan di Supabase).
- Lupa password dan set password baru melalui link pemulihan.
- Login OAuth melalui Google dan Facebook.
- Sesi login persisten, logout, dan callback/redirect.
- Onboarding 3 slide otomatis untuk login pertama per akun; bisa dibuka kembali dari tombol **Panduan**.
- Tampilan demo tanpa login hanya muncul jika proyek Supabase belum dikonfigurasi. Demo berisi data dummy.

> **Penting:** autentikasi ini nyata setelah Anda memasukkan Supabase Project URL dan publishable/anon key serta mengaktifkan provider. Kredensial OAuth Google/Facebook harus disetel di dashboard masing-masing dan Supabase. Saya tidak dapat mengaktifkan provider di akun Anda karena memerlukan kredensial milik Anda.
>
> **Bukan production vault:** semua data aset yang ada di layar saat ini masih data contoh yang tertanam di frontend. Login tidak otomatis membuatnya tersimpan per pengguna atau melindunginya dari orang yang membaca source HTML. Jangan masukkan KTP, dokumen, nilai aset, password, private key, atau informasi pribadi sungguhan. Produk produksi memerlukan database/storage dan otorisasi server-side/RLS.

## Design refresh — Modern Family Fintech

UI menggunakan lapisan visual terpisah di `design-system.css`: warm white, forest green, aksen lime selektif, headline yang lebih kuat, dan preview Family Asset Map pada hero. Urutan produk, ID elemen, autentikasi, dan onboarding dipertahankan. Lihat `DESIGN_SYSTEM.md` untuk token warna dan prinsip desain.

Pastikan workflow GitHub Pages menyalin `design-system.css` ke `_site`. File tersebut sudah masuk daftar artifact di `.github/workflows/deploy-pages.yml`.

## 1. Struktur folder

```text
warisku-github-pages/
├── index.html                       # UI + layar login/register
├── auth.js                          # integrasi Supabase Auth
├── auth-config.js                   # Project URL dan public/publishable key
├── onboarding.js                    # First-login onboarding slides
├── onboarding.css                   # Responsive modal, carousel & dots
├── design-system.css                # Modern Family Fintech visual layer
├── DESIGN_SYSTEM.md                 # Design tokens and implementation notes
├── ONBOARDING.md                    # First-login onboarding behavior
├── assets/
│   ├── favicon.svg
│   ├── warisku_ui_overview.png
│   └── previews/                    # sembilan screenshot UI
├── .github/workflows/deploy-pages.yml
├── .nojekyll
├── .gitignore
└── README.md
```

## Onboarding pengguna baru

Setelah autentikasi berhasil, pengguna yang belum menyelesaikan pengenalan akan melihat modal tiga slide: (1) apa itu Warisku, (2) Family Asset Map dan diferensiasi dari folder penyimpanan umum, (3) protokol keluarga dan penjelasan bahwa heartbeat bukan bukti kematian atau izin membuka vault. Pengguna dapat geser di perangkat sentuh, memakai panah keyboard, memilih titik navigasi, kembali, melewati, atau menutup panduan.

Status penyelesaian disimpan ke metadata pengguna Supabase agar tidak muncul lagi di perangkat lain setelah sinkronisasi berhasil; localStorage per user menjadi fallback jika sinkronisasi gagal. Tombol **Panduan** di header membuka kembali tur kapan saja. Ini adalah UX onboarding saja, bukan data onboarding bisnis atau profil keluarga di database.

## 2. Buat proyek Supabase

1. Buka [Supabase](https://supabase.com/dashboard) dan buat proyek baru.
2. Di Project Settings/API Keys, ambil **Project URL** dan **publishable key** (atau `anon` key lama bila dashboard Anda masih menampilkannya).
3. Anda tidak perlu mengedit `auth-config.js` secara manual. Tambahkan dua Repository Actions variables di GitHub: `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY`. Workflow deployment akan membuat `auth-config.js` untuk versi situs yang dipublikasikan. Langkah detail ada di `AUTH_SETUP.md`.

`publishable`/`anon` key memang untuk client-side dan akan terlihat oleh browser. **Jangan pernah menaruh `service_role` key, database password, Google Client Secret, atau Facebook App Secret di `auth-config.js`, `auth.js`, atau repository frontend.** OAuth secrets hanya disimpan di dashboard penyedia/Supabase.

## 3. Konfigurasikan URL callback

Di Supabase: **Authentication → URL Configuration**.

- **Site URL**: URL GitHub Pages Anda, misalnya `https://USERNAME.github.io/REPO/`.
- **Redirect URLs** tambahkan URL produksi tersebut secara tepat.
- Untuk development lokal, tambahkan `http://localhost:8000/**`.
- Jika kadang membuka `index.html` secara langsung lewat URL, masukkan juga path tersebut. Disarankan menggunakan URL root situs.

URL harus cocok dengan URL yang benar-benar dipakai saat sign-in, reset password, dan konfirmasi email. Hindari wildcard terlalu luas pada lingkungan produksi.

## 4. Aktifkan login email

Di Supabase: **Authentication → Sign In / Providers** (nama menu dapat sedikit berbeda pada dashboard).

1. Pastikan provider Email aktif.
2. Untuk menguji signup dengan aman, biarkan email confirmation aktif.
3. Uji pendaftaran; buka email konfirmasi dan klik tautan. Jika tidak ada email, cek spam serta konfigurasi email.
4. Untuk deployment nyata, atur SMTP kustom dan template email yang sesuai. Layanan email bawaan untuk pengujian bukan pengganti konfigurasi email produksi yang andal.

Form yang tersedia mencakup daftar akun, login, lupa password, dan penggantian password menggunakan link pemulihan.

## 5. Aktifkan Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Siapkan Google Auth Platform / OAuth consent screen dan buat OAuth Client ID dengan tipe **Web application**.
3. **Authorized JavaScript origins**: masukkan origin situs Anda, misalnya `https://USERNAME.github.io` (origin tidak menyertakan `/REPO/`). Saat uji lokal tambahkan `http://localhost:8000`.
4. **Authorized redirect URI**: masukkan callback Supabase, biasanya `https://PROJECT_REF_ANDA.supabase.co/auth/v1/callback`. Salin URI persis dari Supabase **Authentication → Providers → Google** karena itulah callback yang benar.
5. Tempel Google Client ID dan Client Secret di konfigurasi provider Google pada dashboard Supabase, kemudian aktifkan provider.
6. Konfigurasikan consent screen dan test users/publishing status sesuai kebutuhan Google.

Perhatian: Google mengarahkan kembali ke callback Supabase terlebih dahulu; Supabase kemudian mengarahkan pengguna kembali ke URL Warisku yang sudah diizinkan pada langkah 3.

## 6. Aktifkan Facebook OAuth

1. Buka [Meta for Developers](https://developers.facebook.com/) dan buat aplikasi.
2. Tambahkan/aktifkan use case **Facebook Login**.
3. Pada pengaturan Facebook Login, masukkan callback Supabase ke **Valid OAuth Redirect URIs**: biasanya `https://PROJECT_REF_ANDA.supabase.co/auth/v1/callback`. Salin URI persis dari Supabase **Authentication → Providers → Facebook**.
4. Pastikan izin `public_profile` dan `email` tersedia. Email mungkin tidak diberikan jika akun Facebook tidak memiliki email yang terkonfirmasi atau izin belum tersedia.
5. Masukkan Facebook App ID dan App Secret hanya ke dashboard provider Facebook di Supabase, lalu aktifkan provider.
6. Lengkapi app domains, privacy policy, dan status Development/Live. Dalam Development, hanya pengguna/tester yang memenuhi aturan Meta yang dapat login; akses publik dapat memerlukan proses tinjauan atau konfigurasi Meta tambahan.

## 7. Tes lokal

Jangan membuka file dengan skema `file://`, karena OAuth redirect memerlukan origin HTTP/HTTPS. Dari root folder proyek:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000/`. Pastikan URL itu sudah ada pada Redirect URLs Supabase dan origin itu didaftarkan di Google OAuth bila sedang menguji Google login.

Lakukan test berikut:

1. Buat akun dengan email yang dapat diakses.
2. Konfirmasi email dan login dengan email/password.
3. Logout, kemudian login kembali.
4. Uji lupa password dan ikuti link pemulihan.
5. Uji Google dan Facebook setelah konfigurasi masing-masing selesai.
6. Pastikan pengguna yang logout kembali melihat layar login.

## 8. Push ke GitHub dan deploy

Workflow `.github/workflows/deploy-pages.yml` telah diperbarui agar menyalin `index.html`, `auth.js`, `auth-config.js`, `onboarding.js`, `onboarding.css`, `design-system.css`, dan `assets/` ke artifact Pages. GitHub Pages hanya host file frontend; backend autentikasi disediakan Supabase.

### Jika repository Anda sudah ada di komputer (disarankan)

1. Unduh ZIP terbaru dan ekstrak.
2. Salin/merge file proyek ke folder repository lokal yang sudah terhubung dengan GitHub. Jangan hapus repository atau history Git.
3. Replace file dengan nama sama dan tambahkan file baru. Pertahankan folder `.github/workflows/` dan `assets/`.
4. Dari root repository, jalankan:

```bash
git status
git add index.html design-system.css assets/favicon.svg README.md DESIGN_SYSTEM.md .github/workflows/deploy-pages.yml
git commit -m "Refresh Warisku UI with modern family fintech design"
git push origin main
```

Jika Anda juga mengganti/menambah asset, gunakan `git add -A` setelah mengecek `git status`.

### Jika hanya memakai situs GitHub

Unggah/replace file individual dengan path yang sama, dan tambahkan `auth.js` serta `auth-config.js` di root repo. Pastikan workflow tersimpan di `.github/workflows/deploy-pages.yml`. Lebih mudah memakai GitHub Desktop jika perlu menambahkan beberapa direktori sekaligus.

**Tidak perlu menghapus semua file di GitHub.** Perbarui `index.html`, `design-system.css`, `onboarding.css`, `onboarding.js`, `README.md`, dokumentasi desain, workflow, dan favicon. Pertahankan `auth.js`, `auth-config.js` aktif, serta konfigurasi/variables Supabase yang sudah berfungsi kecuali ada perubahan autentikasi khusus. Asset lain tetap dipertahankan. Jangan upload ZIP sebagai satu file dan berharap GitHub Pages mengekstraknya.

Sebelum push, buat Repository Actions variables `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` seperti dijelaskan di `AUTH_SETUP.md`. Setelah push, buka tab **Actions**, pastikan workflow hijau, lalu buka URL di Settings → Pages atau deployment job. File `auth-config.js` di repository boleh tetap berisi placeholder: workflow membuat salinan yang benar pada artifact deploy, jadi file itu tidak perlu diedit manual.

## 9. Batas keamanan yang wajib dipahami

- File frontend publik. Obfuscation atau menyembunyikan elemen HTML bukan kontrol akses server-side.
- Supabase Auth mengautentikasi akun, tetapi belum ada tabel profil/aset dan belum ada penyimpanan dokumen per pengguna dalam prototipe ini.
- Sebelum menyimpan data nyata, buat database/storage dan pasang Row Level Security (RLS) untuk membatasi setiap record ke pemilik sah. Untuk dokumen, gunakan bucket private dan signed URL berumur pendek, plus kontrol backend.
- Jangan simpan service-role key pada frontend. Jangan simpan bank password/private key di field bebas.
- OAuth provider secret tidak pernah ditempatkan dalam source code.
- Pastikan kebijakan privasi, terms, retention/deletion, recovery akun, audit trail, dan incident response disiapkan sebelum menerima data pribadi.
- Login berhasil bukan bukti e-KYC, bukan penetapan ahli waris, dan bukan persetujuan pembukaan vault.

## Referensi resmi

- [Supabase Auth — JavaScript sign up](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase Auth — password sign in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Supabase Auth — redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Auth — Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Auth — Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [GitHub Pages with GitHub Actions](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
