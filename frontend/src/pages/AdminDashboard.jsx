import { useState } from 'react';

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '$124,500',
      change: '+12.5%',
      isPositive: true,
      icon: 'payments',
      color: 'blue',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      chartPath: 'M0,30 L0,15 Q10,25 20,10 T40,20 T60,5 T80,15 T100,0 L100,30 Z'
    },
    {
      title: 'Tổng booking',
      value: '1,284',
      change: '+8.2%',
      isPositive: true,
      icon: 'book_online',
      color: 'orange',
      bg: 'bg-orange-50',
      textColor: 'text-orange-600',
      chartPath: 'M0,30 L0,20 Q15,5 30,15 T60,25 T80,10 T100,5 L100,30 Z'
    },
    {
      title: 'User mới',
      value: '342',
      change: '-2.1%',
      isPositive: false,
      icon: 'person_add',
      color: 'green',
      bg: 'bg-green-50',
      textColor: 'text-green-600',
      chartPath: 'M0,30 L0,5 L20,20 L40,10 L60,25 L80,15 L100,20 L100,30 Z'
    }
  ];

  const recentBookings = [
    {
      id: '#BK-9284',
      customer: 'Nguyễn Thị Mai',
      product: 'Sunset Villa, Hội An',
      date: '12/10/2023',
      amount: '$450.00',
      status: 'Hoàn thành',
      statusType: 'completed',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzEYZNfrKdFUwB1vRpUwoluF0kuxaIMK2BEdilzH-0b04akPwfd8Q9XYDFnZT3XAABUZ9J7we_3-Z-N5CeviT3BrfTVbfnjNxj3K_kxbkfTQud4FfILKIMTKf0k3mH2QoeF4ZqqdEKFbQM6g5v-otztL-GQJEeHLPRgdcPARST98U_ZQNoiNFDNXi7M3VDCRqVgLad0LHcNFyeUS38l9lmOWMtDLc4T9wISst3ZqIuEDGcMtXi3eTxBP8AOxt37yTvRwZYSLwQ1v_I'
    },
    {
      id: '#BK-9285',
      customer: 'Trần Văn Nam',
      product: 'Tour Lặn Biển Phú Quốc',
      date: '14/10/2023',
      amount: '$120.00',
      status: 'Chờ xác nhận',
      statusType: 'pending',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcEWctQg0FvCGWBfmDCX3ZWmZBXgvVxAhfdSg7bb96JdVmSsuNepGfpkUpxnAjH-MZGFbqUg5Mz3VoF1hyKATuUoIp1TDbpT-vFHcZ_-_W8tHze2NpROX2jPPpeQDJuIQTRS-t06DPeWL7R-xeWnhsy_CSDd7uyYDwP0BTkDY5j6pnjylK-cy-qCtpa11CCKrh9y2g4PYwh3QBZHhqiPUx8FgwLnHXews_2Ci5YpSfBoQsHtECIWeqtbwGLFp68IIW0wKf85axVUXs'
    },
    {
      id: '#BK-9286',
      customer: 'Lê Hoàng Linh',
      product: 'Sapa Cloud Cabin',
      date: '15/10/2023',
      amount: '$320.00',
      status: 'Đã hủy',
      statusType: 'cancelled',
      avatar: null // Will show initial
    },
    {
      id: '#BK-9287',
      customer: 'Phạm Thu Hương',
      product: 'Đà Lạt Pine Tree House',
      date: '16/10/2023',
      amount: '$210.00',
      status: 'Đã thanh toán',
      statusType: 'paid',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDcDnmurLT0bgyNlOKoz9dJP6THTTKVqX-fdrQwJPp7UlGADmk_pjXWIO9WhNE0L1LwHjlNGFiY6MZFJcuCvFXWVWmHdZAeVIQd0iXs8Hfb7k6GsjKPIs1Iz6NXGsVkDLnVYMEXM_Nn37hMwptaRfn3C9XQ-iHGUwFF8g9Fzbq9-kUern6IcEOzuxpRxZye4EKh9EetfsJvuxVXl5CZR4ZhzM_5dhnqpmBGYoaucwQbFPWUvFuvKmhvlYJQcVHXf93--wPYX38f8tb'
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans'] w-full">
      {/* SideNavBar */}
      <nav className="hidden md:flex h-full w-72 fixed left-0 border-r border-slate-200 bg-white shadow-sm z-40 flex-col py-10 gap-4">
        <div className="px-8 mb-10">
          <span className="text-2xl font-black text-blue-600 tracking-tighter">Globetrot Admin</span>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
            { id: 'users', icon: 'group', label: 'Quản lý User' },
            { id: 'homestays', icon: 'home', label: 'Quản lý Homestay' },
            { id: 'experiences', icon: 'explore', label: 'Quản lý Trải nghiệm' },
            { id: 'posts', icon: 'article', label: 'Quản lý Bài viết' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-bold border-none cursor-pointer ${
                activeMenu === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:pl-8'
              }`}
            >
              <span className={`material-symbols-outlined ${activeMenu === item.id ? 'fill' : ''}`}>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-8 mt-auto flex items-center gap-4 pt-6 border-t border-slate-100 text-left">
          <img 
            alt="Admin Avatar" 
            className="w-12 h-12 rounded-2xl object-cover shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnHlBYtwQmPn23qO6dzC80ITYNpaPVJBxqD2rf3Ra_1ygEj4vyltv0nSazo0mL_xMrImY1yQbdshw9G-_Pc_uYs9r_fQWnLXnV2D68MJVX4yZmEiiJGgM-q8OuwDGcqeACnkyLybfy4ZYz-aXlQf6fzKrE0MaSUiR-bsX-aPCtNff1YYMJDctCShAMI66suJ56YaEIhHisQjHOSeaedGYbegjQYuWvUCVSkxasDFAoytyGFsPy5uXXZsPB3rdOOoiiJveizsW2jXiA"
          />
          <div>
            <p className="font-bold text-slate-900 text-sm">Admin</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">System Admin</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-72 flex flex-col">
        {/* Top Bar */}
        <header className="flex justify-between items-center px-10 h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
          <h1 className="text-2xl font-black text-slate-900">Tổng quan Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input type="text" placeholder="Tìm kiếm hệ thống..." className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 w-64 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <button className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 bg-transparent border-none cursor-pointer relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="p-10 space-y-10 bg-slate-50/50">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
                <div className="flex justify-between items-start z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.title}</p>
                    <p className={`text-4xl font-black ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-orange-500' : 'text-green-600'}`}>{stat.value}</p>
                  </div>
                  <div className={`p-4 ${stat.bg} ${stat.textColor} rounded-2xl shadow-sm`}>
                    <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10 mt-auto">
                  <span className={`material-symbols-outlined text-sm font-bold ${stat.isPositive ? 'text-green-600' : 'text-rose-500'}`}>
                    {stat.isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  <span className={`text-sm font-black ${stat.isPositive ? 'text-green-600' : 'text-rose-500'}`}>{stat.change}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">so với tháng trước</span>
                </div>
                {/* SVG Background decoration */}
                <svg className={`absolute bottom-0 left-0 w-full h-24 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.08] pointer-events-none ${stat.textColor}`} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d={stat.chartPath} fill="currentColor"></path>
                </svg>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Phân tích hiệu suất</h2>
                  <p className="text-slate-400 text-sm font-bold mt-1">Dữ liệu doanh thu & booking 2024</p>
                </div>
                <select className="bg-slate-50 border-none text-slate-900 font-bold text-sm rounded-2xl py-3 px-6 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
                  <option>6 tháng qua</option>
                  <option>1 năm qua</option>
                </select>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4 pt-4 relative">
                <div className="w-full flex justify-around items-end h-full relative border-b border-slate-100 pb-2">
                  {[
                    { label: 'T1', h: '40%', subH: '30%' },
                    { label: 'T2', h: '60%', subH: '45%' },
                    { label: 'T3', h: '80%', subH: '55%' },
                    { label: 'T4', h: '50%', subH: '40%' },
                    { label: 'T5', h: '90%', subH: '70%' },
                    { label: 'T6', h: '75%', subH: '60%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center group w-full max-w-[40px]">
                      <div className="w-full bg-blue-100 rounded-2xl relative mb-4 transition-all duration-500 group-hover:bg-blue-200" style={{ height: bar.h }}>
                        <div className="absolute bottom-0 w-full bg-blue-600 rounded-2xl transition-all duration-700 delay-100" style={{ height: bar.subH }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Status / Recent Activity */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-8">Trạng thái hệ thống</h2>
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-white">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 text-sm">Máy chủ chính</p>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">Hoạt động tốt 99.9%</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-white">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl font-bold">cloud_sync</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 text-sm">Backup dữ liệu</p>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-tighter">Lần cuối: 2h trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-white">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl font-bold">security</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 text-sm">Tường lửa (WAF)</p>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Đã chặn 1.2k yêu cầu</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-10 bg-slate-900 text-cyan-50 font-black text-xs uppercase tracking-widest py-5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 border-none cursor-pointer">
                Quản lý hạ tầng
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Danh sách booking gần đây</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">Cập nhật thời gian thực</p>
              </div>
              <button className="bg-slate-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all border-none cursor-pointer flex items-center gap-2">
                Xem tất cả <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-10 py-6 border-b border-slate-50">ID</th>
                    <th className="px-6 py-6 border-b border-slate-50">Khách hàng</th>
                    <th className="px-6 py-6 border-b border-slate-50">Sản phẩm</th>
                    <th className="px-6 py-6 border-b border-slate-50">Ngày</th>
                    <th className="px-6 py-6 border-b border-slate-50">Tổng tiền</th>
                    <th className="px-10 py-6 border-b border-slate-50 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 text-sm">
                  {recentBookings.map((bk, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-50/40 last:border-0 group cursor-pointer">
                      <td className="px-10 py-6 font-bold text-slate-400 group-hover:text-blue-600 transition-colors">#{bk.id}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          {bk.avatar ? (
                            <img alt={bk.customer} className="w-10 h-10 rounded-2xl object-cover shadow-sm" src={bk.avatar} />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">{bk.customer.charAt(0)}</div>
                          )}
                          <span className="font-bold text-slate-900">{bk.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-slate-600">{bk.product}</td>
                      <td className="px-6 py-6 text-slate-400 font-bold">{bk.date}</td>
                      <td className="px-6 py-6 font-black text-slate-900">{bk.amount}</td>
                      <td className="px-10 py-6 text-center">
                        <span className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                          bk.statusType === 'completed' ? 'bg-green-100 text-green-600' :
                          bk.statusType === 'pending' ? 'bg-orange-100 text-orange-600' :
                          bk.statusType === 'cancelled' ? 'bg-slate-100 text-slate-400' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
