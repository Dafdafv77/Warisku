# Warisku — First-login onboarding

## Perilaku

- Tur ditampilkan otomatis setelah sesi Supabase terautentikasi jika akun belum menyelesaikannya.
- Terdiri dari tiga slide: (1) nilai Warisku, (2) Family Asset Map dan dokumen yang boleh tetap berada di penyimpanan lain, (3) protokol keluarga dan akses yang tidak terbuka otomatis hanya karena heartbeat terlewat.
- Navigasi menggunakan tombol Kembali/Lanjut, tiga titik yang dapat diklik, panah kiri/kanan pada keyboard, dan swipe pada perangkat sentuh.
- Pengguna dapat melewati atau menutup tur. Penyelesaian/dismissal akan membuatnya tidak muncul otomatis lagi.
- Tombol **Panduan** di header bisa membuka tur kembali kapan saja.

## Penyimpanan status

Modul `onboarding.js` mendengarkan event `warisku:authenticated` yang dikirim `auth.js` dari `showApp(session)`. Status selesai dicatat pada `user_metadata.warisku_onboarding_completed_at` melalui Supabase Auth. Ada fallback localStorage per ID pengguna apabila sinkronisasi metadata gagal. Jika metadata ditulis, preferensi berlaku lintas perangkat; fallback localStorage hanya berlaku pada browser tersebut.

Event `warisku:signed-out` menutup modal jika sesi berakhir. Tur tidak pernah memproses dokumen atau data aset.

## File yang terlibat

- `index.html`: memuat `onboarding.css` dan `onboarding.js` sebelum modul `auth.js`.
- `onboarding.css`: style modal, responsif, animasi dan dot indicator.
- `onboarding.js`: tiga slide, navigasi, aksesibilitas, metadata status selesai, dan tombol buka ulang.
- `auth.js`: mengirim event pada sesi aktif dan saat kembali ke tampilan login.
- `.github/workflows/deploy-pages.yml`: menyalin kedua file onboarding ke `_site` sebelum publish GitHub Pages.

## Batasan

Status onboarding tidak menggunakan tabel profil aplikasi khusus; metadata Supabase dan localStorage hanya menyimpan flag pengalaman pengguna. Keduanya tidak menyimpan Family Asset Map. Data aset prototipe masih dummy, dan autentikasi tidak menjadikan data contoh tersimpan secara privat atau aman untuk dokumen nyata.
