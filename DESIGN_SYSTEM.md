# Warisku Design System — Modern Family Fintech

## Tujuan
Warisku harus terasa modern, hangat, premium, dan mudah dipahami—bukan seperti aplikasi administrasi hukum tradisional ataupun dashboard SaaS generik. Perubahan ini hanya menyentuh presentasi visual dan tidak mengubah urutan alur produk, Supabase Auth, ataupun onboarding.

## Prinsip
- **Clarity first:** satu headline utama, satu tindakan dominan, istilah yang mudah dimengerti.
- **Modern, not cold:** dasar warm-white dan forest green dengan aksen lime yang dipakai secara selektif.
- **Product as proof:** hero menggunakan mockup Family Asset Map, bukan ilustrasi stok generik.
- **Quiet dashboard:** kartu hanya untuk mengelompokkan informasi; hierarki dibangun melalui tipografi, spacing, dan pemisah.
- **Accessible by default:** target sentuh sekitar 44–48 px, focus state terlihat, layout responsif, dan dukungan reduced motion.
- **Honest security language:** tidak menggunakan visual/microcopy yang menjanjikan timer sebagai bukti kematian atau akses yang tidak dapat dicabut setelah dokumen diunduh.

## Token utama
| Token | Warna | Penggunaan |
|---|---|---|
| Ink | `#182820` | Teks utama |
| Forest | `#23352E` | Identitas, CTA utama, panel hero |
| Warm white | `#F7F7F1` | Latar aplikasi |
| Card | `#FFFEFA` | Latar permukaan |
| Lime | `#D7F171` | Aksen fokus / CTA hero |
| Soft sage | `#DDE7DE` | Permukaan sekunder |
| Brass | `#B89A66` | Status netral/tertunda tertentu, bukan dekorasi berlebihan |

## Struktur stylesheet
- `index.html`: markup serta perilaku dasar prototipe.
- `onboarding.css`: gaya onboarding tour.
- `design-system.css`: lapisan desain baru yang mengoverride style awal, responsif untuk layar desktop dan mobile.
- `auth.js` dan `auth-config.js`: autentikasi; jangan mengubah tanpa kebutuhan.

## Deployment
GitHub Actions harus menyalin `design-system.css` ke artifact Pages. Ketika menggabungkan paket ini ke repository yang sudah ada, pertahankan konfigurasi Supabase aktif dan variables GitHub.

## Batasan
Tampilan UI tetap prototipe. Informasi aset masih data contoh, bukan data yang tersimpan per akun. Desain tidak menggantikan RLS, private storage, audit log, threat modeling, atau legal review yang diperlukan sebelum penggunaan data nyata.
