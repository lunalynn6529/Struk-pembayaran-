import { UsageRecord, ReceiptCustomization } from './types';

// The exact initial records requested by the user
export const INITIAL_RECORDS: UsageRecord[] = [
  {
    id: 'rec_1',
    no: 'A1',
    namaPelanggan: 'Suryadi (A1)',
    bulan: 'Februari 2026',
    meterAwal: 384,
    meterAkhir: 408,
    tarifDasar: 12500,
    biayaAdmin: 2500,
    catatan: 'Pembayaran Pemakaian Air Rumah Tangga A1'
  },
  {
    id: 'rec_2',
    no: 'A2',
    namaPelanggan: 'Hendra Wijaya (A2)',
    bulan: 'Februari 2026',
    meterAwal: 385,
    meterAkhir: 403,
    tarifDasar: 12500,
    biayaAdmin: 2500,
    catatan: 'Pembayaran Pemakaian Air Rumah Tangga A2'
  },
  {
    id: 'rec_3',
    no: 'B1',
    namaPelanggan: 'Aminah (B1)',
    bulan: 'Februari 2026',
    meterAwal: 267,
    meterAkhir: 281,
    tarifDasar: 12500,
    biayaAdmin: 2500,
    catatan: 'Pembayaran Pemakaian Air Rumah Tangga B1'
  },
  {
    id: 'rec_4',
    no: 'B2',
    namaPelanggan: 'Rahmat Hidayat (B2)',
    bulan: 'Februari 2026',
    meterAwal: 305,
    meterAkhir: 318,
    tarifDasar: 12500,
    biayaAdmin: 2500,
    catatan: 'Pembayaran Pemakaian Air Rumah Tangga B2'
  }
];

export const DEFAULT_SETTINGS: ReceiptCustomization = {
  namaPenyedia: 'Depo Hanum Qua',
  alamatPenyedia: 'Jl. Pemuda Merdeka No. 12, Sidoarjo',
  teleponPenyedia: '0812-3456-7890',
  footerText: 'Terima kasih atas pembayaran Anda. Simpan struk ini sebagai bukti resmi pembayaran pemakaian air bersih.',
  theme: 'classic-blue',
  fontFamily: 'mono',
  paddingSize: 'normal',
  showLogo: true,
  showMeterDetails: true,
  showBarcode: true,
  showSignature: true,
  namaPetugas: 'Moh. Huda'
};

// Formatting helpers
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Calculations helper
export function calculateUsageDetails(record: UsageRecord) {
  const volume = Math.max(0, record.meterAkhir - record.meterAwal);
  const subtotal = volume * record.tarifDasar;
  const total = subtotal + record.biayaAdmin;
  return {
    volume,
    subtotal,
    total
  };
}

// Generate code for a dummy invoice/transaction ref
export function generateTrxCode(no: string, bulan: string): string {
  const cleanBulan = bulan.replace(/\s+/g, '').substring(0, 5).toUpperCase();
  return `TRX-${no || 'XX'}-${cleanBulan}-${Math.floor(1000 + Math.random() * 9000)}`;
}
