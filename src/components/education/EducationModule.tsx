import React, { useState } from 'react';
import {
  Eye,
  Sun,
  Laptop,
  Layers,
  Sparkles,
  ShieldCheck,
  Compass,
  Car,
  ChevronRight,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Glasses,
  CheckCircle2,
  Info,
  Clock,
  Activity,
  ShoppingBag,
  LogIn,
  Sliders,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LensDetail {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  color: string;
  bgLight: string;
  icon: React.ElementType;
  description: string;
  benefits: string[];
  recommendedFor: string;
  indexOptions: string[];
}

const LENS_LIST: LensDetail[] = [
  {
    id: 'bluechromic',
    name: 'Lensa Bluechromic (All-in-One)',
    tagline: 'Perlindungan Sempurna: Anti Radiasi Gadget + Otomatis Gelap di Bawah Sinar Matahari',
    badge: 'Paling Populer',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800',
    icon: Sparkles,
    description:
      'Lensa canggih hasil perpaduan teknologi Blue Ray (penyaring sinar biru digital) dan Photochromic (adaptasi pigmen UV). Di dalam ruangan, lensa ini bening dan melindungi mata dari layar HP/laptop. Di luar ruangan, lensa otomatis bertransisi menjadi gelap seperti kacamata hitam sunglasses saat terpapar sinar matahari.',
    benefits: [
      'Menyaring radiasi sinar biru (HEV) hingga 420nm dari ponsel, monitor komputer, dan lampu LED',
      'Transisi cepat menjadi gelap (grey/charcoal) saat terkena sinar matahari luar ruangan',
      'Praktis 1 kacamata untuk bekerja di kantor maupun berkendara & berlibur di luar',
      'Mencegah mata cepat lelah, perih, kering, dan risiko degenerasi makula dini',
      'Coating hidrofobik anti-pantul dan licin tahan minyak sidik jari'
    ],
    recommendedFor: 'Profesional, mahasiswa, pengguna gadget aktif yang juga sering beraktivitas di luar ruangan.',
    indexOptions: ['1.56 Standard', '1.61 Tipis', '1.67 Super Slim']
  },
  {
    id: 'photochromic',
    name: 'Lensa Photochromic (Transisi)',
    tagline: 'Adaptif Otomatis Gelap di Luar Ruangan & Kembali Jernih Bening di Dalam Ruangan',
    badge: 'Favorit Outdoor',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    icon: Sun,
    description:
      'Lensa adaptif dengan molekul fotokromik mikroskopis yang bereaksi terhadap sinar ultraviolet (UV). Ketika Anda melangkah keluar ke bawah terik matahari, lensa menyerap UV dan menggelap secara instan. Ketika kembali ke dalam ruangan atau tempat teduh, lensa kembali jernih seperti kacamata optik biasa.',
    benefits: [
      'Perlindungan 100% UV400 terhadap radiasi ultraviolet A dan B berbahaya',
      'Mengurangi kesilauan matahari secara instan saat siang hari di luar',
      'Tidak perlu repot membawa kacamata hitam minus terpisah',
      'Sensitivitas adaptif terhadap intensitas UV (semakin terik, semakin pekat)'
    ],
    recommendedFor: 'Pengendara motor/mobil, pehobi olahraga luar ruangan, pekerja lapangan, dan traveling.',
    indexOptions: ['1.56 Standard', '1.61 Slim', '1.67 High Index']
  },
  {
    id: 'blueray',
    name: 'Lensa Blue Ray (Blue Cut / Anti Radiasi)',
    tagline: 'Perisai Pelindung Mata dari Paparan Layar Digital Komputer, Tablet & Smartphone',
    badge: 'Wajib WFH & Pekerja Layar',
    color: 'text-sky-600 dark:text-sky-400',
    bgLight: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800',
    icon: Laptop,
    description:
      'Lensa khusus dengan lapisan nano filter selektif yang memblokir spektrum cahaya biru berbahaya (380-450nm) yang dipancarkan secara terus-menerus oleh layar digital LED monitor, TV, dan smartphone, namun tetap meneruskan spektrum cahaya biru-toska yang aman untuk ritme sirkadian tubuh.',
    benefits: [
      'Menghilangkan gejala Computer Vision Syndrome (CVS): mata perih, pegal, dan berair',
      'Membantu mengurangi frekuensi sakit kepala dan pusing setelah bekerja di depan monitor seharian',
      'Menjaga kualitas tidur malam karena paparan blue light tidak merusak melatonin',
      'Kejernihan optik tinggi dengan distorsi warna yang sangat minimal'
    ],
    recommendedFor: 'Programmer, desainer, staf kantor, anak sekolah/kuliah, dan gamer.',
    indexOptions: ['1.56 Standard', '1.61 Slim', '1.67 Ultra Slim', '1.74 Ter-tipis']
  },
  {
    id: 'progressive',
    name: 'Lensa Progresif (Multifokal Modern)',
    tagline: 'Penglihatan Jernih di Semua Jarak (Jauh, Menengah, Dekat) Tanpa Garis Pembatas',
    badge: 'Solusi Usia 40+',
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    icon: Layers,
    description:
      'Lensa inovatif multifokal gradasi tanpa garis melintang di tengah (berbeda dengan kacamata bifokal konvensional tempo dulu). Bagian atas lensa dirancang untuk melihat pemandangan jauh, bagian tengah untuk jarak menengah (monitor komputer / dashboard mobil), dan bagian bawah untuk membaca buku / pesan di smartphone.',
    benefits: [
      'Estetika muda dan modern karena tidak terlihat garis batas sambungan pada permukaan lensa',
      'Transisi titik fokus yang mulus dan alami dari jarak jauh ke jarak dekat tanpa sensasi loncat gambar',
      'Cukup satu kacamata untuk membaca, mengemudi, dan bekerja di depan laptop',
      'Tersedia dalam kombinasi bahan Blue Ray dan Photochromic (Progressive Bluechromic)'
    ],
    recommendedFor: 'Pengguna berusia 40 tahun ke atas yang mulai mengalami kesulitan membaca dekat (presbiopia) sekaligus memiliki minus atau silinder.',
    indexOptions: ['1.56 Progressive', '1.61 Short Corridor', '1.67 Freeform Digital']
  },
  {
    id: 'hiindex',
    name: 'Lensa High Index (1.61, 1.67, 1.74)',
    tagline: 'Lensa Tipis, Ringan & Elegan Khusus Resep Minus dan Silinder Tinggi',
    badge: 'Desain Ekstra Tipis',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    icon: ShieldCheck,
    description:
      'Lensa optik berbahan resin polimer dengan indeks bias tinggi yang mampu membelokkan cahaya secara lebih efisien. Hasilnya, ketebalan fisik lensa jauh lebih tipis hingga 20% - 50% dibanding lensa plastik standar 1.56 untuk ukuran minus yang sama, membuat bobot kacamata sangat ringan dan tidak menonjol dari bingkai.',
    benefits: [
      'Mengurangi efek mata tampak mengecil (minifying effect) pada minus tebal',
      'Tepian lensa tidak menyembul tebal keluar dari bingkai frame tipis atau metal titanium',
      'Sangat ringan di batang hidung, mencegah lecet dan kacamata merosot ke bawah',
      'Sangat dianjurkan untuk minus -3.50 ke atas hingga -12.00 dan silinder tinggi'
    ],
    recommendedFor: 'Konsumen dengan ukuran minus atau silinder sedang hingga tinggi yang menginginkan estetika kacamata elegan.',
    indexOptions: ['1.60 / 1.61 (Tipis 20%)', '1.67 (Lebih Tipis 35%)', '1.74 (Ultra Tipis 50%)']
  },
  {
    id: 'drive',
    name: 'Lensa Polarized / Drive Anti-Silau',
    tagline: 'Kontras Tajam & Menghilangkan Silau Pantulan Jalanan Basah Maupun Lampu Kendaraan',
    badge: 'Spesialis Berkendara',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
    icon: Car,
    description:
      'Lensa dengan filter polarisasi vertikal khusus yang memblokir pantulan cahaya horizontal yang menyilaukan dari permukaan aspal jalan raya, kap mobil, genangan air, dan kaca kendaraan di depan Anda. Memberikan kejernihan visual tinggi dan kenyamanan maksimal saat berkendara jarak jauh.',
    benefits: [
      'Menghilangkan glare (pantulan silau menyilaukan) secara 99%',
      'Meningkatkan persepsi kedalaman dan kontras warna rambu-rambu jalan',
      'Sangat nyaman untuk perjalanan darat siang hari yang terik maupun pantai',
      'Mengurangi kelelahan refleks mata saat menyetir jarak jauh'
    ],
    recommendedFor: 'Pengemudi mobil, pengendara motor turing, pemancing, dan aktivitas maritim.',
    indexOptions: ['1.50 Polarized Hard Resin', '1.60 Slim Polarized']
  }
];

export const EducationModule: React.FC<{
  onOpenLogin?: () => void;
  onNavigate?: (tab: string) => void;
}> = ({ onOpenLogin, onNavigate }) => {
  const [selectedLensId, setSelectedLensId] = useState<string>('bluechromic');

  // Interactive Quiz / Recommendation State
  const [userActivity, setUserActivity] = useState<string>('screen');
  const [userMinusRange, setUserMinusRange] = useState<string>('mid');
  const [userSpecialNeed, setUserSpecialNeed] = useState<string>('all_in_one');

  const selectedLens = LENS_LIST.find((l) => l.id === selectedLensId) || LENS_LIST[0];

  // Smart Recommendation Logic
  const getRecommendation = () => {
    if (userActivity === 'reading') {
      return {
        title: 'Lensa Progresif Multifokal Digital',
        subtitle: 'Ideal untuk membaca dan beraktivitas harian tanpa garis pembatas',
        lensId: 'progressive',
        recommendedIndex: userMinusRange === 'high' ? 'Indeks 1.67 Slim Freeform' : 'Indeks 1.56 / 1.61 Digital',
        reason:
          'Kombinasi kebutuhan baca dekat dengan aktivitas harian membutuhkan lensa gradasi mulus yang memberikan fokus optimal untuk jauh, komputer, dan tulisan kecil.'
      };
    }
    if (userSpecialNeed === 'all_in_one' || (userActivity === 'mixed' && userSpecialNeed === 'convenience')) {
      return {
        title: 'Lensa Bluechromic (All-in-One)',
        subtitle: 'Kombinasi terlengkap proteksi UV luar ruangan + Filter Blue Light komputer',
        lensId: 'bluechromic',
        recommendedIndex: userMinusRange === 'high' ? 'Indeks 1.67 Super Tipis' : 'Indeks 1.61 Tipis',
        reason:
          'Anda membutuhkan kepraktisan 1 kacamata serbaguna. Lensa otomatis gelap saat terkena terik matahari dan menyaring radiasi saat menatap layar HP/laptop.'
      };
    }
    if (userActivity === 'outdoor' || userSpecialNeed === 'driving') {
      return {
        title: userSpecialNeed === 'driving' ? 'Lensa Polarized / Drive Anti-Silau' : 'Lensa Photochromic Grey/Brown',
        subtitle: 'Reduksi silau matahari maksimal untuk kenyamanan berkendara dan ruang terbuka',
        lensId: userSpecialNeed === 'driving' ? 'drive' : 'photochromic',
        recommendedIndex: userMinusRange === 'high' ? 'Indeks 1.67 High Index' : 'Indeks 1.56 / 1.60',
        reason:
          'Aktivitas di jalanan dan luar ruangan memerlukan peredam silau dan proteksi sinar UV400 agar mata tidak silau dan terhindar dari katarak dini.'
      };
    }
    if (userMinusRange === 'high') {
      return {
        title: 'Lensa High Index 1.67 / 1.74 Ultra Thin',
        subtitle: 'Prioritas ketipisan dan bobot ringan agar frame kacamata terlihat elegan',
        lensId: 'hiindex',
        recommendedIndex: 'Indeks 1.67 atau 1.74 Aspheric Ultra Thin',
        reason:
          'Untuk minus di atas -3.50, lensa standar akan tebal dan berat di hidung. Bahan indeks tinggi memadatkan optik sehingga pinggiran lensa tetap rapi di dalam frame.'
      };
    }
    return {
      title: 'Lensa Blue Ray (Blue Cut Protection)',
      subtitle: 'Filter cahaya biru layar digital untuk mata tetap segar dan fokus bekerja',
      lensId: 'blueray',
      recommendedIndex: 'Indeks 1.56 Standard atau 1.61 Slim',
      reason:
        'Sangat cocok untuk pekerja kantor dan pengguna smartphone harian untuk menghindari mata lelah, pusing, dan insomnia akibat cahaya biru.'
    };
  };

  const currentRec = getRecommendation();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Eye Hub Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-900/40 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pusat Edukasi Kesehatan Mata & Panduan Lensa Optik</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Kenali Mata Anda & Temukan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
              Lensa Kacamata Ideal
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Selamat datang di <strong>eye hub</strong>! Ketahui perbedaan teknologi lensa{' '}
            <em>Bluechromic, Photochromic, Blue Ray, Progresif,</em> hingga panduan ketipisan indeks lensa{' '}
            untuk kenyamanan penglihatan terbaik setiap hari.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('lens-catalog-guide');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer transition-all hover:gap-3"
            >
              <span>Jelajahi Jenis Lensa</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => (onNavigate ? onNavigate('marketplace') : onOpenLogin?.())}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span>Lihat Katalog Marketplace Eye Hub</span>
            </button>

            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Optik / Konsumen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Visual Comparison of 4 Common Refractive Errors */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-500" />
              Memahami 4 Gangguan Penglihatan Utama
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pemeriksaan refraksi mata menentukan jenis resep lensa sferis (minus/plus) dan silindris yang Anda butuhkan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-slate-800/60 border border-sky-200/60 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-700 dark:text-sky-300">Miopia (Mata Minus)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Resep SPH (-)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Titik fokus cahaya jatuh di depan retina. Objek jarak jauh terlihat buram, sedangkan objek jarak dekat terlihat jelas.
            </p>
            <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              Solusi: Lensa Cekung (Minus / Sferis Negatif)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Hipermetropia (Mata Plus)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Resep SPH (+)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Titik fokus cahaya jatuh di belakang retina. Objek dekat tampak buram dan menyebabkan mata cepat lelah saat membaca.
            </p>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Solusi: Lensa Cembung (Plus / Sferis Positif)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 dark:text-amber-300">Astigmatisme (Silinder)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                CYL & Axis
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Kelengkungan kornea tidak rata (seperti bola rugby), membuat bayangan berbayang ganda baik dekat maupun jauh.
            </p>
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Solusi: Lensa Silindris dengan Sudut Axis (0°-180°)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-slate-800/60 border border-purple-200/60 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-700 dark:text-purple-300">Presbiopia (Mata Tua)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Resep ADD (+)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Penurunan elastisitas alami lensa kristalin mata mulai usia 40 tahun, menyulitkan fokus membaca teks jarak dekat.
            </p>
            <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              Solusi: Lensa Progresif / Kacamata Baca
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive Lens Technologies Explorer */}
      <div id="lens-catalog-guide" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
            <Glasses className="w-4 h-4" />
            <span>Katalog & Penjelasan Lengkap Teknologi Lensa</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Pilihan Jenis Lensa Kacamata & Keunggulannya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Klik jenis lensa di bawah untuk membaca karakteristik, keunggulan, dan rekomendasi penggunaannya:
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LENS_LIST.map((lens) => {
            const Icon = lens.icon;
            const isSelected = lens.id === selectedLensId;
            return (
              <button
                key={lens.id}
                onClick={() => setSelectedLensId(lens.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm ring-1 ring-sky-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {lens.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      {lens.badge}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-xs leading-tight text-slate-900 dark:text-white">
                    {lens.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                    {lens.id === 'bluechromic'
                      ? 'Anti Radiasi + Gelap'
                      : lens.id === 'photochromic'
                      ? 'Transisi Luar Ruangan'
                      : lens.id === 'blueray'
                      ? 'Filter Layar Digital'
                      : lens.id === 'progressive'
                      ? 'Fokus Jauh & Dekat'
                      : lens.id === 'hiindex'
                      ? 'Ultra Tipis Ringan'
                      : 'Anti Silau Nyetir'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Selected Lens Detail Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${selectedLens.bgLight}`}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-sky-500/20">
                  {selectedLens.badge}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Indeks Tersedia: {selectedLens.indexOptions.join(' • ')}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedLens.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 mt-1">
                  {selectedLens.tagline}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedLens.description}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
                  Keunggulan & Manfaat Utama:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedLens.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  Paling Dianjurkan Untuk:
                </span>
                <p className="text-slate-600 dark:text-slate-300">{selectedLens.recommendedFor}</p>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="w-full lg:w-72 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0 space-y-4">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-sky-500" />
                <span>Pesan Lensa Ini di Eye Hub</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lensa ini siap dipotong dan difaset dengan presisi tinggi di laboratorium faset mitra Eye Hub Optics.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => (onNavigate ? onNavigate('marketplace') : onOpenLogin?.())}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Lihat di Etalase Toko</span>
                </button>

                {onOpenLogin && (
                  <button
                    onClick={onOpenLogin}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login untuk Pesan Resep</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thickness / Lens Index Guide (1.56, 1.61, 1.67, 1.74) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Panduan Ketebalan & Indeks Bias Lensa</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Bagaimana Memilih Indeks Lensa yang Tepat Sesuai Ukuran Minus?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Semakin tinggi indeks bias, semakin padat material resin lensa, sehingga tepi lensa semakin tipis dan tidak tebal seperti pantat botol.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white">Indeks 1.56</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Standar
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Cocok untuk resep minus rendah:
            </div>
            <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
              Plano (0.00) s/d -2.50
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Harga paling ekonomis, ketebalan wajar untuk minus ringan dalam bingkai plastik ataupun bingkai metal penuh.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white">Indeks 1.61</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                20% Lebih Tipis
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Cocok untuk resep minus sedang:
            </div>
            <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
              -2.50 s/d -4.50
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Keseimbangan ideal antara estetika ramping, ketahanan pecah (impact resistance), dan harga terjangkau.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white">Indeks 1.67</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                35% Super Tipis
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Cocok untuk resep minus tinggi:
            </div>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              -4.00 s/d -8.00
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Desain aspheric mencegah distorsi mata kecil dan membuat kacamata tampak sangat rapi pada frame tipis atau semi-rimless.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-white">Indeks 1.74</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                50% Ultra Slim
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Cocok untuk resep minus sangat tinggi:
            </div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              -6.00 s/d -12.00+
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Material polimer ultra padat kasta tertinggi. Bobot paling enteng, mencegah rasa berat di cuping hidung.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lens Recommender Quiz */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 to-sky-950 text-white border border-sky-800/40 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Kuis Rekomendasi Pintar Eye Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Temukan Lensa Terbaik Berdasarkan Aktivitas Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Jawab 3 pertanyaan sederhana untuk mendapatkan panduan jenis lensa dan indeks yang paling cocok:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Question 1: Activity */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-xs font-bold text-sky-300 block">1. Aktivitas Terbanyak:</span>
            <div className="space-y-1.5">
              {[
                { id: 'screen', label: '💻 Layar Komputer / HP Seharian' },
                { id: 'outdoor', label: '☀️ Banyak di Luar / Berkendara' },
                { id: 'reading', label: '📖 Membaca Dokumen & Usia >40' },
                { id: 'mixed', label: '🔄 Seimbang Dalam & Luar Ruangan' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setUserActivity(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    userActivity === opt.id
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {userActivity === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Minus range */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-xs font-bold text-sky-300 block">2. Ukuran Minus Anda:</span>
            <div className="space-y-1.5">
              {[
                { id: 'low', label: 'Normal s/d Minus Ringan (0 s/d -2.50)' },
                { id: 'mid', label: 'Minus Sedang (-2.75 s/d -4.50)' },
                { id: 'high', label: 'Minus Tebal (-4.75 s/d -10.00+)' },
                { id: 'cyl', label: 'Ada Silinder (Astigmatisme)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setUserMinusRange(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    userMinusRange === opt.id
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {userMinusRange === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Special need */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-xs font-bold text-sky-300 block">3. Kebutuhan Spesial:</span>
            <div className="space-y-1.5">
              {[
                { id: 'all_in_one', label: '✨ Praktis 1 Lensa untuk Segala Kondisi' },
                { id: 'driving', label: '🚗 Anti-Silau Lampu Malam & Aspal' },
                { id: 'thin_look', label: '💎 Sangat Mengutamakan Ketipisan' },
                { id: 'budget', label: '🏷️ Standar Ekonomis & Nyaman' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setUserSpecialNeed(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    userSpecialNeed === opt.id
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {userSpecialNeed === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Result Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Rekomendasi Lensa Ideal Untuk Anda:
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">{currentRec.title}</h3>
            <p className="text-xs text-sky-200 font-semibold">{currentRec.subtitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">{currentRec.reason}</p>
            <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-xs font-bold text-sky-300">
              Saran Indeks: {currentRec.recommendedIndex}
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedLensId(currentRec.lensId);
                const el = document.getElementById('lens-catalog-guide');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
            >
              <span>Pelajari Lebih Dalam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Eye Health Habits & Lens Care Tips */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-500" />
          Tips Merawat Kesehatan Mata & Kacamata Anda
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>Metode 20-20-20</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Setiap <strong>20 menit</strong> menatap layar monitor, istirahatkan mata dengan memandang objek berjarak minimal{' '}
              <strong>20 kaki (6 meter)</strong> selama <strong>20 detik</strong> untuk melemaskan otot siliaris mata.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cara Cuci Lensa Benar</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Basahi lensa dengan air mengalir sebelum dilap dengan kain microfiber. Jangan lap lensa dalam keadaan kering berdebu{' '}
              atau menggunakan tisu/ujung baju yang dapat merusak lapisan anti-refleksi (coating).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span>Pemeriksaan Rutin</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Lakukan pemeriksaan refraksi mata di optik atau dokter spesialis mata setidaknya <strong>6 hingga 12 bulan sekali</strong>{' '}
              untuk memantau kestabilan ukuran sferis dan silinder mata Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
