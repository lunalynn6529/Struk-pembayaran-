import { useState } from 'react';
import { UsageRecord } from '../types';
import { formatRupiah, calculateUsageDetails } from '../data';
import { Search, Edit, Trash2, Eye, RefreshCw, Layers, Sparkles, FileText, Copy } from 'lucide-react';

interface RecordTableProps {
  records: UsageRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (id: string) => void;
  onEditRecord: (record: UsageRecord) => void;
  onDeleteRecord: (id: string) => void;
  onResetRecords: () => void;
  onDuplicateRecord: (record: UsageRecord) => void;
}

export default function RecordTable({
  records,
  selectedRecordId,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onResetRecords,
  onDuplicateRecord,
}: RecordTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering records based on search keywords
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.no.toLowerCase().includes(term) ||
      r.namaPelanggan.toLowerCase().includes(term) ||
      r.bulan.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs space-y-4">
      {/* Search Header and Restore Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-natural-sage" />
          <h3 className="font-display font-semibold text-natural-sage text-base">
            Daftar Pemakaian Air ({filteredRecords.length})
          </h3>
        </div>

        <button
          onClick={onResetRecords}
          title="Kembalikan data contoh awal"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F1EA] hover:bg-natural-border text-natural-sage text-[11px] font-semibold rounded-lg border border-natural-border transition duration-150 cursor-pointer"
        >
          <RefreshCw size={12} /> Reset Data Contoh
        </button>
      </div>

      {/* Search box input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-natural-khaki" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari ID, nama pelanggan, atau bulan..."
          className="w-full text-xs pl-9 pr-3 py-2 border border-natural-border rounded-xl focus:outline-none focus:ring-2 focus:ring-natural-khaki/30 focus:border-natural-sage bg-natural-bg text-natural-text"
        />
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto rounded-xl border border-natural-border">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-[#F4F1EA] text-natural-sage font-semibold border-b border-natural-border">
              <th className="py-3 px-3">No / ID</th>
              <th className="py-3 px-4">Nama Pelanggan</th>
              <th className="py-3 px-3">Bulan</th>
              <th className="py-3 px-3 text-right">Meter (Awal/Akhir)</th>
              <th className="py-3 px-3 text-right">Volume</th>
              <th className="py-3 px-3 text-right">Total Tagihan</th>
              <th className="py-3 px-4 text-center">Aksi & Pratinjau</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-natural-border/40 bg-white">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-natural-khaki bg-natural-bg">
                  Tidak ada pencatatan pemakaian air yang cocok atau tidak sengaja dihapus.
                  <div className="mt-3">
                    <button
                      onClick={onResetRecords}
                      className="px-3 py-1 text-[11px] font-semibold bg-[#F4F1EA] text-natural-sage rounded-lg hover:bg-natural-border border border-natural-border"
                    >
                      Klik untuk Muat Ulang Data Awal
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const isSelected = selectedRecordId === r.id;
                const { volume, total } = calculateUsageDetails(r);

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r.id)}
                    className={`group transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4F1EA]/80 border-l-4 border-l-natural-sage hover:bg-[#F4F1EA]'
                        : 'hover:bg-natural-bg'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-natural-text text-xs tracking-wide">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        isSelected ? 'bg-natural-sage text-white font-semibold' : 'bg-[#F4F1EA] text-natural-sage font-medium border border-natural-border/30'
                      }`}>
                        {r.no}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-natural-text">
                      <div>{r.namaPelanggan.split('(')[0].trim()}</div>
                      {r.catatan && (
                        <div className="text-[10px] text-natural-khaki font-normal truncate max-w-[140px]">
                          {r.catatan}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-natural-text/80 font-medium">{r.bulan}</td>
                    <td className="py-3 px-3 text-right font-mono text-natural-khaki text-[11px]">
                      {r.meterAwal} ➜ {r.meterAkhir}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-natural-sage">
                      {volume} m³
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-natural-text text-xs">
                      {formatRupiah(total)}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectRecord(r.id)}
                          title="Lihat Pratinjau Struk"
                          className={`p-1.5 rounded-lg transition duration-100 flex items-center gap-0.5 ${
                            isSelected
                              ? 'bg-natural-sage text-white hover:bg-[#5A5E4E]'
                              : 'bg-[#F4F1EA] text-natural-sage hover:bg-natural-border'
                          }`}
                        >
                          <Eye size={13} />
                          {isSelected && <span className="text-[10px] pr-1 font-semibold">Aktif</span>}
                        </button>

                        <button
                          onClick={() => onEditRecord(r)}
                          title="Ubah Data Tagihan"
                          className="p-1.5 rounded-lg bg-[#F4F1EA] text-natural-terracotta hover:bg-natural-border transition duration-100 border border-natural-border/40"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() => onDuplicateRecord(r)}
                          title="Duplikat sebagai Data Baru"
                          className="p-1.5 rounded-lg bg-[#F4F1EA] text-natural-sage hover:bg-natural-border transition duration-100 border border-natural-border/40"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          onClick={() => onDeleteRecord(r.id)}
                          title="Hapus Data"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-150 transition duration-100 border border-red-100/50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-natural-khaki flex items-center gap-2">
        <Sparkles size={12} className="text-natural-terracotta shrink-0 animate-pulse" />
        <span>Pilihlah baris pelanggan atau tekan tombol "Aktif" (👋) untuk preview kwitansi real-time di kolom kanan.</span>
      </div>
    </div>
  );
}
