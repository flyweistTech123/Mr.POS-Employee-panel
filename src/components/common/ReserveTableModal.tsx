import React, { useEffect, useMemo, useState } from "react";
import {
  useGetReservationFloorMapQuery,
  useCreateEmployeeReservationMutation,
} from "@/redux/api/reservationApi";
import type { FloorMapTable } from "@/types/reservation";

interface ReserveTableModalProps {
  open: boolean;
  onClose: () => void;
  floorId: number;
  floorName?: string;
}

const DURATION_OPTIONS = [60, 90, 120] as const;

/** True only if the backend says the table is free AND big enough. */
const isTableSelectable = (t: FloorMapTable): boolean =>
  t.available !== false && t.capacity_sufficient !== false;

const tableLabel = (t: FloorMapTable): string =>
  (t["Table-name"] as string | undefined) ??
  (t["Table-code"] as string | undefined) ??
  `t-${String(t.Table_id).padStart(2, "0")}`;

const tableSublabel = (t: FloorMapTable): string => {
  if (!isTableSelectable(t)) {
    return (
      (t.reservation_view_status as string | undefined) ??
      (t.capacity_sufficient === false ? "Too small" : "Unavailable")
    );
  }
  const cap = t.Capacity ?? t["Seating-Persons_Count"];
  return cap != null ? `Cap ${cap}` : "";
};

const ReserveTableModal: React.FC<ReserveTableModalProps> = ({
  open,
  onClose,
  floorId,
  floorName,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateStr, setDateStr] = useState(""); // YYYY-MM-DD
  const [timeStr, setTimeStr] = useState(""); // HH:mm
  const [duration, setDuration] = useState<number>(90);
  const [partySize, setPartySize] = useState<number | "">("");
  const [selectedTable, setSelectedTable] = useState<FloorMapTable | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Full ISO with IST offset — sent as `date_time` to both endpoints.
  const dateTime = useMemo(() => {
    if (!dateStr || !timeStr) return "";
    return `${dateStr}T${timeStr}:00+05:30`;
  }, [dateStr, timeStr]);

  const canQuery =
    open && Boolean(dateTime) && partySize !== "" && Boolean(floorId);

  const { data, isFetching } = useGetReservationFloorMapQuery(
    {
      floorId,
      dateTime,
      durationMinutes: duration,
      partySize: Number(partySize),
    },
    { skip: !canQuery }
  );

  const [createReservation, { isLoading: isCreating }] =
    useCreateEmployeeReservationMutation();

  const tables = data?.tables ?? [];

  // Reset selection when query params change.
  useEffect(() => {
    setSelectedTable(null);
  }, [dateTime, duration, partySize, floorId]);

  // Reset form on close.
  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setDateStr("");
      setTimeStr("");
      setDuration(90);
      setPartySize("");
      setSelectedTable(null);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) return setError("Guest name is required.");
    if (!phone.trim()) return setError("Contact number is required.");
    if (!dateTime) return setError("Pick a date and time.");
    if (partySize === "" || Number(partySize) < 1)
      return setError("Party size must be at least 1.");
    if (!selectedTable) return setError("Select a table.");
    if (!isTableSelectable(selectedTable))
      return setError("That table is not available for this slot.");

    try {
      await createReservation({
        guest_name: name.trim(),
        guest_phone: phone.trim(),
        date_time: dateTime,
        party_size: Number(partySize),
        floor_id: floorId,
        table_id: selectedTable.Table_id,
        duration_minutes: duration,
        notes: "",
      }).unwrap();
      onClose();
    } catch (e) {
      console.error("Failed to create reservation", e);
      setError("Failed to create reservation. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl w-[900px] max-w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Reserve Table
            {floorName ? (
              <span className="text-gray-400 font-normal"> — {floorName}</span>
            ) : null}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Customize Table</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person Name"
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact No"
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full"
            />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full"
            />
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full"
            />
            <input
              type="number"
              min={1}
              value={partySize}
              onChange={(e) =>
                setPartySize(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="No of person"
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full"
            />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-[#F9F5F9] px-4 py-3 rounded-lg text-sm outline-none w-full text-gray-700"
              title="Reservation duration — saved with the booking"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          <h3 className="text-base font-bold mb-4">
            Available tables for your inputs
          </h3>

          {!canQuery ? (
            <p className="text-sm text-gray-500">
              Enter date, time, and party size to see available tables.
            </p>
          ) : isFetching ? (
            <p className="text-sm text-gray-500">Checking availability…</p>
          ) : tables.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tables available for this slot. Try another time or party size.
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {tables.map((t) => {
                const selectable = isTableSelectable(t);
                return (
                  <TableCard
                    key={t.Table_id}
                    label={tableLabel(t)}
                    sublabel={tableSublabel(t)}
                    selected={selectedTable?.Table_id === t.Table_id}
                    disabled={!selectable}
                    onClick={() => selectable && setSelectedTable(t)}
                  />
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-4" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating || !selectedTable}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Reserving…" : "Confirm Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TableCardProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const TableCard: React.FC<TableCardProps> = ({
  label,
  sublabel,
  selected,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`relative flex flex-col items-center justify-center w-[120px] h-[90px] rounded-2xl border transition-all ${
      disabled
        ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
        : selected
          ? "bg-purple-50 border-purple-400 ring-2 ring-purple-300"
          : "bg-[#FDF0F4] border-pink-100 hover:border-pink-300"
    }`}
  >
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
      <svg width="100" height="70" viewBox="0 0 120 90" fill="none">
        <rect x="20" y="10" width="80" height="50" rx="8" fill="#A579D1" />
        <rect x="5" y="20" width="10" height="30" rx="4" fill="#A579D1" />
        <rect x="105" y="20" width="10" height="30" rx="4" fill="#A579D1" />
        <rect x="30" y="65" width="60" height="10" rx="4" fill="#A579D1" />
      </svg>
    </div>
    <div className="z-10 w-10 h-10 rounded-full bg-gradient-to-r from-[#8E24AA] to-[#D32F2F] flex items-center justify-center text-white font-bold text-sm shadow-md">
      {label}
    </div>
    {sublabel && (
      <span className="z-10 mt-1 text-[10px] font-semibold text-gray-500">
        {sublabel}
      </span>
    )}
  </button>
);

export default ReserveTableModal;