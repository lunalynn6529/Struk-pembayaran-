import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { UsageRecord, ReceiptCustomization } from '../types';
import { formatRupiah, calculateUsageDetails, generateTrxCode } from '../data';
import { Printer, Download, Eye, Sparkles, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptPreviewProps {
  record: UsageRecord | null;
  customization: ReceiptCustomization;
}

export default function ReceiptPreview({ record, customization }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-natural-khaki border border-dashed border-natural-border rounded-2xl bg-white/50">
        <div className="p-4 bg-natural-bg text-natural-sage rounded-full mb-4">
          <Eye size={36} className="animate-pulse" />
        </div>
        <p className="font-semibold text-natural-sage">Belum Ada Struk Terpilih</p>
        <p className="text-xs text-natural-khaki mt-1 max-w-xs leading-relaxed">
          Silakan pilih salah satu baris data pelanggan terlebih dahulu untuk melihat pratinjau struk secara real-time.
        </p>
      </div>
    );
  }

  const { volume, subtotal, total } = calculateUsageDetails(record);
  const trxCode = generateTrxCode(record.no, record.bulan);

  // Set style values based on customization options
  const getThemeClasses = () => {
    switch (customization.theme) {
      case 'monochrome':
        return {
          paper: 'receipt-paper border border-natural-border text-[#4A4A48] shadow-md bg-white',
          headerBg: 'bg-natural-bg border-b border-dashed border-natural-border',
          divider: 'dashed-divider my-4 opacity-50',
          accentText: 'text-[#4A4A48] font-bold',
          badge: 'bg-[#F4F1EA] text-[#4A4A48] border border-natural-border',
          footerBg: 'bg-natural-bg',
          bgHex: '#ffffff'
        };
      case 'classic-blue':
        return {
          paper: 'receipt-paper border border-indigo-200 text-slate-800 shadow-xl shadow-slate-100 bg-white',
          headerBg: 'bg-indigo-50/50 border-b border-dashed border-indigo-200',
          divider: 'border-t border-dashed border-indigo-300 my-4',
          accentText: 'text-indigo-800 font-bold',
          badge: 'bg-indigo-100 text-indigo-800 border border-indigo-350',
          footerBg: 'bg-indigo-50/20',
          bgHex: '#ffffff'
        };
      case 'emerald':
        return {
          paper: 'receipt-paper border border-natural-border text-natural-text shadow-xl bg-white',
          headerBg: 'bg-natural-bg border-b border-dashed border-natural-border',
          divider: 'border-t border-dashed border-natural-border my-4',
          accentText: 'text-natural-sage font-bold',
          badge: 'bg-[#F4F1EA] text-natural-sage border border-natural-border',
          footerBg: 'bg-natural-bg/50',
          bgHex: '#ffffff'
        };
      case 'vintage-pulp':
        return {
          paper: 'receipt-paper-vintage border border-natural-border text-natural-text shadow-xl',
          headerBg: 'bg-[#F4F1EA]/50 border-b border-dashed border-natural-border',
          divider: 'border-t border-dashed border-natural-khaki my-4',
          accentText: 'text-natural-terracotta font-bold',
          badge: 'bg-[#F4F1EA] text-natural-sage border border-natural-border',
          footerBg: 'bg-[#F3EFE6]',
          bgHex: '#fbfbf9'
        };
      case 'midnight-dark':
        return {
          paper: 'bg-[#3A3A38] border border-[#4A4A48] text-[#F9F7F2] shadow-xl',
          headerBg: 'bg-[#4A4A48]/80 border-b border-dashed border-[#5A5E4E]',
          divider: 'border-t border-dashed border-[#5A5E4E] my-4 p-0',
          accentText: 'text-[#F9F7F2] font-semibold',
          badge: 'bg-[#4A4A48] text-[#F9F7F2] border border-[#5A5E4E]',
          footerBg: 'bg-[#4A4A48]/50',
          bgHex: '#3a3a38'
        };
    }
  };

  const getFontClass = () => {
    switch (customization.fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
    }
  };

  const getPaddingClass = () => {
    switch (customization.paddingSize) {
      case 'compact':
        return 'p-4 sm:p-5 text-xs gap-1';
      case 'normal':
        return 'p-6 sm:p-7 text-sm gap-2';
      case 'spacious':
        return 'p-8 sm:p-9 text-base gap-3';
    }
  };

  const currentTheme = getThemeClasses();

  // Export dynamically to PNG using html-to-image
  const handleExportPNG = async () => {
    if (!receiptRef.current) return;
    setExporting(true);
    setSuccessMsg(null);

    try {
      // Small timeout to give style engines time to sync
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: currentTheme.bgHex,
        pixelRatio: 2, // Retinal level HD output
        style: {
          transform: 'scale(1)',
          borderRadius: '0px',
          boxShadow: 'none',
        }
      });

      const link = document.createElement('a');
      link.download = `Struk_Air_${record.no}_${record.bulan.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      setSuccessMsg('Struk berhasil diekspor sebagai gambar PNG!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Pengunduhan PNG gagal:', error);
      alert('Gagal mengunduh gambar struk. Coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  // Live browser printing
  const handlePrint = () => {
    const el = document.getElementById('printable-receipt-area');
    if (el) el.classList.add('active-print');
    window.print();
    if (el) el.classList.remove('active-print');
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F1EA] rounded-2xl p-4 md:p-6 border border-natural-border sm:shadow-xs">
      {/* Title with live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-natural-border pb-4 mb-4">
        <div>
          <h3 className="font-display font-semibold text-natural-sage text-lg flex items-center gap-2">
            <Eye size={20} className="text-natural-sage" /> Pratinjau Real-Time
          </h3>
          <p className="text-xs text-natural-khaki font-medium">
            Setiap perubahan data & gaya otomatis diperbarui live.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-natural-sage rounded-full border border-natural-border text-xs font-semibold">
          <Sparkles size={12} className="animate-spin text-natural-terracotta" /> Aktif
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-[#4A4A48] hover:bg-[#3A3A38] opacity-100 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl transition duration-150 shadow-md shadow-natural-khaki/30 cursor-pointer"
        >
          <Printer size={16} /> Print / Cetak
        </button>

        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-natural-terracotta hover:bg-[#B37F64] text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl transition duration-150 disabled:bg-[#B37F64]/70 shadow-md shadow-natural-terracotta/20 cursor-pointer"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
              <span>Mengekspor...</span>
            </>
          ) : (
            <>
              <Download size={16} /> Ekspor PNG
            </>
          )}
        </button>
      </div>

      {/* Info Status Messages */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-white text-natural-sage border border-natural-border rounded-xl flex items-center gap-2 text-xs font-semibold"
        >
          <Check size={16} className="text-natural-sage" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Instructions helper */}
      <div className="mb-4 text-xs text-natural-sage bg-[#E8E4D9]/50 border border-natural-border rounded-xl p-3 flex items-start gap-2">
        <Info size={16} className="shrink-0 mt-0.5 text-natural-sage" />
        <p className="font-medium text-natural-sage/95">
          <strong>Sistem thermal:</strong> Tombol <strong>Print / Cetak</strong> secara otomatis menyeleksi struk di bawah untuk dicetak ke mesin thermal print kertas 58mm/80mm secara rapi.
        </p>
      </div>

      {/* The Printable / Exportable Thermal receipt */}
      <div className="flex-1 flex justify-center items-start overflow-y-auto max-h-[550px] p-2 bg-white rounded-xl border border-natural-border shadow-inner">
        <div
          ref={receiptRef}
          id="printable-receipt-area"
          className={`w-full max-w-[340px] ${currentTheme.paper} ${getFontClass()} receipt-jagged-bottom transition-all duration-300`}
        >
          {/* Header Area */}
          <div className={`text-center space-y-1 p-4 ${currentTheme.headerBg}`}>
            {customization.showLogo && (
              <div className="flex justify-center mb-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-natural-bg border border-natural-border`}>
                  <div className="text-natural-sage text-base font-bold">💧</div>
                </div>
              </div>
            )}
            <h4 className="font-bold text-center tracking-wide text-sm sm:text-base uppercase leading-snug">
              {customization.namaPenyedia}
            </h4>
            <p className="text-xs opacity-85 leading-snug">{customization.alamatPenyedia}</p>
            {customization.teleponPenyedia && (
              <p className="text-[11px] opacity-75">Telp: {customization.teleponPenyedia}</p>
            )}
          </div>

          {/* Receipt Body with Configured Padding */}
          <div className={`${getPaddingClass()} flex flex-col`}>
            {/* Metadata Info */}
            <div className="grid grid-cols-2 text-[11px] opacity-90 leading-relaxed">
              <div>No. Bukti</div>
              <div className="text-right font-medium">{trxCode}</div>

              <div>Tanggal</div>
              <div className="text-right font-mono">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).replace(',', '')}
              </div>

              <div>Bulan Tagih</div>
              <div className="text-right font-bold uppercase">{record.bulan}</div>

              <div>ID Pelanggan</div>
              <div className="text-right font-semibold text-natural-sage">{record.no}</div>

              <div>Nama Pel.</div>
              <div className="text-right font-medium truncate">{record.namaPelanggan}</div>
            </div>

            <div className={currentTheme.divider}></div>

            {/* Meter Reading details */}
            {customization.showMeterDetails && (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="opacity-75">Meter Awal</span>
                    <span className="font-mono">{record.meterAwal} m³</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="opacity-75">Meter Akhir</span>
                    <span className="font-mono">{record.meterAkhir} m³</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-semibold">
                    <span className="opacity-90">Total Pemakaian</span>
                    <span className="font-mono text-natural-sage font-bold">{volume} m³</span>
                  </div>
                </div>
                <div className={currentTheme.divider}></div>
              </>
            )}

            {/* Calculations and Billing items */}
            <div className="space-y-2">
              <div className="text-right text-[11px] italic opacity-60">
                Rincian Pembayaran
              </div>

              {/* Rincian Pemakaian Air */}
              <div className="flex justify-between items-start text-xs sm:text-sm">
                <div className="flex flex-col">
                  <span>Tarif Air Bersih</span>
                  <span className="text-[11px] opacity-70">
                    {volume} m³ x {formatRupiah(record.tarifDasar)}
                  </span>
                </div>
                <span className="font-mono font-medium">{formatRupiah(subtotal)}</span>
              </div>

              {/* Biaya Admin / Pemeliharaan */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span>Biaya Administrasi</span>
                <span className="font-mono font-medium">{formatRupiah(record.biayaAdmin)}</span>
              </div>

              <div className={currentTheme.divider}></div>

              {/* Grand Total */}
              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">TOTAL TAGIHAN</span>
                <span className={`font-mono text-base font-extrabold ${currentTheme.accentText}`}>
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            {/* Notes if applicable */}
            {record.catatan && (
              <div className="mt-3 p-2 bg-natural-bg rounded text-[11px] italic opacity-80 leading-snug">
                * {record.catatan}
              </div>
            )}

            {/* Footnote text */}
            <div className="text-center text-[10px] leading-relaxed opacity-75 mt-4 space-y-2">
              <div className="dashed-divider opacity-30 pt-2"></div>
              <p className="px-1 text-center font-sans tracking-tight">{customization.footerText}</p>
            </div>

            {/* Simulated Signature Area */}
            {customization.showSignature && (
              <div className="flex justify-around items-center pt-5 pb-2 text-[11px]">
                <div className="text-center opacity-75">
                  <p className="mb-8">Pelanggan,</p>
                  <p className="font-semibold underline truncate max-w-[120px]">
                    {record.namaPelanggan.split('(')[0].trim()}
                  </p>
                </div>
                <div className="text-center opacity-75">
                  <p className="mb-8">Petugas Air,</p>
                  <p className="font-semibold underline truncate max-w-[120px]">{customization.namaPetugas}</p>
                </div>
              </div>
            )}

            {/* Simulated Barcode / QR Code */}
            {customization.showBarcode && (
              <div className="mt-4 flex flex-col items-center justify-center opacity-75">
                <div className="flex h-7 items-center space-x-[1px] bg-black/90 p-1 w-full max-w-[160px] rounded animate-pulse">
                  <div className="bg-white h-full w-[2px]"></div>
                  <div className="bg-white h-full w-[4px]"></div>
                  <div className="bg-white h-full w-[1px]"></div>
                  <div className="bg-white h-full w-[3px]"></div>
                  <div className="bg-white h-full w-[2px]"></div>
                  <div className="bg-white h-full w-[5px]"></div>
                  <div className="bg-white h-full w-[1px]"></div>
                  <div className="bg-white h-full w-[2px]"></div>
                  <div className="bg-white h-full w-[4px]"></div>
                  <div className="bg-white h-full w-[1px]"></div>
                  <div className="bg-white h-full w-[3px]"></div>
                  <div className="bg-white h-full w-[2px]"></div>
                  <div className="bg-white h-full w-[1px]"></div>
                </div>
                <span className="text-[9px] font-mono mt-1 font-semibold tracking-wider">
                  *{trxCode.replace(/-/g, '')}*
                </span>
              </div>
            )}
            
            {/* Spacing bottom for tearing simulation look */}
            <div className="h-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
