import React, { useState } from 'react';

// --- Modal Component ---
const NewReservationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop Overlay
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            New Reservation
          </h2>
          
          <form className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Guest Name</label>
                <input 
                  type="text" 
                  defaultValue="Mohammed Al-Farsi" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Phone</label>
                <input 
                  type="text" 
                  defaultValue="+974 55-000-1234" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Occasion</label>
                <input 
                  type="text" 
                  defaultValue="Birthday Business VIP Anniversary" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Estimated Duration</label>
                <input 
                  type="text" 
                  placeholder="__hr __min" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Date & Time</label>
                <input 
                  type="text" 
                  defaultValue="04/15/2026, 07:30 PM" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Party Size</label>
                <input 
                  type="text" 
                  defaultValue="4" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Assign Table</label>
                <select className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white">
                  <option>Table 2 - Available</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Notes</label>
                <input 
                  type="text" 
                  defaultValue="Allergies: nuts" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 border border-purple-300 text-purple-700 bg-white py-2.5 rounded-md font-medium text-sm hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-700 text-white py-2.5 rounded-md font-medium text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function ReservationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-800 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          +New Reservation
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Reservation Queue */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Reservation Queue
            </h2>
            <div className="flex flex-col gap-3">
              
              {/* Queue Item 1 - Selected */}
              <div className="border-2 border-red-400 rounded-lg p-4 bg-white shadow-sm relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">Al-Mansoori - 4 guests</h3>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200 font-medium">Upcoming</span>
                </div>
                <p className="text-sm text-gray-500">Today 7:00 PM - Table 5 - Window seat requested</p>
              </div>

              {/* Queue Item 2 */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">Birthday party - 8 guests</h3>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200 font-medium">Upcoming</span>
                </div>
                <p className="text-sm text-gray-500">Today 8:00 PM - Table 7 - Cake & decoration</p>
              </div>

              {/* Queue Item 3 */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">Johnson Group - 12 guests</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 font-medium">Tomorrow</span>
                </div>
                <p className="text-sm text-gray-500">Apr 15, 12:30 PM - Private room</p>
              </div>

              {/* Queue Item 4 */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">Johnson Group - 12 guests</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 font-medium">Confirmed</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Section (Inline Form as shown in first screenshot) */}
          <section className="border-2 border-red-400 rounded-xl p-6 bg-white">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              New Reservation
            </h2>
            
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Guest Name</label>
                  <input type="text" defaultValue="Mohammed Al-Farsi" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone</label>
                  <input type="text" defaultValue="+974 55-000-1234" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Occasion</label>
                  <input type="text" defaultValue="Birthday Business VIP Anniversary" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                 <div>
                  <label className="block text-xs text-gray-600 mb-1">Estimated Duration</label>
                  <input type="text" placeholder="__hr __min" className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date & Time</label>
                  <input type="text" defaultValue="04/15/2026, 07:30 PM" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Party Size</label>
                  <input type="text" defaultValue="4" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Assign Table</label>
                  <select className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 bg-white">
                    <option>Table 2 - Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <input type="text" defaultValue="Allergies: nuts" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <button type="button" className="mt-2 w-full bg-gradient-to-r from-pink-600 to-purple-700 text-white py-3 rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity">
                Confirm Reservation
              </button>
            </form>
          </section>
        </div>

        {/* Right Column - Floor Map */}
        <div className="lg:w-[45%]">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Floor Map - Reservation View
          </h2>
          
          <div className="grid grid-cols-4 gap-3">
            {/* Table T1 */}
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T1</span>
              <span className="text-[10px] text-gray-500 mt-1">Occupied</span>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T2</span>
              <span className="text-[10px] text-gray-500 mt-1">Free</span>
            </div>
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T3</span>
              <span className="text-[10px] text-gray-500 mt-1">Occupied</span>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T4</span>
              <span className="text-[10px] text-gray-500 mt-1">Reserved</span>
              <span className="text-[10px] text-gray-500">8:30 PM</span>
            </div>

            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T5</span>
              <span className="text-[10px] text-gray-500 mt-1">Occupied</span>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T6</span>
              <span className="text-[10px] text-gray-500 mt-1">Free</span>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T7</span>
              <span className="text-[10px] text-gray-500 mt-1">Free</span>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T8</span>
              <span className="text-[10px] text-gray-500 mt-1">Reserved</span>
              <span className="text-[10px] text-gray-500">8:00 PM</span>
            </div>

            <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T9</span>
              <span className="text-[10px] text-gray-500 mt-1">Free</span>
            </div>
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T10</span>
              <span className="text-[10px] text-gray-500 mt-1">Occupied</span>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T11</span>
              <span className="text-[10px] text-gray-500 mt-1">Reserved</span>
              <span className="text-[10px] text-gray-500">10:30 PM</span>
            </div>
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex flex-col items-center justify-center aspect-square">
              <span className="font-semibold text-gray-700">T12</span>
              <span className="text-[10px] text-gray-500 mt-1">Occupied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render the Modal conditionally */}
      <NewReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}