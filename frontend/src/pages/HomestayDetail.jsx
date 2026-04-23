function HomestayDetail() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32 md:pb-0 text-left">
      <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter text-left">
        {/* Image Gallery (Bento Style) */}
        <section className="lg:col-span-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <div className="md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
              <img 
                alt="Main homestay view" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7bXTbKza0xWNhn5kTWYGoJisA4IAeX-ptqsT3iwOTrllPSCMp2v_vIkXvO_JAZ7lcxwpB65ZX9xl_QzLSnWiVmBUm3p3CMd2sNbpnoK5R0qHSbp5kWGLkE5rIW71YmvsiyZ45RGk8JTc331whMt9EVHtt2MRWRCcRYskUvGndnYcmkw0yHk9lzrL_AeS1ggtZOpJJ6s8c2RVWylRMsW4rIh4SBx2R_IZffJ9dD5Pwlv62NpHakOO1J04jdtOnvv-4uvVdvKnuX1KO" 
              />
            </div>
            <div className="hidden md:block relative group cursor-pointer overflow-hidden">
              <img 
                alt="Bedroom view" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8CpnKk4k5A5Y_tsCyKpVyMTQngmeXzL8xPositionsNzVbPf1-D4SA-EGzVsH3KjovdvrefkcyW3i7ka3UqjjpndicOBVV2_wfDxhJs38fX20JrikjPZ2mhhhXE5_pJFgXnY3psFH3MDVDxZ3j8Lf5KoLvL71uq-96nHh87eQKm3iTjnnjxXNEcHovj7yQ2lhA_Sjbh-DcsOGVllbo9pIe2hubJxm3ZvUufDAcaD5mhCb8Jby3ARgOaxM1wLtzBWxgV7XN1rU81lQjLi_nl5P" 
              />
            </div>
            <div className="hidden md:block relative group cursor-pointer overflow-hidden">
              <img 
                alt="Kitchen view" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK_QrVAdfenCLv6V2mIGwtEjlnC2mdGeNu7RAciB0eOlNOfSSxn-8aGtvUU7LT5-ooFa8Ij5MQ_eveBo5TeRX9De4kLrJaPMN7g7SR3wG1oqqh8Iy6i-w_Hhc7kHDNpxYz_wQJ27EtxLitsrlK2T-3sHp-1fKJjgOs-LTLOP6PZEMiosWGAj5SzIHoDQklqiDWi0g0OfoIuYukjq6LjrlD-OIN-kSNocsmaWKTvPsV5yLBZKV1Uel3lung1ZrPi7mKit-o1U5fmdSW" 
              />
            </div>
            <div className="hidden md:block relative group cursor-pointer overflow-hidden">
              <img 
                alt="Bathroom view" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRcaJ6WOAfsQPl85sMBzF-8MtQBJPVFwMkjiqTZhSbplq5fodiVysbmJ9AsinwJeGTPWrwM-U1jWWVndUZKU_mXegRayJJgMjdcskHPiIlvxBBU3hVIMgRQ6LMxob6bwYsRsfe6-OJngdG_3-VbHQMgTUDGiAaLaj8jSUAuzewmdpZNb347ARYP-srA-KMbb77GwL_aS3PJErognyuWKPxP25a8Y5dpTefN9YehkPZ1Z3bJIee9zpVNGrmdi_ep8azRHmGdq0D4wTD" 
              />
            </div>
            <div className="hidden md:block relative group cursor-pointer overflow-hidden">
              <img 
                alt="Balcony view" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDefmy5P3SjMzOmS-vBvVh2cjwq-Y-cTSPTFLE-6i6qyWooM-CFAOX7CagDS9smwHhIecGH3aj5vWFNxXGjcHZVMPQv9VAXTmMq1h7uTWSCQ6cMX_5ZevBWi00vf32tRLUP3w2PG_let-VH9q0nM3L5q8TeP8r7yTeG6qmrVTfumMVEN5CAeZwfbRj9Z6N9XCPGLh-y4-EoILAsWHYFo7hTDM4Hd5kePXx-rLyIouiSGU5A4WYompeLrigWWMbx1qqXB-F6IzlXPL-3" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-label-md font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined">grid_view</span> Xem tất cả ảnh
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Left Column: Content */}
        <div className="lg:col-span-8 flex flex-col gap-10 text-left">
          {/* Header Info */}
          <section>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Căn hộ Loft yên tĩnh tại Trung tâm Thành phố</h1>
                <p className="font-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Đà Nẵng, Việt Nam
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer bg-transparent">
                  <span className="material-symbols-outlined text-on-surface">ios_share</span>
                </button>
                <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer bg-transparent">
                  <span className="material-symbols-outlined text-on-surface">favorite_border</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center py-4 border-y border-surface-container-high text-left">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary-container fill">star</span>
                <span className="font-label-md font-bold text-on-surface">4.92</span>
                <span className="font-body-md text-on-surface-variant underline ml-1 cursor-pointer">(128 đánh giá)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="font-body-md text-on-surface">Chủ nhà siêu cấp</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <div className="flex items-center gap-1 font-body-md text-on-surface-variant">
                <span>4 khách</span> • <span>2 phòng ngủ</span> • <span>2 giường</span> • <span>1 phòng tắm</span>
              </div>
            </div>
          </section>

          {/* Host Info */}
          <section className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-sm text-left">
            <img 
              alt="Host avatar" 
              className="w-14 h-14 rounded-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj8kxpAAF2xpdoCzCdKDwGZxrAn8A6aKB9MhFDim_yY4aOFzMuUKVm7sDjcelc4wIf-FjWiWsiv8dOwF2b_wfgCywLjuKiHj9ReKwP8TvBLM6UgJcDyWplWinh1-zwYX2epPDS0T5DAP-JgyFB_rYnxr9lWFZSbBTHxEpdM6QLo0AuMz43Rh6MrBTXehSJvkzHinPNdV5HjcfsJ3yG-d8lW2mnLPUAwpSQLWFHFcOezTMrK4o-TqE4BIeQY6g3a3Po3GZlTBkta_tX" 
            />
            <div>
              <h3 className="font-label-md font-semibold text-on-surface text-[16px]">Chủ nhà: Linh</h3>
              <p className="font-body-md text-on-surface-variant text-[14px]">Tham gia từ 2019 • Phản hồi nhanh</p>
            </div>
          </section>

          {/* Description */}
          <section className="text-left">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Về không gian này</h2>
            <div className="font-body-md text-on-surface-variant space-y-4 text-left">
              <p>Trải nghiệm nhịp sống sôi động của Đà Nẵng từ căn hộ loft được thiết kế tuyệt đẹp và ngập tràn ánh nắng này. Hoàn hảo cho các cặp đôi, người đi du lịch một mình hoặc gia đình nhỏ, không gian của chúng tôi mang đến một nơi nghỉ ngơi yên bình sau một ngày khám phá.</p>
              <p>Căn hộ có bếp đầy đủ tiện nghi, khu vực sinh hoạt ấm cúng với TV thông minh và ban công riêng nhìn ra toàn cảnh thành phố. Bạn chỉ mất 5 phút đi bộ đến Cầu Rồng nổi tiếng và các khu chợ địa phương nhộn nhịp.</p>
              <button className="font-label-md text-primary font-semibold flex items-center gap-1 hover:underline mt-2 cursor-pointer border-none bg-transparent">
                Hiển thị thêm <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </section>

          {/* Amenities */}
          <section className="text-left">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Tiện nghi có sẵn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center gap-3 font-body-md text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-outline">wifi</span>
                <span>Wifi tốc độ cao (100 Mbps)</span>
              </div>
              <div className="flex items-center gap-3 font-body-md text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-outline">pool</span>
                <span>Bể bơi chung</span>
              </div>
              <div className="flex items-center gap-3 font-body-md text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-outline">kitchen</span>
                <span>Nhà bếp đầy đủ dụng cụ</span>
              </div>
              <div className="flex items-center gap-3 font-body-md text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-outline">ac_unit</span>
                <span>Điều hòa nhiệt độ</span>
              </div>
            </div>
            <button className="mt-6 px-6 py-3 border border-on-surface text-on-surface font-label-md font-semibold rounded-lg hover:bg-surface-container transition-colors cursor-pointer bg-transparent">
              Hiển thị tất cả 24 tiện nghi
            </button>
          </section>

          {/* Reviews */}
          <section className="pt-8 border-t border-surface-container-high text-left">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[32px] text-secondary-container fill">star</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">4.92 · 128 đánh giá</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-none">
              {/* Review 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd0Gg2orx8sen_-YK8XgLHWo2ifpGiuaBr30JFXJdCgYE1aOLSWSgfc9hE5_hvHaIsAMwQyz-ghORU2ZHqmniN7dTr-540a7Uqw-7ijoCrcfZHhugxNrqhAlFwQTHXMSZyaxP2cNZV82I7Ieo4hZ483kuRJP7_GgNVXbTSDbl76oi8byq5no_fnCXlPjtXr2ynlIolAGNx6H9Uk4SvdvrOcEwr9zRq5lVIqglviPhX9xoP2WmWy5ddHQlwBObPsgfYYdjfLbQpfo07" className="w-12 h-12 rounded-full object-cover" alt="Michael" />
                  <div>
                    <h4 className="font-label-md font-semibold text-on-surface text-[16px]">Michael</h4>
                    <p className="font-body-md text-on-surface-variant text-[12px]">Tháng 10, 2023</p>
                  </div>
                </div>
                <p className="font-body-md text-on-surface-variant line-clamp-2">Tuyệt vời! Vị trí không thể chê vào đâu được và căn hộ rất sạch sẽ. Linh đã hỗ trợ nhiệt tình các địa điểm ăn uống. Sẽ quay lại đây lần nữa.</p>
              </div>
              {/* Review 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMevb9iwooURRTZaaXpu-9i6CYgPFkQlwhikXqCuRXjCsJ2UR4H0r-ceLQiLgaPDltsb887ERBmXoc9ecGuBMzw0spC-UswB4tNVxDzyECcKxA_IPO6zNl1sHaQ_7aDnLd5H8NSny5BA_g8AvBs0a3fVHhj3MeYEWesEvkWPfm2hKfXKB4gGhTt23bLz1FQK7cMMU2-pFD4haAoexgJujPhYqErpn9GD4BgYf-XAiTzhCUgq2d4HWdl2idiRHq12P4rJmTJH29NnyV" className="w-12 h-12 rounded-full object-cover" alt="Sarah" />
                  <div>
                    <h4 className="font-label-md font-semibold text-on-surface text-[16px]">Sarah</h4>
                    <p className="font-body-md text-on-surface-variant text-[12px]">Tháng 9, 2023</p>
                  </div>
                </div>
                <p className="font-body-md text-on-surface-variant line-clamp-2">Một ốc đảo bình yên ngay giữa lòng thành phố. Giường ngủ rất thoải mái và bể bơi chung là một điểm cộng lớn sau một ngày khám phá nóng nực.</p>
              </div>
            </div>
            <button className="mt-6 px-6 py-3 border border-on-surface text-on-surface font-label-md font-semibold rounded-lg hover:bg-surface-container transition-colors cursor-pointer bg-transparent">
              Hiển thị tất cả 128 đánh giá
            </button>
          </section>

          {/* Map Area */}
          <section className="pt-8 border-t border-surface-container-high text-left">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Vị trí của bạn</h2>
            <p className="font-body-md text-on-surface-variant mb-6 text-left">Đà Nẵng, Việt Nam</p>
            <div className="w-full h-[300px] bg-surface-container-high rounded-xl overflow-hidden relative">
              <img 
                alt="Map view" 
                className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM0DcMtwMTZbcSXEbuYfaR-yoi4gpmXMON3e78X4QJ81fg30et8YXv_ISdvq6KRa5G603rE1DWJvg70dERqRUqK2vSNPqphb0JH49wbQYyFYbjAKXtb8Nfvt2CGVVqAyORVi5qLvAExkH5grb9KSaawgy60U0lC-cZss4P6rmEdxIXmgGUSuOWlNdG7fQVW_vQFgvrWdWTKZN_sGctsWJJFhNgmoa0Vko-wq7VOEs-OHmVgBuNp5CPAgFhinJl4eZJHD3xW39RstlM" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-white"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Booking Widget (Sticky) */}
        <div className="hidden lg:block lg:col-span-4 text-left">
          <div className="sticky top-[100px] bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-lg">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="font-headline-md text-[28px] text-on-surface font-bold">1.200.000₫</span>
                <span className="font-body-md text-on-surface-variant"> / đêm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary-container fill">star</span>
                <span className="font-label-sm font-bold text-on-surface">4.92</span>
                <span className="font-label-sm text-on-surface-variant">(128)</span>
              </div>
            </div>
            {/* Input Fields */}
            <div className="border border-outline-variant rounded-xl overflow-hidden mb-4">
              <div className="flex border-b border-outline-variant">
                <div className="flex-1 p-3 border-r border-outline-variant hover:bg-surface-container cursor-pointer transition-colors">
                  <label className="block font-label-sm text-on-surface-variant uppercase text-[10px] font-bold">Nhận phòng</label>
                  <span className="font-body-md text-on-surface text-[14px]">24/10/2023</span>
                </div>
                <div className="flex-1 p-3 hover:bg-surface-container cursor-pointer transition-colors">
                  <label className="block font-label-sm text-on-surface-variant uppercase text-[10px] font-bold">Trả phòng</label>
                  <span className="font-body-md text-on-surface text-[14px]">29/10/2023</span>
                </div>
              </div>
              <div className="p-3 hover:bg-surface-container cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <label className="block font-label-sm text-on-surface-variant uppercase text-[10px] font-bold">Khách</label>
                  <span className="font-body-md text-on-surface text-[14px]">2 khách</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
              </div>
            </div>
            <button className="w-full bg-secondary-container text-white font-label-md font-bold text-[16px] py-4 rounded-xl hover:bg-[#e67300] transition-colors shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer border-none">
              Đặt ngay
            </button>
            <p className="text-center font-body-md text-on-surface-variant text-[14px] mt-4">Bạn chưa bị tính phí ngay</p>
            {/* Pricing Breakdown */}
            <div className="mt-6 space-y-3 font-body-md text-on-surface text-[15px]">
              <div className="flex justify-between">
                <span className="underline cursor-pointer">1.200.000₫ x 5 đêm</span>
                <span>6.000.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="underline cursor-pointer">Phí vệ sinh</span>
                <span>200.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="underline cursor-pointer">Phí dịch vụ Globetrot</span>
                <span>350.000₫</span>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t border-surface-container-high font-headline-md text-[18px] text-on-surface font-bold">
              <span>Tổng trước thuế</span>
              <span>6.550.000₫</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-container-high p-4 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe">
        <div className="text-left">
          <div className="font-headline-md text-[18px] text-on-surface font-bold">1.200.000₫ <span className="font-body-md text-[14px] font-normal text-on-surface-variant">đêm</span></div>
          <div className="font-label-sm text-on-surface underline">24 - 29 Tháng 10</div>
        </div>
        <button className="bg-secondary-container text-white font-label-md font-bold px-8 py-3 rounded-lg shadow-md active:scale-95 transition-transform cursor-pointer border-none">
          Đặt ngay
        </button>
      </div>
    </div>
  );
}

export default HomestayDetail;
