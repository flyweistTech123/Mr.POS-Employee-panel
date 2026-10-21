/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllFloorsQuery, useGetFloorWithTablesQuery } from "@/redux/api/quickOrderSlice";
import { useOrderFlowStore } from "@/store/zustandStores";
import WaitlistDrawer from "@/components/common/WaitlistDrawer";
import ReserveTableModal from "@/components/common/ReserveTableModal";
import EditFloorPlan from "@/components/common/EditFloorPlan";
import { TableIcon } from "@/icons/TableIcon"; // ✅ Using your exact TableIcon

const TablePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Tables");
  const { floor: globalFloor } = useOrderFlowStore();

  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: floorsData } = useGetAllFloorsQuery();
  const floors = floorsData?.data || [];

  const floorId = useMemo(() => {
    const match = floors.find((f: any) => f.Floor_Name === globalFloor);
    return match ? match.Floor_id : floors[0]?.Floor_id;
  }, [floors, globalFloor]);

  const { data: floorTables, isLoading } = useGetFloorWithTablesQuery(String(floorId), { skip: !floorId });
  const tables = floorTables?.tables || [];

  const filteredTables = useMemo(() => {
    if (activeTab === "All Tables") return tables;
    return tables.filter((t: any) => (t.dynamic_status || t.table_status || "Available").toLowerCase() === activeTab.toLowerCase());
  }, [tables, activeTab]);

  // ✅ Group tables by row
  const groupedRows = useMemo(() => {
    const rowMap: Record<string, any[]> = {};
    filteredTables.forEach((table: any) => {
      const match = String(table["Table-name"] || table.Table_id).match(/(\d+)/);
      const row = match ? match[1][0] : "1";
      if (!rowMap[row]) rowMap[row] = [];
      rowMap[row].push(table);
    });
    return Object.keys(rowMap).sort((a, b) => Number(a) - Number(b)).map((key) => rowMap[key]);
  }, [filteredTables]);

  const handleTableSelect = (table: any) => {
    navigate("/orders", { state: { tableId: table.Table_id, floor: globalFloor } });
  };

  // ✅ AutoScrollRow matching the Edit view
  const AutoScrollRow = ({ children }: { children: React.ReactNode }) => {
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
      <div 
        ref={rowRef} 
        className="flex flex-row gap-6 mb-6 overflow-x-auto flex-nowrap min-w-0 w-full pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    );
  };

  // Status to size mapping (same as Edit view)
  const getSizeFromCapacity = (capacity: number): "small" | "medium" | "long" => {
    if (capacity === 4) return "medium";
    if (capacity === 8) return "long";
    return "small";
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] px-8 py-6 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
          Table <span className="text-gray-400">(Floor Plan)</span>
        </h1>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-[#F1F1F1] rounded-full p-1.5 shadow-inner">
            {["All Tables", "Served", "waiting", "Reser"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Tables
            </button>
            <button 
              onClick={() => setShowWaitlist(true)}
              className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:opacity-90"
            >
              Add Waitlist
            </button>
            <button 
              onClick={() => setShowReserve(true)}
              className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:opacity-90"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODE TOGGLE */}
      {isEditing ? (
        <div className="mt-4">
          <EditFloorPlan 
            floor={globalFloor} 
            onSave={() => setIsEditing(false)} 
          />
        </div>
      ) : (
        <>
          {/* TABLES GRID (HORIZONTAL SLIDER) */}
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">Loading tables...</div>
          ) : groupedRows.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No tables available on this floor.</div>
          ) : (
            <div className="flex flex-col gap-0 items-center w-full min-w-0">
              {/* ✅ Each row uses the AutoScrollRow matching the Edit view */}
              {groupedRows.map((rowTables, rowIndex) => (
                <AutoScrollRow key={rowIndex}>
                  {rowTables.map((table: any) => {
                    const status = table.dynamic_status || table.table_status || "Available";
                    const size = getSizeFromCapacity(table.Capacity || 2);
                    
                    return (
                      <div 
                        key={table.Table_id} 
                        onClick={() => handleTableSelect(table)} 
                        className="cursor-pointer transition-transform hover:scale-105 snap-start"
                      >
                        <TableSlot
                          table={table}
                          size={size}
                          status={status}
                        />
                      </div>
                    );
                  })}
                </AutoScrollRow>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      <WaitlistDrawer open={showWaitlist} onClose={() => setShowWaitlist(false)} />
      <ReserveTableModal open={showReserve} onClose={() => setShowReserve(false)} tables={tables} />
    </div>
  );
};

// ✅ Reusing the exact same TableSlot visual from Edit
const TableSlot = ({ table, size, status }: { table: any, size: "small" | "medium" | "long", status: string }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-w-[160px] min-h-[140px]">
      <TableIcon
        size={size}
        label={table.number ? table.number.toLowerCase().replace(/^t(\d+)$/, "t-$1") : `t-${table.Table_id}`}
      />
      {/* Status Badge overlay */}
      {status && status !== "Available" && (
        <div
          className={`absolute bottom-1 z-10 px-3 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm ${
            status === "Served"
              ? "bg-green-100 text-green-700"
              : status === "Reserved"
              ? "bg-purple-100 text-purple-700"
              : status === "Ready"
              ? "bg-yellow-100 text-yellow-700"
              : status === "Occupied"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status === "Served" && "✓ "}
          {status === "Ready" && "🔔 "}
          {status}
        </div>
      )}
    </div>
  );
};

export default TablePage;