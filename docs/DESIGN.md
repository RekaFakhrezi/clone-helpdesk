# DESIGN.md — HelpDesk IT UNDIP

Arah visual: **console-like clarity** (rujukan: omp.sh). Situs kerja yang tenang:
hierarki dari *garis tipis + langkah nilai tinta*, bukan dari kartu dan bayangan.
Identitas Undip (navy) dipertahankan dan dinaikkan jadi satu-satunya warna jenuh.

Sumber keputusan (dari pengukuran langsung di omp.sh, 2026-11-11):

| Properti | omp.sh | Keputusan kita |
|---|---|---|
| Ground | `#000`, elevated `#0a0a0c` | terang: `#FFFFFF` / kanvas `#F7F8FA`; rail & header tetap navy gelap |
| Langkah tinta | `97% / 82% / 50%` (oklch) | `#0B1524` (ink), `#4A5568` (dim), `#7C8898` (faint) |
| Garis | `oklch(100% 0 0 / .08)` dan `/.14` | `rgba(11,21,36,.10)` dan `rgba(11,21,36,.18)` |
| Aksen | `oklch(70% .24 340)` magenta, plus cyan `oklch(81% .14 200)` | navy Undip `#002D72` sebagai satu-satunya aksen; biru terang `#0059BB` hanya untuk tautan/hover |
| Warna status | — (situs marketing) | merah `#B3211B`, amber `#B26B00`, hijau `#0F7B4F` — hanya bila membawa makna |
| Display | Geist 500, `-0.025em`, 70px | Poppins **500** (bukan 700), `-0.02em`, judul halaman 32–40px |
| Mono/data | JetBrains Mono 13.9px | nomor tiket & angka tabel pakai `font-variant-numeric: tabular-nums`; mono hanya untuk nomor tiket |
| Label mikro | mono uppercase (CURL / BREW / COMPATIBLE) | label 11px, uppercase, `tracking .08em`, warna `--fg-faint` |
| Radius | `0` di semua kontrol | **4px** (aplikasi admin berteks rapat; 0 terlalu keras, 12–22px terlalu "SaaS") |
| Bayangan | tidak ada; kedalaman dari garis | tidak ada bayangan kartu; satu `--shadow-pop` hanya untuk dropdown/modal |
| Grid | `--spacing: .25rem` | 4px, sama |
| Motion | `.15s cubic-bezier(.4,0,.2,1)` | sama; satu momen authored (baris tabel saat status berubah) |
| Pilihan teks | `--selection` aksen 32% alpha | navy 16% alpha |

## Yang dihapus (bukan diperbaiki)

Berdasarkan `craft-floor` + pengukuran repo:

1. **Baris kartu KPI** (angka besar + label kecil + sub-teks) di tiga dashboard → diganti satu strip metrik dengan pembatas vertikal dan label mikro; angka pakai `tabular-nums`.
2. **Kartu seukuran sama berisi ikon+judul+teks** sebagai struktur halaman (Beranda, Kategori Laporan, Rekap Laporan) → daftar berbaris dengan rule.
3. **`backdrop-blur` sebagai dekorasi** (overlay sidebar, modal, login) → overlay solid `rgba(11,21,36,.55)` tanpa blur.
4. **Radius 22/14/9px + `shadow-soft`** → 4px, tanpa bayangan kartu.
5. **`--gold` / `--paper` / `--ink` yang namanya bohong** → nama per peran: `--bg`, `--surface`, `--fg`, `--fg-dim`, `--fg-faint`, `--rule`, `--rule-strong`, `--accent`, `--accent-hover`, `--ok`, `--warn`, `--danger`.
6. **Kelas font mati** `font-iBMPlexSans` (343×) dan `font-nimbusSans` (39×) → dihapus; Poppins lewat `--font-sans`.
7. **87 nilai hex arbitrary** (1.117 pemakaian) → diganti token peran.
8. **Emoji sebagai ikon** (👍/👎 di feedback artikel) → `lucide-react` garis 1.75.
9. **Permukaan browser default** → `::selection`, `:focus-visible` ring 2px navy offset 2px, scrollbar tipis, `caret-color` navy.

## Aturan pakai

- Warna jenuh hanya untuk: aksen (aksi utama, tautan aktif), status, dan deret data. Latar dan teks selalu netral.
- Tidak ada gradien dekoratif, glass, border-left tebal, atau bayangan offset.
- Setiap angka yang berdampingan memakai `font-variant-numeric: tabular-nums`.
- Judul halaman tidak didahului label *kicker*; breadcrumb hanya bila hirarki > 2 tingkat.
- Satu momen motion per layar.
- Kontras minimum 4.5:1 untuk teks badan, 3:1 untuk teks besar.

## Tahapan

1. **Token** — `@theme` di `globals.css` + hapus kelas font mati.
2. **Shell** — `SidebarShell`, `DashboardShell`, `AdminTopbar`, `TablePagination`, `Modal`, `Toast`.
3. **Konten dashboard administrasi** — strip metrik, tabel, filter, modal.
4. **Operator & pimpinan** — mengikuti shell yang sama.
5. **Permukaan publik** — Beranda, Basis Pengetahuan, artikel.
