import { useState, useEffect } from 'react';
import { UsageRecord, ReceiptCustomization } from './types';
import { INITIAL_RECORDS, DEFAULT_SETTINGS, calculateUsageDetails, formatRupiah } from './data';
import RecordTable from './components/RecordTable';
import RecordForm from './components/RecordForm';
import CustomizationSettings from './components/CustomizationSettings';
import ReceiptPreview from './components/ReceiptPreview';
import A4ReceiptMerger from './components/A4ReceiptMerger';
import { 
  Droplet, 
  HelpCircle, 
  FileSpreadsheet, 
  Settings, 
  Activity, 
  Wallet, 
  Layers, 
  Check, 
  Sparkles, 
  Plus, 
  Menu,
  Grid2X2,
  Edit,
  Copy,
  Trash2,
  LogOut,
  Lock,
  ExternalLink,
  CheckCircle,
  CloudLightning,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { exportToGoogleSheets } from './lib/googleSheets';

export default function App() {
  // Authentication & Sync states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Sheets Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Main states for customer water records and receipts customization details
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [customization, setCustomization] = useState<ReceiptCustomization>(DEFAULT_SETTINGS);
  
  // Selection and edit records states
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<UsageRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'kustomisasi' | 'gabungan-a4'>('input');
  
  // Mobile drawer state for previewing on smaller devices
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Custom modal state for reliable iframe confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  } | null>(null);

  // Load from localStorage or pre-populate with requested data upon mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('water_records');
    const savedSettings = localStorage.getItem('water_receipt_settings');

    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords) as UsageRecord[];
        setRecords(parsed);
        if (parsed.length > 0) {
          setSelectedRecordId(parsed[0].id); // Select first one by default
        }
      } catch (e) {
        setRecords(INITIAL_RECORDS);
        setSelectedRecordId(INITIAL_RECORDS[0].id);
      }
    } else {
      // First boot: load the 4 requested rows directly from INITIAL_RECORDS
      setRecords(INITIAL_RECORDS);
      setSelectedRecordId(INITIAL_RECORDS[0].id);
      localStorage.setItem('water_records', JSON.stringify(INITIAL_RECORDS));
    }

    if (savedSettings) {
      try {
        setCustomization(JSON.parse(savedSettings));
      } catch (e) {
        setCustomization(DEFAULT_SETTINGS);
      }
    } else {
      localStorage.setItem('water_receipt_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  // Listen to Google Auth changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setAccessToken(cachedToken);
        setIsAuthLoading(false);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In handler
  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setAuthError(null);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err?.message || 'Gagal masuk dengan akun Google Anda.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Google Sign-Out handler
  const handleGoogleLogout = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out Akun Google',
      message: 'Apakah Anda yakin ingin keluar dari akun Google? Anda perlu login kembali untuk dapat menginput atau mengubah data pelanggan.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: async () => {
        try {
          await logout();
          setUser(null);
          setAccessToken(null);
          setExportUrl(null);
          setConfirmModal(null);
        } catch (err) {
          console.error('Logout error:', err);
        }
      }
    });
  };

  // Export records to Google Sheets
  const handleExportToSheets = async () => {
    if (!accessToken) {
      setExportError('Token akses tidak tersedia. Silakan masuk kembali.');
      return;
    }
    
    setIsExporting(true);
    setExportError(null);
    setExportUrl(null);

    try {
      const result = await exportToGoogleSheets(records, customization, accessToken);
      setExportUrl(result.spreadsheetUrl);
      
      // Open beautiful success confirmation modal
      setConfirmModal({
        isOpen: true,
        title: 'Ekspor Sukses! 🟢',
        message: `Tabel pemakaian air (${records.length} pelanggan) telah diekspor ke akun Google Drive & Google Sheets Anda. Klik tombol di bawah untuk membukanya.`,
        confirmText: 'Buka Spreadsheet ↗',
        cancelText: 'Selesai',
        isDanger: false,
        onConfirm: () => {
          window.open(result.spreadsheetUrl, '_blank');
          setConfirmModal(null);
        }
      });
    } catch (err: any) {
      console.error('Google Sheets export error:', err);
      setExportError(err?.message || 'Gagal mengekspor riwayat ke Google Sheets.');
      
      setConfirmModal({
        isOpen: true,
        title: 'Ekspor Gagal 🔴',
        message: `Terjadi kendala saat mengekspor: ${err?.message || 'Gagal mengekspor data'}. Silakan coba beberapa saat lagi.`,
        confirmText: 'Mengerti',
        cancelText: 'Batal',
        isDanger: true,
        onConfirm: () => setConfirmModal(null)
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Save records and settings automatically on modifications
  const handleSaveRecordsState = (newRecords: UsageRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('water_records', JSON.stringify(newRecords));
  };

  const handleSaveCustomizationState = (newSettings: ReceiptCustomization) => {
    setCustomization(newSettings);
    localStorage.setItem('water_receipt_settings', JSON.stringify(newSettings));
  };

  // Add or update usage record
  const handleSaveRecord = (record: UsageRecord) => {
    const exists = records.some((r) => r.id === record.id);
    let updated: UsageRecord[];

    if (exists) {
      updated = records.map((r) => (r.id === record.id ? record : r));
      setEditingRecord(null); // Clear editing state after update
    } else {
      updated = [record, ...records];
    }

    handleSaveRecordsState(updated);
    setSelectedRecordId(record.id); // Automatically select newly saved item to preview
  };

  const handleDeleteRecord = (id: string, bypassConfirm = false) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    const performDelete = () => {
      const updated = records.filter((r) => r.id !== id);
      handleSaveRecordsState(updated);

      if (selectedRecordId === id) {
        setSelectedRecordId(updated.length > 0 ? updated[0].id : null);
      }
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
    };

    if (bypassConfirm) {
      performDelete();
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Hapus Catatan Pelanggan',
        message: `Apakah Anda yakin ingin menghapus catatan pemakaian air untuk ${record.namaPelanggan}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus',
        cancelText: 'Batal',
        isDanger: true,
        onConfirm: () => {
          performDelete();
          setConfirmModal(null);
        }
      });
    }
  };

  const handleDuplicateRecord = (record: UsageRecord) => {
    // Generate a clean Incremental No/ID based on the code copied
    let newNo = record.no;
    const match = record.no.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const digits = parseInt(match[2], 10);
      newNo = `${prefix}${digits + 1}`;
    } else {
      newNo = `${record.no}-NEW`;
    }

    const duplicated: UsageRecord = {
      ...record,
      id: `rec_${Date.now()}`,
      no: newNo,
      namaPelanggan: `${record.namaPelanggan.split('(')[0].trim()} (Salinan)`
    };

    const updated = [duplicated, ...records];
    handleSaveRecordsState(updated);
    setSelectedRecordId(duplicated.id);
    
    // Smoothly scroll down to table/form after duplicating so they can customize it
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleResetToDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset ke Data Contoh',
      message: 'Apakah Anda yakin ingin memulihkan data awal dari contoh soal (A1, A2, B1, B2)? Data buatan Anda saat ini akan ditimpa.',
      confirmText: 'Ya, Reset Data',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: () => {
        handleSaveRecordsState(INITIAL_RECORDS);
        setSelectedRecordId(INITIAL_RECORDS[0].id);
        setEditingRecord(null);
        setConfirmModal(null);
      }
    });
  };

  // State Calculations for KPI bento cards
  const totalVolume = records.reduce((sum, r) => sum + Math.max(0, r.meterAkhir - r.meterAwal), 0);
  const totalBilling = records.reduce((sum, r) => {
    const { total } = calculateUsageDetails(r);
    return sum + total;
  }, 0);
  const totalSubtotalOnly = records.reduce((sum, r) => {
    const { subtotal } = calculateUsageDetails(r);
    return sum + subtotal;
  }, 0);
  const totalRecords = records.length;
  const avgUsage = totalRecords > 0 ? (totalVolume / totalRecords).toFixed(1) : '0';

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  // 1. Full Screen Loading Indicator
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-natural-bg flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-natural-sage/10 text-natural-sage rounded-2xl flex items-center justify-center mx-auto border border-natural-sage/20 shadow-xs">
            <Droplet size={32} className="animate-bounce text-natural-sage" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-semibold text-natural-sage text-base">Memeriksa Keamanan Sistem...</h3>
            <p className="text-xs text-natural-khaki font-medium">Menghubungkan layanan kredensial Google</p>
          </div>
          <div className="flex justify-center pt-2">
            <div className="w-6 h-6 border-2 border-natural-sage border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Google Login Lock Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-natural-bg text-natural-text font-sans antialiased flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-natural-border rounded-3xl shadow-xl overflow-hidden">
          {/* Top Banner decoration */}
          <div className="bg-natural-sage px-6 py-8 text-center text-white relative">
            <div className="absolute top-4 right-4 bg-white/10 text-white rounded-full p-1.5 flex items-center justify-center">
              <Lock size={14} />
            </div>
            <div className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto border border-white/20 mb-3.5 shadow-sm">
              <Droplet size={26} className="animate-pulse text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8E4D9]">Depo Hanum Qua</span>
            <h2 className="font-display font-semibold text-xl tracking-tight mt-1">Kwitansi Digital Kassa Air</h2>
            <p className="text-xs text-white/80 mt-1.5 max-w-xs mx-auto">
              Sistem pencatatan terintegrasi & kustomisasi cetak struk pembayaran air bersih mandiri.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm sm:text-base text-neutral-800 text-center">
                Autentikasi Pengguna Diperlukan
              </h3>
              
              <div className="space-y-3 bg-natural-bg/50 border border-natural-border/60 p-4 rounded-2xl">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-natural-sage/10 text-natural-sage flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-[#5C5C59] leading-relaxed">
                    <strong>Proteksi Data Aman:</strong> Mencegah akses yang tidak sah ke catatan tagihan air perumahan atau koperasi Anda.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-natural-sage/10 text-natural-sage flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-[#5C5C59] leading-relaxed">
                    <strong>Ekspor Cloud Langsung:</strong> Sinkronisasi database pelanggan dan kirim laporan excel langsung ke Drive / Sheets Anda.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-natural-sage/10 text-natural-sage flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-[#5C5C59] leading-relaxed">
                    <strong>Keamanan Tinggi:</strong> Menggunakan Google OAuth aman. Kredensial Anda diisolasi di lingkungan terproteksi.
                  </p>
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-3 px-4 rounded-xl font-medium leading-relaxed text-center">
                ⚠️ {authError}
              </div>
            )}

            {/* Official style Sign-In Button */}
            <div className="flex flex-col items-center">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl border border-neutral-800 hover:border-neutral-900 transition duration-150 shadow-md hover:shadow-lg cursor-pointer max-w-sm"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                Masuk dengan Google
              </button>
              
              <p className="text-[10px] text-natural-khaki font-semibold text-center mt-5">
                Sistem Kasir Air Bersih Mandiri • Versi Cloud Terproteksi
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans antialiased">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-natural-border/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-natural-sage flex items-center justify-center text-white shadow-sm">
              <Droplet size={18} className="text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-natural-khaki uppercase tracking-widest block leading-none">Depo Hanum Qua</span>
              <h1 className="font-display font-semibold text-natural-sage text-base tracking-tight leading-tight">
                Kwitansi<span className="text-natural-terracotta">Digital</span>
              </h1>
            </div>
          </div>

          {/* Center Info on Desktop */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F1EA] rounded-full border border-natural-border/70 font-semibold text-natural-sage">
              <span className="w-2 h-2 rounded-full bg-natural-sage animate-ping inline-block" />
              <span>Sistem Kasir Air Aktif</span>
            </div>
            <span className="text-natural-khaki font-bold">●</span>
            <span className="text-natural-sage/95 font-medium">Bulan: <strong className="text-natural-sage">{customization.namaPetugas ? customization.namaPetugas : 'Operator'}</strong></span>
          </div>

          {/* Right Area: Export spreadsheets and user card profile */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Elegant Export to Google Sheets Action */}
            <button
              onClick={handleExportToSheets}
              disabled={isExporting}
              title="Ekspor seluruh riwayat pencatatan ke Google Drive & Sheets"
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200/80 transition duration-150 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Mengekspor...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">Ekspor ke Sheets</span>
                  <span className="sm:hidden">Ekspor</span>
                </>
              )}
            </button>

            {/* User credentials identifier */}
            <div className="flex items-center gap-2 border-l border-natural-border/70 pl-2.5 sm:pl-3.5">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Google User'} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-natural-sage/30 hover:scale-105 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-natural-sage text-white text-xs font-bold flex items-center justify-center">
                  {(user.displayName || 'G').charAt(0)}
                </div>
              )}
              
              <div className="hidden md:block text-left leading-tight">
                <h5 className="text-[11px] font-bold text-natural-sage">{user.displayName || 'Google Operator'}</h5>
                <p className="text-[9px] text-natural-khaki font-medium truncate max-w-[110px]">{user.email}</p>
              </div>

              {/* Secure Log-Out */}
              <button
                onClick={handleGoogleLogout}
                title="Selesaikan Sesi / Logout google"
                className="p-1.5 hover:bg-red-50 hover:text-red-650 text-natural-khaki rounded-lg transition duration-150 cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>

            {/* Preview button for tiny screens */}
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="md:hidden flex items-center justify-center p-1.5 bg-natural-sage text-white rounded-lg hover:bg-[#5A5E4E] transition cursor-pointer shrink-0"
              title="Tampilkan Pratinjau Struk"
            >
              <Plus size={15} />
            </button>
            
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Info Banner in Natural Colors */}
        <div className="bg-white text-natural-text border border-natural-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-2.5 bg-natural-bg text-natural-sage rounded-xl border border-natural-border">
            <Sparkles size={20} className="animate-spin text-natural-terracotta" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-semibold text-sm sm:text-base text-natural-sage leading-snug">
              Sistem Input Air & Cetak Struk Real-Time Terintegrasi (Tema Natural Tones)
            </h2>
            <p className="text-xs text-[#5C5C59] leading-relaxed max-w-4xl">
              Gunakan panel ini untuk mengelola pencatatan meter air pelanggan seperti contoh data Anda (<strong>A1, A2, B1, B2</strong>). Anda dapat mengedit, menambah, memantau kubikasi secara interaktif, menyesuaikan desain layout, pratinjau real-time, dan mengekspor struk akhir sebagai <strong>PNG HD</strong> atau langsung mencetaknya.
            </p>
          </div>
        </div>

        {/* 3. Bento Metrics Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-bg text-natural-sage rounded-xl flex items-center justify-center border border-natural-border shrink-0">
              <Plus size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-natural-khaki tracking-wider">Unit Tercatat</p>
              <h4 className="text-base font-bold text-natural-sage font-mono">{totalRecords} <span className="text-[10px] font-sans font-normal text-natural-text/70">pelanggan</span></h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-bg text-natural-sage rounded-xl flex items-center justify-center border border-natural-border shrink-0">
              <Droplet size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-natural-khaki tracking-wider">Total Volume</p>
              <h4 className="text-base font-bold text-natural-sage font-mono">{totalVolume} <span className="text-[10px] font-sans font-normal text-natural-text/70">m³</span></h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-bg text-natural-terracotta rounded-xl flex items-center justify-center border border-natural-border shrink-0">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-natural-khaki tracking-wider">Target Pendapatan</p>
              <h4 className="text-xs font-bold text-natural-sage font-mono">{formatRupiah(totalBilling)}</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-natural-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-bg text-natural-sage rounded-xl flex items-center justify-center border border-natural-border shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-natural-khaki tracking-wider">Rata-Rata Pemakaian</p>
              <h4 className="text-base font-bold text-natural-sage font-mono">{avgUsage} <span className="text-[10px] font-sans font-normal text-natural-text/70">m³ / Unit</span></h4>
            </div>
          </div>

        </div>

        {/* 3.5. Shortcut Customer Navigator DOCK */}
        <div className="bg-white px-5 py-4 rounded-2xl border border-natural-border shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-natural-border/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-natural-sage"></span>
              </span>
              <h3 className="text-xs font-bold text-natural-sage uppercase tracking-wider">
                Akses Pintas Ganti Pelanggan Cepat (Real-Time Switcher)
              </h3>
            </div>
            <p className="text-[10px] text-natural-khaki font-semibold">
              Klik nama pelanggan untuk beralih instan ke mode input & pratinjau struk. Tekan tombol (👥) untuk menduplikasi data.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {records.map((r) => {
              const isActive = r.id === selectedRecordId;
              return (
                <div 
                  key={r.id}
                  className={`flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition duration-150 ${
                    isActive 
                      ? 'bg-natural-sage text-white border-natural-sage ring-2 ring-natural-sage/20 font-bold'
                      : 'bg-white text-natural-text border-natural-border hover:bg-[#F4F1EA]'
                  }`}
                  onClick={() => {
                    setSelectedRecordId(r.id);
                    setEditingRecord(r);
                    setActiveTab('input');
                    setShowMobilePreview(true);
                    
                    // Smoothly auto-scroll to the input form
                    setTimeout(() => {
                      const el = document.getElementById('record-form-container');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 50);
                  }}
                  title={`Klik untuk edit & pratinjau data ${r.namaPelanggan}`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-natural-bg text-natural-sage border border-natural-border/65'
                  }`}>
                    {r.no}
                  </span>
                  <span className="truncate max-w-[130px]">
                    {r.namaPelanggan.split('(')[0].trim()}
                  </span>
                  
                  {/* Quick Copy/Clone icon */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateRecord(r);
                    }}
                    title="Duplikat Data"
                    className={`ml-1 p-1 rounded-md transition duration-100 ${
                      isActive ? 'hover:bg-white/20 text-white animate-pulse' : 'hover:bg-natural-border text-natural-khaki'
                    }`}
                  >
                    <Copy size={11} />
                  </button>

                  {/* Quick Delete icon */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecord(r.id);
                    }}
                    title="Hapus Data Pelanggan Ini"
                    className={`p-1 rounded-md transition duration-100 ${
                      isActive ? 'hover:bg-red-700/50 text-white' : 'hover:bg-red-50 text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}

            {/* Quick Add Client Button in the dock */}
            <button
              onClick={() => {
                setEditingRecord(null); // resets form to new customer
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-natural-terracotta hover:bg-[#B37F64] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <Plus size={12} /> Tambah Baru
            </button>
          </div>
        </div>

        {/* 4. Split Workspaces Layout: Left Management vs Right Preview */}
        <div className={activeTab === 'gabungan-a4' ? "block" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
          
          {/* Left panel: Occupies 7 columns when single-view, or full width when A4 merged view */}
          <section className={activeTab === 'gabungan-a4' ? "w-full space-y-6" : "lg:col-span-7 space-y-6"}>
            
            {/* Tabs for choosing layout operations */}
            <div className="flex bg-[#E8E4D9] p-1.5 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-natural-sage text-white shadow-xs'
                    : 'text-natural-sage hover:bg-white/50'
                }`}
              >
                <FileSpreadsheet size={15} /> Catat & Kelola Meter Air
              </button>
              <button
                onClick={() => setActiveTab('kustomisasi')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'kustomisasi'
                    ? 'bg-natural-sage text-white shadow-xs'
                    : 'text-natural-sage hover:bg-white/50'
                }`}
              >
                <Settings size={15} /> Sesuaikan Desain Struk
              </button>
              <button
                onClick={() => setActiveTab('gabungan-a4')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'gabungan-a4'
                    ? 'bg-natural-sage text-white shadow-xs'
                    : 'text-natural-sage hover:bg-white/50'
                }`}
              >
                <Grid2X2 size={15} /> Gabungan A4 (4 Struk)
              </button>
            </div>

            {/* Active Workspace */}
            <AnimatePresence mode="wait">
              {activeTab === 'input' ? (
                <motion.div
                  key="input-tab"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* Usage input form widget */}
                  <RecordForm
                    editingRecord={editingRecord}
                    onSave={handleSaveRecord}
                    onCancel={() => setEditingRecord(null)}
                  />

                  {/* Registered Records table view widget */}
                  <RecordTable
                    records={records}
                    selectedRecordId={selectedRecordId}
                    onSelectRecord={(idx) => {
                      setSelectedRecordId(idx);
                      // In mobile view, scroll to preview easily
                      setShowMobilePreview(true);
                    }}
                    onEditRecord={(rec) => {
                      setEditingRecord(rec);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    onDeleteRecord={handleDeleteRecord}
                    onResetRecords={handleResetToDemo}
                    onDuplicateRecord={handleDuplicateRecord}
                  />
                </motion.div>
              ) : activeTab === 'kustomisasi' ? (
                <motion.div
                  key="kustomisasi-tab"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <CustomizationSettings
                    settings={customization}
                    onChange={handleSaveCustomizationState}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="gabungan-a4-tab"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <A4ReceiptMerger
                    records={records}
                    customization={customization}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* Right panel: Sticky Live Preview area (occupies 5 columns) - hidden when in full screen merger tab */}
          {activeTab !== 'gabungan-a4' && (
            <aside className="lg:col-span-5 sticky top-24 hidden lg:block">
              <ReceiptPreview
                record={selectedRecord}
                customization={customization}
              />
            </aside>
          )}

        </div>
      </main>

      {/* 5. Desktop-equivalent Mobile Drawer/Modal for live preview */}
      <AnimatePresence>
        {showMobilePreview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end md:hidden">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-white h-full shadow-2xl p-4 flex flex-col overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex justify-between items-center pb-3 border-b mb-3">
                <h3 className="font-semibold text-natural-sage text-sm">Pratinjau Hasil Struk</h3>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Live Preview rendered inside the mobile drawer */}
              <div className="flex-1">
                <ReceiptPreview
                  record={selectedRecord}
                  customization={customization}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Custom elegant modal fallback for confirm dialogs to ensure iframe compatibility */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="w-full max-w-sm bg-white border border-natural-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    confirmModal.isDanger 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : 'bg-[#F4F1EA] text-natural-sage border-natural-border'
                  }`}>
                    {confirmModal.isDanger ? <Trash2 size={20} /> : <Droplet size={20} />}
                  </div>
                  <h3 className="font-display font-semibold text-neutral-800 text-sm">
                    {confirmModal.title}
                  </h3>
                </div>

                <p className="text-xs text-[#5C5C59] leading-relaxed">
                  {confirmModal.message}
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 bg-neutral-100 hover:bg-[#F4F1EA] text-neutral-700 font-semibold text-xs py-2.5 px-4 rounded-xl border border-neutral-200 transition cursor-pointer text-center"
                  >
                    {confirmModal.cancelText || 'Batal'}
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 font-semibold text-xs py-2.5 px-4 rounded-xl text-white transition cursor-pointer text-center ${
                      confirmModal.isDanger
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-natural-sage hover:bg-[#5A5E4E]'
                    }`}
                  >
                    {confirmModal.confirmText || 'Ya'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Humble Footer info */}
      <footer className="bg-[#E8E4D9] border-t border-natural-border mt-20 py-8 text-center text-xs text-natural-sage/90">
        <p className="font-semibold text-natural-sage font-display">Pencatat Pemakaian & Cetak Struk v1.1</p>
        <p className="mt-1">Dibuat khusus dengan tema premium <strong>Natural Tones</strong> untuk asisten pencatatan mandiri.</p>
      </footer>
    </div>
  );
}
