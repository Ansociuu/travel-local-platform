function Navbar({ view, onNavigate }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm font-['Plus_Jakarta_Sans']">
      <div className="flex justify-between items-center h-16 px-6 lg:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('home')}
            className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 cursor-pointer outline-none border-none bg-transparent"
          >
            Globetrot
          </button>
          <div className="hidden md:flex gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`font-semibold transition-all px-2 py-1 rounded-md active:scale-95 cursor-pointer border-none bg-transparent ${view === 'home' ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-slate-600 hover:text-blue-500'}`}
            >
              Khám phá
            </button>
            <button
              onClick={() => onNavigate('homestays')}
              className={`transition-all px-2 py-1 rounded-md active:scale-95 cursor-pointer border-none bg-transparent ${view === 'homestays' ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-slate-600 hover:text-blue-500'}`}
            >
              Homestay
            </button>
            <button
              onClick={() => onNavigate('experiences')}
              className={`transition-all px-2 py-1 rounded-md active:scale-95 cursor-pointer border-none bg-transparent ${view === 'experiences' ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-slate-600 hover:text-blue-500'}`}
            >
              Trải nghiệm
            </button>
            <button
              onClick={() => onNavigate('community')}
              className={`transition-all px-2 py-1 rounded-md active:scale-95 cursor-pointer border-none bg-transparent ${view === 'community' ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-slate-600 hover:text-blue-500'}`}
            >
              Cộng đồng
            </button>
            <button
              onClick={() => onNavigate('translate')}
              className={`transition-all px-2 py-1 rounded-md active:scale-95 cursor-pointer border-none bg-transparent ${view === 'translate' ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-slate-600 hover:text-blue-500'}`}
            >
              Tin nhắn
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center border-none bg-transparent">
            <span className="material-symbols-outlined">language</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`transition-colors cursor-pointer flex items-center border-none bg-transparent ${view === 'profile' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="hidden md:inline-flex text-slate-600 dark:text-slate-400 hover:text-blue-500 font-label-md cursor-pointer border-none bg-transparent"
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="hidden md:inline-flex bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-surface-tint transition-colors cursor-pointer border-none"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
