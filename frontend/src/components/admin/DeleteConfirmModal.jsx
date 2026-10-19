import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการลบข้อมูล",
  itemName = "",
  description = "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากระบบอย่างถาวร",
  confirmWord = "delete",
  isLoading = false
}) {
  const [inputWord, setInputWord] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputWord("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = inputWord.trim().toLowerCase() === confirmWord.toLowerCase();

  const handleConfirm = (e) => {
    e.preventDefault();
    if (isMatch && !isLoading) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 text-left relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="p-6 sm:p-7">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                <AlertTriangle size={24} />
              </div>
              <div className="pr-6">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Target Item Name Banner */}
            {itemName && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl mb-5 text-xs text-slate-700">
                <span className="text-slate-400 font-medium block text-[11px] mb-0.5">รายการที่จะลบ:</span>
                <strong className="font-bold text-slate-800 break-words">{itemName}</strong>
              </div>
            )}

            {/* Type-to-delete instruction */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เพื่อความปลอดภัย กรุณาพิมพ์คำว่า <span className="text-rose-600 font-mono font-black select-all px-1.5 py-0.5 bg-rose-50 rounded border border-rose-200">delete</span> เพื่อยืนยันการลบ:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder="พิมพ์ delete เพื่อยืนยัน"
                  disabled={isLoading}
                  className={`w-full p-3 bg-white border rounded-xl text-sm font-mono outline-none transition-all ${
                    isMatch 
                      ? "border-rose-400 ring-2 ring-rose-100 text-rose-700 font-bold" 
                      : "border-slate-200 text-slate-800 focus:border-[#3F51B5] focus:ring-2 focus:ring-indigo-50"
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={!isMatch || isLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isMatch && !isLoading
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>กำลังลบ...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>ยืนยันการลบ (Delete)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
