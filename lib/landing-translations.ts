export type LandingLanguage = 'id' | 'en'

export const landingTranslations = {
  id: {
    nav: {
      features: 'Fitur',
      dashboard: 'Dashboard',
      howItWorks: 'Cara Kerja',
      pricing: 'Harga',
      privacy: 'Privasi',
      faq: 'FAQ',
      contact: 'Kontak',
      signIn: 'Masuk',
      getStarted: 'Mulai gratis',
    },
    hero: {
      badge1: 'Aplikasi Budgeting Gratis',
      badge2: 'Catat Pengeluaran Harian',
      badge3: 'Aplikasi Mobile (Segera Hadir)',
      headlinePrefix: 'Cara Mudah Mencatat Pengeluaran Harian & ',
      headlineGradient: 'Aplikasi Budgeting Bulanan',
      subtitle:
        'Bingung uang gaji habis ke mana? Gunakan aplikasi budgeting bulanan dan pencatat pengeluaran harian Qwarts Finance. Pantau arus kas harian, tetapkan pagu anggaran per kategori, dan capai target tabungan secara gratis tanpa ribet.',
      ctaGoogle: 'Mulai Catat Gratis dengan Google',
      ctaPreview: 'Lihat contoh dashboard',
      trust1: 'Gratis pencatatan pengeluaran harian',
      trust2: 'Data per akun privat & aman',
      trust3: 'Web responsif (Aplikasi Mobile Segera Hadir)',
      mockupWindow: 'finance.qwarts.my.id/dashboard',
      mockupBadge: 'Ilustrasi Dashboard Budgeting',
      mockupNetWorthTitle: 'Total Kekayaan Bersih',
      mockupNetWorthGrowth: '+18.4% bulan ini',
      mockupActiveWallets: 'Dompet Aktif',
      mockupActiveWalletsValue: 'BCA, Mandiri, Cash',
      mockupCashFlowTitle: 'Arus Kas Pengeluaran & Pemasukan',
      mockupCashFlowMonth: 'Maret 2026',
      mockupIncome: 'Pemasukan',
      mockupExpense: 'Pengeluaran',
      mockupChartNote: 'Tercatat rapi di grafik bulanan',
      mockupGoalsTitle: 'Target Impian (Fitur PRO)',
      mockupGoalsName: 'Dana Darurat 6 Bulan',
      mockupGoalsTarget: 'Target Rp 20.000.000',
      mockupGoalsAchieved: '85% Tercapai • Sisa Rp 3.000.000 lagi',
      mockupTxTitle: 'Catatan Pengeluaran & Pemasukan Harian',
      mockupTxSub: 'Contoh simulasi catatan transaksi',
      mockupTx1Title: 'Gaji Bulanan',
      mockupTx1Cat: 'BCA • Pemasukan',
      mockupTx2Title: 'Belanja Bulanan',
      mockupTx2Cat: 'Mandiri • Makanan',
      mockupTx3Title: 'Internet & WiFi',
      mockupTx3Cat: 'Tagihan Rutin',
      mockupDisclaimer: '*Contoh data — bukan saldo akunmu',
    },
    seoSection: {
      tag: 'Panduan Finansial Cerdas',
      title: 'Kenapa Butuh Cara Mencatat Pengeluaran Harian & Budgeting Bulanan?',
      subtitle:
        'Seringkali kita merasa penghasilan cukup, namun di akhir bulan bingung uang habis ke mana. Pengeluaran kecil harian (latte factor) yang tidak tercatat adalah penyebab utama kebocoran finansial.',
      card1Title: 'Stop Kebocoran Finansial Harian',
      card1Desc:
        'Dengan mencatat pengeluaran harian seketika saat bertransaksi, Anda tahu persis ke mana setiap rupiah mengalir dan bisa memangkas pengeluaran impulsif.',
      card2Title: 'Disiplin dengan Pos Budget Bulanan',
      card2Desc:
        'Fitur aplikasi budgeting bulanan memudahkan alokasi pagu dana belanja makanan, transportasi, dan hiburan agar tidak overbudget sebelum gajian berikutnya.',
      card3Title: 'Multi-Dompet & Rekening Terpisah',
      card3Desc:
        'Pisahkan uang operasional harian, tabungan bank, dan saldo e-wallet. Tidak ada lagi saldo bercampur yang membuat ilusi bahwa Anda masih punya banyak uang.',
      card4Title: 'Bukan Sekadar Catatan, Tapi Target Nyata',
      card4Desc:
        'Pencatatan keuangan yang konsisten adalah fondasi membangun dana darurat, membayar tagihan tepat waktu, dan mewujudkan impian finansial masa depan.',
    },
    socialProof: {
      tag: 'Dibuat untuk Pengelolaan Finansial yang Masuk Akal',
      title: 'Cocok untuk Siapa Saja yang Ingin Finansial Lebih Rapi',
      card1Title: 'Pencatat Keuangan Pemula',
      card1Desc:
        'Beralih dari cara manual di buku atau spreadsheet yang membingungkan ke aplikasi budgeting web yang ringan dan otomatis.',
      card2Title: 'Pekerja & Freelancer',
      card2Desc:
        'Memisahkan uang operasional harian, rekening tabungan, dan dana cadangan agar arus kas tidak saling tercampur.',
      card3Title: 'Pengatur Budget Bulanan',
      card3Desc:
        'Ingin membatasi pos pengeluaran harian (makanan, gaya hidup) agar tidak overbudget di tengah bulan.',
      testimonials: [
        {
          quote:
            'Dulu sering bingung gaji habis ke mana. Sekarang tinggal buka di HP dan catat setiap habis belanja, arus kas bulanan langsung kelihatan jelas.',
          author: 'Dimas R., Karyawan Swasta',
        },
        {
          quote:
            'Paket Starter gratisnya sudah sangat cukup untuk pencatatan harian saya. Tampilannya bersih, ringan, dan tidak banyak tombol yang bikin pusing.',
          author: 'Sarah A., Freelancer',
        },
        {
          quote:
            'Saya ambil paket PRO tahunan karena butuh fitur batas budget per kategori dan ekspor Excel. Harganya murah banget dibanding manfaat yang didapat.',
          author: 'Reza P., Product Designer',
        },
      ],
    },
    features: {
      tag: 'Fitur Aplikasi Keuangan',
      title: 'Semua yang Kamu Butuhkan untuk Mencatat Pengeluaran & Budgeting',
      subtitle:
        'Mulai dari cara mencatat pengeluaran harian tanpa biaya, hingga fitur otomatisasi pagu anggaran di aplikasi budgeting PRO.',
      f1Badge: 'Free',
      f1Title: 'Catat Pengeluaran & Pemasukan Harian',
      f1Desc:
        'Catat setiap transaksi pengeluaran harianmu tanpa batasan jumlah. Pantau arus kas secara visual lewat grafik bulanan yang mudah dipahami.',
      f2Badge: 'Free (2) · PRO (Unlimited)',
      f2Title: 'Multi-Dompet & Rekening Bank',
      f2Desc:
        'Pisahkan uang tunai harian, rekening bank (BCA, Mandiri, BRI), atau e-wallet (GoPay, OVO). Akun Starter mendukung hingga 2 dompet; buka tanpa batas di PRO.',
      f3Badge: 'PRO',
      f3Title: 'Aplikasi Budgeting Bulanan & Overbudget Alert',
      f3Desc:
        'Tetapkan pagu anggaran per kategori (makanan, transportasi, hiburan) dan pantau persentase belanja agar tidak melebihi batas budget bulanan.',
      f4Badge: 'PRO',
      f4Title: 'Target Impian (Savings Goals)',
      f4Desc:
        'Rencanakan dana darurat, beli gadget baru, atau liburan. Pantau progress bar tabungan secara visual hingga nominal impian tercapai.',
      f5Badge: 'PRO',
      f5Title: 'Tagihan Rutin & Pengingat Jatuh Tempo',
      f5Desc:
        'Catat pengeluaran rutin bulanan seperti WiFi, listrik, atau langganan aplikasi. Lengkap dengan tanggal jatuh tempo agar tidak terkena denda keterlambatan.',
      f6Badge: 'PRO',
      f6Title: 'Ekspor Laporan Excel & PDF',
      f6Desc:
        'Unduh rekapitulasi data keuangan bulanan dalam format Excel (.xlsx) atau PDF kapan saja untuk arsip pribadi maupun evaluasi keuangan tahunan.',
    },
    howItWorks: {
      tag: 'Alur Praktis',
      title: 'Mulai Rapi Finansial dalam 3 Langkah Mudah',
      step1Title: 'Masuk dengan Akun Google',
      step1Desc:
        'Cukup satu klik dengan akun Google Anda tanpa perlu menghafal password baru. Dashboard aplikasi budgeting siap dalam hitungan detik.',
      step2Title: 'Atur Dompet & Pos Kategori Pengeluaran',
      step2Desc:
        'Tambahkan hingga 2 dompet di paket Free (misal: Rekening Utama & Tunai) serta sesuaikan pos kategori pengeluaran harian sesuai gaya hidupmu.',
      step3Title: 'Catat Rutin & Evaluasi Budget Bulanan',
      step3Desc:
        'Catat pengeluaran harian secara konsisten. Upgrade ke PRO kapan saja saat kamu butuh pagu budget otomatis, target impian, atau ekspor data.',
    },
    pricing: {
      badge: 'Transparan & Sangat Terjangkau',
      title: 'Pilihan Paket Aplikasi Budgeting yang Jujur & Masuk Akal',
      subtitle:
        'Gratis untuk pencatatan pengeluaran harian; upgrade ke PRO untuk sistem budgeting otomatis, multi-dompet unlimited, dan ekspor laporan.',
      freeTitle: 'Paket Starter (Free)',
      freeBadge: 'Gratis Selamanya',
      freeDesc:
        'Cocok untuk siapa saja yang ingin mulai membiasakan diri mencatat pengeluaran harian dan pemasukan tanpa ribet.',
      freePrice: 'Rp 0',
      freePricePeriod: '/ selamanya',
      includedTitle: 'Fitur Termasuk:',
      fInc1: 'Pencatatan Pengeluaran & Pemasukan Harian Unlimited',
      fInc2: 'Maksimal 2 Dompet / Rekening Bank',
      fInc3: 'Kategori Transaksi Lengkap',
      fInc4: 'Grafik Arus Kas & Statistik Bulanan',
      fInc5: 'Login Cepat dengan Akun Google (OAuth2)',
      notIncludedTitle: 'Tidak Termasuk (Ada di PRO):',
      fExc1: 'Lebih dari 2 dompet / rekening',
      fExc2: 'Pagu budget per kategori & overbudget alert',
      fExc3: 'Target Impian (tabungan masa depan)',
      fExc4: 'Pelacak tagihan rutin & pengingat',
      fExc5: 'Ekspor laporan ke Excel (.xlsx) & PDF',
      freeCta: 'Mulai Gratis Sekarang',
      proPopularBadge: 'Paling Dipilih',
      proTitle: 'Paket Qwarts Finance PRO',
      proDesc:
        'Kendali penuh atas keuanganmu dengan sistem otomatisasi batas budget, target tabungan, dan ekspor data.',
      proMonthlyLabel: 'Opsi Bulanan:',
      proMonthlyPrice: 'Rp 19.000',
      proMonthlyPeriod: '/ bulan',
      proYearlyLabel: 'Opsi Tahunan (Hemat ~35%):',
      proYearlyPrice: 'Rp 149.000',
      proYearlyPeriod: '/ tahun',
      proYearlyEquivalent: '⚡ Paket tahunan setara hanya ~Rp 12.400/bulan',
      proFeature1: 'Semua Fitur Paket Starter (Free)',
      proFeature2Bold: 'Unlimited Dompet & Rekening',
      proFeature2Text: ' (BCA, Mandiri, BRI, GoPay, OVO, Dana)',
      proFeature3Bold: 'Batas Budget Bulanan',
      proFeature3Text: ' per Kategori & Peringatan Overbudget',
      proFeature4Bold: 'Target Impian & Tabungan',
      proFeature4Text: ' dengan Progress Bar Visual',
      proFeature5Bold: 'Pelacak Tagihan Rutin',
      proFeature5Text: ' & Pengingat Jatuh Tempo',
      proFeature6Bold: 'Ekspor Laporan Lengkap',
      proFeature6Text: ' ke Excel (.xlsx) & PDF Otomatis',
      proFeature7Bold: 'Lencana Eksklusif PRO Member ⭐',
      proCta: 'Pilih Paket PRO',
      bottomNote:
        'Data keuangan tetap milikmu sepenuhnya. Mulai Starter tanpa kartu kredit. Upgrade atau batalkan langganan kapan saja langsung dari dashboard.',
    },
    privacy: {
      tag: 'Privasi Pengguna',
      title: 'Data Keuanganmu adalah Milik Pribadimu',
      subtitle:
        'Kami mengutamakan privasi dan transparansi tanpa membuat klaim keamanan yang berlebihan.',
      card1Title: 'Login via Google OAuth2',
      card1Desc:
        'Kami tidak menyimpan password akun Anda. Autentikasi ditangani langsung oleh sistem resmi Google yang terpercaya.',
      card2Title: 'Data Privat Per Akun',
      card2Desc:
        'Setiap catatan transaksi tersimpan secara terisolasi per pengguna dan tidak pernah dibagikan atau dijual ke pihak mana pun.',
      card3Title: 'Tanpa Akses Rekening Bank',
      card3Desc:
        'Kami tidak pernah meminta nomor PIN kartu, kata sandi m-banking, maupun hak debit mutasi bank Anda.',
      card4Title: 'Kontrol Data di Tangan Anda',
      card4Desc:
        'Anda memiliki kendali penuh untuk menambah, mengedit, mengekspor laporan, atau menghapus data transaksi kapan saja.',
      readPolicy: 'Baca kebijakan privasi lengkap',
    },
    faq: {
      tag: 'Pertanyaan Populer',
      title: 'Pertanyaan Seputar Cara Mencatat Pengeluaran & Fitur Budgeting (FAQ)',
      items: [
        {
          q: 'Bagaimana cara mencatat pengeluaran harian yang efektif agar tidak lupa?',
          a: 'Kunci konsistensi mencatat pengeluaran harian adalah langsung mencatat setiap kali bertransaksi tanpa menunda. Buka Qwarts Finance melalui browser HP Anda dan masukkan nominal serta kategori dalam waktu kurang dari 5 detik. Tidak perlu repot login berulang kali atau menunggu struk menumpuk di dompet.',
        },
        {
          q: 'Mengapa lebih baik memakai aplikasi budgeting bulanan dibanding buku catatan atau Excel manual?',
          a: 'Buku catatan mudah hilang dan tidak bisa menjumlahkan pengeluaran secara otomatis. Spreadsheet Excel seringkali merepotkan saat dibuka di layar HP saat berbelanja. Aplikasi budgeting bulanan seperti Qwarts Finance menghitung sisa budget secara otomatis, memberikan peringatan overbudget, menyajikan grafik tren pengeluaran, serta mendukung sinkronisasi multi-perangkat.',
        },
        {
          q: 'Apakah ada versi gratis? Apa saja batasannya?',
          a: 'Ya! Paket Starter 100% gratis selamanya untuk pencatatan transaksi harian tanpa batasan jumlah. Batasannya adalah maksimal 2 dompet/rekening dan belum mencakup fitur PRO seperti batas budget per kategori, target impian (tabungan), pengingat tagihan rutin, serta ekspor data Excel/PDF.',
        },
        {
          q: 'Apakah saya bisa login langsung dengan akun Google?',
          a: 'Tentu saja. Anda bisa langsung mendaftar atau masuk dengan satu kali klik menggunakan akun Google (Google OAuth2). Tidak perlu repot mengisi formulir manual atau mengingat kata sandi baru.',
        },
        {
          q: 'Berapa jumlah dompet di paket Free vs PRO?',
          a: 'Di Paket Starter (Free), Anda dapat membuat hingga 2 dompet atau rekening (misalnya 1 rekening bank dan 1 dompet uang tunai). Pada Paket PRO, Anda dapat menambahkan rekening dan e-wallet tanpa batas (unlimited), seperti BCA, Mandiri, BRI, GoPay, OVO, Dana, dan lainnya.',
        },
        {
          q: 'Bagaimana keamanan data finansial saya?',
          a: 'Data keuangan Anda tersimpan per akun dan dilindungi standar keamanan modern. Kami tidak pernah meminta informasi sensitif perbankan seperti PIN kartu ATM, kata sandi m-banking, maupun token transaksi. Anda mencatat secara mandiri dan privat.',
        },
        {
          q: 'Apa saja fitur yang termasuk di dalam paket PRO?',
          a: 'Paket PRO mencakup: unlimited dompet & rekening, pengaturan batas budget bulanan per kategori dengan peringatan overbudget, fitur Target Impian (savings goals) dengan visualisasi progres, pelacak tagihan rutin & pengingat jatuh tempo, serta ekspor laporan ke Excel (.xlsx) dan PDF.',
        },
        {
          q: 'Apa perbedaan bayar bulanan vs tahunan untuk paket PRO?',
          a: 'Paket PRO bulanan berbiaya Rp 19.000/bulan dengan fleksibilitas bayar setiap bulan. Paket tahunan berbiaya Rp 149.000/tahun (setara ~Rp 12.400/bulan), yang memberikan penghematan biaya sekitar 35% dibanding bayar bulanan.',
        },
        {
          q: 'Bisakah saya mengekspor data atau menghapus akun?',
          a: 'Pengguna Paket PRO dapat mengekspor seluruh catatan transaksi ke format Excel (.xlsx) atau PDF kapan pun dibutuhkan untuk arsip pribadi. Anda juga dapat mengelola dan menghapus data catatan finansial Anda kapan saja melalui dashboard.',
        },
      ],
    },
    ctaBanner: {
      title: 'Mulai Rapikan Keuangan & Catat Pengeluaran Hari Ini',
      subtitle:
        'Gratis untuk pencatatan pengeluaran harian, upgrade ke PRO kapan pun kamu siap mengontrol pagu budget bulanan dan target tabungan impian.',
      cta: 'Mulai Catat Gratis dengan Google',
      note: 'Tanpa kartu kredit untuk Starter • Setup instan dalam 1 menit',
    },
    contact: {
      tag: 'Layanan & Bantuan Pelanggan',
      title: 'Hubungi Kami',
      subtitle:
        'Tim dukungan kami siap membantu kebutuhan kendala akun, pertanyaan fitur, dan pembayaran langganan Anda.',
      emailTitle: 'Email Resmi Support',
      emailDesc: 'Kirimkan pertanyaan atau laporan kendala Anda melalui email resmi kami.',
      phoneTitle: 'WhatsApp & Telepon',
      phoneDesc: 'Respon cepat bantuan pelanggan pada hari dan jam operasional.',
      phoneBadge: 'WhatsApp Aktif',
      addressTitle: 'Alamat Kantor / Domisili Usaha',
      addressDesc:
        'Jl. Bambu Hitam No.5, RT.5/RW.5, Setu, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13890, Indonesia',
      officeHours: 'Senin – Minggu: 08:00 – 21:00 WIB',
      paymentGatewayBadge: 'Sistem Pembayaran Terverifikasi & Aman:',
      paymentGatewayDesc:
        'Didukung oleh Duitku Payment Gateway • QRIS (Semua Bank & E-Wallet), Virtual Account (BCA, Mandiri, BRI, BNI), ShopeePay & E-Wallet.',
    },
    footer: {
      brandDesc:
        'Aplikasi budgeting bulanan pintar dan solusi cara mencatat pengeluaran harian berbasis web dan mobile untuk kontrol arus kas, pos anggaran, dan target tabungan impian.',
      statusActive: 'Operasional Layanan Aktif',
      colNavTitle: 'Navigasi',
      navFeatures: 'Fitur Utama',
      navDashboard: 'Tampilan Dashboard',
      navPricing: 'Harga & Paket PRO',
      navFaq: 'Pertanyaan (FAQ)',
      navContact: 'Kontak Dukungan',
      colContactTitle: 'Kontak Dukungan',
      colAddressTitle: 'Alamat Usaha & Legalitas',
      privacyPolicy: 'Kebijakan Privasi',
      copyright: 'Qwarts Finance. Hak cipta dilindungi undang-undang.',
      helpContact: 'Bantuan & Kontak',
      enterDashboard: 'Masuk ke Dashboard',
    },
  },
  en: {
    nav: {
      features: 'Features',
      dashboard: 'Dashboard',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      privacy: 'Privacy',
      faq: 'FAQ',
      contact: 'Contact',
      signIn: 'Sign In',
      getStarted: 'Start for Free',
    },
    hero: {
      badge1: 'Free Budgeting App',
      badge2: 'Daily Expense Tracker',
      badge3: 'Mobile App (Coming Soon)',
      headlinePrefix: 'Effortless Daily Expense Tracking & ',
      headlineGradient: 'Monthly Budgeting App',
      subtitle:
        'Wondering where your money goes every month? Use Qwarts Finance to track daily expenses and plan your monthly budget. Monitor cash flows, category spending caps, and savings goals for free without hassle.',
      ctaGoogle: 'Start Tracking Free with Google',
      ctaPreview: 'View dashboard demo',
      trust1: 'Free unlimited daily expense tracking',
      trust2: 'Isolated & secure per-account data',
      trust3: 'Responsive Web (Mobile App Coming Soon)',
      mockupWindow: 'finance.qwarts.my.id/dashboard',
      mockupBadge: 'Budgeting Dashboard Illustration',
      mockupNetWorthTitle: 'Total Net Worth',
      mockupNetWorthGrowth: '+18.4% this month',
      mockupActiveWallets: 'Active Wallets',
      mockupActiveWalletsValue: 'BCA, Mandiri, Cash',
      mockupCashFlowTitle: 'Income & Expense Cash Flow',
      mockupCashFlowMonth: 'March 2026',
      mockupIncome: 'Income',
      mockupExpense: 'Expense',
      mockupChartNote: 'Cleanly organized in monthly charts',
      mockupGoalsTitle: 'Dream Goals (PRO Feature)',
      mockupGoalsName: '6-Month Emergency Fund',
      mockupGoalsTarget: 'Target Rp 20,000,000',
      mockupGoalsAchieved: '85% Achieved • Rp 3,000,000 remaining',
      mockupTxTitle: 'Daily Expense & Income Log',
      mockupTxSub: 'Sample simulated transaction log',
      mockupTx1Title: 'Monthly Salary',
      mockupTx1Cat: 'BCA • Income',
      mockupTx2Title: 'Monthly Groceries',
      mockupTx2Cat: 'Mandiri • Food',
      mockupTx3Title: 'Internet & WiFi',
      mockupTx3Cat: 'Subscription',
      mockupDisclaimer: '*Sample demonstration data — not your actual balance',
    },
    seoSection: {
      tag: 'Smart Financial Guide',
      title: 'Why Daily Expense Tracking & Monthly Budgeting Matter',
      subtitle:
        'Most people feel their income vanishes not because they earn too little, but because untracked micro-expenses (the latte factor) slowly drain cash reserves without being noticed.',
      card1Title: 'Stop Daily Financial Leaks',
      card1Desc:
        'By logging daily transactions on the go, you see exactly where every penny flows and can trim impulsive spending before it hurts your wallet.',
      card2Title: 'Stay Disciplined with Category Budgets',
      card2Desc:
        'Monthly budgeting caps allow you to assign clear limits for dining, groceries, and entertainment so you never overspend before the next paycheck.',
      card3Title: 'Keep Multi-Wallets & Accounts Separate',
      card3Desc:
        'Separate operational cash, bank savings, and e-wallet balances. No more mixed-up funds creating the illusion that you have excess spending money.',
      card4Title: 'Not Just Records, Real Financial Milestones',
      card4Desc:
        'Consistent bookkeeping is the true foundation for building emergency reserves, paying recurring bills on time, and securing lifelong financial peace.',
    },
    socialProof: {
      tag: 'Built for Sensible Financial Management',
      title: 'Perfect for Anyone Who Wants Cleaner Finances',
      card1Title: 'Beginner Budgeters',
      card1Desc:
        'Transition from messy paper notebooks or complicated spreadsheets to a lightweight, automated web budgeting app.',
      card2Title: 'Employees & Freelancers',
      card2Desc:
        'Separate daily living expenses, savings accounts, and buffer funds so your cash flows never get tangled.',
      card3Title: 'Monthly Budget Planners',
      card3Desc:
        'Set spending limits on daily categories (dining, lifestyle) to avoid overspending halfway through the month.',
      testimonials: [
        {
          quote:
            'I used to wonder where my paycheck disappeared every month. Now I just open it on my phone after shopping, and my monthly cash flow is immediately clear.',
          author: 'Dimas R., Private Sector Employee',
        },
        {
          quote:
            'The free Starter plan is more than enough for my daily tracking. The interface is clean, lightweight, and clutter-free.',
          author: 'Sarah A., Freelancer',
        },
        {
          quote:
            'I chose the yearly PRO plan for category budget caps and Excel export. It is remarkably affordable for the immense clarity it provides.',
          author: 'Reza P., Product Designer',
        },
      ],
    },
    features: {
      tag: 'Finance App Features',
      title: 'Everything You Need for Daily Expense Tracking & Budgeting',
      subtitle:
        'From zero-cost daily expense tracking to automated monthly budgeting caps in the PRO plan.',
      f1Badge: 'Free',
      f1Title: 'Daily Income & Expense Tracking',
      f1Desc:
        'Record all your daily transactions without count limits. Visually monitor income and expenses with intuitive monthly cash flow charts.',
      f2Badge: 'Free (2) · PRO (Unlimited)',
      f2Title: 'Multi-Wallet & Bank Accounts',
      f2Desc:
        'Organize cash, bank accounts (BCA, Mandiri, BRI), and e-wallets (GoPay, OVO). Starter supports up to 2 wallets; unlock unlimited on PRO.',
      f3Badge: 'PRO',
      f3Title: 'Monthly Budgeting & Overbudget Alerts',
      f3Desc:
        'Set monthly spending caps per category (food, transit, leisure) and monitor percentages to prevent exceeding your budget limits.',
      f4Badge: 'PRO',
      f4Title: 'Dream Goals (Savings Goals)',
      f4Desc:
        'Plan for an emergency fund, a new gadget, or a holiday trip. Track visual progress bars until you hit your savings target.',
      f5Badge: 'PRO',
      f5Title: 'Recurring Bills & Reminders',
      f5Desc:
        'Keep track of routine monthly expenses like WiFi, utilities, or app subscriptions with due date reminders to prevent late fees.',
      f6Badge: 'PRO',
      f6Title: 'Export Reports to Excel & PDF',
      f6Desc:
        'Download monthly financial recaps in Excel (.xlsx) or PDF format anytime for personal archiving and annual reviews.',
    },
    howItWorks: {
      tag: 'Practical Workflow',
      title: 'Get Financially Organized in 3 Simple Steps',
      step1Title: 'Sign in with Google Account',
      step1Desc:
        'One-click sign in with your Google account—no need to memorize new passwords. Your budgeting dashboard is ready in seconds.',
      step2Title: 'Set Up Wallets & Expense Categories',
      step2Desc:
        'Add up to 2 wallets on the Free plan (e.g., Main Account & Cash) and customize daily expense categories to fit your lifestyle.',
      step3Title: 'Track Regularly & Review Monthly Budgets',
      step3Desc:
        'Log daily transactions consistently. Upgrade to PRO whenever you want category budgets, dream goals, or file exports.',
    },
    pricing: {
      badge: 'Transparent & Accessible',
      title: 'Honest, Sensible Pricing for Your Budgeting Journey',
      subtitle:
        'Free for daily expense tracking; upgrade to PRO for category budgets, unlimited wallets, savings goals, and data export.',
      freeTitle: 'Starter Plan (Free)',
      freeBadge: 'Free Forever',
      freeDesc:
        'Ideal for anyone looking to build a consistent habit of logging daily income and expenses hassle-free.',
      freePrice: 'Rp 0',
      freePricePeriod: '/ forever',
      includedTitle: 'Included Features:',
      fInc1: 'Unlimited Daily Income & Expense Tracking',
      fInc2: 'Up to 2 Wallets / Bank Accounts',
      fInc3: 'Comprehensive Transaction Categories',
      fInc4: 'Monthly Cash Flow Charts & Statistics',
      fInc5: 'Quick Google OAuth2 Login',
      notIncludedTitle: 'Not Included (Available in PRO):',
      fExc1: 'More than 2 wallets / accounts',
      fExc2: 'Category budget limits & overbudget alert',
      fExc3: 'Dream Goals (future savings milestones)',
      fExc4: 'Recurring bill tracker & due date reminders',
      fExc5: 'Export reports to Excel (.xlsx) & PDF',
      freeCta: 'Get Started Free Now',
      proPopularBadge: 'Most Popular',
      proTitle: 'Qwarts Finance PRO',
      proDesc:
        'Total command over your finances with automated budget limits, savings goals, and instant data exports.',
      proMonthlyLabel: 'Monthly Plan:',
      proMonthlyPrice: 'Rp 19,000',
      proMonthlyPeriod: '/ month',
      proYearlyLabel: 'Yearly Plan (Save ~35%):',
      proYearlyPrice: 'Rp 149,000',
      proYearlyPeriod: '/ year',
      proYearlyEquivalent: '⚡ Annual plan equals just ~Rp 12,400/month',
      proFeature1: 'All Starter (Free) Plan Features',
      proFeature2Bold: 'Unlimited Wallets & Accounts',
      proFeature2Text: ' (BCA, Mandiri, BRI, GoPay, OVO, Dana, etc.)',
      proFeature3Bold: 'Monthly Category Budgets',
      proFeature3Text: ' & Overbudget Alert Warnings',
      proFeature4Bold: 'Dream Goals & Savings',
      proFeature4Text: ' with Visual Progress Bars',
      proFeature5Bold: 'Recurring Bill Tracker',
      proFeature5Text: ' & Due Date Reminders',
      proFeature6Bold: 'Comprehensive Report Exports',
      proFeature6Text: ' to Excel (.xlsx) & PDF',
      proFeature7Bold: 'Exclusive PRO Member Badge ⭐',
      proCta: 'Choose PRO Plan',
      bottomNote:
        'Your financial data belongs completely to you. Start free without a credit card. Upgrade or cancel anytime directly from your dashboard.',
    },
    privacy: {
      tag: 'User Privacy',
      title: 'Your Financial Data Stays Yours',
      subtitle:
        'We prioritize genuine privacy and transparency without inflated security claims.',
      card1Title: 'Login via Google OAuth2',
      card1Desc:
        'We never store your passwords. Authentication is handled directly by trusted, official Google systems.',
      card2Title: 'Private Data Per Account',
      card2Desc:
        'Every transaction entry is isolated per user and is never shared or sold to any third party.',
      card3Title: 'No Bank Account Access Required',
      card3Desc:
        'We never ask for ATM PINs, mobile banking passwords, SMS OTPs, or debit bank rights. Your tracking is manual and private.',
      card4Title: 'Data Control in Your Hands',
      card4Desc:
        'You have full control to add, edit, export reports, or delete your transaction data whenever you wish.',
      readPolicy: 'Read full privacy policy',
    },
    faq: {
      tag: 'Common Questions',
      title: 'FAQ: Daily Expense Tracking & Monthly Budgeting',
      items: [
        {
          q: 'What is the most effective way to track daily expenses consistently?',
          a: 'The key to consistent daily expense tracking is logging purchases immediately without delay. Simply open Qwarts Finance on your mobile browser and log the amount and category in under 5 seconds. Avoid waiting until the weekend so no micro-expenses get forgotten.',
        },
        {
          q: 'Why use a monthly budgeting app instead of physical notebooks or Excel spreadsheets?',
          a: 'Physical notebooks are easily lost and cannot calculate automated summaries. Excel spreadsheets are clumsy to navigate on mobile screens while on the go. A dedicated monthly budgeting app like Qwarts Finance calculates remaining budgets instantly, alerts you before overspending, generates visual charts, and syncs seamlessly across devices.',
        },
        {
          q: 'Is there a free version? What are the limitations?',
          a: 'Yes! The Starter plan is 100% free forever for unlimited daily transaction recording. The limitations are a maximum of 2 wallets/accounts, and it does not include PRO features such as category budgets, dream savings goals, recurring bill reminders, and Excel/PDF report exports.',
        },
        {
          q: 'Can I log in directly with my Google account?',
          a: 'Certainly. You can sign up or log in with a single click using your Google account (Google OAuth2). There is no need to fill out manual forms or remember another password.',
        },
        {
          q: 'How many wallets can I create in Starter vs PRO?',
          a: 'On the Starter (Free) plan, you can create up to 2 wallets (for example, 1 bank account and 1 cash wallet). On the PRO plan, you can add unlimited wallets and e-wallets, such as BCA, Mandiri, BRI, GoPay, OVO, Dana, and others.',
        },
        {
          q: 'How safe is my financial information?',
          a: 'Your financial data is saved per account and guarded with modern security standards. We never ask for sensitive banking details like ATM card PINs, mobile banking passwords, or transaction tokens. Your records are manual and private.',
        },
        {
          q: 'What features are included in the PRO plan?',
          a: 'The PRO plan includes: unlimited wallets & accounts, monthly category budgets with overbudget alerts, Dream Goals (savings targets) with progress visualizers, recurring bill tracking with due date reminders, and report exports to Excel (.xlsx) and PDF.',
        },
        {
          q: 'What is the difference between monthly vs yearly PRO billing?',
          a: 'The monthly PRO plan costs Rp 19,000/month with the flexibility to pay month-by-month. The annual plan costs Rp 149,000/year (equivalent to ~Rp 12,400/month), offering about 35% savings compared to monthly payments.',
        },
        {
          q: 'Can I export my data or delete my records?',
          a: 'PRO users can export all transaction logs to Excel (.xlsx) or PDF format at any time for personal archives. You also have complete control to manage or delete your financial records at any point through the dashboard.',
        },
      ],
    },
    ctaBanner: {
      title: 'Take Control of Your Personal Finances Today',
      subtitle:
        'Free for daily expense tracking, upgrade to PRO whenever you are ready to master category budgets and dream savings.',
      cta: 'Start Tracking Free with Google',
      note: 'No credit card needed for Starter • Instant 1-minute setup',
    },
    contact: {
      tag: 'Customer Support & Help',
      title: 'Contact Us',
      subtitle:
        'Our support team is ready to help with account questions, feature guidance, and subscription billing inquiries.',
      emailTitle: 'Official Support Email',
      emailDesc: 'Send your questions or problem reports to our official support email.',
      phoneTitle: 'WhatsApp & Phone',
      phoneDesc: 'Fast customer support assistance during operational hours.',
      phoneBadge: 'WhatsApp Active',
      addressTitle: 'Office / Registered Business Address',
      addressDesc:
        'Jl. Bambu Hitam No.5, RT.5/RW.5, Setu, Kec. Cipayung, East Jakarta City, Jakarta 13890, Indonesia',
      officeHours: 'Monday – Sunday: 08:00 – 21:00 WIB (UTC+7)',
      paymentGatewayBadge: 'Verified & Secure Payment System:',
      paymentGatewayDesc:
        'Powered by Duitku Payment Gateway • QRIS (All Banks & E-Wallets), Virtual Accounts (BCA, Mandiri, BRI, BNI), ShopeePay & E-Wallets.',
    },
    footer: {
      brandDesc:
        'Smart monthly budgeting app and daily expense tracking platform for web and mobile to control cash flow, budgeting categories, and savings goals.',
      statusActive: 'Operational Systems Online',
      colNavTitle: 'Navigation',
      navFeatures: 'Main Features',
      navDashboard: 'Dashboard View',
      navPricing: 'Pricing & PRO Plan',
      navFaq: 'FAQ',
      navContact: 'Support Contact',
      colContactTitle: 'Customer Support',
      colAddressTitle: 'Business Address & Legal',
      privacyPolicy: 'Privacy Policy',
      copyright: 'Qwarts Finance. All rights reserved.',
      helpContact: 'Help & Contact',
      enterDashboard: 'Open Dashboard',
    },
  },
} as const
