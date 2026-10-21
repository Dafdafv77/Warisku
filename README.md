# Warisku — Interactive Product Prototype

Prototipe statis untuk konsep **Warisku: Family Continuity Platform**. UI menunjukkan end-to-end flow dari onboarding, Family Asset Map, readiness review, trusted contacts, konfigurasi heartbeat, review kasus, hingga Family Action Center dan tinjauan tahunan.

> **Penting:** ini hanya prototipe frontend dengan data contoh. Tidak ada backend, autentikasi, penyimpanan dokumen, verifikasi identitas/kematian, notifikasi nyata, atau pembukaan akses sesungguhnya. Jangan masukkan KTP, data aset, password, private key, atau informasi pribadi nyata.

## Preview

![Overview UI Warisku](assets/warisku_ui_overview.png)

## Jalankan secara lokal

Cara paling sederhana: buka `index.html` melalui browser.

Atau gunakan server statis lokal agar perilakunya lebih mirip hosting:

```bash
python -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Deploy ke GitHub Pages

Repository ini sudah menyertakan workflow GitHub Actions di `.github/workflows/deploy-pages.yml`. Setiap push ke branch `main` akan menerbitkan isi `index.html` dan folder `assets/` ke GitHub Pages.

1. Buat repository baru di GitHub, misalnya `warisku-prototype`. Pilih **Public** jika ingin menggunakan GitHub Pages dengan akun Free.
2. Ekstrak folder proyek ini, lalu push **isi folder** ke root repository (jangan mengunggah ZIP sebagai satu file).
3. Pastikan branch utama bernama `main`.
4. Buka **Settings → Pages** pada repository.
5. Pada bagian **Build and deployment → Source**, pilih **GitHub Actions**.
6. Buka tab **Actions**. Workflow `Deploy Warisku Prototype to GitHub Pages` akan berjalan setelah push. Tunggu sampai statusnya hijau.
7. Buka **Settings → Pages** atau deployment job di Actions untuk mendapatkan URL situs.

URL biasanya berbentuk `https://NAMA-USER.github.io/NAMA-REPO/` untuk repository proyek. Gunakan URL yang diberikan GitHub sebagai sumber final.

### Push melalui terminal

Dari folder proyek ini, jika Git sudah terpasang:

```bash
git init
git add .
git commit -m "Initial Warisku prototype"
git branch -M main
git remote add origin https://github.com/NAMA-USER/NAMA-REPO.git
git push -u origin main
```

Ganti `NAMA-USER` dan `NAMA-REPO` dengan akun serta repository Anda. Jika folder ini sudah merupakan repository Git, jangan jalankan `git init` ulang; cukup tambahkan remote bila belum ada, lalu commit dan push.

### Setelah mengubah UI

Edit `index.html`, commit, dan push ke branch `main`. GitHub Actions akan menerbitkan versi terbaru secara otomatis. Workflow hanya mengunggah `index.html` dan `assets/`. Simpan dokumen strategi atau spesifikasi internal di lokasi/repository terpisah jika Anda tidak ingin dokumen tersebut terlihat oleh publik.

## Isi repository

```text
warisku-github-pages/
├── index.html                       # UI demo; CSS dan JavaScript tertanam
├── assets/
│   ├── favicon.svg
│   ├── warisku_ui_overview.png       # overview sembilan tahap
│   └── previews/                    # screenshot tiap tahap
├── .github/workflows/
│   └── deploy-pages.yml             # deploy otomatis ke GitHub Pages
├── .nojekyll
├── .gitignore
└── README.md
```

## Batasan prototipe dan sebelum produksi

- Tombol dan data hanya mensimulasikan interaksi browser; perubahan tidak tersimpan di server dan dapat hilang saat halaman di-refresh.
- Semua data aset yang terlihat adalah data contoh.
- Sistem produksi memerlukan backend, autentikasi/MFA, otorisasi per item, enkripsi dan manajemen kunci, audit trail, backup/pemulihan, retensi/penghapusan, monitoring, serta proses review manual yang aman.
- Heartbeat yang terlewat bukan bukti kematian dan tidak boleh membuka vault otomatis. Status laporan peristiwa, bukti kematian/ketidakmampuan, dasar kewenangan, sengketa, dan persetujuan pelepasan harus dipisahkan.
- Sebelum deployment publik, pastikan tidak ada data pribadi atau rahasia di HTML, commit history, screenshot, konfigurasi, atau dokumentasi yang diterbitkan.

