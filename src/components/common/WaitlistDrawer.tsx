/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import AddGuestDrawer from "./AddGuestDrawer";
import {
  useGetWaitlistQuery,
  useNotifyWaitlistGuestMutation,
} from "@/redux/api/waitlistSlice";

interface WaitlistDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddGuestProceed?: (draft: {
    persons: number;
    floorName: string;
    floorId: number | null;
  }) => void;
}

const WaitlistDrawer: React.FC<WaitlistDrawerProps> = ({
  open,
  onClose,
  onAddGuestProceed,
}) => {
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useGetWaitlistQuery(
    { status: "Waiting" },
    { skip: !open || isAddingGuest, refetchOnMountOrArgChange: true }
  );

  const [notifyGuest] = useNotifyWaitlistGuestMutation();
  const waitlist = data?.data ?? [];

  if (!open) return null;

  if (isAddingGuest) {
    return (
      <AddGuestDrawer
        open={open}
        onClose={() => setIsAddingGuest(false)}
        onProceed={(draft) => {
          setIsAddingGuest(false);
          onAddGuestProceed?.(draft);
          onClose();
        }}
      />
    );
  }

  const handleNotify = async (waitlistId: number) => {
    setNotifyingId(waitlistId);
    setNotifyError(null);
    try {
      await notifyGuest({
        id: waitlistId,
        channel: "SMS",
        delivery_reference: `SMS-PROVIDER-REFERENCE-${Date.now()}`,
      }).unwrap();

      setShowNotificationSuccess(true);
      setTimeout(() => setShowNotificationSuccess(false), 3000);
    } catch (err: any) {
      setNotifyError(
        err?.data?.message || "Failed to send notification. Please try again."
      );
      setTimeout(() => setNotifyError(null), 4000);
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-[360px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Waitlist ({waitlist.length})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {showNotificationSuccess && (
            <div className="bg-white border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in-down">
              <div className="w-12 h-12 rounded-full bg-[#00C853] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-[#00C853] font-bold text-lg">
                Notification Sent
              </h3>
            </div>
          )}

          {notifyError && (
            <div className="bg-white border border-red-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-red-600 text-sm font-semibold">{notifyError}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500 py-10">Loading waitlist…</div>
          )}

          {isError && (
            <div className="text-center text-red-500 py-10">
              Failed to load waitlist.
              <button onClick={() => refetch()} className="ml-2 underline">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && waitlist.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No guests currently waiting.
            </div>
          )}

          {waitlist.map((item) => (
            <div key={item._id} className="border border-pink-200 bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Name:{" "}
                  <span className="font-bold text-gray-800">{item.customer_name}</span>
                </span>
                <span className="text-xs font-semibold text-[#8E24AA] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Persons: {item.persons}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  ⏱ Waiting: {item.waiting_minutes} Min
                </span>
                <span className="flex items-center gap-1">
                  📞 Contact No: {item.phone}
                </span>
              </div>
              <button
                onClick={() => handleNotify(item.Waitlist_id)}
                disabled={notifyingId === item.Waitlist_id}
                className="w-full py-2 bg-[#00C853] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00A844] transition-colors disabled:opacity-60"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifyingId === item.Waitlist_id ? "Sending…" : "Notify"}
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => setIsAddingGuest(true)}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistDrawer;