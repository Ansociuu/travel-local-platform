import { useParams } from 'react-router-dom';

function ExperienceDetail() {
  const { id } = useParams();

  // Mock data for an experience
  const experience = {
    id: id || '1',
    title: 'Food Tour Ẩm thực Đường phố Huế',
    location: 'Huế, Việt Nam',
    rating: 4.9,
    reviews: 156,
    host: {
      name: 'Anh Nguyễn',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMevb9iwooURRTZaaXpu-9i6CYgPFkQlwhikXqCuRXjCsJ2UR4H0r-ceLQiLgaPDltsb887ERBmXoc9ecGuBMzw0spC-UswB4tNVxDzyECcKxA_IPO6zNl1sHaQ_7aDnLd5H8NSny5BA_g8AvBs0a3fVHhj3MeYEWesEvkWPfm2hKfXKB4gGhTt23bLz1FQK7cMMU2-pFD4haAoexgJujPhYqErpn9GD4BgYf-XAiTzhCUgq2d4HWdl2idiRHq12P4rJmTJH29NnyV',
      joinDate: '2020',
      fastResponder: true
    },
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdBa9U-2EKzOlD4xNm3w2tsYGiCxR5RLugmlbMC86mL41P5HJffdm319YyxjH7UzMMrv872rk2Dyznw8XLxsNZ3pg91kA1ZVaOJe5ZsMrIhA-mb6QAlJ-KnP8muJoiXf8m3pLDt_BwrEW4R0_x9Dw6a_wBEjeZn7FwOSCmsoQAZbQSJvaNaxwjG30gi3QRxktSamnEUmLyLxvH2YUM6-8MlOwMeQP-KFSVE14gE6NtRmcftjeQVFuxx9JI6zssBQoUEnNP64yX7YEJ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7236AaYeDBjT7N_2tUpH5FDKyuECsW_6oJXFmr3UCMx46xVUnmiwSEg4vCU0Q32-4zXIF-3QyZPdLf_L9B_fyGW8m96rca1dFDbD4GsjX7MUyi6CqZNpO_6gkBRRIesoS9mxyFvxCqFy15GAa4tTMw-S1c3_Dnp24TjFM6eN5VqTW8PbAzhnYu_PzozYpXBHzAntOq0L9Ui293HG6qemo_p-WsRZ9dHNhGY6KVFZkOAcrecqLD012gyrMagcyoKWYsoaWJNren16z',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoU-g-2fjNB3c-cixppv0qF2IC9ukxFCcxlqzuvq0Ei-zDEz9UXu2Vi6X24R4aLj9bdEpUnhvn_2XPyQXcT2tNQOCkFA4PoCdToFlgFv7GQ9EHhHS_UXpEcn5Mb4x3i_exxuPUqNkOYxnYrRIl4-kpnfQzPnWj3WJKNA1idvSX6TbU6-mHdiWk3j5TQUMf0xSQ8l5UYqAt4qHc0O3LOQN9knhuVzshFMPKZq_NIlnhirzL4IKn3Ko5PCUwnrYT5-VzsiWGe3Hn_c_S',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3AnLPKC80neeKBHts9JKvQ_aA-ahwTZPJTrlmjU5VjPC8EiOw4bsaVqe20jCy8yIVx6KS84i_HtehyzHdW1K9uFtid-_6o5UdthLU6x8arVQntuj7RxKtCkjVKeo1yLlLL1OSMben2JiQwdNFyhMY9RolhlJC_eE2deJvRZJnRZPPAYskUlp2mRbY0h8defGLBNErmUjQx5-adSYR2kQgae80vFpGPf1klJLW6CF8pBiMXJEBPNr3vc43Y7PZMhJDqLomsRWaaMbu'
    ],
    details: {
      duration: '4 giờ',
      includes: ['Đồ ăn/Đồ uống', 'Hướng dẫn viên', 'Phương tiện di chuyển'],
      language: 'Tiếng Việt, Tiếng Anh',
      capacity: 'Tối đa 8 người'
    },
    description: 'Tham gia cùng tôi trong một hành trình khám phá những hương vị bí mật của cố đô Huế. Chúng ta sẽ cùng nhau dạo qua các khu chợ nhộn nhịp, nếm thử Bún Bò Huế chính gốc, Bánh bèo, lọc, nậm và kết thúc bằng một ly trà cung đình ấm áp.',
    price: 450000
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32 md:pb-0 text-left">
      <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Image Display */}
        <section className="lg:col-span-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <div className="md:col-span-2 relative group cursor-pointer overflow-hidden">
              <img src={experience.images[0]} alt="Experience main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="hidden md:flex flex-col gap-2 h-full">
              <div className="h-1/2 relative group cursor-pointer overflow-hidden">
                <img src={experience.images[1]} alt="Experience 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="h-1/2 relative group cursor-pointer overflow-hidden">
                <img src={experience.images[2]} alt="Experience 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>
          </div>
        </section>

        {/* Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <section>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{experience.title}</h1>
            <div className="flex items-center gap-4 py-4 border-y border-surface-container-high">
              <div className="flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-secondary-container fill">star</span>
                <span>{experience.rating} ({experience.reviews} đánh giá)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-on-surface-variant">{experience.location}</span>
            </div>
          </section>

          {/* Featured Highlights */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="flex flex-col items-center p-4 bg-surface-container rounded-xl text-center">
                <span className="material-symbols-outlined mb-2 text-primary">schedule</span>
                <span className="font-label-sm text-on-surface-variant uppercase text-[10px]">Thời lượng</span>
                <span className="font-label-md font-bold">{experience.details.duration}</span>
             </div>
             <div className="flex flex-col items-center p-4 bg-surface-container rounded-xl text-center">
                <span className="material-symbols-outlined mb-2 text-primary">restaurant</span>
                <span className="font-label-sm text-on-surface-variant uppercase text-[10px]">Ẩm thực</span>
                <span className="font-label-md font-bold">Huế chính gốc</span>
             </div>
             <div className="flex flex-col items-center p-4 bg-surface-container rounded-xl text-center">
                <span className="material-symbols-outlined mb-2 text-primary">language</span>
                <span className="font-label-sm text-on-surface-variant uppercase text-[10px]">Ngôn ngữ</span>
                <span className="font-label-md font-bold">Việt - Anh</span>
             </div>
             <div className="flex flex-col items-center p-4 bg-surface-container rounded-xl text-center">
                <span className="material-symbols-outlined mb-2 text-primary">group</span>
                <span className="font-label-sm text-on-surface-variant uppercase text-[10px]">Quy mô</span>
                <span className="font-label-md font-bold">{experience.details.capacity}</span>
             </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="font-headline-md text-headline-md mb-4 uppercase">Mô tả trải nghiệm</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">{experience.description}</p>
          </section>

          {/* What's included */}
          <section className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-high">
            <h2 className="font-label-md font-bold mb-4 uppercase">Bao gồm những gì</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experience.details.includes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  <span className="font-body-md">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Host */}
          <section className="flex items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-sm">
            <img src={experience.host.avatar} className="w-16 h-16 rounded-full object-cover" alt="Host" />
            <div>
              <h3 className="font-label-md font-bold uppercase text-on-surface">Người hướng dẫn: {experience.host.name}</h3>
              <p className="font-body-md text-on-surface-variant text-sm">Tham gia từ {experience.host.joinDate} • Phản hồi nhanh</p>
            </div>
          </section>
        </div>

        {/* Right Column: Booking */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-[100px] bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <span className="font-headline-md text-[32px] font-extrabold text-on-surface">{experience.price.toLocaleString('vi-VN')}₫</span>
              <span className="font-body-md text-on-surface-variant"> / người</span>
            </div>
            
            <div className="space-y-4 mb-6">
               <div className="p-4 border border-outline-variant rounded-xl cursor-not-allowed bg-surface-container-low">
                  <label className="block text-[10px] font-bold text-outline uppercase mb-1">Ngày đã chọn (Ví dụ)</label>
                  <span className="font-label-md">28 Tháng 10, 2023</span>
               </div>
               <div className="p-4 border border-outline-variant rounded-xl flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Số lượng khách</label>
                    <span className="font-label-md">2 người</span>
                  </div>
                  <span className="material-symbols-outlined">expand_more</span>
               </div>
            </div>

            <button className="w-full bg-primary text-white font-label-md font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-md cursor-pointer border-none uppercase">
              Đặt chỗ ngay
            </button>
            <p className="text-center text-[12px] text-on-surface-variant mt-4 font-medium italic">Xác nhận nhanh chóng • Không phí ẩn</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ExperienceDetail;
