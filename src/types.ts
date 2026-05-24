export interface UsageRecord {
  id: string; // Internal unique state ID
  no: string; // The "No" or billing ID (e.g., A1, A2, B1, B2)
  namaPelanggan: string; // Name of the customer
  bulan: string; // Billing Month (e.g., Februari 2026)
  meterAwal: number; // Meter awal
  meterAkhir: number; // Meter akhir
  tarifDasar: number; // Tarif dasar per m³ (e.g., 12500)
  biayaAdmin: number; // Admin or extra operational fees (e.g., 2500)
  catatan?: string; // Optional custom note per customer
}

export type ThemeStyle = 'monochrome' | 'classic-blue' | 'emerald' | 'vintage-pulp' | 'midnight-dark';
export type FontType = 'sans' | 'serif' | 'mono';
export type SizeType = 'compact' | 'normal' | 'spacious';

export interface ReceiptCustomization {
  namaPenyedia: string; // E.g., "PAMSIMAS TIRTA SEJAHTERA"
  alamatPenyedia: string; // E.g., "Jl. Kenangan Indah No. 42"
  teleponPenyedia: string; // E.g., "0812-3456-7890"
  footerText: string; // E.g., "Simpan bukti pembayaran ini sebagai tanda bukti sah."
  theme: ThemeStyle;
  fontFamily: FontType;
  paddingSize: SizeType;
  showLogo: boolean;
  showMeterDetails: boolean;
  showBarcode: boolean;
  showSignature: boolean;
  namaPetugas: string; // E.g., "Budi Santoso"
}
