import { useState } from 'react';

function Profile() {
  const [activeTab, setActiveTab] = useState('bookings');

  const bookings = [
    {
      id: 1,
      title: 'Hoi An Ancient Boutique',
      date: '12 - 15 Thg 8, 2023',
      location: 'Quảng Nam, Việt Nam',
      price: '2.400.000 ₫',
      status: 'HOÀN THÀNH',
      statusType: 'completed',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiiNHz2k7BM4X4lEgHsx3uXdiukWJAt2X6gopXns60sSb0GRY96ul8qVvU_VL85mJCSYogks50bTd4onlA9xn6HWYXLvtT8Wa6KqFO70t6OkbRrFkshQJJxpn9tk5gJPR-D__tDMJNnwocYqZPddK4vsxk788p-aTRR891APoGYcG7XKAih20zt-JYqww3d7exrp7MDva1kVFv0UhzdNZskvN1cwBREt6mrkYXYrWwsiBvL7cf7iM3rzkVsZJ8dIFY8X4NK0ei0xgM'
    },
    {
      id: 2,
      title: 'Chiang Mai Eco Lodge Retreat',
      date: '05 - 08 Thg 11, 2023',
      location: 'Chiang Mai, Thái Lan',
      price: '4.150.000 ₫',
      status: 'SẮP TỚI',
      statusType: 'upcoming',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn9oTRPo3m4kPEfzF9EIiT65U7KLDYM3P8Q1NSTpMRbWulshuJpHme8Dw6UcwUnjbmZ2oP2Ho_A_oVtasQSUhkb7mVkdLCKGotVT7VPeyg7tP9yqml4eqwYf7F2kQti8bE53BDYM2ZniwExT76uk6kO5QnvP1cfOBvD8o0AkCVJ04bIW9l4OfERgVSkaGpsLM6kFIhwKV-CiMQQ8Wb8RPbmVhtEyV4tGQcqgKq533si72ut_v_Ci5n8MENOGdNvDbidvlZcC-153UM'
    }
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-32 md:pb-12 text-left font-['Plus_Jakarta_Sans']">
      {/* Profile Header Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Main Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-white dark:border-slate-800 shadow-md">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXpajbpUK5KqVquPbeg_LOyDJgw08qPraBh5GemlhQuOjKVXKt_3Py52frfn6jFKhlMZJY2SJypJSWZCuXH6EGw3ViJpDlKwWXmr3XLQ53YenZKFi2v9pCp23CI1MiH-fkXb5PckL3UfibYsN54IkiSKWXCJ9kNoxqsXA4udb9KVXKzjE6w8W2v2-hRpmhU1uRKVNx9cwoP9XOuOWBR-bF2nruXpdtFFTkqRWyGUx5bBWi7U3YHqJsgIG3yLOdZp4R5ToRRbQPocjn" 
            />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Xin chào, Linh!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">Kẻ lữ hành am hiểu. Khám phá Việt Nam qua những quán cà phê. Đam mê du lịch bền vững và những trải nghiệm đậm chất địa phương.</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer border-none active:scale-95 shadow-sm shadow-blue-200">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Settings Column */}
        <div className="flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60 text-center flex flex-col items-center justify-center aspect-square transition-transform hover:scale-105">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">24</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chuyến đi</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60 text-center flex flex-col items-center justify-center aspect-square transition-transform hover:scale-105">
              <span className="text-2xl font-black text-orange-500 mb-1">1.2k</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Người theo dõi</span>
            </div>
          </div>
          {/* Settings Block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex-1 flex flex-col justify-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Ngôn ngữ ưu tiên</label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-semibold rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs Area */}
      <div className="mb-10 overflow-x-auto no-scrollbar">
        <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 gap-10 min-w-max px-2">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap px-4 cursor-pointer bg-transparent ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-500 border-none'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'bookings' ? 'fill' : ''}`}>luggage</span>
            Lịch sử đặt chỗ
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap px-4 cursor-pointer bg-transparent ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-500 border-none'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'posts' ? 'fill' : ''}`}>article</span>
            Bài viết đã đăng
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`pb-4 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap px-4 cursor-pointer bg-transparent ${activeTab === 'wishlist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-500 border-none'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'wishlist' ? 'fill' : ''}`}>favorite</span>
            Wishlist
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'bookings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-row group hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="w-1/3 min-w-[140px] relative overflow-hidden">
                  <img alt={booking.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={booking.image} />
                  <div className={`absolute top-3 left-3 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm tracking-wider transition-colors ${booking.statusType === 'completed' ? 'bg-white/90 text-blue-600' : 'bg-orange-500/90 text-white'}`}>
                    {booking.status}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{booking.date}</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase">{booking.title}</h3>
                    <div className="text-sm text-slate-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-500">location_on</span>
                      {booking.location}
                    </div>
                  </div>
                  <div className="mt-5 flex justify-between items-end">
                    <div className="text-base font-black text-slate-900 dark:text-white">{booking.price}</div>
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-transparent border-none">
                      {booking.statusType === 'completed' ? 'Xem chi tiết' : 'Quản lý'}
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-400">edit_note</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-2">Bạn chưa có bài viết nào</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">Hãy chia sẻ những trải nghiệm du lịch thú vị của bạn với cộng đồng!</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold border-none cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Đăng bài ngay</button>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-rose-400">favorite</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-2">Danh sách yêu thích trống</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">Lưu lại những địa điểm tuyệt vời để lên kế hoạch cho chuyến đi tiếp theo!</p>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold border-none cursor-pointer hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">Khám phá ngay</button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
