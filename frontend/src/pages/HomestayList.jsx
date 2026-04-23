function HomestayList({ onNavigate }) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Search Bar for Homestay List Header */}
      <div className="hidden md:flex sticky top-[64px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-[1440px] mx-auto w-full px-margin-desktop flex justify-start">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
            <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-label-md font-label-md focus:border-primary focus:ring-1 focus:ring-primary outline-none w-96 transition-all" placeholder="Tìm kiếm điểm đến..." type="text"/>
          </div>
        </div>
      </div>

      <main className="flex-1 flex w-full max-w-[1440px] mx-auto pt-6 px-4 md:px-margin-desktop gap-gutter mb-24 md:mb-12 relative text-left">
        {/* Filter Sidebar (Left) */}
        <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-[144px] bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
          <h2 className="font-headline-md text-headline-md mb-6 text-on-surface">Bộ lọc</h2>
          
          <div className="mb-8">
            <h3 className="font-label-md text-label-md font-semibold mb-4 text-on-surface">Khoảng giá (1 đêm)</h3>
            <div className="flex items-center gap-2 mb-4">
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md font-label-md outline-none" placeholder="Từ" type="text"/>
              <span className="text-on-surface-variant">-</span>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md font-label-md outline-none" placeholder="Đến" type="text"/>
            </div>
            <div className="h-1 bg-surface-variant rounded-full relative mt-6">
              <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"></div>
              <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm"></div>
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>
          
          <hr className="border-outline-variant mb-6"/>
          
          <div className="mb-8">
            <h3 className="font-label-md text-label-md font-semibold mb-4 text-on-surface">Loại chỗ ở</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
                <span className="font-body-md text-body-md text-on-surface">Toàn bộ nhà</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
                <span className="font-body-md text-body-md text-on-surface">Phòng riêng</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
                <span className="font-body-md text-body-md text-on-surface">Phòng chung</span>
              </label>
            </div>
          </div>
          
          <hr className="border-outline-variant mb-6"/>
          
          <div className="mb-6">
            <h3 className="font-label-md text-label-md font-semibold mb-4 text-on-surface">Đánh giá của khách</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="border-outline-variant text-primary focus:ring-primary w-5 h-5" name="rating" type="radio"/>
                <div className="flex items-center text-secondary-container">
                  <span className="material-symbols-outlined text-lg fill">star</span>
                  <span className="font-body-md text-body-md text-on-surface ml-1">Tuyệt vời: 4.5+</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="border-outline-variant text-primary focus:ring-primary w-5 h-5" name="rating" type="radio"/>
                <div className="flex items-center text-secondary-container">
                  <span className="material-symbols-outlined text-lg fill">star</span>
                  <span className="font-body-md text-body-md text-on-surface ml-1">Rất tốt: 4.0+</span>
                </div>
              </label>
            </div>
          </div>
          
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-on-primary-fixed-variant transition-colors mt-4 cursor-pointer border-none">Áp dụng</button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header & Toggle Map */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Chỗ ở tại Đà Lạt</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Hơn 300 chỗ ở tuyệt vời dành cho bạn</p>
            </div>
            <button className="flex items-center gap-2 bg-surface-container-highest hover:bg-surface-dim text-on-surface font-label-md text-label-md px-4 py-2 rounded-full transition-colors border border-outline-variant shadow-sm cursor-pointer border-none">
              <span className="font-semibold">Xem trên bản đồ</span>
              <span className="material-symbols-outlined">map</span>
            </button>
          </div>

          {/* Mobile Filter Chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-2">
            <button className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap cursor-pointer">
              <span className="material-symbols-outlined text-sm">tune</span> Bộ lọc
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap cursor-pointer">Giá</button>
            <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap cursor-pointer">Loại chỗ ở</button>
          </div>

          {/* Homestay Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <article key={i} onClick={() => onNavigate('detail')} className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-variant hover:shadow-md transition-all cursor-pointer text-left">
                <div className="aspect-[4/3] relative overflow-hidden bg-surface-variant">
                  <img 
                    alt="Homestay" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={i % 2 === 0 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Pg42KqQW00wyTIrPKSgZ4F1t_C1s4KM7xD8ZKC2P0QqoxYod56UukVYZNKKl5d2j0iyBd7q1LkG_tLrw5FY_8vo2O9MZ_QmGtZ81m6WurLZ5d_TtnhYEAzbityinnj8iQtML1Y8aGYoy0tvsDVByTL1xHpKFwsTRHyEWCwnXXIUfXfYXjnNBfzD5YfO18mDMCjjdzZ5w979--Xkd9oDDn71pewkrLZzlGbj8wUlCgArxVwYKqEwrDRIpmr1zS4kO-ll9CDEGYkbw" : "https://lh3.googleusercontent.com/aida-public/AB6AXuAyWX2RnaAkx58_lEO7y3_zpaSQbsugqAbkahoL6weD0tr82UXbLKIgegKtjM5XBtNS1kA3qW5yGxGXsAyzZbX2XJby1HBnmUq0L7Y3O_A4FbSqJ1kadppqsvwSKiuW5VXYTps8Aay_nu1pQ3mscZWHOTbZnnrRT3GehgS2nzhcDRhEbSZIg6-6FxkTzAa_sp-VftFI6aGrhIUbs43RJKqp8F4luiBIWgyaT1CzfGt0DIKiojQtiNu_UokkNrDzoFEJUEJQH0jwxWDq"} 
                  />
                  <button className="absolute top-3 right-3 text-white hover:text-secondary-container transition-colors cursor-pointer border-none bg-transparent">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                  {i === 2 && <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-xs font-bold text-on-surface">Khách yêu thích</div>}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-label-md text-label-md font-bold text-on-surface truncate pr-2">Pine View Retreat {i}</h3>
                    <div className="flex items-center gap-1 text-secondary-container shrink-0">
                      <span className="material-symbols-outlined text-sm fill">star</span>
                      <span className="font-label-sm text-label-sm text-on-surface">4.9</span>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">Toàn bộ nhà • 2 giường</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface">1.200.000₫</span>
                      <span className="font-body-md text-body-md text-on-surface-variant text-sm"> /đêm</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-6 py-3 rounded-lg transition-colors cursor-pointer bg-transparent">Tải thêm</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomestayList;
