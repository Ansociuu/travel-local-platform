function Home({ onNavigate }) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[819px] min-h-[600px] flex items-center justify-center text-left">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Majestic limestone karsts in Ha Long Bay at golden hour" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC1B8iNqZW9uQLtd9IFKHQwLio1GSf1o8rFbZEMsKgC0JW9BwUiUHqXEEnNPyadJm0i_2E4_KvewlNQ6i3axEFq6XtCr3vW3P52wUivOSUIV-yL6NLe0J1NMbQJivqlUybE1ZmOGvErbotVFsBMgXcnZjFBN9UfsdSwGJLm6WNEiaU1hdruwK8iy-inVNrJmCNIHErjTSCvjH4tJmUAuXttUrXcwGLsNS4kEJlrl-GV-JgP8ug28ZyEqOHmnt5l8sr50ZoseMIJvwD" 
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
          <h1 className="font-display-lg text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg text-center">Khám phá Việt Nam cùng Globetrot</h1>
          <p className="font-body-lg text-xl md:text-2xl font-bold text-white mb-10 max-w-3xl drop-shadow-md text-center">Tìm kiếm những điểm đến tuyệt vời, chỗ ở độc đáo và trải nghiệm khó quên cho chuyến đi tiếp theo của bạn.</p>
          <div className="w-full bg-surface rounded-xl p-2 shadow-lg flex flex-col md:flex-row gap-2">
            <div className="flex-grow flex items-center bg-surface-container-low rounded-lg px-4 py-3 border border-outline-variant focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-3 shrink-0">location_on</span>
              <input className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-outline outline-none" placeholder="Bạn muốn đi đâu?" type="text" />
            </div>
            <div className="flex-grow flex items-center bg-surface-container-low rounded-lg px-4 py-3 border border-outline-variant focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-3 shrink-0">calendar_month</span>
              <input className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-outline outline-none" placeholder="Ngày đi - Ngày về" type="text" />
            </div>
            <div className="flex-grow flex items-center bg-surface-container-low rounded-lg px-4 py-3 border border-outline-variant focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-3 shrink-0">person</span>
              <input className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-outline outline-none" placeholder="Số khách" type="text" />
            </div>
            <button
                onClick={() => onNavigate('homestays')}
                className="bg-secondary-container text-white px-8 py-3 rounded-lg font-label-md hover:bg-[#e67300] transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer border-none"
            >
              <span className="material-symbols-outlined mr-2">search</span> Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Trending Destinations Section */}
      <section className="py-xl bg-surface px-6 md:px-margin-desktop max-w-[1440px] mx-auto w-full text-left">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Địa điểm Hot & Trending</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Những địa điểm thu hút du khách nhất hiện nay.</p>
          </div>
          <button className="text-primary font-label-md flex items-center hover:underline cursor-pointer border-none bg-transparent p-0">
            Xem tất cả <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Card 1 */}
          <div className="group cursor-pointer">
            <div className="relative h-72 rounded-xl overflow-hidden mb-3">
              <img alt="Hà Giang" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsEamC16ZYNKqM_ITQys3f8j_V5JVIPO5EL7U1wDXVpfkN4SaLtxT6RUfxa4giw0BLZ12Jmpe-W2fr20yU-ilCdb7ECPDNzUl7blCInZp4maxxbzHzhemWyoKsRdx5M5RJbVvENFaOLI4rRd2szuJylnyikJqA67MN1YljPJHGx095QHK23MOs-dEFt3nn6z3aF-ExyHis2rqHmp27BeCW7TVToJY5zbzgQxG61BSYMqWKm3Fp4H8iGcIbcR8l-TUgsFAUpwDjhscV" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-error text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-md">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> Trending
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-headline-md text-headline-md text-white mb-1 drop-shadow-md">Hà Giang</h3>
                <p className="text-white/90 text-sm flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">group</span> 150k+ du khách tuần này</p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="group cursor-pointer">
            <div className="relative h-72 rounded-xl overflow-hidden mb-3">
              <img alt="Hội An" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB80wDRtBubMWIYYSK5nDjtpbY_BVg8f1RepzJiB0j6yzgEisXHj4jzjfLBogzgb70EzcQMpe7S40NJlHwsly4R7UCGV0-PRzigS6h-YFW-wWeFVBqHK0aLz2tQ2ZynAfFFq--QQKMu5OSvmv4B7lCAqAaohmnpV_PKOOFqPUPKPRhXQzNapjoZBcgoJD1XE5DiPWrK7zJ76MnJv_1RhDbkZblTOOBA1hJKd7U-jrE8aPTj6y1Vbd1kcPTFnh6g-X3s2fN-E34h_iAw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-secondary-container text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-md">
                <span className="material-symbols-outlined text-[14px] mr-1">local_fire_department</span> Phổ biến
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-headline-md text-headline-md text-white mb-1 drop-shadow-md">Phố cổ Hội An</h3>
                <p className="text-white/90 text-sm flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">group</span> 200k+ du khách tuần này</p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="group cursor-pointer">
            <div className="relative h-72 rounded-xl overflow-hidden mb-3">
              <img alt="Nha Trang" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQFq4XXC1vhGJGdgebKB1VvgdYvmBOGTfaNV6Dld0hZsi5gCkBeEsMbzmuRqeJApTL10TOpqOsQynBqTg-29Rf04C2pKhXAfWfEKoy8xJItfPZzoOyp-JbEBWH0b6jJNHG_fLieFKrJ8oNMw5DXHxlFN1HpgXl_5IPxLCChQYZKePZvpzMOWzQoOh3HT_IOLqduADEOHuhzPoknKyFVo1i34sdnmVG6B44Z172U3A1X9scoq-JkV_gunAo6wfxUHTe9Ad_-Ht-OVXX" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-md">
                <span className="material-symbols-outlined text-[14px] mr-1">star</span> Lựa chọn hàng đầu
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-headline-md text-headline-md text-white mb-1 drop-shadow-md">Nha Trang</h3>
                <p className="text-white/90 text-sm flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">group</span> 120k+ du khách tuần này</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences & Seasonal omitted for brevity in this step, but I should include them if I want to match App.jsx perfectly */}
      {/* I will include the rest of the sections to maintain parity */}
      
      {/* Featured Experiences Section */}
      <section className="py-xl bg-surface-container-low px-6 md:px-margin-desktop max-w-[1440px] mx-auto w-full text-left">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Trải nghiệm nổi bật</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Khám phá văn hóa và hoạt động độc đáo tại mỗi điểm đến.</p>
          </div>
          <button className="text-primary font-label-md flex items-center hover:underline cursor-pointer border-none bg-transparent p-0">
            Xem tất cả <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Example Card */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-outline-variant/30 flex flex-col h-full text-left">
            <div className="relative h-56 overflow-hidden">
              <img alt="Trekking Sapa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7236AaYeDBjT7N_2tUpH5FDKyuECsW_6oJXFmr3UCMx46xVUnmiwSEg4vCU0Q32-4zXIF-3QyZPdLf_L9B_fyGW8m96rca1dFDbD4GsjX7MUyi6CqZNpO_6gkBRRIesoS9mxyFvxCqFy15GAa4tTMw-S1c3_Dnp24TjFM6eN5VqTW8PbAzhnYu_PzozYpXBHzAntOq0L9Ui293HG6qemo_p-WsRZ9dHNhGY6KVFZkOAcrecqLD012gyrMagcyoKWYsoaWJNren16z" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded-full shadow-sm">Phiêu lưu</div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-headline-md text-[20px] text-on-surface mb-2 group-hover:text-primary transition-colors">Trekking Sapa</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">Khám phá những bản làng xa xôi và chiêm ngưỡng ruộng bậc thang hùng vĩ cùng người bản địa.</p>
              <div className="mt-auto">
                <div className="flex items-center text-secondary-container font-label-sm mb-3">
                  <span className="material-symbols-outlined text-[16px] fill">star</span>
                  <span className="ml-1">4.9 (120 đánh giá)</span>
                </div>
                <p className="font-label-md text-label-md"><span className="font-bold text-lg text-on-surface">Từ 500,000₫</span> / người</p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-outline-variant/30 flex flex-col h-full text-left">
            <div className="relative h-56 overflow-hidden">
              <img alt="Cooking Class Hue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdBa9U-2EKzOlD4xNm3w2tsYGiCxR5RLugmlbMC86mL41P5HJffdm319YyxjH7UzMMrv872rk2Dyznw8XLxsNZ3pg91kA1ZVaOJe5ZsMrIhA-mb6QAlJ-KnP8muJoiXf8m3pLDt_BwrEW4R0_x9Dw6a_wBEjeZn7FwOSCmsoQAZbQSJvaNaxwjG30gi3QRxktSamnEUmLyLxvH2YUM6-8MlOwMeQP-KFSVE14gE6NtRmcftjeQVFuxx9JI6zssBQoUEnNP64yX7YEJ" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-secondary-container text-xs font-bold px-2 py-1 rounded-full shadow-sm">Ẩm thực</div>
            </div>
            <div className="p-5 flex flex-col flex-grow text-left">
              <h3 className="font-headline-md text-[20px] text-on-surface mb-2 group-hover:text-primary transition-colors">Lớp học nấu ăn Huế</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">Học cách chế biến các món ăn cung đình và đặc sản địa phương từ những đầu bếp gia đình.</p>
              <div className="mt-auto">
                <div className="flex items-center text-secondary-container font-label-sm mb-3">
                  <span className="material-symbols-outlined text-[16px] fill">star</span>
                  <span className="ml-1">4.8 (85 đánh giá)</span>
                </div>
                <p className="font-label-md text-label-md"><span className="font-bold text-lg text-on-surface">Từ 800,000₫</span> / người</p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-outline-variant/30 flex flex-col h-full text-left">
            <div className="relative h-56 overflow-hidden">
              <img alt="Pottery Bat Trang" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuG4_x4G_y4G_D4G_w4G_t4G_G4G_4x4G_y4G_D4G_w4G_t4G_G4G_4x4G_y4G_D4G_w4G_t4G_G4G_4x4G_y4G_D4G_w4G_t4G_G4G_4x4G_y4G_D4G_w4G_t4G_G4G_4x4G_y4G_D4G_w4G_4x4G_y4G_D4G_w4G_" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-tertiary text-xs font-bold px-2 py-1 rounded-full shadow-sm">Văn hóa</div>
            </div>
            <div className="p-5 flex flex-col flex-grow text-left">
              <h3 className="font-headline-md text-[20px] text-on-surface mb-2 group-hover:text-primary transition-colors">Làm gốm Bát Tràng</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">Trải nghiệm tự tay vuốt gốm và tạo ra những tác phẩm nghệ thuật của riêng mình.</p>
              <div className="mt-auto">
                <div className="flex items-center text-secondary-container font-label-sm mb-3">
                  <span className="material-symbols-outlined text-[16px] fill">star</span>
                  <span className="ml-1">4.7 (210 đánh giá)</span>
                </div>
                <p className="font-label-md text-label-md"><span className="font-bold text-lg text-on-surface">Từ 300,000₫</span> / người</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Homestays */}
      <section className="py-xl bg-surface-container-low px-6 md:px-margin-desktop max-w-[1440px] mx-auto w-full text-left">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Homestay Nổi Bật</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Không gian nghỉ dưỡng tuyệt vời được yêu thích nhất.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <div className="bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer text-left" onClick={() => onNavigate('homestays')}>
            <div className="relative h-48 overflow-hidden shrink-0">
              <img alt="Homestay" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvLue6r0_twdQwHv9zkChmMsaMIGm-mfbYtj_4SxV4Or5iBO7BpZhBId9fAVR9OxKblIGr93D5UnI0XrzOXqHqJX-ZzRq2w2M0lQ0-oMKiGMd3u8H9dVhKRE0VXGYe43-xwq-NNDnJhpM394DRJlHUy2TB_s33PvJWGRdMw9Ug2GE_8sKKrQ48MggvkCHb3MGba-1G6RWgyI7PwlilGG1mfIyN0suqNZHEgruDj2HTExNLzP88NnZQSYQy37L0k96qLmadMeoYgoej" />
              <button className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-sm rounded-full text-on-surface hover:text-error transition-colors cursor-pointer flex items-center border-none">
                <span className="material-symbols-outlined">favorite_border</span>
              </button>
            </div>
            <div className="p-4 flex flex-col flex-grow text-left">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline-md text-[20px] text-on-surface">The May - Vintage House</h3>
                <div className="flex items-center text-secondary-container font-label-sm shrink-0">
                  <span className="material-symbols-outlined text-[16px] fill">star</span>
                  <span className="ml-1">4.9</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex items-center">
                <span className="material-symbols-outlined text-[18px] mr-1 text-on-surface-variant">location_on</span> Hội An, Quảng Nam
              </p>
              <div className="mt-auto flex justify-between items-center">
                <p className="font-label-md text-label-md"><span className="font-bold text-lg text-on-surface">1,200,000₫</span> / đêm</p>
                <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-md hover:bg-surface-tint transition-colors cursor-pointer border-none">Đặt ngay</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
