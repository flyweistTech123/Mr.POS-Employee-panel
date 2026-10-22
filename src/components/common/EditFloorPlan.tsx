import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import toast from "react-hot-toast";
import { useSaveFloorLayoutMutation } from "@/redux/api/floorPlanApi";
import table2 from "@/assets/table/table2.svg";
import table4 from "@/assets/table/table4.svg";
import table8 from "@/assets/table/table8.svg";
import tableIcon from "@/assets/navbar/table_icon.svg";
import { TableIcon } from "@/icons/TableIcon";

// ---------------- Types ----------------
interface ApiTableRow {
  Table_id: number;
  "Table-name"?: string;
  Capacity?: number;
  table_status?: string;
  dynamic_status?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  [key: string]: any;
}

interface EditFloorPlanProps {
  floorId: string | number;
  tables: ApiTableRow[];
  onSaved?: () => void;
  onCancel?: () => void;
}

// ---------------- Capacity sanitization ----------------
const VALID_CAPACITIES: Array<2 | 4 | 8> = [2, 4, 8];

const sanitizeCapacity = (raw: number | undefined): 2 | 4 | 8 => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 2;
  if (VALID_CAPACITIES.includes(n as 2 | 4 | 8)) return n as 2 | 4 | 8;
  if (n <= 2) return 2;
  if (n <= 4) return 4;
  return 8;
};

// ---------------- Constants ----------------
const TABLE_TYPES = [
  { capacity: 4, img: table4 },
  { capacity: 8, img: table8 },
  { capacity: 2, img: table2 },
];

const SIZE_BY_CAPACITY: Record<2 | 4 | 8, { width: number; height: number }> = {
  2: { width: 120, height: 90 },
  4: { width: 160, height: 110 },
  8: { width: 220, height: 130 },
};

const dimsFor = (capacity: 2 | 4 | 8) => SIZE_BY_CAPACITY[capacity];

// ---------------- DraggableTableType ----------------
function DraggableTableType({ capacity, img }: { capacity: number; img: string }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TABLE_TYPE",
      item: { capacity },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [capacity]
  );

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex flex-col items-center justify-center border rounded-xl cursor-grab active:cursor-grabbing px-2 py-1 sm:px-4 sm:py-2 mx-1 sm:mx-2 border-gray-200 bg-white shadow-sm transition-all duration-200 ${
        isDragging
          ? "opacity-50 scale-105 shadow-xl z-20"
          : "opacity-100 scale-100 hover:shadow-md"
      }`}
      style={{ minWidth: 70 }}
    >
      <img src={img} alt={`${capacity} seater`} className="w-12 h-10 object-contain" />
    </div>
  );
}

// ---------------- TableSlot ----------------
function TableSlot({
  table,
  onDrop,
}: {
  table: ApiTableRow;
  onDrop: (capacity: number) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop<
    { capacity: number },
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: "TABLE_TYPE",
      drop: (item) => onDrop(item.capacity),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop]
  );

  const capacity = sanitizeCapacity(table.Capacity);
  let size: "small" | "medium" | "long" = "small";
  if (capacity === 4) size = "medium";
  if (capacity === 8) size = "long";

  const label = String(table["Table-name"] ?? `t-${table.Table_id}`)
    .toLowerCase()
    .replace(/^t(\d+)$/, "t-$1");

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 ${
        isOver && canDrop
          ? "bg-purple-50 ring-2 ring-[#8E24AA] ring-offset-2 scale-105 shadow-lg"
          : "bg-transparent hover:bg-gray-50/50"
      }`}
    >
      <TableIcon size={size} label={label} />
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-[#8E24AA]/10 rounded-2xl flex items-center justify-center z-10">
          <span className="text-[#8E24AA] font-bold text-xs bg-white px-2 py-1 rounded-full shadow-sm">
            Drop to resize
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------- AutoScroll helpers ----------------
function AutoScrollContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!ref.current) return;
      const { top, bottom } = ref.current.getBoundingClientRect();
      const amount = 20,
        threshold = 40;
      if (e.clientY - top < threshold)
        ref.current.scrollBy({ top: -amount, behavior: "smooth" });
      else if (bottom - e.clientY < threshold)
        ref.current.scrollBy({ top: amount, behavior: "smooth" });
    };
    const node = ref.current;
    node?.addEventListener("dragover", onDragOver);
    return () => node?.removeEventListener("dragover", onDragOver);
  }, []);
  return (
    <div
      ref={ref}
      className="w-full max-w-full px-2 sm:px-6 md:px-10 py-2 md:py-4 min-h-screen overflow-y-auto"
    >
      {children}
    </div>
  );
}

function AutoScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (!ref.current) return;
      const { left, right } = ref.current.getBoundingClientRect();
      const amount = 20,
        threshold = 40;
      if (e.clientX - left < threshold)
        ref.current.scrollBy({ left: -amount, behavior: "smooth" });
      else if (right - e.clientX < threshold)
        ref.current.scrollBy({ left: amount, behavior: "smooth" });
    };
    const node = ref.current;
    node?.addEventListener("dragover", onDragOver);
    return () => node?.removeEventListener("dragover", onDragOver);
  }, []);
  return (
    <div
      ref={ref}
      className="flex flex-row gap-8 mb-8 overflow-x-auto flex-nowrap min-w-0 w-full pb-4 snap-x snap-mandatory"
    >
      {children}
    </div>
  );
}

// ---------------- Main component ----------------
const EditFloorPlan: React.FC<EditFloorPlanProps> = ({
  floorId,
  tables,
  onSaved,
  onCancel,
}) => {
  const [rows, setRows] = useState<ApiTableRow[]>(tables);
  const [saveLayout, { isLoading: saving }] = useSaveFloorLayoutMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(tables);
  }, [tables]);

  const handleDrop = (idx: number, capacity: number) => {
    const safe = sanitizeCapacity(capacity);
    setRows((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, Capacity: safe } : t))
    );
  };

  const handleSave = async () => {
    if (!floorId) {
      toast.error("No floor selected.");
      return;
    }
    setError(null);

    // Build payload with sanitized capacities.
    const coerced: Array<{ id: number; from: number; to: 2 | 4 | 8 }> = [];
    const payload = rows.map((t) => {
      const capacity = sanitizeCapacity(t.Capacity);
      if (t.Capacity !== undefined && capacity !== t.Capacity) {
        coerced.push({
          id: t.Table_id,
          from: Number(t.Capacity),
          to: capacity,
        });
      }
      const dims = dimsFor(capacity);
      return {
        table_id: Number(t.Table_id),
        capacity,
        x: t.x ?? 0,
        y: t.y ?? 0,
        width: t.width ?? dims.width,
        height: t.height ?? dims.height,
        rotation: t.rotation ?? 0,
      };
    });

    if (coerced.length > 0) {
      console.warn("[EditFloorPlan] coerced capacities:", coerced);
      toast(
        `${coerced.length} table(s) had invalid capacity — auto-corrected to 2/4/8.`,
        { icon: "⚠️", duration: 4000 }
      );
    }

    const tId = toast.loading("Saving floor plan…");
    try {
      await saveLayout({ floorId, tables: payload }).unwrap();
      toast.success("Floor plan saved", { id: tId });
      onSaved?.();
    } catch (e: any) {
      console.error("Save failed", e);
      const msg =
        e?.data?.message ?? "Failed to save floor plan. Please try again.";
      setError(msg);
      toast.error(msg, { id: tId, duration: 5000 });
    }
  };

  const grid = useMemo(() => {
    const rowsCount = 3;
    const colsCount = 5;
    const out: React.ReactNode[] = [];
    for (let r = 0; r < rowsCount; r++) {
      const line: React.ReactNode[] = [];
      for (let c = 0; c < colsCount; c++) {
        const idx = r * colsCount + c;
        const t = rows[idx];
        if (t) {
          line.push(
            <TableSlot
              key={t.Table_id}
              table={t}
              onDrop={(cap) => handleDrop(idx, cap)}
            />
          );
        } else {
          line.push(
            <div
              key={`empty-${r}-${c}`}
              className="border-dashed border-2 border-gray-200 rounded-2xl min-w-[140px] min-h-[110px] bg-gray-50/50"
              style={{ width: 160, height: 110 }}
            />
          );
        }
      }
      out.push(<AutoScrollRow key={r}>{line}</AutoScrollRow>);
    }
    return out;
  }, [rows]);

  return (
    <>
      <div className="sticky top-0 z-20 bg-white md:static md:bg-transparent flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full shadow-sm pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center w-full">
            {TABLE_TYPES.map((type) => (
              <div key={type.capacity} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-1 gap-1">
                  <img
                    src={tableIcon}
                    alt="table icon"
                    className="w-5 h-5 opacity-70"
                  />
                  <span className="font-semibold text-sm text-gray-700">
                    {type.capacity} Seater
                  </span>
                </div>
                <DraggableTableType capacity={type.capacity} img={type.img} />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !floorId}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white font-semibold shadow-md hover:opacity-90 text-sm md:text-base whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 mx-auto max-w-lg rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 text-center">
          {error}
        </div>
      )}

      <AutoScrollContainer>
        <div className="flex flex-col gap-0 items-center w-full min-w-0">
          {grid}
        </div>
      </AutoScrollContainer>
    </>
  );
};

export default EditFloorPlan;