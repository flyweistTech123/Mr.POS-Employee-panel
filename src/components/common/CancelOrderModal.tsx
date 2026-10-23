/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  loading?: boolean;
}

const CancelOrderModal: React.FC<Props> = ({ open, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }
    setError("");
    await onConfirm(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-[420px] shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Order?</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will discard the current order. Please tell us why.
        </p>

        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(""); }}
          rows={3}
          placeholder="e.g. Guest changed their mind"
          className={`w-full rounded-xl border p-3 text-sm outline-none resize-none transition-colors ${
            error ? "border-red-400" : "border-gray-200 focus:border-[#8E24AA]"
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;