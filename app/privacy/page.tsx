import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, UserCheck, Database, FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Qwarts Finance',
  description: 'Kebijakan privasi dan komitmen perlindungan data pengguna Qwarts Finance.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Glow Header */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-teal-400 transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Title */}
        <div className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>Transparansi & Keamanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kebijakan Privasi Qwarts Finance
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Terakhir diperbarui: 20 Maret 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-400" />
              1. Prinsip Utama Kami
            </h2>
            <p>
              Di Qwarts Finance, kami percaya bahwa data keuangan pribadi adalah privasi mutlak Anda. Layanan kami dirancang dengan prinsip minimisasi data: kami hanya menyimpan informasi yang benar-benar diperlukan agar aplikasi dashboard dapat berjalan sesuai kebutuhan Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-400" />
              2. Data yang Kami Kumpulkan
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>
                <strong className="text-white">Informasi Akun:</strong> Nama, alamat email, dan foto profil yang diteruskan secara resmi melalui Google OAuth saat Anda mendaftar atau masuk.
              </li>
              <li>
                <strong className="text-white">Catatan Keuangan yang Anda Masukkan:</strong> Nama dompet buatan Anda, nominal transaksi pemasukan/pengeluaran, kategori transaksi, budget bulanan, dan target tabungan yang Anda input secara mandiri.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-teal-400" />
              3. Hal yang TIDAK Pernah Kami Lakukan
            </h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <p className="font-semibold text-rose-300">Kami menjamin bahwa:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                <li>Kami <strong>TIDAK PERNAH</strong> meminta atau menyimpan nomor PIN kartu ATM, kata sandi m-banking, atau kode OTP perbankan Anda.</li>
                <li>Kami <strong>TIDAK PERNAH</strong> menghubungkan langsung aplikasi ini ke rekening bank untuk menarik dana atau mutasi otomatis tanpa izin.</li>
                <li>Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau membagikan data catatan keuangan Anda kepada pihak ketiga atau pengiklan mana pun.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              4. Hak dan Kendali Pengguna
            </h2>
            <p>
              Seluruh data transaksi dan dompet yang Anda catat adalah hak milik Anda sepenuhnya. Anda dapat mengubah, mengekspor ke format file Excel (.xlsx) / PDF (fitur PRO), atau menghapus data transaksi kapan saja langsung melalui antarmuka dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              5. Hubungi Kami & Layanan Dukungan
            </h2>
            <p>
              Jika Anda memiliki pertanyaan seputar layanan, privasi data, transaksi, atau bantuan teknis di Qwarts Finance, silakan hubungi kami melalui saluran resmi berikut:
            </p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-sm">
              <p>
                <strong className="text-white">Email Resmi:</strong>{' '}
                <a href="mailto:mails@qwarts.my.id" className="text-teal-400 underline hover:text-teal-300">
                  mails@qwarts.my.id
                </a>
              </p>
              <p>
                <strong className="text-white">WhatsApp / Telepon:</strong>{' '}
                <a href="https://wa.me/6281776370728" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline hover:text-teal-300">
                  +62 817-7637-0728
                </a>
              </p>
              <p>
                <strong className="text-white">Alamat Usaha / Operasional:</strong><br />
                <span className="text-slate-300">
                  Jl. Bambu Hitam No.5, RT.5/RW.5, Setu, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13890, Indonesia
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Qwarts Finance. Hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </div>
  )
}
