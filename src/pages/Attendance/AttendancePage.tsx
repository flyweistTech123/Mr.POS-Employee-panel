import React from 'react';

const AttendancePage = () => {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Employee Attendance & Leave</h1>

      {/* --- TOP SECTION: PROFILE CARD & CLOCK IN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Profile & Status Card (Spans 2 columns) */}
        <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h2 className="font-semibold text-lg">Lorem Ipsum Name</h2>
                <p className="text-gray-500 text-sm">Bartender</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <div className="flex items-center md:justify-end gap-2 mb-1">
                <span className="font-medium text-sm text-gray-700">Current Shift</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  On Shift
                </span>
              </div>
              <p className="text-sm text-gray-500">Morning Shift 09:00 AM - 06:00 PM</p>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="border border-red-200 rounded-xl p-3 text-center">
              <p className="font-semibold text-gray-900">09:14 AM</p>
              <p className="text-xs text-gray-500">Clock in</p>
            </div>
            <div className="border border-purple-200 rounded-xl p-3 text-center">
              <p className="font-semibold text-gray-900">3hr 12min</p>
              <p className="text-xs text-gray-500">Worked today</p>
            </div>
            <div className="bg-green-200/50 border border-green-300 rounded-xl p-3 text-center flex flex-col justify-center">
              <p className="font-semibold text-gray-900">Start</p>
              <p className="text-xs text-gray-900">Break</p>
            </div>
            <div className="border border-purple-200 rounded-xl p-3 text-center">
              <p className="font-semibold text-gray-900">07</p>
              <p className="text-xs text-gray-500">Leaves Left</p>
            </div>
          </div>
        </div>

        {/* Clock In Card */}
        <div className="border border-purple-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 text-purple-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </div>
          <p className="text-gray-600 font-medium">Tuesday, Feb 1, 2025</p>
          <p className="text-xl font-bold text-gray-900 mb-6">09:14 PM</p>
          <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity">
            Clock In
          </button>
        </div>
      </div>

      {/* --- BOTTOM SECTION: HISTORY, ATTACHMENTS, SIDEBAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (History + Attachments + Approval) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-700">Attendance History</div>
            <div className="bg-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-500">Leave status</div>
            <button className="ml-auto border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-gray-50">
              Apply Leave
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-pink-100/50 grid grid-cols-5 p-4 text-xs font-medium text-gray-700">
              <div>Date</div>
              <div className="text-center">Check-in ↓</div>
              <div className="text-center">Check-Out ↓</div>
              <div className="text-center">Over Time/ Under Time ↓</div>
              <div className="text-right">Total Login</div>
            </div>
            
            <div className="grid grid-cols-5 p-4 text-sm text-gray-800 border-b border-gray-100 items-center">
              <div>01 Jan 2025</div>
              <div className="text-center">10:18</div>
              <div className="text-center">10:18</div>
              <div className="text-center text-green-600 font-medium">+ 2 hrs : 06 min</div>
              <div className="text-right font-medium">4 hrs : 16 min</div>
            </div>
            
            <div className="grid grid-cols-5 p-4 text-sm text-gray-800 items-center">
              <div>01 Jan 2025</div>
              <div className="text-center">10:18</div>
              <div className="text-center">10:18</div>
              <div className="text-center text-red-500 font-medium">- 2 hrs : 06 min</div>
              <div className="text-right font-medium">4 hrs : 16 min</div>
            </div>
          </div>

          {/* Lower Grid: Attachments + Manager Approval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Attachment */}
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold mb-1">Attachment</h3>
              <p className="text-xs text-gray-500 mb-4">Lorem ipsum is simply dummy text.</p>
              
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50/50">
                <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop file here</p>
                <p className="text-xs text-gray-400 mb-3">Or</p>
                <button className="border border-purple-800 text-purple-900 text-xs font-semibold px-4 py-1.5 rounded hover:bg-purple-50 mb-3">
                  Browse File
                </button>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
              </div>
              
              <button className="w-full mt-4 bg-gradient-to-r from-purple-800 to-pink-600 text-white py-2 rounded-lg font-medium text-sm">
                Send
              </button>
            </div>

            {/* Manager Approval */}
            <div className="border border-gray-200 rounded-xl p-5 flex flex-col">
              <h3 className="font-semibold mb-1">Manager Approval</h3>
              <p className="text-xs text-gray-500 mb-4">Needs the manager's approval</p>
              
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Manager" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">Michael Brown</p>
                  <p className="text-xs text-gray-500">Restaurant Manager</p>
                </div>
              </div>

              <div className="bg-green-100/50 border border-green-200 rounded-lg p-4 flex-1">
                <p className="text-sm font-medium text-gray-800 mb-1">Pending Approval</p>
                <p className="text-xs text-gray-600">Lorem ipsum is simply dummy text.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Leave Balance */}
          <div className="border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-pink-100 p-2 rounded-lg text-pink-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Leave Balance</p>
                <p className="text-xs text-gray-500">Annual Leave Remaining</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">7 days</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-900 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border border-red-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg text-pink-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <p className="text-sm font-semibold">Emergency Contact</p>
              </div>
              <div className="w-8 h-5 bg-pink-400 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>+1 987 654 3210</span>
              </div>
              <div className="pl-7 text-gray-500 text-xs">
                John Doe
              </div>
              
              <div className="flex items-center gap-3 text-gray-700 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span className="text-xs">John.doe@example.com</span>
              </div>
               <div className="pl-7 text-gray-500 text-xs">
                Email
              </div>
            </div>

            <button className="w-full mt-5 border border-purple-800 text-purple-900 py-2 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors">
              Edit Contact
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;