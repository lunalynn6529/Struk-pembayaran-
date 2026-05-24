import { ReceiptCustomization, ThemeStyle, FontType, SizeType } from '../types';
import { Settings, Droplet, Type, Eye, Layers } from 'lucide-react';

interface CustomizationSettingsProps {
  settings: ReceiptCustomization;
  onChange: (settings: ReceiptCustomization) => void;
}

export default function CustomizationSettings({ settings, onChange }: CustomizationSettingsProps) {
  const updateSetting = <K extends keyof ReceiptCustomization>(key: K, value: ReceiptCustomization[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const themes: { id: ThemeStyle; label: string; bg: string; text: string; desc: string }[] = [
    { id: 'monochrome', label: 'Hitam Putih', bg: 'bg-neutral-100', text: 'text-neutral-800 border-neutral-300', desc: 'Standard thermal' },
    { id: 'classic-blue', label: 'Biru Bersih', bg: 'bg-indigo-100', text: 'text-indigo-700 border-indigo-300', desc: 'Modern & professional' },
    { id: 'emerald', label: 'Hijau Alami / Sage', bg: 'bg-natural-sage/20 border-natural-sage/30', text: 'text-natural-sage border-natural-border', desc: 'Natural Depo vibe' },
    { id: 'vintage-pulp', label: 'Kertas Klasik', bg: 'bg-[#F4F1EA]', text: 'text-natural-sage border-natural-border', desc: 'Retro pulp look' },
    { id: 'midnight-dark', label: 'Mode Gelap', bg: 'bg-neutral-900', text: 'text-neutral-200 border-neutral-700', desc: 'Sleek dark theme' }
  ];

  const fonts: { id: FontType; label: string; css: string }[] = [
    { id: 'sans', label: 'Inter Sans (Modern)', css: 'font-sans' },
    { id: 'serif', label: 'Playfair Serif (Formal)', css: 'font-serif' },
    { id: 'mono', label: 'JetBrains Mono (Kasir)', css: 'font-mono' }
  ];

  const paddings: { id: SizeType; label: string; desc: string }[] = [
    { id: 'compact', label: 'Rapat', desc: 'Hemat kertas' },
    { id: 'normal', label: 'Sedang', desc: 'Proporsional' },
    { id: 'spacious', label: 'Longgar', desc: 'Sangat terbaca' }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-natural-border">
        <Settings size={20} className="text-natural-sage" />
        <h3 className="font-display font-semibold text-natural-sage text-base">Kustomisasi Tata Letak</h3>
      </div>

      {/* 1. Header & Identity */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-natural-khaki uppercase tracking-widest flex items-center gap-1.5">
          <Droplet size={14} className="text-natural-sage" /> Identitas Penyedia Air
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-natural-text mb-1">Nama Penyedia / Depo</label>
            <input
              type="text"
              value={settings.namaPenyedia}
              onChange={(e) => updateSetting('namaPenyedia', e.target.value.toUpperCase())}
              placeholder="e.g. DEPO HANUM QUA"
              className="w-full text-xs font-medium px-3 py-2 border border-natural-border rounded-lg focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage uppercase bg-natural-bg text-natural-text"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-natural-text mb-1">Alamat Kantor Penyedia</label>
            <input
              type="text"
              value={settings.alamatPenyedia}
              onChange={(e) => updateSetting('alamatPenyedia', e.target.value)}
              placeholder="e.g. Jl. Kenangan Mandiri No. 42"
              className="w-full text-xs px-3 py-1.5 border border-natural-border rounded-lg focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage bg-natural-bg text-natural-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-natural-text mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={settings.teleponPenyedia}
                onChange={(e) => updateSetting('teleponPenyedia', e.target.value)}
                placeholder="081x"
                className="w-full text-xs px-3 py-1.5 border border-natural-border rounded-lg focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage bg-natural-bg text-natural-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-natural-text mb-1">Nama Petugas Penilai</label>
              <input
                type="text"
                value={settings.namaPetugas}
                onChange={(e) => updateSetting('namaPetugas', e.target.value)}
                placeholder="Nama Petugas"
                className="w-full text-xs px-3 py-1.5 border border-natural-border rounded-lg focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage bg-natural-bg text-natural-text"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-natural-border/60" />

      {/* 2. Theme & Visual Vibe */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-natural-khaki uppercase tracking-widest flex items-center gap-1.5">
          <Layers size={14} className="text-natural-terracotta" /> Skema Warna & Tema
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSetting('theme', t.id)}
              className={`p-2.5 rounded-xl border text-left transition duration-150 cursor-pointer ${
                settings.theme === t.id
                  ? 'border-natural-sage bg-[#F4F1EA] ring-1 ring-natural-sage'
                  : 'border-natural-border hover:bg-natural-bg'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-3.5 h-3.5 rounded-full ${t.bg} border border-natural-border inline-block`} />
                <span className="text-xs font-semibold text-natural-text">{t.label}</span>
              </div>
              <span className="text-[10px] text-natural-khaki block leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-natural-border/60" />

      {/* 3. Typography Selection */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-natural-khaki uppercase tracking-widest flex items-center gap-1.5">
          <Type size={14} className="text-natural-sage" /> Jenis Huruf (Font)
        </h4>

        <div className="space-y-2">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => updateSetting('fontFamily', f.id)}
              className={`w-full p-2 rounded-xl border text-left text-xs transition duration-150 flex items-center justify-between cursor-pointer ${
                settings.fontFamily === f.id
                  ? 'border-natural-sage bg-[#F4F1EA] font-semibold'
                  : 'border-natural-border hover:bg-[#F4F1EA]'
              }`}
            >
              <span className={`${f.css}`}>{f.label}</span>
              {settings.fontFamily === f.id && (
                <span className="w-2 h-2 rounded-full bg-natural-sage" />
              )}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-natural-border/60" />

      {/* 4. Padding Density */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-natural-khaki uppercase tracking-widest flex items-center gap-1.5">
          <Settings size={14} className="text-natural-sage" /> Kerenggangan Layout
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {paddings.map((p) => (
            <button
              key={p.id}
              onClick={() => updateSetting('paddingSize', p.id)}
              className={`p-2 rounded-xl border text-center transition duration-150 cursor-pointer ${
                settings.paddingSize === p.id
                  ? 'border-natural-sage bg-[#F4F1EA] font-semibold'
                  : 'border-natural-border hover:bg-[#F4F1EA]'
              }`}
            >
              <span className="text-xs block text-natural-text">{p.label}</span>
              <span className="text-[9px] text-natural-khaki block leading-tight">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-natural-border/60" />

      {/* 5. Toggles Area */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-natural-khaki uppercase tracking-widest flex items-center gap-1.5">
          <Eye size={14} className="text-natural-terracotta" /> Visibilitas Komponen
        </h4>

        <div className="grid grid-cols-2 gap-3.5 text-xs text-natural-text">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLogo}
              onChange={(e) => updateSetting('showLogo', e.target.checked)}
              className="accent-natural-sage w-4 h-4 rounded"
            />
            <span>Logo Air (💧)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showMeterDetails}
              onChange={(e) => updateSetting('showMeterDetails', e.target.checked)}
              className="accent-natural-sage w-4 h-4 rounded"
            />
            <span>Detail Kubikasi</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showBarcode}
              onChange={(e) => updateSetting('showBarcode', e.target.checked)}
              className="accent-natural-sage w-4 h-4 rounded"
            />
            <span>Barcode Struk</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSignature}
              onChange={(e) => updateSetting('showSignature', e.target.checked)}
              className="accent-natural-sage w-4 h-4 rounded"
            />
            <span>Kolom TTD</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-natural-text/80 mb-1">Pesan Kaki Struk (Footer Text)</label>
          <textarea
            rows={3}
            value={settings.footerText}
            onChange={(e) => updateSetting('footerText', e.target.value)}
            className="w-full text-xs p-2 border border-natural-border rounded-lg focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage leading-normal bg-natural-bg"
            placeholder="Ketik catatan kaki penutup struk..."
          />
        </div>
      </div>
    </div>
  );
}
