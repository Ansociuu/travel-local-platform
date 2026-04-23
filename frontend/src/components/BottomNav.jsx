function BottomNav({ view, onNavigate }) {
  if (view === 'home') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-24 pb-safe bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <button 
        onClick={() => onNavigate('home')} 
        className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-200 cursor-pointer border-none bg-transparent ${view === 'home' ? 'bg-blue-50 text-blue-700 rounded-2xl' : 'text-gray-400'}`}
      >
        <span className="material-symbols-outlined fill">explore</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold mt-1">Khám phá</span>
      </button>
      <button 
        onClick={() => onNavigate('homestays')} 
        className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-200 cursor-pointer border-none bg-transparent ${view === 'homestays' ? 'bg-blue-50 text-blue-700 rounded-2xl' : 'text-gray-400'}`}
      >
        <span className="material-symbols-outlined">luggage</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold mt-1">Homestay</span>
      </button>
      <button 
        onClick={() => onNavigate('community')}
        className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-200 cursor-pointer border-none bg-transparent ${view === 'community' ? 'bg-blue-50 text-blue-700 rounded-2xl' : 'text-gray-400'}`}
      >
        <span className="material-symbols-outlined">group</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold mt-1">Cộng đồng</span>
      </button>
      <button 
        onClick={() => onNavigate('translate')}
        className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-200 cursor-pointer border-none bg-transparent ${view === 'translate' ? 'bg-blue-50 text-blue-700 rounded-2xl' : 'text-gray-400'}`}
      >
        <span className="material-symbols-outlined">chat_bubble</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold mt-1">Tin nhắn</span>
      </button>
      <button 
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-200 cursor-pointer border-none bg-transparent ${view === 'profile' ? 'bg-blue-50 text-blue-700 rounded-2xl' : 'text-gray-400'}`}
      >
         <span className="material-symbols-outlined">person</span>
         <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold mt-1">Hồ sơ</span>
      </button>
    </nav>
  );
}

export default BottomNav;
