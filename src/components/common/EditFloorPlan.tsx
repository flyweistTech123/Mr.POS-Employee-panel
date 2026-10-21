import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getTablesByFloor, updateFloorPlan, type Table } from "@/api/tableApi";
import table2 from "@/assets/table/table2.svg";
import table4 from "@/assets/table/table4.svg";
import table8 from "@/assets/table/table8.svg";
import tableIcon from "@/assets/navbar/table_icon.svg";
import { TableIcon } from "@/icons/TableIcon";

const TABLE_TYPES = [
  { capacity: 4, label: "4", img: table4 },
  { capacity: 8, label: "8", img: table8 },
  { capacity: 2, label: "2", img: table2 },
];

interface DraggableTableTypeProps {
  capacity: number;
  img: string;
  small?: boolean;
}

function DraggableTableType({ capacity, img, small }: DraggableTableTypeProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TABLE_TYPE",
      item: { capacity },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [capacity]
  );
  
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex flex-col items-center justify-center border rounded-xl cursor-grab active:cursor-grabbing px-2 py-1 sm:px-4 sm:py-2 mx-1 sm:mx-2 border-gray-200 bg-white shadow-sm transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105 shadow-xl z-20" : "opacity-100 scale-100 hover:shadow-md"
      }`}
      style={{ minWidth: small ? 70 : 100 }}
    >
      <img
        src={img}
        alt={`${capacity} seater`}
        className={small ? "w-12 h-10 object-contain" : "w-40 h-25 object-contain"}
      />
    </div>
  );
}

function TableSlot({
  table,
  onDrop,
}: {
  table: Table;
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

  let size: "small" | "medium" | "long" = "small";
  if (table.capacity === 4) size = "medium";
  if (table.capacity === 8) size = "long";

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 ${
        isOver && canDrop
          ? "bg-purple-50 ring-2 ring-[#8E24AA] ring-offset-2 scale-105 shadow-lg"
          : "bg-transparent hover:bg-gray-50/50"
      }`}
    >
      <TableIcon
        size={size}
        label={table.number.toLowerCase().replace(/^t(\d+)$/, "t-$1")}
      />
      {/* Drop indicator hint */}
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

// --- AutoScroll Components ---
function AutoScrollContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (!containerRef.current) return;
      const { top, bottom } = containerRef.current.getBoundingClientRect();
      const scrollAmount = 20;
      const threshold = 40;
      if (e.clientY - top < threshold) {
        containerRef.current.scrollBy({ top: -scrollAmount, behavior: "smooth" });
      } else if (bottom - e.clientY < threshold) {
        containerRef.current.scrollBy({ top: scrollAmount, behavior: "smooth" });
      }
    }
    const node = containerRef.current;
    if (node) node.addEventListener("dragover", onDragOver);
    return () => {
      if (node) node.removeEventListener("dragover", onDragOver);
    };
  }, []);
  return (
    <div ref={containerRef} className="w-full max-w-full px-2 sm:px-6 md:px-10 py-2 md:py-4 min-h-screen overflow-y-auto">
      {children}
    </div>
  );
}

function AutoScrollRow({ children }: { children: React.ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (!rowRef.current) return;
      const { left, right } = rowRef.current.getBoundingClientRect();
      const scrollAmount = 20;
      const threshold = 40;
      if (e.clientX - left < threshold) {
        rowRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else if (right - e.clientX < threshold) {
        rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
    const node = rowRef.current;
    if (node) node.addEventListener("dragover", onDragOver);
    return () => {
      if (node) node.removeEventListener("dragover", onDragOver);
    };
  }, []);
  return (
    <div ref={rowRef} className="flex flex-row gap-8 mb-8 overflow-x-auto flex-nowrap min-w-0 w-full pb-4 snap-x snap-mandatory">
      {children}
    </div>
  );
}

const EditFloorPlan: React.FC<{
  floor: string;
  onSave?: (tables: Table[]) => void;
}> = ({ floor, onSave }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fallback to mock data if getTablesByFloor fails to prevent crashing
    getTablesByFloor(floor).then(setTables).catch(() => {
      // Mock data for demo if API fails
      setTables([
        { id: "1", number: "T01", capacity: 2, status: "Available" },
        { id: "2", number: "T02", capacity: 4, status: "Available" },
        { id: "3", number: "T03", capacity: 8, status: "Available" },
        { id: "4", number: "T04", capacity: 2, status: "Available" },
        { id: "5", number: "T05", capacity: 4, status: "Available" },
      ] as any);
    });
  }, [floor]);

  const handleDrop = useCallback((idx: number, capacity: number) => {
    setTables((prev) => {
      const updated = prev.map((t, i) => (i === idx ? { ...t, capacity } : t));
      return updated;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFloorPlan(floor, tables);
    } catch (e) {
      console.log("Save failed (offline mock)", e);
    }
    setSaving(false);
    if (onSave) onSave(tables);
  };

  // Layout: 3 rows x 5 cols
  const gridRows = 3;
  const gridCols = 5;
  const grid = [];
  for (let r = 0; r < gridRows; r++) {
    const row = [];
    for (let c = 0; c < gridCols; c++) {
      const idx = r * gridCols + c;
      if (tables[idx]) {
        row.push(
          <TableSlot
            key={tables[idx].id}
            table={tables[idx]}
            onDrop={(capacity) => handleDrop(idx, capacity)}
          />
        );
      } else {
        row.push(
          <div
            key={`empty-${r}-${c}`}
            className="border-dashed border-2 border-gray-200 rounded-2xl min-w-[140px] min-h-[110px] bg-gray-50/50"
            style={{ width: 160, height: 110 }}
          />
        );
      }
    }
    grid.push(
      <AutoScrollRow key={r}>{row}</AutoScrollRow>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 bg-white md:static md:bg-transparent md:shadow-none flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full shadow-sm pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center w-full">
            {TABLE_TYPES.map((type) => (
              <div key={type.capacity} className="flex flex-col items-center">
                <div className="flex flex-row items-center justify-center w-full mt-0 mb-1 gap-1">
                  <img src={tableIcon} alt="table icon" className="w-5 h-5 opacity-70" />
                  <span className="font-semibold text-sm text-gray-700">
                    {type.capacity} Seater
                  </span>
                </div>
                <DraggableTableType
                  capacity={type.capacity}
                  img={type.img}
                  small
                />
              </div>
            ))}
          </div>
          <button
            className="mt-2 sm:mt-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white font-semibold shadow-md hover:opacity-90 text-sm md:text-base w-full sm:w-auto whitespace-nowrap transition-all"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      <AutoScrollContainer>
        <div className="flex flex-col gap-0 items-center w-full min-w-0">
          {grid}
        </div>
      </AutoScrollContainer>
    </>
  );
};

export default EditFloorPlan;