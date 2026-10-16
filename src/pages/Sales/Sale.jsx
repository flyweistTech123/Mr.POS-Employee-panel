import React from 'react';

function Sale() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <h1 className="text-2xl font-bold tracking-tight">Sales Performance</h1>

        {/* --- Top Hero Card --- */}
        <div className="bg-[#fdf2f8] rounded-2xl p-6 shadow-sm border border-pink-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#6b21a8] mb-1">23,300.00 XOF</h2>
              <p className="text-gray-500 font-medium">Today</p>
            </div>
            <button className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
              Today
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-green-600">Upsell Revenue:</span>
              <span className="text-gray-800">₣ 23,300.00</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>•</span>
              <span>Tips:</span>
              <span className="text-gray-800">₣ 2,300.00</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>•</span>
              <span>Customer Satisfaction:</span>
              <span className="text-gray-800 flex items-center gap-1">
                <span className="text-yellow-500 text-lg leading-none">★</span> 4.5
              </span>
            </div>
          </div>
        </div>

        {/* --- Middle Section: Productivity & Reviews --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Productivity Cards Container */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg">Productivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                <h4 className="font-semibold text-sm mb-4">Orders Taken</h4>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold tracking-tight">46</span>
                  <span className="text-gray-400 font-medium mb-1">/60</span>
                </div>
                <p className="text-xs text-green-500 font-medium">Order Completed</p>
                {/* Decorative colored bottom borders matching screenshot */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-green-400"></div>
                  <div className="flex-1 bg-red-300"></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                <h4 className="font-semibold text-sm mb-4">Items sold</h4>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold tracking-tight">46</span>
                </div>
                <p className="text-xs text-orange-500 font-medium">Dish Sold</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-orange-300"></div>
                  <div className="flex-1 bg-red-300"></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                <h4 className="font-semibold text-sm mb-4">Average Order <br/> Value</h4>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold tracking-tight">2,300 XOF</span>
                </div>
                <p className="text-xs text-purple-500 font-medium underline decoration-purple-200">Avg Check Amounts</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-purple-300"></div>
                  <div className="flex-1 bg-red-300"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Customer Reviews</h3>
            <div className="space-y-3">
              {[
                { stars: 5, count: 200, width: 'w-[80%]', color: 'bg-red-500' },
                { stars: 4, count: 120, width: 'w-[45%]', color: 'bg-red-500' },
                { stars: 3, count: 5, width: 'w-[5%]', color: 'bg-red-500' },
                { stars: 2, count: 0, width: 'w-0', color: 'bg-red-500' },
                { stars: 1, count: 0, width: 'w-0', color: 'bg-red-500' },
              ].map((row) => (
                <div key={row.stars} className="flex items-center text-sm gap-3">
                  <span className="w-6 font-medium text-gray-600">{row.stars} <span className="text-yellow-500">★</span></span>
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full ${row.width}`}></div>
                  </div>
                  <span className="w-8 text-right text-gray-500 text-xs">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Third Section: KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-semibold mb-2">Total Sales</h4>
            <p className="text-3xl font-bold mb-1">1,142 XOF</p>
            <p className="text-xs text-orange-500">+18% vs yesterday</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-semibold mb-2">Tips Earned</h4>
            <p className="text-3xl font-bold mb-1">87.50 XOF</p>
            <p className="text-xs text-purple-500">Avg 7.7%</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-semibold mb-2">Upsells</h4>
            <p className="text-3xl font-bold mb-1">9</p>
            <p className="text-xs text-purple-500">$142 extra revenue</p>
          </div>
        </div>

        {/* --- Bottom Section: Lists --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Top Items Sold Today</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <span className="font-semibold">Wagyu Burger</span>
                <span className="text-sm font-medium text-red-500">x6 - $144</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <span className="font-semibold">Truffle Fries</span>
                <span className="text-sm font-medium text-red-500">x12 - $114</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <span className="font-semibold">Grilled Salmon</span>
                <span className="text-sm font-medium text-red-500">x5 - $110</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <span className="font-semibold">Mango Lemonade</span>
                <span className="text-sm font-medium text-red-500">x4 - $70</span>
              </div>
            </div>
          </div>

          {/* Loyalty Enrollments */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Loyalty Enrollments</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center h-[68px]">
                <span className="font-semibold">New Customers Signed Up</span>
                <span className="text-xs font-bold text-white bg-green-400 px-3 py-1 rounded-full">3 today</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center h-[68px]">
                <span className="font-semibold">Avg Feedback Rating</span>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  4.8/5 <span className="text-red-500 text-lg leading-none">★</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Sale;