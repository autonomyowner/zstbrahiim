'use client'

import Image from 'next/image'

const APK_URL = 'https://github.com/autonomyowner/mobilisad/releases/download/v1.0.0/zst.apk'
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APK_URL)}`

// Custom SVG icons
const AndroidIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5765-6.1185-9.4396" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ScanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

export default function AppDownloadPage(): JSX.Element {
  return (
    <div className="-mt-10 -mb-16 min-h-screen bg-gradient-to-b from-black via-[#0A0908] to-black">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-4 mb-12">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
            Application Mobile
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Telechargez l&apos;app <span className="text-[#C9A227]">ZST</span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            Votre marketplace B2C & B2B complete avec services freelance, directement sur votre telephone Android
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111114] border border-[#C9A227]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* QR Code Section */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30">
                <ScanIcon />
                <span className="text-sm font-medium text-[#C9A227]">Scanner le QR Code</span>
              </div>

              <div className="inline-block p-5 bg-white rounded-2xl shadow-xl">
                <Image
                  src={QR_CODE_URL}
                  alt="QR Code pour telecharger l'application ZST"
                  width={200}
                  height={200}
                  className="block"
                  unoptimized
                />
              </div>

              <div className="space-y-2">
                <p className="text-white font-medium">
                  Pointez l&apos;appareil photo de votre telephone
                </p>
                <p className="text-sm text-white/50">
                  Le telechargement commencera automatiquement
                </p>
              </div>
            </div>

            {/* Direct Download Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Telechargement Direct
                </h2>
                <p className="text-white/60">
                  Vous pouvez aussi telecharger l&apos;APK directement sur votre appareil Android
                </p>
              </div>

              <a
                href={APK_URL}
                className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#C9A227] hover:bg-[#E8C547] text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#C9A227]/20"
              >
                <DownloadIcon />
                <span>Telecharger APK</span>
                <AndroidIcon />
              </a>

              {/* App Info */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Version</p>
                  <p className="text-lg font-bold text-white">1.0.0</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Plateforme</p>
                  <p className="text-lg font-bold text-white">Android</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">Fonctionnalites</p>
                <ul className="space-y-2">
                  {[
                    'Marketplace B2C & B2B complete',
                    'Achat et vente de tous produits',
                    'Plateforme services freelance',
                    'Notifications en temps reel',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-12 bg-[#111114]/50 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <PhoneIcon />
            Instructions d&apos;installation
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Telecharger',
                description: 'Scannez le QR code ou cliquez sur le bouton pour telecharger le fichier APK',
              },
              {
                step: '2',
                title: 'Autoriser',
                description: 'Autorisez l\'installation depuis des sources inconnues dans les parametres',
              },
              {
                step: '3',
                title: 'Installer',
                description: 'Ouvrez le fichier APK telecharge et suivez les instructions',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -top-3 -left-1 w-8 h-8 rounded-full bg-[#C9A227] text-black font-bold text-sm flex items-center justify-center">
                  {item.step}
                </div>
                <div className="pt-6 pl-2">
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beta Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-white font-medium mb-2">
            Version Beta disponible
          </p>
          <p className="text-sm text-white/60">
            Play Store et App Store coming soon
          </p>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Application officielle ZST Marketplace
          </p>
        </div>
      </div>
    </div>
  )
}
