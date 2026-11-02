import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Ban, RefreshCw, Scale, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Qwarts Finance',
  description: 'Syarat dan ketentuan penggunaan layanan Qwarts Finance.',
  alternates: {
    canonical: 'https://www.qwarts.my.id/terms',
  },
}

export default function TermsPage() {
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
            <Scale className="h-3.5 w-3.5 text-teal-400" />
            <span>Dokumen Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Syarat & Ketentuan Penggunaan
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Terakhir diperbarui: 30 Oktober 2026
          </p>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Dengan mengakses atau menggunakan layanan Qwarts Finance, Anda menyatakan telah membaca,
            memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum di bawah ini.
            Jika Anda tidak menyetujui syarat ini, mohon untuk tidak menggunakan layanan kami.
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">

          {/* 1. Definisi Layanan */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              1. Definisi Layanan
            </h2>
            <p>
              Qwarts Finance adalah aplikasi manajemen keuangan pribadi berbasis web yang tersedia di{' '}
              <a href="https://www.qwarts.my.id" className="text-teal-400 underline hover:text-teal-300">
                www.qwarts.my.id
              </a>
              . Layanan ini memungkinkan pengguna mencatat transaksi keuangan, memantau arus kas,
              mengatur anggaran bulanan, dan merencanakan target tabungan secara mandiri.
            </p>
            <p>
              Qwarts Finance merupakan layanan pencatatan keuangan mandiri. Kami <strong className="text-white">bukan</strong> lembaga
              keuangan, bank, atau penyedia layanan pembayaran yang teregulasi. Seluruh data yang
              dimasukkan adalah catatan pribadi pengguna dan tidak terhubung langsung dengan rekening
              bank atau instrumen keuangan mana pun.
            </p>
          </section>

          {/* 2. Akun & Keamanan */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-teal-400" />
              2. Akun & Tanggung Jawab Pengguna
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Anda bertanggung jawab penuh atas keamanan akun dan kata sandi Anda. Jangan berbagi
                kredensial login kepada pihak mana pun.
              </li>
              <li>
                Setiap aktivitas yang terjadi di bawah akun Anda — baik oleh Anda sendiri maupun
                pihak lain yang mendapat akses — menjadi tanggung jawab Anda sepenuhnya.
              </li>
              <li>
                Anda wajib memberikan informasi yang akurat saat mendaftar. Penggunaan identitas palsu
                atau data orang lain tanpa izin merupakan pelanggaran terhadap ketentuan ini.
              </li>
              <li>
                Qwarts Finance berhak menangguhkan atau menghapus akun yang terbukti melanggar
                ketentuan penggunaan tanpa pemberitahuan terlebih dahulu.
              </li>
            </ul>
          </section>

          {/* 3. Paket & Pembayaran */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-400" />
              3. Paket Berlangganan & Pembayaran
            </h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="space-y-2">
                <p className="font-semibold text-white">Paket Starter (Gratis)</p>
                <p className="text-sm text-slate-300">
                  Tersedia secara gratis tanpa batas waktu. Tidak diperlukan kartu kredit atau
                  informasi pembayaran apa pun untuk menggunakan paket ini.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <p className="font-semibold text-white">Paket PRO</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-300 ml-2">
                  <li>
                    Tersedia dalam opsi bulanan (Rp 19.000/bulan) atau tahunan (Rp 149.000/tahun).
                  </li>
                  <li>
                    Pembayaran diproses melalui gateway pembayaran Duitku yang tersertifikasi.
                    Qwarts Finance tidak menyimpan data kartu kredit atau rekening bank Anda.
                  </li>
                  <li>
                    Akses fitur PRO aktif segera setelah pembayaran berhasil dikonfirmasi oleh
                    sistem gateway pembayaran.
                  </li>
                  <li>
                    Paket PRO berlaku selama periode yang dipilih (1 bulan atau 1 tahun) dihitung
                    sejak tanggal pembayaran berhasil.
                  </li>
                  <li>
                    Setelah masa berlaku habis, akun akan secara otomatis kembali ke paket Starter
                    (Gratis). Data yang sudah dicatat tetap tersimpan dan dapat diakses, namun
                    fitur eksklusif PRO tidak lagi dapat digunakan hingga berlangganan kembali.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Kebijakan Pengembalian Dana */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-teal-400" />
              4. Kebijakan Pengembalian Dana (Refund)
            </h2>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-2">
              <p className="font-semibold text-amber-300">Kebijakan Pengembalian Dana:</p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li>
                  Pengembalian dana dapat diajukan dalam waktu{' '}
                  <strong className="text-white">7 (tujuh) hari kalender</strong> sejak tanggal
                  pembayaran berhasil, dengan syarat fitur PRO belum digunakan secara signifikan.
                </li>
                <li>
                  Pengajuan refund dilakukan melalui email resmi ke{' '}
                  <a href="mailto:mails@qwarts.my.id" className="text-teal-400 underline">
                    mails@qwarts.my.id
                  </a>{' '}
                  dengan menyertakan nomor order pembayaran.
                </li>
                <li>
                  Kami berhak menolak permintaan refund jika ditemukan indikasi penyalahgunaan
                  atau pelanggaran ketentuan layanan.
                </li>
                <li>
                  Proses pengembalian dana memerlukan waktu 5–14 hari kerja tergantung kebijakan
                  bank atau penyedia dompet digital pengguna.
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Larangan Penggunaan */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ban className="h-5 w-5 text-teal-400" />
              5. Larangan Penggunaan
            </h2>
            <p>Anda dilarang keras menggunakan layanan Qwarts Finance untuk:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Aktivitas ilegal, penipuan, atau pencucian uang dalam bentuk apapun.</li>
              <li>
                Melakukan rekayasa balik (<em>reverse engineering</em>), mengeksploitasi, atau
                mencoba mengakses sistem backend dan database Qwarts Finance secara tidak sah.
              </li>
              <li>
                Mendistribusikan malware, spam, atau konten berbahaya melalui platform kami.
              </li>
              <li>
                Menggunakan layanan untuk keperluan komersial atau bisnis tanpa izin tertulis
                dari Qwarts Finance.
              </li>
              <li>
                Menyalin, mendistribusikan, atau mengeksploitasi kode sumber, desain, atau
                konten aplikasi tanpa izin tertulis.
              </li>
            </ul>
          </section>

          {/* 6. Keterbatasan Tanggung Jawab */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-teal-400" />
              6. Keterbatasan Tanggung Jawab
            </h2>
            <p>
              Qwarts Finance disediakan &quot;sebagaimana adanya&quot; (<em>as-is</em>) tanpa jaminan
              ketersediaan layanan 100% atau kebebasan dari kesalahan. Kami tidak bertanggung jawab
              atas:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Kerugian finansial yang timbul akibat keputusan keuangan yang dibuat berdasarkan
                data yang diinput atau ditampilkan oleh aplikasi.
              </li>
              <li>
                Kehilangan data akibat force majeure, serangan siber, atau kegagalan infrastruktur
                di luar kendali kami.
              </li>
              <li>
                Gangguan layanan sementara karena pemeliharaan sistem, pembaruan, atau kondisi
                teknis tak terduga.
              </li>
            </ul>
            <p>
              Kami menyarankan pengguna untuk secara berkala mengekspor data keuangan sebagai
              cadangan menggunakan fitur ekspor yang tersedia di dashboard.
            </p>
          </section>

          {/* 7. Perubahan Layanan & Ketentuan */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-teal-400" />
              7. Perubahan Layanan & Ketentuan
            </h2>
            <p>
              Qwarts Finance berhak mengubah, memperbarui, atau menghentikan fitur tertentu kapan
              saja. Perubahan signifikan pada ketentuan ini akan diberitahukan melalui email terdaftar
              atau notifikasi di dashboard setidaknya 7 hari sebelum berlaku.
            </p>
            <p>
              Penggunaan layanan secara berkelanjutan setelah perubahan ketentuan diberlakukan
              dianggap sebagai persetujuan terhadap ketentuan yang baru.
            </p>
          </section>

          {/* 8. Hukum yang Berlaku */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-teal-400" />
              8. Hukum yang Berlaku
            </h2>
            <p>
              Syarat dan ketentuan ini tunduk pada dan ditafsirkan berdasarkan hukum yang berlaku
              di Negara Kesatuan Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan
              secara musyawarah terlebih dahulu. Apabila tidak tercapai kesepakatan, penyelesaian
              sengketa dilakukan melalui jalur hukum yang berlaku di yurisdiksi Indonesia.
            </p>
          </section>

          {/* 9. Kontak */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-400" />
              9. Hubungi Kami
            </h2>
            <p>
              Untuk pertanyaan, keluhan, atau pengajuan refund terkait syarat dan ketentuan ini,
              silakan hubungi kami melalui:
            </p>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-sm">
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
                <strong className="text-white">Alamat Operasional:</strong><br />
                <span className="text-slate-300">
                  Jl. Bambu Hitam No.5, RT.5/RW.5, Setu, Kec. Cipayung,
                  Kota Jakarta Timur, DKI Jakarta 13890, Indonesia
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Footer Nav */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Qwarts Finance. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-teal-400 transition">
              Kebijakan Privasi
            </Link>
            <Link href="/" className="hover:text-teal-400 transition">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
