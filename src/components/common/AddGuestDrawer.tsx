/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useGetAllFloorsQuery } from "@/redux/api/quickOrderSlice";
import { useOrderFlowStore } from "@/store/zustandStores";

interface AddGuestDrawerProps {
  open: boolean;
  onClose: () => void;
  onProceed?: (draft: {
    persons: number;
    floorName: string;
    floorId: number | null;
  }) => void;
}

const AddGuestDrawer: React.FC<AddGuestDrawerProps> = ({
  open,
  onClose,
  onProceed,
}) => {
  const [persons, setPersons] = useState(1);
  const {
    floor: globalFloor,
    selectedFloorId: globalFloorId, // ← existing field
    setFloor,
    setPersons: setGlobalPersons,
    setWaitlistDraft,
  } = useOrderFlowStore();

  const { data: floorsData } = useGetAllFloorsQuery();
  const floors = floorsData?.data || [];

  useEffect(() => {
    if (open) setPersons(1);
  }, [open]);

  if (!open) return null;

  const handleSelectTable = () => {
    const draft = {
      persons,
      floorName: globalFloor,
      floorId: globalFloorId,
    };
    setGlobalPersons(persons);
    setWaitlistDraft(draft);
    onProceed?.(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-[360px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Guest</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-[#F9F5F9] rounded-[24px] overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-[#8E24AA]/20 to-[#E53935]/20 p-5">
              <h3 className="text-lg font-bold text-gray-800">Floor Map</h3>
              <p className="text-xs text-gray-600 mt-1">
                Select Floor and Persons
              </p>
            </div>

            <div className="p-5">
              <div className="mb-6">
                <label className="font-semibold text-sm text-gray-700 mb-3 block">
                  Select Persons:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPersons((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xl flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-gray-800 shadow-sm border border-gray-200">
                    {persons}
                  </div>
                  <button
                    onClick={() => setPersons((p) => p + 1)}
                    className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white text-xl flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-sm text-gray-700 mb-3 block">
                  Select Floor:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {floors.map((f: any) => (
                    <button
                      key={f.Floor_id}
                      onClick={() => setFloor(f.Floor_Name, f.Floor_id)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                        globalFloor === f.Floor_Name
                          ? "bg-gradient-to-r from-[#8E24AA] to-[#E53935] text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {f.Floor_Name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={handleSelectTable}
                disabled={!globalFloorId}
                className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#8E24AA] to-[#E53935] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Select Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGuestDrawer;