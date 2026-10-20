import React, { useMemo, useState } from 'react';
import {
  FiUsers, FiClock, FiRepeat, FiX, FiChevronDown,
  FiCheckCircle, FiLogOut,
} from 'react-icons/fi';
import {
  useGetShiftDashboardQuery,
  useGetCoworkerShiftsQuery,
  useRequestShiftSwapMutation,
  useRespondToShiftSwapMutation,
  useClockOutMutation,
} from '../../redux/api/shiftApiSlice';

export default function WorkShift() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [selectedCoworker, setSelectedCoworker] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedShiftToSwap, setSelectedShiftToSwap] = useState<any | null>(null);
  const [selectedTargetShiftId, setSelectedTargetShiftId] = useState<string>('');

  // RTK Query hooks
  const { data: apiResponse, isLoading, isError } = useGetShiftDashboardQuery();
  const [requestSwap, { isLoading: isRequesting }] = useRequestShiftSwapMutation();
  const [respondToSwap, { isLoading: isResponding }] = useRespondToShiftSwapMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  // Fetch the selected coworker's shifts (for the target-shift dropdown)
  const coworkerIdNum = selectedCoworker ? Number(selectedCoworker) : 0;
  const {
    data: coworkerShiftsRaw,
    isFetching: isFetchingCoworkerShifts,
  } = useGetCoworkerShiftsQuery(coworkerIdNum, { skip: !coworkerIdNum });

  const coworkerShifts: any[] = useMemo(() => {
    if (!coworkerShiftsRaw) return [];
    const arr = Array.isArray(coworkerShiftsRaw)
      ? coworkerShiftsRaw
      : (coworkerShiftsRaw as any).data ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [coworkerShiftsRaw]);

  const dashboardData = apiResponse?.data;

  // ---------- Formatting helpers ----------
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateWorkedTime = (startIso: string) => {
    if (!startIso) return '0hr 0min';
    const diffMins = Math.floor((Date.now() - new Date(startIso).getTime()) / 60000);
    return `${Math.floor(diffMins / 60)}hr ${diffMins % 60}min`;
  };

  // ---------- Handlers ----------
  const handleRequestSwap = async () => {
    if (!selectedCoworker || !reason.trim() || !selectedShiftToSwap) {
      alert('Please select a coworker, a target shift, and enter a reason.');
      return;
    }

    const requesterShiftId =
      selectedShiftToSwap.shift_id ?? 
      selectedShiftToSwap.employee_shift_id ?? 
      selectedShiftToSwap.id;

    if (requesterShiftId == null) {
      alert('This shift has no ID — cannot request a swap.');
      return;
    }

    try {
      await requestSwap({
        requester_shift_id: Number(requesterShiftId),
        target_employee_id: Number(selectedCoworker),
        target_shift_id: selectedTargetShiftId
          ? Number(selectedTargetShiftId)
          : null,
        reason: reason.trim(),
      }).unwrap();

      alert('Swap request sent successfully!');
      closeModal();
    } catch (error: any) {
      console.error('Error requesting swap:', error);
      alert(error?.data?.message || 'Failed to send swap request.');
    }
  };

  const handleRespondToSwap = async (swapId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToSwap({ swapId, status }).unwrap();
      alert(`Swap ${status} successfully!`);
    } catch (error: any) {
      console.error('Error responding to swap:', error);
      alert(error?.data?.message || `Failed to ${status} swap.`);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut().unwrap();
      alert('Clocked out successfully!');
    } catch (error: any) {
      console.error('Error clocking out:', error);
      alert(error?.data?.message || 'Failed to clock out.');
    }
  };

  const openSwapModal = (shift: any) => {
    setSelectedShiftToSwap(shift);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCoworker('');
    setReason('');
    setSelectedTargetShiftId('');
    setSelectedShiftToSwap(null);
  };

  // ---------- Loading / error ----------
  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading shift dashboard...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load shift data. Please try again.</div>;

  const currentShift = dashboardData?.current_shift ?? null;
  const upcomingShifts = dashboardData?.upcoming_shifts ?? [];
  const teamSchedule = dashboardData?.team_schedule ?? [];
  const swapRequests = dashboardData?.incoming_swap_requests ?? [];

  // De-dupe coworkers by employee_id
  const coworkers = (dashboardData?.coworkers ?? []).filter(
    (c: any, i: number, arr: any[]) =>
      c.employee_id != null &&
      arr.findIndex((x) => x.employee_id === c.employee_id) === i,
  );

  // Helper to find coworker details for the Team Schedule & Swap Requests
  const getEmployeeInfo = (employeeId: number) => {
    return coworkers.find((c: any) => c.employee_id === employeeId) || {
      full_name: `Employee #${employeeId}`,
      profile_image: '',
    };
  };

  return (
    <>
      <style>{`
        .custom-vertical-scroll::-webkit-scrollbar { width: 3px; }
        .custom-vertical-scroll::-webkit-scrollbar-track { background-color: #ffe5e5; border-radius: 10px; margin: 10px 0; }
        .custom-vertical-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; transition: background-color 0.2s ease; }
        .custom-vertical-scroll:hover::-webkit-scrollbar-thumb, .custom-vertical-scroll:active::-webkit-scrollbar-thumb { background-color: #ff3b30; }
      `}</style>

      <div className="min-h-screen bg-[#FAFAFA] p-8 font-sans text-gray-800 relative">
        <h1 className="text-3xl font-bold mb-6">Shift Management</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
            
            {/* Today Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-black mb-4">Today</h2>

              <div className="border-[3px] border-[#f8e1e6] rounded-xl p-5 relative bg-white shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)]">
                {currentShift ? (
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-[#2ecc71] text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                        <FiCheckCircle /> Shift Active
                      </span>
                      <p className="text-[#555555] mb-1 text-[15px]">
                        Started:{' '}
                        <span className="text-black font-bold">{formatTime(currentShift.start_at)}</span>
                      </p>
                      <p className="text-[#555555] text-[15px]">
                        Worked:{' '}
                        <span className="text-black font-bold">{calculateWorkedTime(currentShift.start_at)}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-[#333333] text-[13px] mb-1">{formatDate(currentShift.start_at)}</p>
                      <p className="text-lg font-extrabold text-black mb-3">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button
                        onClick={handleClockOut}
                        disabled={isClockingOut}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#b12a68] to-[#7a1c7d] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
                      >
                        {isClockingOut ? 'Clocking...' : (<><FiLogOut /> Clock Out</>)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4 font-medium">No active shift currently.</div>
                )}
              </div>
            </div>

            {/* Upcoming Shift */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-black mb-4">Up Coming Shift</h2>

              <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift: any, index: number) => (
                    <div
                      key={shift._id ?? shift.id ?? index}
                      className="flex-1 min-w-[30%] shrink-0 snap-start border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                    >
                      <h3 className="font-bold text-gray-800">
                        {new Date(shift.start_at).toLocaleDateString('en-US', { weekday: 'long' })}
                      </h3>
                      <span className="bg-[#fdf2f4] text-[#c9516b] px-3 py-1 rounded-full text-xs font-medium w-fit">
                        {shift.role || 'Shift'}
                      </span>
                      <p className="text-sm text-gray-500">
                        {formatTime(shift.start_at)} - {formatTime(shift.end_at)}
                      </p>
                      <button
                        onClick={() => openSwapModal(shift)}
                        className="mt-1 w-full border border-[#f8b4c4] text-[#c9516b] font-medium py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
                      >
                        Request Swap
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 py-2 font-medium">No upcoming shifts scheduled.</div>
                )}
              </div>
            </div>

            {/* Shift Swap Requests */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-2">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <FiRepeat className="w-5 h-5 text-gray-800" />
                <h2 className="text-lg font-bold">Shift Swap Request</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {swapRequests.length > 0 ? (
                  swapRequests.map((req: any) => {
                    // Find the requester's details from the coworkers list
                    const requester = getEmployeeInfo(req.requester_employee_id);
                    const swapIdToSend = req.shift_swap_id || req.id;

                    return (
                      <div key={req._id || req.id} className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={requester.profile_image || 'https://i.pravatar.cc/150?img=1'}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-semibold text-gray-700">
                            {requester.full_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5" /> Shift #{req.requester_shift_id}
                          </span>
                          <span className="bg-[#fdf2f4] text-[#c9516b] px-4 py-1 rounded-full text-xs font-medium">
                            {requester.role || 'Role'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                          {req.reason || 'No reason provided.'}
                        </p>

                        <div className="flex gap-4">
                          <button
                            onClick={() => handleRespondToSwap(String(swapIdToSend), 'rejected')}
                            disabled={isResponding}
                            className="flex-1 border border-[#f8b4c4] text-[#c9516b] font-medium py-2 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleRespondToSwap(String(swapIdToSend), 'accepted')}
                            disabled={isResponding}
                            className="flex-1 bg-[#2ecc71] text-white font-medium py-2 rounded-lg text-sm hover:bg-green-600 transition shadow-sm disabled:opacity-50"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 font-medium">No pending swap requests.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Team Scheduled */}
          <div className="w-full lg:w-[350px] bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shrink-0 flex flex-col max-h-[calc(100vh-140px)]">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4 shrink-0">
              <FiUsers className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold">Team Scheduled</h2>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto custom-vertical-scroll pr-3 flex-1">
              {teamSchedule.length > 0 ? (
                teamSchedule.map((member: any, idx: number) => {
                  // Find the member's details from the coworkers list
                  const info = getEmployeeInfo(member.employee_id);
                  
                  return (
                    <div
                      key={member._id || idx}
                      className="flex items-center justify-between border border-gray-100 rounded-xl p-3 shadow-sm bg-white shrink-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={info.profile_image || 'https://i.pravatar.cc/150?img=11'}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {info.full_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <FiClock className="w-3 h-3" /> {formatTime(member.start_at)} - {formatTime(member.end_at)}
                          </p>
                        </div>
                      </div>
                      <span className="bg-[#fdf2f4] text-[#c9516b] px-3 py-1.5 rounded-full text-xs font-medium">
                        {member.role || 'Role'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm font-medium">No team members scheduled.</div>
              )}
            </div>
          </div>

        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-[560px] p-6 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-[22px] font-bold text-black">Request Shift Swap</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Your shift */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
                <p className="font-bold text-sm mb-4">Your Shift</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 font-medium text-[15px]">
                    {selectedShiftToSwap?.start_at
                      ? `${new Date(selectedShiftToSwap.start_at).toLocaleDateString('en-US', { weekday: 'long' })} / ${formatTime(
                          selectedShiftToSwap.start_at,
                        )} - ${formatTime(selectedShiftToSwap.end_at)}`
                      : '—'}
                  </p>
                  <span className="bg-[#fdf2f4] text-[#c9516b] px-4 py-1.5 rounded-full text-xs font-medium">
                    {selectedShiftToSwap?.role || 'Shift'}
                  </span>
                </div>
              </div>

              {/* Coworker + Target shift */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Swap With</label>
                  <div className="relative">
                    <select
                      value={selectedCoworker}
                      onChange={(e) => {
                        setSelectedCoworker(e.target.value);
                        setSelectedTargetShiftId(''); 
                      }}
                      className="w-full appearance-none border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:border-purple-500 bg-white"
                    >
                      <option value="">Select Coworker</option>
                      {coworkers.map((c: any) => (
                        <option key={c.employee_id} value={c.employee_id}>
                          {c.full_name} (ID: {c.employee_id})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Their Shift (optional)</label>
                  <div className="relative">
                    <select
                      value={selectedTargetShiftId}
                      onChange={(e) => setSelectedTargetShiftId(e.target.value)}
                      disabled={!selectedCoworker || isFetchingCoworkerShifts}
                      className="w-full appearance-none border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:border-purple-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {isFetchingCoworkerShifts
                          ? 'Loading…'
                          : selectedCoworker
                          ? 'None (any)'
                          : 'Select coworker first'}
                      </option>
                      {coworkerShifts.map((s: any, i: number) => {
                        const id = s.shift_id ?? s.employee_shift_id ?? s.id ?? i;
                        return (
                          <option key={id} value={id}>
                            {new Date(s.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                            • {formatTime(s.start_at)}-{formatTime(s.end_at)}
                          </option>
                        );
                      })}
                    </select>
                    <FiChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment on Friday"
                  className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRequestSwap}
                  disabled={isRequesting}
                  className="bg-gradient-to-r from-[#b12a68] to-[#7a1c7d] text-white font-medium py-2.5 px-10 rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
                >
                  {isRequesting ? 'Requesting...' : 'Request Swap'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}