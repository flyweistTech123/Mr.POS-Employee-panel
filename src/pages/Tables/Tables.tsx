/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetAllFloorsQuery,
  useGetFloorWithTablesQuery,
} from "@/redux/api/quickOrderSlice";
import { useCreateWaitlistMutation } from "@/redux/api/waitlistSlice";
import { useOrderFlowStore } from "@/store/zustandStores";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import WaitlistDrawer from "@/components/common/WaitlistDrawer";
import ReserveTableModal from "@/components/common/ReserveTableModal";
import EditFloorPlan from "@/components/common/EditFloorPlan";
import { TableIcon } from "@/icons/TableIcon";
import Loader from "@/components/Loader";

/* -------------------------------------------------------------------------- */
/*  Types & Constants                                                         */
/* -------------------------------------------------------------------------- */

type StatusValue = "All" | "Served" | "Waiting" | "Reserved";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const tableLabel = (t_item: any): string =>
  (t_item["Table-code"] as string | undefined) ??
  (t_item.Title as string | undefined) ??
  `t-${t_item.Table_id}`;

const mapBookingStatus = (id: number | undefined | null): string => {
  switch (id) {
    case 1: return "Available";
    case 2: return "Occupied";
    case 3: return "Served";
    case 4: return "Waiting";
    case 5: return "Reserved";
    default: return "Available";
  }
};

const getSizeFromCapacity = (capacity: number): "small" | "medium" | "long" => {
  if (capacity >= 8) return "long";
  if (capacity >= 5) return "long";
  if (capacity >= 3) return "medium";
  return "small";
};

/* -------------------------------------------------------------------------- */
/*  Auto-Scroll Row                                                           */
/* -------------------------------------------------------------------------- */

const AutoScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;

    function onDragOver(e: DragEvent) {
      if (!node) return;
      const { left, right } = node.getBoundingClientRect();
      const scrollAmount = 20;
      const threshold = 40;
      if (e.clientX - left < threshold) {
        node.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else if (right - e.clientX < threshold) {
        node.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }

    node.addEventListener("dragover", onDragOver);
    return () => node.removeEventListener("dragover", onDragOver);
  }, []);

  return (
    <div
      ref={rowRef}
      className="flex flex-row gap-6 mb-6 overflow-x-auto flex-nowrap min-w-0 w-full pb-2 snap-x snap-mandatory"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Floor Plan Canvas                                                         */
/* -------------------------------------------------------------------------- */

const statusBorder = (status: string): string => {
  switch (status) {
    case "Occupied": return "bg-red-50 border-red-300";
    case "Reserved": return "bg-purple-50 border-purple-300";
    case "Waiting": return "bg-blue-50 border-blue-300";
    case "Served": return "bg-green-50 border-green-300";
    case "Ready": return "bg-yellow-50 border-yellow-300";
    default: return "bg-[#FDF0F4] border-pink-200";
  }
};

const FloorPlanCanvas: React.FC<{
  tables: any[];
  floorWidth: number;
  floorHeight: number;
  activeStatus: StatusValue;
  onSelect: (t: any) => void;
  busyId: number | null;
}> = ({ tables, floorWidth, floorHeight, activeStatus, onSelect, busyId }) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-auto"
      style={{ width: floorWidth, height: floorHeight, minWidth: 320, minHeight: 320 }}
    >
      {tables.map((t_item, index) => {
        const { x = 0, y = 0, width = 120, height = 90, rotation = 0 } = t_item.layout ?? {};
        
        const currentStatus = mapBookingStatus(t_item["Table-Booking-Status_id"]);
        if (activeStatus !== "All" && currentStatus !== activeStatus) return null;

        const capacity = t_item.Capacity ?? 2;
        const busy = busyId === t_item.Table_id;

        return (
          <button
            key={t_item.Table_id}
            onClick={() => onSelect(t_item)}
            disabled={busy}
            className={`absolute flex flex-col items-center justify-center rounded-xl border-2 shadow transition hover:scale-105 ${index === 0 ? "table-available" : ""} ${statusBorder(currentStatus)} ${busy ? "opacity-50 pointer-events-none" : ""}`}
            style={{ left: x, top: y, width, height, transform: `rotate(${rotation}deg)` }}
            title={`${tableLabel(t_item)} · ${t('Cap')} ${capacity}`}
          >
            <span className="text-[11px] font-bold text-gray-800">
              {t_item["Table-code"] ?? tableLabel(t_item)}
            </span>
            <span className="text-[9px] text-gray-500">{t('Cap')} {capacity}</span>
          </button>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Table Slot                                                                */
/* -------------------------------------------------------------------------- */

const TableSlot: React.FC<{
  label: string;
  size: "small" | "medium" | "long";
  status: string;
}> = ({ label, size, status }) => {
  const { t } = useTranslation();

  const badgeClass =
    status === "Served" ? "bg-green-100 text-green-700" :
    status === "Reserved" ? "bg-purple-100 text-purple-700" :
    status === "Ready" ? "bg-yellow-100 text-yellow-700" :
    status === "Occupied" ? "bg-red-100 text-red-700" :
    status === "Waiting" ? "bg-blue-100 text-blue-700" :
    "bg-gray-100 text-gray-600";

  return (
    <div className="relative flex flex-col items-center justify-center min-w-[160px] min-h-[140px]">
      <TableIcon size={size} label={label.toLowerCase().replace(/\s+/g, "-")} />
      {status && status !== "Available" && (
        <div className={`absolute bottom-1 z-10 px-3 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm ${badgeClass}`}>
          {status === "Served" && "✓ "}
          {status === "Ready" && "🔔 "}
          {t(status)}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

const TablePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isOrderTraining = useWalkthroughStore(
    (state) => state.isActive && state.activeTraining === "order"
  );
  
  const [activeStatus, setActiveStatus] = useState<StatusValue>("All");

  const {
    floor: globalFloor,
    selectedFloorId: globalFloorId,
    waitlistDraft,
    clearWaitlistDraft,
  } = useOrderFlowStore();

  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingTableForGuest, setIsSelectingTableForGuest] = useState(false);
  const [creatingForTableId, setCreatingForTableId] = useState<number | null>(null);

  // ✅ FIXED: localFloorId type is number | null to match Zustand
  const [localFloorId, setLocalFloorId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [createWaitlist] = useCreateWaitlistMutation();

  const { data: floorsData } = useGetAllFloorsQuery();
  const floors = floorsData?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync local floor ID with global
  useEffect(() => {
    if (localFloorId !== null) return;
    if (globalFloorId) {
      setLocalFloorId(globalFloorId);
      return;
    }
    const match = floors.find((f: any) => f.Floor_Name === globalFloor);
    if (match) {
      setLocalFloorId(match.Floor_id);
    } else if (floors.length > 0) {
      setLocalFloorId(floors[0].Floor_id);
    }
  }, [floors, globalFloor, globalFloorId, localFloorId]);

  const currentFloorName = floors.find((f: any) => f.Floor_id === localFloorId)?.Floor_Name || "Select Floor";

  /* ------------------------------------------------------------------ */
  /*  API QUERY                                                         */
  /* ------------------------------------------------------------------ */

  const {
    data: floorTablesRes,
    isLoading,
    refetch,
  } = useGetFloorWithTablesQuery(
    { floorId: String(localFloorId ?? ""), status: activeStatus } as any,
    { skip: !localFloorId }
  );

  const response = floorTablesRes as any;
  
  const rawTables: any[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.tables)) return response.data.tables;
    if (Array.isArray(response.tables)) return response.tables;
    return [];
  }, [response]);

  const floorMeta = response?.data?.floor ?? response?.floor;

  const tables = useMemo(() => {
    if (activeStatus === "All") return rawTables;
    return rawTables.filter((t_item) => {
      const status = mapBookingStatus(t_item["Table-Booking-Status_id"]);
      return status === activeStatus;
    });
  }, [rawTables, activeStatus]);

  const hasLayoutPositions = useMemo(
    () => tables.some((t_item: any) => (t_item.layout?.x ?? 0) !== 0 || (t_item.layout?.y ?? 0) !== 0),
    [tables]
  );

  const ROW_SIZE = 6;
  const groupedRows = useMemo(() => {
    if (tables.length === 0) return [] as any[][];
    const rows: any[][] = [];
    for (let i = 0; i < tables.length; i += ROW_SIZE) {
      rows.push(tables.slice(i, i + ROW_SIZE));
    }
    return rows;
  }, [tables]);

  useEffect(() => {
    if (!waitlistDraft) setIsSelectingTableForGuest(false);
  }, [waitlistDraft]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */

  const handleTableSelect = (table: any) => {
    if (isOrderTraining) {
      const walkthrough = useWalkthroughStore.getState();
      if (walkthrough.steps[walkthrough.currentStep]?.selector === ".table-available") {
        walkthrough.next();
      }
      return;
    }
    navigate("/orders", {
      state: { tableId: table.Table_id, floor: globalFloor },
    });
  };

  const handleTableSelectForGuest = async (table: any) => {
    if (!waitlistDraft) return;
    setCreatingForTableId(table.Table_id);
    try {
      const name = window.prompt(t("Guest name?"));
      if (!name) return;
      const phone = window.prompt(t("Guest phone?")) || "";
      if (!phone) return;

      await createWaitlist({
        customer_name: name,
        phone,
        persons: waitlistDraft.persons,
        Floor_id: waitlistDraft.floorId ?? localFloorId!,
        Table_id: table.Table_id,
        save_customer: false,
      }).unwrap();

      clearWaitlistDraft();
      setIsSelectingTableForGuest(false);
      setShowWaitlist(true);
    } catch (err) {
      console.error("Failed to create waitlist", err);
      alert(t("Failed to add guest. Please try again."));
    } finally {
      setCreatingForTableId(null);
    }
  };

  const onSelect = isSelectingTableForGuest ? handleTableSelectForGuest : handleTableSelect;

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#F8F8F8] px-8 py-6 overflow-hidden">
      
      {/* ========================================= */}
      {/* EXACT HEADER DESIGN FROM SCREENSHOT       */}
      {/* ========================================= */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-black mr-2 whitespace-nowrap flex items-baseline">
          {t('Table')}{' '}
          <span className="text-gray-500 text-lg font-medium ml-1">({t('Floor Plan')})</span>
        </h1>

        {/* 1. Floor Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white pl-3 pr-2 py-1.5 rounded-[6px] text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity min-w-[100px] justify-between"
          >
            <span>{currentFloorName}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full min-w-[120px] bg-white rounded-md shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
              {floors.map((floor: any) => (
                <button
                  key={floor.Floor_id}
                  onClick={() => {
                    setLocalFloorId(floor.Floor_id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
                    localFloorId === floor.Floor_id
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {floor.Floor_Name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Status Tabs */}
        <div className="flex bg-[#F0EBF3] rounded-full p-1 ml-1">
          {[
            { label: t("All Tables"), value: "All" },
            { label: t("Served"), value: "Served" },
            { label: t("Waiting"), value: "Waiting" },
            { label: t("Reserved"), value: "Reserved" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveStatus(value as StatusValue)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                activeStatus === value
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 3. Action Buttons */}
        <div className="flex gap-2 ml-1">
          <button
            onClick={() => setIsEditing(true)}
            disabled={!localFloorId}
            className="flex items-center justify-center bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white w-[42px] h-[32px] rounded-[6px] shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            title={t('Edit Tables')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowWaitlist(true)}
            className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white px-4 h-[32px] rounded-[6px] text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t('Add Waitlist')}
          </button>
          
          <button
            onClick={() => setShowReserve(true)}
            disabled={!localFloorId}
            className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white px-5 h-[32px] rounded-[6px] text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {t('Reserve')}
          </button>
        </div>
      </div>
      {/* ========================================= */}

      {/* GUEST SELECTION BANNER */}
      {isSelectingTableForGuest && waitlistDraft && (
        <div className="mb-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <p className="text-sm text-purple-900 font-semibold">
            {t('Pick a table for')}{" "}
            <span className="font-bold">{waitlistDraft.persons}</span> {t('guest(s) on')}{" "}
            <span className="font-bold">{waitlistDraft.floorName}</span>
          </p>
          <button
            onClick={() => {
              clearWaitlistDraft();
              setIsSelectingTableForGuest(false);
            }}
            className="text-xs font-bold text-purple-700 underline"
          >
            {t('Cancel')}
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      {isEditing ? (
        <div className="mt-4">
          <EditFloorPlan
            floorId={localFloorId!}
            tables={tables}
            onSaved={() => {
              setIsEditing(false);
              refetch();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {!localFloorId ? (
            <div className="text-center py-20 text-gray-500">
              {t('Select a floor to view tables.')}
            </div>
          ) : isLoading && tables.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
               <div className="flex items-center justify-center w-full min-h-[60vh]">
                 <Loader />
              </div>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {activeStatus === "All"
                ? t("No tables available on this floor.")
                : `${t('No tables are currently')} ${t(activeStatus).toLowerCase()} ${t('on this floor.')}`}
            </div>
          ) : hasLayoutPositions ? (
            <FloorPlanCanvas
              tables={tables}
              floorWidth={Number(floorMeta?.floor_width ?? 800)}
              floorHeight={Number(floorMeta?.floor_height ?? 600)}
              activeStatus={activeStatus}
              onSelect={onSelect}
              busyId={creatingForTableId}
            />
          ) : (
            <div className="flex flex-col gap-0 items-center w-full min-w-0">
              {groupedRows.map((rowTables, rowIndex) => (
                <AutoScrollRow key={rowIndex}>
                  {rowTables.map((table: any, tableIndex) => {
                    const currentStatus = mapBookingStatus(table["Table-Booking-Status_id"]);
                    const capacity = table.Capacity ?? 2;
                    const size = getSizeFromCapacity(capacity);
                    const busy = creatingForTableId === table.Table_id;

                    return (
                      <div
                        key={table.Table_id}
                        onClick={() => onSelect(table)}
                        className={`cursor-pointer transition-transform hover:scale-105 snap-start ${
                          rowIndex === 0 && tableIndex === 0 ? "table-available" : ""
                        } ${busy ? "opacity-50 pointer-events-none" : ""}`}
                        title={`${tableLabel(table)} · ${t('Cap')} ${capacity}`}
                      >
                        <TableSlot
                          label={tableLabel(table)}
                          size={size}
                          status={currentStatus}
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
      <WaitlistDrawer
        open={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        onAddGuestProceed={() => {
          setShowWaitlist(false);
          setIsSelectingTableForGuest(true);
        }}
      />
      {localFloorId != null && (
        <ReserveTableModal
          open={showReserve}
          onClose={() => setShowReserve(false)}
          floorId={localFloorId}
          floorName={currentFloorName}
        />
      )}
    </div>
  );
};

export default TablePage;