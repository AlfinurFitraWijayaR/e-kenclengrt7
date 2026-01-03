# E-Kencleng RT 7

Sistem Pengelolaan Iuran Warga RT 7 - Aplikasi web untuk manajemen kas komunitas berbasis tagihan harian.

## 📋 Gambaran Umum

E-Kencleng RT 7 adalah aplikasi pengelolaan iuran warga yang dirancang untuk:

- Pencatatan iuran harian rumah tangga (Rp 500/hari)
- Manajemen pembayaran secara tunai
- Perhitungan saldo otomatis (hutang/deposit)
- Pelaporan per periode pengumpulan
- Ekspor laporan ke PDF

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **Architecture**: Server Components, Server Actions

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (protected)/          # Route grup dengan auth
│   ├── api/
│   │   └── export/pdf/       # API ekspor PDF
│   ├── dashboard/            # Halaman dashboard
│   ├── households/           # CRUD rumah tangga
│   │   ├── [id]/             # Detail & edit
│   │   └── new/              # Tambah baru
│   ├── periods/              # CRUD periode
│   │   ├── [id]/edit/        # Edit periode
│   │   └── new/              # Periode baru
│   ├── history/              # Riwayat pengumpulan
│   ├── export/               # Ekspor PDF
│   └── login/                # Halaman login
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components
│   ├── balance-display.tsx   # Tampilan saldo
│   └── dashboard-components.tsx
└── lib/
    ├── actions/              # Server Actions
    │   ├── auth.ts           # Auth actions
    │   ├── dashboard.ts      # Dashboard data
    │   ├── households.ts     # CRUD rumah tangga
    │   ├── periods.ts        # CRUD periode
    │   └── transactions.ts   # Transaksi pembayaran
    ├── supabase/             # Supabase clients
    │   ├── client.ts         # Browser client
    │   ├── server.ts         # Server client
    │   └── middleware.ts     # Auth middleware
    ├── types/
    │   └── database.ts       # TypeScript types
    └── format.ts             # Utility functions
```

## 🗄️ Database Schema

### Tables

#### `households`

| Column                  | Type      | Description                |
| ----------------------- | --------- | -------------------------- |
| id                      | uuid      | Primary key                |
| name                    | varchar   | Nama kepala keluarga/rumah |
| contribution_start_date | date      | Tanggal mulai iuran        |
| status                  | varchar   | 'active' / 'inactive'      |
| created_at              | timestamp | Waktu dibuat               |

#### `collection_periods`

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | uuid      | Primary key           |
| month      | int       | Bulan (1-12)          |
| year       | int       | Tahun                 |
| start_date | date      | Tanggal mulai periode |
| end_date   | date      | Tanggal akhir periode |
| notes      | text      | Catatan               |
| created_at | timestamp | Waktu dibuat          |

#### `contribution_transactions`

| Column           | Type      | Description              |
| ---------------- | --------- | ------------------------ |
| id               | uuid      | Primary key              |
| household_id     | uuid      | FK ke households         |
| period_id        | uuid      | FK ke collection_periods |
| transaction_date | date      | Tanggal transaksi        |
| type             | varchar   | 'DEBIT' / 'CREDIT'       |
| amount           | int       | Jumlah (dalam IDR)       |
| description      | text      | Keterangan               |
| created_at       | timestamp | Waktu dibuat             |

### Tipe Transaksi

- **DEBIT**: Kewajiban iuran harian (500 IDR/hari)
- **CREDIT**: Pembayaran tunai dari warga

## 💰 Perhitungan Saldo

```
saldo = SUM(CREDIT.amount) − (total_hari × 500)
```

Dimana:

- `total_hari` = jumlah hari dari `contribution_start_date` sampai hari ini
- Saldo < 0 → **Hutang**
- Saldo > 0 → **Deposit**
- Saldo = 0 → **Lunas**

⚠️ **Saldo TIDAK disimpan di database**, melainkan dihitung secara dinamis dari riwayat transaksi.

## 🔐 Authentication & Authorization

### Roles

- **Admin**: Full access (CRUD semua data)
- **Officer**: Lihat data + catat pembayaran

### Protected Routes

- `/dashboard`
- `/households`
- `/periods`
- `/history`
- `/export`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
# Copy supabase/schema.sql to Supabase SQL Editor and run

# Start development server
npm run dev
```

### Database Setup

1. Buat project baru di Supabase
2. Salin isi `supabase/schema.sql` ke SQL Editor
3. Jalankan query untuk membuat tables dan functions
4. Enable Row Level Security sesuai kebutuhan

## 📊 Fitur Utama

### Dashboard

- Total rumah tangga aktif
- Total kas terkumpul
- Jumlah rumah tangga berhutang
- Jumlah rumah tangga dengan deposit
- Pembayaran terbaru
- Daftar rumah tangga dengan hutang terbesar

### Manajemen Rumah Tangga

- Tambah, edit, hapus rumah tangga
- Lihat saldo dan riwayat transaksi
- Catat pembayaran baru

### Periode Pengumpulan

- Buat periode bulanan
- Lihat status pembayaran per periode
- Filter berdasarkan bulan/tahun

### Riwayat & Laporan

- Laporan status pembayaran per periode
- Ekspor ke PDF untuk pencetakan

## 🎨 UI/UX

- Mobile-first responsive design
- Glassmorphism login page
- Gradient accent colors (emerald/teal)
- Status badges dengan warna:
  - 🔴 Merah = Hutang
  - 🟢 Hijau = Deposit/Lunas
- Format saldo eksplisit:
  - "−3.000 (Hutang)"
  - "+2.000 (Deposit)"

## 📄 License

MIT License - Bebas digunakan untuk keperluan komunitas.

---

**E-Kencleng RT 7** © 2025
