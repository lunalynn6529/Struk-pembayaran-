import { useState, useEffect, FormEvent } from 'react';
import { UsageRecord } from '../types';
import { formatRupiah } from '../data';
import { Play, RotateCcw, Save, Trash2, X, Info } from 'lucide-react';

interface RecordFormProps {
  editingRecord: UsageRecord | null;
  onSave: (record: UsageRecord) => void;
  onCancel: () => void;
}

export default function RecordForm({ editingRecord, onSave, onCancel }: RecordFormProps) {
  const [no, setNo] = useState('');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [bulan, setBulan] = useState('Februari 2026');
  const [meterAwal, setMeterAwal] = useState<number>(0);
  const [meterAkhir, setMeterAkhir] = useState<number>(0);
  const [tarifDasar, setTarifDasar] = useState<number>(12500);
  const [biayaAdmin, setBiayaAdmin] = useState<number>(2500);
  const [catatan, setCatatan] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load editing record data if editing
  useEffect(() => {
    if (editingRecord) {
      setNo(editingRecord.no);
      setNamaPelanggan(editingRecord.namaPelanggan);
      setBulan(editingRecord.bulan);
      setMeterAwal(editingRecord.meterAwal);
      setMeterAkhir(editingRecord.meterAkhir);
      setTarifDasar(editingRecord.tarifDasar);
      setBiayaAdmin(editingRecord.biayaAdmin);
      setCatatan(editingRecord.catatan || '');
    } else {
      // Clear for new entry
      setNo('');
      setNamaPelanggan('');
      setBulan('Februari 2026');
      setMeterAwal(0);
      setMeterAkhir(0);
      setTarifDasar(12500);
      setBiayaAdmin(2500);
      setCatatan('');
    }
    setValidationError(null);
  }, [editingRecord]);

  // Real-time calculation previews
  const currentVolume = Math.max(0, meterAkhir - meterAwal);
  const calculatedSubtotal = currentVolume * tarifDasar;
  const calculatedTotal = calculatedSubtotal + biayaAdmin;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!no.trim()) {
      setValidationError('Nomor ID Pelanggan (e.g. A1, B2) wajib diisi.');
      return;
    }
    if (!namaPelanggan.trim()) {
      setValidationError('Nama Pelanggan wajib diisi.');
      return;
    }
    if (meterAkhir < meterAwal) {
      setValidationError('Peringatan: Meter Akhir tidak boleh kurang dari Meter Awal.');
      return;
    }

    const savedRecord: UsageRecord = {
      id: editingRecord?.id || `rec_${Date.now()}`,
      no: no.toUpperCase().trim(),
      namaPelanggan: namaPelanggan.trim(),
      bulan: bulan.trim(),
      meterAwal: Number(meterAwal),
      meterAkhir: Number(meterAkhir),
      tarifDasar: Number(tarifDasar),
      biayaAdmin: Number(biayaAdmin),
      catatan: catatan.trim() || undefined
    };

    onSave(savedRecord);
    // Reset form after saving new record if not editing
    if (!editingRecord) {
      setNo('');
      setNamaPelanggan('');
      setMeterAwal(0);
      setMeterAkhir(0);
      setCatatan('');
    }
    setValidationError(null);
  };

  const loadDemoTemplate = (type: 'A1' | 'B1' | 'C1') => {
    if (type === 'A1') {
      setNo('A3');
      setNamaPelanggan('Bambang Pamungkas (A3)');
      setBulan('Februari 2026');
      setMeterAwal(400);
      setMeterAkhir(425);
      setTarifDasar(12500);
    } else if (type === 'B1') {
      setNo('B3');
      setNamaPelanggan('Diana Lestari (B3)');
      setBulan('Februari 2026');
      setMeterAwal(150);
      setMeterAkhir(172);
      setTarifDasar(12500);
    } else {
      setNo('C1');
      setNamaPelanggan('Koperasi Warga Mandiri (C1)');
      setBulan('Februari 2026');
      setMeterAwal(1020);
      setMeterAkhir(1115);
      setTarifDasar(15000); // Higher commercial rate
    }
  };

  return (
    <div id="record-form-container" className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-natural-border mb-4">
        <h3 className="font-display font-semibold text-natural-sage text-base">
          {editingRecord ? '✍️ Ubah Record Pemakaian' : '➕ Input Pemakaian Air Baru'}
        </h3>
        {editingRecord && (
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#F4F1EA] rounded-lg text-natural-khaki transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Demo helper tags */}
      {!editingRecord && (
        <div className="mb-4 bg-natural-bg p-2.5 rounded-xl border border-natural-border">
          <p className="text-[10px] uppercase tracking-widest font-bold text-natural-khaki mb-1.5">
            Templat Cepat (Eksperimen Bebas)
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => loadDemoTemplate('A1')}
              className="px-2.5 py-1 text-[10px] font-semibold bg-[#F4F1EA] text-natural-sage rounded-lg hover:bg-natural-border transition border border-natural-border cursor-pointer"
            >
              + Rumah A3
            </button>
            <button
              onClick={() => loadDemoTemplate('B1')}
              className="px-2.5 py-1 text-[10px] font-semibold bg-[#F4F1EA] text-natural-terracotta rounded-lg hover:bg-natural-border transition border border-natural-border cursor-pointer"
            >
              + Rumah B3
            </button>
            <button
              onClick={() => loadDemoTemplate('C1')}
              className="px-2.5 py-1 text-[10px] font-semibold bg-[#F4F1EA] text-natural-khaki rounded-lg hover:bg-natural-border transition border border-natural-border cursor-pointer"
            >
              + Komersial C1
            </button>
          </div>
        </div>
      )}

      {/* Actual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-natural-text mb-1">ID / No Pelanggan</label>
            <input
              type="text"
              required
              value={no}
              onChange={(e) => setNo(e.target.value)}
              placeholder="e.g. A3"
              className="w-full text-xs font-bold px-3 py-2 border border-natural-border rounded-lg uppercase focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none bg-natural-bg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-natural-text mb-1">Periode Bulan</label>
            <input
              type="text"
              required
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              placeholder="e.g. Februari 2026"
              className="w-full text-xs px-3 py-2 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none bg-natural-bg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-natural-text mb-1">Nama Lengkap Pelanggan</label>
          <input
            type="text"
            required
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
            placeholder="e.g. Bambang Susanto"
            className="w-full text-xs px-3 py-2 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none bg-natural-bg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F1EA] rounded-xl border border-natural-border">
          <div>
            <label className="block text-xs font-medium text-natural-text mb-1">Meter Awal (m³)</label>
            <input
              type="number"
              min="0"
              required
              value={meterAwal || ''}
              onChange={(e) => setMeterAwal(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
              className="w-full text-xs font-mono px-2.5 py-1.5 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-natural-text mb-1">Meter Akhir (m³)</label>
            <input
              type="number"
              min="0"
              required
              value={meterAkhir || ''}
              onChange={(e) => setMeterAkhir(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
              className={`w-full text-xs font-mono px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                meterAkhir < meterAwal && meterAkhir > 0
                  ? 'border-red-400 bg-red-50 focus:ring-red-500/20 text-red-900'
                  : 'border-natural-border bg-white focus:ring-natural-khaki/30 focus:border-natural-sage'
              }`}
            />
          </div>

          <div className="col-span-2 flex justify-between items-center text-[11px] text-natural-text/75 border-t border-natural-border pt-2 mt-1.5">
            <span>Volume Pemakaian:</span>
            <span className={`font-bold font-mono text-xs ${meterAkhir < meterAwal ? 'text-red-500' : 'text-natural-sage'}`}>
              {currentVolume} m³
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-natural-text mb-1">Tarif Dasar / m³</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-natural-khaki">Rp</span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={tarifDasar || ''}
                onChange={(e) => setTarifDasar(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono pl-8 pr-2.5 py-2 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-natural-text mb-1">Biaya Admin</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-natural-khaki">Rp</span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={biayaAdmin || ''}
                onChange={(e) => setBiayaAdmin(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-mono pl-8 pr-2.5 py-2 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-natural-text mb-1">Catatan Struk (Opsional)</label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="e.g. Pembayaran Pemakaian Air Rumah Tangga"
            className="w-full text-xs px-3 py-2 border border-natural-border rounded-lg focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage focus:outline-none bg-natural-bg"
          />
        </div>

        {/* Live Bill Calculation Feedback Card inside Form */}
        <div className="p-3.5 bg-white text-natural-text rounded-xl border border-natural-border shadow-inner space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="opacity-75">Subtotal Air:</span>
            <span className="font-mono font-medium">{formatRupiah(calculatedSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Biaya Admin:</span>
            <span className="font-mono font-medium">{formatRupiah(biayaAdmin)}</span>
          </div>
          <div className="border-t border-natural-border pt-2 flex justify-between items-center">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-natural-sage">Total Tagihan:</span>
            <span className="font-mono font-bold text-sm text-natural-terracotta">{formatRupiah(calculatedTotal)}</span>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 pt-2">
          {editingRecord ? (
            <>
              <button
                type="submit"
                className="flex-1 flex justify-center items-center gap-2 bg-natural-sage hover:bg-[#5A5E4E] text-white font-semibold text-xs py-2.5 px-3 rounded-lg transition duration-150 cursor-pointer"
              >
                <Save size={14} /> Update Record
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 flex justify-center items-center gap-2 bg-[#F4F1EA] hover:bg-natural-border text-natural-text font-semibold text-xs py-2.5 px-3 rounded-lg transition duration-150 cursor-pointer"
              >
                Batalkan
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-natural-terracotta hover:bg-[#B37F64] text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition duration-150 shadow-md shadow-natural-terracotta/20 cursor-pointer"
            >
              <Save size={14} /> Simpan Pencatatan
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
