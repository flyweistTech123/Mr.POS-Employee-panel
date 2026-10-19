import React, { useState } from 'react';
import { FiUsers, FiClock, FiRepeat, FiX, FiChevronDown, FiCheckCircle } from 'react-icons/fi';
import { 
  useGetShiftDashboardQuery, 
  useRequestShiftSwapMutation, 
  useRespondToShiftSwapMutation 
} from '../../redux/api/apiSlice';

export default function WorkShift() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
  const [selectedCoworker, setSelectedCoworker] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedShiftToSwap, setSelectedShiftToSwap] = useState<any | null>(null);

  // RTK Query Hooks
  const { data: apiResponse, isLoading, isError } = useGetShiftDashboardQuery();
  const [requestSwap, { isLoading: isRequesting }] = useRequestShiftSwapMutation();
  const [respondToSwap] = useRespondToShiftSwapMutation();

  const dashboardData = apiResponse?.data;

  const handleRequestSwap = async () => {
    if (!selectedCoworker || !selectedShiftToSwap) {
      alert("Please select a coworker and reason.");
      return;
    }

    try {
      await requestSwap({
        requester_shift_id: selectedShiftToSwap.shift_id || Number(selectedShiftToSwap.id),
        target_employee_id: Number(selectedCoworker),
        target_shift_id: selectedShiftToSwap.target_shift_id || null,
        reason: reason
      }).unwrap();
      
      alert('Swap request sent successfully!');
      setIsModalOpen(false);
      setSelectedCoworker('');
      setReason('');
    } catch (error) {
      console.error("Error requesting swap:", error);
      alert('Failed to send swap request.');
    }
  };

  const handleRespondToSwap = async (swapId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToSwap({ swapId, status }).unwrap();
      alert(`Swap ${status} successfully!`);
    } catch (error) {
      console.error(`Error responding to swap:`, error);
      alert(`Failed to ${status} swap.`);
    }
  };

  const openSwapModal = (shift: any) => {
    setSelectedShiftToSwap(shift);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading shift dashboard...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load shift data. Please try again.</div>;

  // Data with fallbacks
  const currentShift = dashboardData?.current_shift || null;
  const upcomingShifts = dashboardData?.upcoming_shifts || [];
  const teamSchedule = dashboardData?.team_schedule || [];
  const swapRequests = dashboardData?.incoming_swap_requests || [];
  const coworkers = dashboardData?.coworkers || [];

  return (
    <>
      <style>
        {`
          .custom-vertical-scroll::-webkit-scrollbar { width: 3px; }
          .custom-vertical-scroll::-webkit-scrollbar-track { background-color: #ffe5e5; border-radius: 10px; margin: 10px 0; }
          .custom-vertical-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; transition: background-color 0.2s ease; }
          .custom-vertical-scroll:hover::-webkit-scrollbar-thumb, .custom-vertical-scroll:active::-webkit-scrollbar-thumb { background-color: #ff3b30; }
        `}
      </style>

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
                        Started: <span className="text-black font-bold">{currentShift.started_at || '09:00 am'}</span>
                      </p>
                      <p className="text-[#555555] text-[15px]">
                        Worked: <span className="text-black font-bold">{currentShift.worked_duration || '0hr 0min'}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-[#333333] text-[13px] mb-1">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-lg font-extrabold text-black mb-3">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <button className="bg-gradient-to-r from-[#b12a68] to-[#7a1c7d] text-white font-medium py-2 px-8 rounded-lg shadow-md hover:opacity-90 transition">
                        Clock In
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4 font-medium">No active shift currently.</div>
                )}
              </div>
            </div>

            {/* Up Coming Shift */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-black mb-4">Up Coming Shift</h2>
              
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {upcomingShifts.length > 0 ? upcomingShifts.map((shift, index) => (
                  <div key={index} className="flex-1 min-w-[30%] shrink-0 snap-start border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <h3 className="font-bold text-gray-800">{shift.day || 'Day'}</h3>
                    <span className="bg-[#fdf2f4] text-[#c9516b] px-3 py-1 rounded-full text-xs font-medium w-fit">
                      {shift.role || 'Role'}
                    </span>
                    <p className="text-sm text-gray-500">{shift.time || 'Time'}</p>
                    <button 
                      onClick={() => openSwapModal(shift)}
                      className="mt-1 w-full border border-[#f8b4c4] text-[#c9516b] font-medium py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
                    >
                      Request Swap
                    </button>
                  </div>
                )) : (
                  <div className="text-gray-500 py-2 font-medium">No upcoming shifts scheduled.</div>
                )}
              </div>
            </div>

            {/* Shift Swap Request */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-2">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <FiRepeat className="w-5 h-5 text-gray-800" />
                <h2 className="text-lg font-bold">Shift Swap Request</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {swapRequests.length > 0 ? swapRequests.map((req: any) => (
                  <div key={req.id} className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={req.requester_image || "https://i.pravatar.cc/150?img=1"} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-semibold text-gray-700">{req.requester_name || 'Employee'}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" /> {req.shift_time || 'Time'}
                      </span>
                      <span className="bg-[#fdf2f4] text-[#c9516b] px-4 py-1 rounded-full text-xs font-medium">
                        {req.role || 'Role'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      {req.reason || 'No reason provided.'}
                    </p>
                    
                    <div className="flex gap-4">
                      <button onClick={() => handleRespondToSwap(req.id, 'rejected')} className="flex-1 border border-[#f8b4c4] text-[#c9516b] font-medium py-2 rounded-lg text-sm hover:bg-red-50 transition">
                        Reject
                      </button>
                      <button onClick={() => handleRespondToSwap(req.id, 'accepted')} className="flex-1 bg-[#2ecc71] text-white font-medium py-2 rounded-lg text-sm hover:bg-green-600 transition shadow-sm">
                        Accept
                      </button>
                    </div>
                  </div>
                )) : (
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
              {teamSchedule.length > 0 ? teamSchedule.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 shadow-sm bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <img src={member.profile_image || "https://i.pravatar.cc/150?img=11"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{member.full_name || 'Name'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FiClock className="w-3 h-3" /> {member.shift_time || 'Time'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#fdf2f4] text-[#c9516b] px-3 py-1.5 rounded-full text-xs font-medium">
                    {member.role || 'Role'}
                  </span>
                </div>
              )) : (
                <div className="text-gray-500 text-sm font-medium">No team members scheduled.</div>
              )}
            </div>
          </div>

        </div>

        {/* MODAL POPUP */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-[500px] p-6 shadow-2xl relative">
              
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-[22px] font-bold text-black">Request Shift Swap</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 shadow-sm">
                <p className="font-bold text-sm mb-4">Your Shift</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 font-medium text-[15px]">
                    {selectedShiftToSwap?.day} / {selectedShiftToSwap?.time}
                  </p>
                  <span className="bg-[#fdf2f4] text-[#c9516b] px-4 py-1.5 rounded-full text-xs font-medium">
                    {selectedShiftToSwap?.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Swap With</label>
                  <div className="relative">
                    <select 
                      value={selectedCoworker}
                      onChange={(e) => setSelectedCoworker(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:border-purple-500 bg-white"
                    >
                      <option value="">Select Coworker</option>
                      {coworkers.map((c: any) => (
                        <option key={c.id} value={c.employee_id}>{c.full_name} (ID: {c.employee_id})</option>
                      ))}
                    </select>
                    <FiChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="........." 
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
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