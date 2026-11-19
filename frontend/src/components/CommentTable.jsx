import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageSquare, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommentTable({ 
  comments = [], 
  title = "Contoh & Detail Data Komentar", 
  subtitle = "Eksplorasi komentar riil TikTok hasil pemrosesan dan penandaan polaritas",
  initialFilter = "all"
}) {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState(null);
  const pageSize = 10;

  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      const matchSearch = search === "" || 
        c.comment.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        (c.positive_evidence && c.positive_evidence.toLowerCase().includes(search.toLowerCase())) ||
        (c.negative_evidence && c.negative_evidence.toLowerCase().includes(search.toLowerCase()));

      const matchSentiment = sentimentFilter === "all" || 
        c.sentiment_primary === sentimentFilter ||
        (sentimentFilter === "saran" && c.is_suggestion);

      return matchSearch && matchSentiment;
    });
  }, [comments, search, sentimentFilter]);

  const totalPages = Math.ceil(filteredComments.length / pageSize) || 1;
  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, currentPage, pageSize]);

  const sentimentBadge = (sent) => {
    switch (sent) {
      case 'positif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#edf3ef] text-[#315343]">Positif</span>;
      case 'negatif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbebee] text-[#aa161a]">Negatif</span>;
      case 'netral':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f6f5ef] text-[#737c76]">Netral</span>;
      case 'perlu_validasi':
      case 'perlu_tinjau':
      case 'campuran':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef8ea] text-[#b47a16]">Perlu Validasi</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f6f5ef] text-[#737c76]">{sent}</span>;
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-xs border border-transparent p-6 mt-6 overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#315343]" />
            <h3 className="text-base font-bold text-[#1a2e26] tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#737c76] mt-1">
            {subtitle} • Menampilkan {filteredComments.length.toLocaleString('id-ID')} data
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari kata, akun, atau bukti..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-3 py-1.5 rounded-full bg-[#f6f5ef] text-xs text-[#1a2e26] focus:outline-none focus:ring-2 focus:ring-[#315343]/30 w-52 md:w-60"
            />
          </div>

          <div className="flex items-center p-1 bg-[#f6f5ef] rounded-full text-xs font-semibold">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'positif', label: 'Positif' },
              { id: 'negatif', label: 'Negatif' },
              { id: 'netral', label: 'Netral' },
              { id: 'perlu_validasi', label: 'Perlu Validasi' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setSentimentFilter(tab.id); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full transition-all ${
                  sentimentFilter === tab.id 
                    ? 'bg-[#315343] text-white shadow-2xs font-bold' 
                    : 'text-[#737c76] hover:text-[#1a2e26]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4 -mx-6 px-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[#8e9791] font-semibold text-xs">
              <th className="py-3 px-3">Pengguna</th>
              <th className="py-3 px-3">Isi Komentar</th>
              <th className="py-3 px-3">Sentimen</th>
              <th className="py-3 px-3">Skor</th>
              <th className="py-3 px-3">Bukti Kata</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#1a2e26] font-normal">
            {paginatedComments.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-[#8e9791]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-[#bcc3be]" />
                    <p className="text-sm font-medium">Tidak ada komentar yang cocok dengan pencarian.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedComments.map((c, i) => (
                <tr key={c.comment_id || i} className="hover:bg-[#fbfaf6] transition-colors group">
                  <td className="py-3.5 px-3 font-medium text-[#1a2e26] whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#edf3ef] text-[#315343] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                        {c.username ? c.username.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a2e26] text-xs">@{c.username || 'user'}</p>
                        <p className="text-[10px] text-[#8e9791]">{c.create_time || '2026'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-md">
                    <p className="text-[#1a2e26] line-clamp-2 text-xs leading-relaxed">
                      {c.comment}
                    </p>
                    {c.is_reply && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#315343] bg-[#edf3ef] px-1.5 py-0.2 rounded-md">
                        Balasan
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {sentimentBadge(c.sentiment_primary)}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`font-bold font-mono ${
                      c.sentiment_score > 0 ? 'text-[#315343]' : c.sentiment_score < 0 ? 'text-[#aa161a]' : 'text-[#737c76]'
                    }`}>
                      {c.sentiment_score > 0 ? `+${c.sentiment_score}` : c.sentiment_score}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-[11px] text-[#737c76]">
                    {c.positive_evidence && (
                      <span className="inline-block bg-[#edf3ef] text-[#315343] px-2 py-0.5 rounded-md text-[10px] mr-1">
                        +{c.positive_evidence}
                      </span>
                    )}
                    {c.negative_evidence && (
                      <span className="inline-block bg-[#fbebee] text-[#aa161a] px-2 py-0.5 rounded-md text-[10px]">
                        -{c.negative_evidence}
                      </span>
                    )}
                    {!c.positive_evidence && !c.negative_evidence && (
                      <span className="text-[#8e9791] italic">netral / tanpa petunjuk</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedComment(c)}
                      className="p-1.5 rounded-lg text-[#8e9791] hover:text-[#315343] hover:bg-[#edf3ef] transition-colors"
                      title="Lihat Detail Komentar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs text-[#737c76]">
        <span>
          Halaman <strong className="text-[#1a2e26]">{currentPage}</strong> dari <strong className="text-[#1a2e26]">{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#f6f5ef] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#f6f5ef] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedComment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#1a2e26]">@{selectedComment.username}</h4>
                  <p className="text-xs text-[#737c76]">Detail Komentar TikTok</p>
                </div>
                {sentimentBadge(selectedComment.sentiment_primary)}
              </div>

              <div className="p-4 rounded-2xl bg-[#f6f5ef] text-sm text-[#1a2e26] leading-relaxed font-medium">
                "{selectedComment.comment}"
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#f6f5ef]">
                  <span className="text-[#8e9791] block text-[10px]">Waktu Unggah:</span>
                  <span className="font-semibold text-[#1a2e26]">{selectedComment.create_time}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f6f5ef]">
                  <span className="text-[#8e9791] block text-[10px]">Skor Sentimen:</span>
                  <span className="font-bold text-[#1a2e26]">{selectedComment.sentiment_score}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#edf3ef]">
                  <span className="text-[#315343] block text-[10px]">Bukti Positif:</span>
                  <span className="font-semibold text-[#315343]">{selectedComment.positive_evidence || '-'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#fbebee]">
                  <span className="text-[#aa161a] block text-[10px]">Bukti Negatif:</span>
                  <span className="font-semibold text-[#aa161a]">{selectedComment.negative_evidence || '-'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedComment(null)}
                  className="px-5 py-2.5 bg-[#315343] text-white font-semibold text-xs rounded-xl hover:bg-[#1a2e26] transition-colors shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
