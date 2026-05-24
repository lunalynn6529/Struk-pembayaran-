import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { UsageRecord, ReceiptCustomization } from '../types';
import { formatRupiah, calculateUsageDetails, generateTrxCode } from '../data';
import { 
  Printer, 
  Download, 
  Grid2X2, 
  Users, 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface A4ReceiptMergerProps {
  records: UsageRecord[];
  customization: ReceiptCustomization;
}

export default function A4ReceiptMerger({ records, customization }: A4ReceiptMergerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Slots matching the 4 corners of an A4 page
  const [slot1, setSlot1] = useState<string>('');
  const [slot2, setSlot2] = useState<string>('');
  const [slot3, setSlot3] = useState<string>('');
  const [slot4, setSlot4] = useState<string>('');

  // Default preselected values on load
  useEffect(() => {
    if (records.length > 0) {
      // Pick first 4 distinct records if they exist, or repeat
      setSlot1(records[0]?.id || '');
      setSlot2(records[1]?.id || records[0]?.id || '');
      setSlot3(records[2]?.id || records[0]?.id || '');
      setSlot4(records[3]?.id || records[0]?.id || '');
    }
  }, [records]);

  // Quick Action: Preselect Top 4 (e.g. A1, A2, B1, B2)
  const handleQuickPreselect = () => {
    const sorted = [...records].sort((a, b) => a.no.localeCompare(b.no));
    if (sorted.length > 0) setSlot1(sorted[0]?.id || '');
    if (sorted.length > 1) setSlot2(sorted[1]?.id || '');
    if (sorted.length > 2) setSlot3(sorted[2]?.id || '');
    if (sorted.length > 3) setSlot4(sorted[3]?.id || '');
  };

  // Quick selection helper list
  const getRecordBySlotId = (id: string): UsageRecord | null => {
    return records.find((r) => r.id === id) || null;
  };

  const currentThemeHex = () => {
    switch (customization.theme) {
      case 'monochrome': return '#ffffff';
      case 'classic-blue': return '#ffffff';
      case 'emerald': return '#ffffff';
      case 'vintage-pulp': return '#fbfbf9';
      case 'midnight-dark': return '#3a3a38';
    }
  };

  // High quality print to A4 size
  const handlePrintA4 = () => {
    const el = document.getElementById('printable-a4-area');
    if (el) el.classList.add('active-print');
    window.print();
    if (el) el.classList.remove('active-print');
  };

  // High quality export of entire A4 page to PNG
  const handleExportA4Png = async () => {
    if (!containerRef.current) return;
    setExporting(true);
    setSuccessMsg(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const dataUrl = await toPng(containerRef.current, {
        cacheBust: true,
        backgroundColor: currentThemeHex(),
        pixelRatio: 2, // High resolution output
        style: {
          transform: 'scale(1)',
          borderRadius: '0px',
          boxShadow: 'none',
        }
      });

      const link = document.createElement('a');
      link.download = `Gabungan_4_Struk_A4_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setSuccessMsg('Gabungan A4 sukses diekspor sebagai gambar PNG HD!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Ekspor PNG gagal: ', err);
      alert('Gagal mengekspor gambar A4. Silakan coba kembali.');
    } finally {
      setExporting(false);
    }
  };

  // Font class configuration
  const getFontClass = () => {
    switch (customization.fontFamily) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
    }
  };

  // Active theme visual styles wrapper
  const getThemeClasses = () => {
    switch (customization.theme) {
      case 'monochrome':
        return {
          card: 'bg-white text-neutral-800 border border-neutral-300',
          headerBg: 'bg-neutral-50 border-b border-dashed border-neutral-300',
          divider: 'border-t border-dashed border-neutral-300 my-3.5',
          textMuted: 'text-neutral-500',
          badge: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
          signature: 'border-b border-neutral-300'
        };
      case 'classic-blue':
        return {
          card: 'bg-white text-slate-800 border border-indigo-200',
          headerBg: 'bg-indigo-50/50 border-b border-dashed border-indigo-200',
          divider: 'border-t border-dashed border-indigo-200 my-3.5',
          textMuted: 'text-indigo-600',
          badge: 'bg-indigo-50 text-indigo-700 border border-indigo-120',
          signature: 'border-b border-indigo-200'
        };
      case 'emerald':
        return {
          card: 'bg-white text-natural-text border border-natural-border',
          headerBg: 'bg-natural-bg border-b border-dashed border-natural-border',
          divider: 'border-t border-dashed border-natural-border my-3.5',
          textMuted: 'text-natural-sage',
          badge: 'bg-[#F4F1EA] text-natural-sage border border-natural-border',
          signature: 'border-b border-natural-border'
        };
      case 'vintage-pulp':
        return {
          card: 'bg-[#fbfbf9] text-natural-text border border-natural-border',
          headerBg: 'bg-[#F4F1EA]/50 border-b border-dashed border-natural-border',
          divider: 'border-t border-dashed border-natural-khaki my-3.5',
          textMuted: 'text-natural-terracotta',
          badge: 'bg-[#F4F1EA] text-natural-sage border border-[#E8E4D9]',
          signature: 'border-b border-natural-khaki'
        };
      case 'midnight-dark':
        return {
          card: 'bg-[#3A3A38] text-[#F9F7F2] border border-[#4A4A48]',
          headerBg: 'bg-[#4A4A48]/80 border-b border-dashed border-[#5A5E4E]',
          divider: 'border-t border-dashed border-[#5A5E4E] my-3.5',
          textMuted: 'text-[#CB997E]',
          badge: 'bg-[#4A4A48] text-[#F9F7F2] border border-[#5A5E4E]',
          signature: 'border-b border-[#5A5E4E]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="space-y-6">
      
      {/* Configuration Panel */}
      <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-natural-border pb-3">
          <div className="flex items-center gap-2">
            <Grid2X2 className="text-natural-sage" size={20} />
            <h3 className="font-display font-semibold text-natural-sage text-base">
              Merger Struk (Penggabung Lembaran A4)
            </h3>
          </div>
          <button
            onClick={handleQuickPreselect}
            className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-[#F4F1EA] text-natural-sage rounded-lg border border-natural-border hover:bg-natural-border transition cursor-pointer"
          >
            ⚡ Urutkan A1, A2, B1, B2 Otomatis
          </button>
        </div>

        <p className="text-xs text-[#5C5C59] leading-relaxed">
          Atur posisi cetak 4 pelanggan Anda untuk menghemat kertas. Lembar cetak akan disusun dalam <strong>grid 2 kolm x 2 baris</strong> berdimensi kertas A4 standard, lengkap dengan pembatas garis gunting yang presisi.
        </p>

        {/* Dynamic Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          
          <div className="space-y-1.5 p-3.5 bg-natural-bg rounded-xl border border-natural-border">
            <span className="text-[10px] font-bold text-natural-khaki tracking-widest block uppercase">🎰 Slot Kiri-Atas (No 1)</span>
            <select
              value={slot1}
              onChange={(e) => setSlot1(e.target.value)}
              className="w-full text-xs bg-white border border-natural-border rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-natural-sage"
            >
              <option value="">-- Kosongkan Slot 1 --</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.no} - {r.namaPelanggan.split('(')[0]} ({r.bulan})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-3.5 bg-natural-bg rounded-xl border border-natural-border">
            <span className="text-[10px] font-bold text-natural-khaki tracking-widest block uppercase">🎰 Slot Kanan-Atas (No 2)</span>
            <select
              value={slot2}
              onChange={(e) => setSlot2(e.target.value)}
              className="w-full text-xs bg-white border border-natural-border rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-natural-sage"
            >
              <option value="">-- Kosongkan Slot 2 --</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.no} - {r.namaPelanggan.split('(')[0]} ({r.bulan})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-3.5 bg-natural-bg rounded-xl border border-natural-border">
            <span className="text-[10px] font-bold text-natural-khaki tracking-widest block uppercase">🎰 Slot Kiri-Bawah (No 3)</span>
            <select
              value={slot3}
              onChange={(e) => setSlot3(e.target.value)}
              className="w-full text-xs bg-white border border-natural-border rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-natural-sage"
            >
              <option value="">-- Kosongkan Slot 3 --</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.no} - {r.namaPelanggan.split('(')[0]} ({r.bulan})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-3.5 bg-natural-bg rounded-xl border border-natural-border">
            <span className="text-[10px] font-bold text-natural-khaki tracking-widest block uppercase">🎰 Slot Kanan-Bawah (No 4)</span>
            <select
              value={slot4}
              onChange={(e) => setSlot4(e.target.value)}
              className="w-full text-xs bg-white border border-natural-border rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-natural-sage"
            >
              <option value="">-- Kosongkan Slot 4 --</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.no} - {r.namaPelanggan.split('(')[0]} ({r.bulan})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handlePrintA4}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4A4A48] hover:bg-[#3A3A38] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition duration-150 shadow-md shadow-natural-khaki/20 cursor-pointer"
          >
            <Printer size={15} /> Cetak 1 Lembar A4
          </button>
          <button
            onClick={handleExportA4Png}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 bg-natural-terracotta hover:bg-[#B37F64] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition duration-150 disabled:bg-[#B37F64]/70 shadow-md shadow-natural-terracotta/10 cursor-pointer"
          >
            {exporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menggabungkan...
              </>
            ) : (
              <>
                <Download size={15} /> Ekspor PNG HD (A4)
              </>
            )}
          </button>
        </div>

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-[#E8E4D9] text-natural-sage border border-natural-border rounded-xl flex items-center gap-2 text-xs font-semibold"
          >
            <Check size={16} className="text-natural-sage shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </div>

      {/* Instructions helper info banner */}
      <div className="text-xs text-natural-sage bg-[#E8E4D9]/40 border border-natural-border rounded-xl p-3 flex items-start gap-2.5">
        <Info size={16} className="shrink-0 text-natural-sage mt-0.5" />
        <p>
          <strong>Tips Percetakan Kertas A4:</strong> Pada kotak dialog print browser Anda, pastikan Anda menyetel <strong>Paper Size: A4</strong>, <strong>Layout: Portrait</strong>, <strong>Margins: None / Minimum</strong>, dan mengaktifkan <strong>Background Graphics (Warna Latar)</strong> agar warna tema/struk tercetak dengan indah.
        </p>
      </div>

      {/* Interactive virtual A4 sheet boundary representation */}
      <div className="flex justify-center p-3 sm:p-5 bg-neutral-200/50 rounded-2xl border border-natural-border shadow-inner overflow-x-auto">
        
        {/* Virtual 2D Canvas centered on screen */}
        <div 
          ref={containerRef}
          id="printable-a4-area"
          className={`shrink-0 w-[210mm] h-[297mm] bg-white p-[10mm] border border-neutral-300 shadow-2xl relative grid grid-cols-2 grid-rows-2 gap-[4mm] ${getFontClass()}`}
          style={{ boxSizing: 'border-box' }}
        >
          
          {/* Subtle scissor indicators overlays on cross section */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Horizontal folding line */}
            <div className="w-full border-t border-dashed border-neutral-300/60 absolute"></div>
            {/* Vertical folding line */}
            <div className="h-full border-l border-dashed border-neutral-300/60 absolute"></div>
            {/* Scissor visual anchor */}
            <div className="bg-white/80 border border-neutral-300 text-[10px] text-neutral-400 py-1 px-2 rounded-md shadow-xs z-10 font-sans font-semibold">
              ✂️ Garis Gunting Lipat
            </div>
          </div>

          {/* Quadrant 1 (Kiri Atas) */}
          <div className={`p-4 rounded-xl flex flex-col justify-between ${themeClasses.card}`} style={{ height: 'calc((297mm - 20mm - 4mm) / 2)' }}>
            <MiniReceiptContent record={getRecordBySlotId(slot1)} customization={customization} classes={themeClasses} />
          </div>

          {/* Quadrant 2 (Kanan Atas) */}
          <div className={`p-4 rounded-xl flex flex-col justify-between ${themeClasses.card}`} style={{ height: 'calc((297mm - 20mm - 4mm) / 2)' }}>
            <MiniReceiptContent record={getRecordBySlotId(slot2)} customization={customization} classes={themeClasses} />
          </div>

          {/* Quadrant 3 (Kiri Bawah) */}
          <div className={`p-4 rounded-xl flex flex-col justify-between ${themeClasses.card}`} style={{ height: 'calc((297mm - 20mm - 4mm) / 2)' }}>
            <MiniReceiptContent record={getRecordBySlotId(slot3)} customization={customization} classes={themeClasses} />
          </div>

          {/* Quadrant 4 (Kanan Bawah) */}
          <div className={`p-4 rounded-xl flex flex-col justify-between ${themeClasses.card}`} style={{ height: 'calc((297mm - 20mm - 4mm) / 2)' }}>
            <MiniReceiptContent record={getRecordBySlotId(slot4)} customization={customization} classes={themeClasses} />
          </div>

        </div>

      </div>

    </div>
  );
}

// Compact receipt component rendering in each quadrant
function MiniReceiptContent({ 
  record, 
  customization, 
  classes 
}: { 
  record: UsageRecord | null, 
  customization: ReceiptCustomization, 
  classes: any 
}) {
  if (!record) {
    return (
      <div className="h-full flex items-center justify-center border border-dashed border-neutral-200 rounded-lg text-neutral-400 italic text-[11px] p-6 text-center select-none bg-neutral-50/50">
        Slot Kosong<br />(Pilih pelanggan di atas untuk mencetak)
      </div>
    );
  }

  const { volume, subtotal, total } = calculateUsageDetails(record);
  const trxCode = generateTrxCode(record.no, record.bulan);

  return (
    <div className="h-full flex flex-col justify-between text-[11px] leading-relaxed">
      
      {/* Header Block */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {customization.showLogo && <span className="text-xs">💧</span>}
            <span className="font-bold text-[12px] tracking-tight truncate max-w-[170px] uppercase leading-none">
              {customization.namaPenyedia}
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase font-mono bg-neutral-100 text-neutral-700 leading-none shrink-0">
            {record.no}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-[9px] opacity-75 truncate leading-tight">
          <span>{customization.alamatPenyedia}</span>
          <span>{customization.teleponPenyedia}</span>
        </div>

        <div className={classes.divider + ' !my-1.5'}></div>
      </div>

      {/* Main Metadata Grid */}
      <div className="space-y-1.5 font-mono">
        
        <div className="grid grid-cols-2 gap-x-2 text-[10px]">
          <div>Abonamen:</div>
          <div className="text-right truncate font-sans">{record.namaPelanggan}</div>
          
          <div>Bulan Periode:</div>
          <div className="text-right truncate font-bold uppercase">{record.bulan}</div>

          <div>No. Referensi:</div>
          <div className="text-right text-[9px] font-bold tracking-tight">{trxCode}</div>
        </div>

        {customization.showMeterDetails && (
          <div className="p-1.5 bg-neutral-100/60 rounded border border-neutral-200/40 text-[9px] space-y-0.5">
            <div className="flex justify-between text-neutral-600">
              <span>Meter Air:</span>
              <span>{record.meterAwal} m³ ➜ {record.meterAkhir} m³</span>
            </div>
            <div className="flex justify-between font-semibold text-neutral-800">
              <span>Volume Konsumsi:</span>
              <span className={classes.textMuted}>{volume} m³</span>
            </div>
          </div>
        )}

      </div>

      <div className={classes.divider + ' !my-1.5'}></div>

      {/* Pricing Matrix */}
      <div className="space-y-1 font-mono text-[10px]">
        
        <div className="flex justify-between">
          <span>Subtotal Air ({volume} m³):</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Biaya Admin & Op:</span>
          <span>{formatRupiah(record.biayaAdmin)}</span>
        </div>

        <div className="border-t border-dashed border-neutral-300 pt-1.5 flex justify-between items-center text-[12px]">
          <span className="font-sans font-bold uppercase tracking-wider text-[9px]">Total Bayar:</span>
          <span className="font-bold text-neutral-900">{formatRupiah(total)}</span>
        </div>

      </div>

      {/* Signature Column & Barcode Block */}
      <div className="space-y-1 pt-1 border-t border-neutral-200/55 mt-1.5">
        
        {record.catatan && (
          <p className="text-[9px] italic opacity-75 truncate max-w-[280px]">
            * {record.catatan}
          </p>
        )}

        <div className="flex items-end justify-between gap-1 mt-1">
          
          {customization.showBarcode ? (
            <div className="flex flex-col items-center shrink-0">
              <div className="flex h-5 items-center space-x-[1px] bg-black p-0.5 w-[55px] rounded opacity-75">
                <div className="bg-white h-full w-[1.5px]"></div>
                <div className="bg-white h-full w-[2.5px]"></div>
                <div className="bg-white h-full w-[1px]"></div>
                <div className="bg-white h-full w-[3px]"></div>
                <div className="bg-white h-full w-[1px]"></div>
                <div className="bg-white h-full w-[2px]"></div>
              </div>
            </div>
          ) : (
            <div className="w-1"></div>
          )}

          {customization.showSignature && (
            <div className="grid grid-cols-2 gap-3 text-[8px] text-center shrink-0 w-[140px] font-sans">
              <div className="space-y-3.5">
                <span className="block opacity-75">Pelanggan</span>
                <span className="block border-t border-neutral-400 mt-0.5 truncate leading-none"></span>
              </div>
              <div className="space-y-3.5">
                <span className="block opacity-75">Petugas</span>
                <span className="block border-t border-neutral-400 mt-0.5 font-semibold truncate leading-none">
                  {customization.namaPetugas}
                </span>
              </div>
            </div>
          )}

        </div>

        <p className="text-[7.5px] text-center opacity-65 leading-none pt-1 border-t border-neutral-100 font-sans">
          Powered by Depo Hanum Qua
        </p>

      </div>

    </div>
  );
}
