function Experiences({ onNavigate }) {
  const experiences = [
    {
      id: 1,
      title: 'Khám phá sương mù Sapa và Bản Cát Cát',
      duration: '2 ngày 1 đêm',
      category: 'Trekking',
      rating: '4.9',
      price: '1.200.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcheytH44XrHpz0zOQEzQjdvv3sWLeGliPmeZS4Ps77tTTqYoY984txWRI6SmnqUVPTEEQn3XHLTZf714oRtv_peMBFwAXNBZicZEQnGq7gjEskwFiY6XzcgITS6vQh_26RQrDxSFJ6lJqkMT0my9GfBCMSCKd1ph4R-MQ3-fVuvOwZhrveqvLMfmZO_9VLXQvjeMrT_U5Sgxs41LGt37IJeEpxjOgszu4ATaMUMfwuyNh7ct30oHkNAgTN7aOv6Wn1BZUynqnCLas'
    },
    {
      id: 2,
      title: 'Food Tour Ẩm thực Đường phố Hà Nội',
      duration: '4 giờ',
      category: 'Food tour',
      rating: '4.8',
      price: '500.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx3iM2JWSe-Puo0ykRxhYJKvHk5VIg4teB1YwSvwGNIV4QNPfgYPyIZMXgXIE_m8Q2nfIcPwIbVILIUQEuVjwuCNIKGxYazFNSD7CU4x66UWJS-liL0kcz9Yt4yFzSG7DEseg9_D1EMmkHlmdPW8OfkhAeiIxVo13U0h1fgXjqLx8-ATnpJdC7dxP8g5sFWlLXi8zq_0SHPgaQcU592xP6MhJV437WWqnnchZryxS1ZGQDmIQ604zxh1d91wsIiG8-l3hBVX_o9N4c'
    },
    {
      id: 3,
      title: 'Thả đèn hoa đăng & Du thuyền sông Hoài Hội An',
      duration: '3 giờ',
      category: 'Văn hóa',
      rating: '5.0',
      price: '250.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYM1Hd8mSrQDK2NwPOVP2iLDSFgLp5GcWjF8KLvJBJLNbnlmHbLlwqf9YB5BCcmxa6-kp6XSK-6yviODSbQKPjfvQeLPYW7JS_z2PAz0vqu_LRu79xJWtV98aOzu7hGEOTRUEDGPw1oBMogT2_gCW6IOse2ktDok-ftRh5TXqjNVZkxFvtIXnUJf9YCShQ18zM5YX0DrydT9uaAvvFIgr-6dKMsE0hzH7MXvc80dzsiEE5V-ycdwSOziiN_M-z03dQGHPRB4o6kRlT',
      featured: true
    },
    {
      id: 4,
      title: 'Lặn ngắm san hô biển Nha Trang (Scuba Diving)',
      duration: '1 ngày',
      category: 'Thể thao nước',
      rating: '4.7',
      price: '1.800.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlgEmcgDuBsA_yQFCygBR8PhW-9RQuUaFG-ygZzEp-7XkzD15zvQpel7N6RqROEU2t0DhlFAaAFuzlrvTU3mjRGNcSjA-FkBC70ngw173o8RMQ1Ml1FnHDyu3E89THQ9nucEB-5acG9knogqGgoClLOBshcxNif3cyulAuGDJX4pECoQw__ZEH9wlbeF4tvfw75LXCte6n0-1ZCf7i1L7Hp1rXNLTSGdnsaUvYynhdUDpLcueNT-xMzxA2DttWUBEHP-lmHHZPUPAv'
    },
    {
      id: 5,
      title: 'Chèo Kayak qua hang động Vịnh Hạ Long',
      duration: '1 ngày',
      category: 'Thể thao nước',
      rating: '4.8',
      price: '850.000₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3qWcc4lxCt6wdSk2SJsbKSNlrW1S9m8E0AMMinqrAYpyDoIxTqGorPHlzimcYO-8YA6nA5tQVCFUoS8xjaluaTIZQBVCu6tSwXcfkvyHZnlzBweFEk7eR7GoJOHn8cYamNlr1Mm-AUMiqam6i_ejxAAweVuceG8AfDvsqSyiOaNG8rAr3ccEeNIlqD5hi42dciM_eLmoOfrQfwdjlKffvpLfml1RkDp1dxRV-p8hAg__Dt-abKBnWCUiMarjvCbEdExLN-FWYNX_u'
    }
  ];

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-margin-desktop py-8 text-left">
      {/* Header Section */}
      <div className="mb-12 text-left">
        <h1 className="font-display-lg text-display-lg text-on-background mb-4">Khám phá Trải nghiệm</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-left">Tìm kiếm những hoạt động độc đáo và đáng nhớ cho chuyến đi tiếp theo của bạn.</p>
      </div>

      {/* Filter & Search Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant text-left">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body-md text-body-md h-12 outline-none transition-colors shadow-none" placeholder="Tìm kiếm địa điểm..." type="text" />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">payments</span>
            <select className="w-full pl-12 pr-10 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface font-body-md text-body-md h-12 appearance-none outline-none transition-colors">
              <option value="">Mức giá</option>
              <option value="low">Dưới 1.000.000đ</option>
              <option value="medium">1.000.000đ - 3.000.000đ</option>
              <option value="high">Trên 3.000.000đ</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
          <button className="bg-surface text-on-surface border border-outline-variant px-6 rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2 h-12 cursor-pointer border-none">
            <span className="material-symbols-outlined">tune</span>
            Bộ lọc thêm
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 snap-x hide-scrollbar no-scrollbar">
        {['Tất cả', 'Trekking', 'Food tour', 'Văn hóa', 'Thể thao nước'].map((cat, idx) => (
          <button 
            key={cat} 
            className={`snap-start whitespace-nowrap px-6 py-2 rounded-full font-label-md text-label-md transition-colors border shadow-sm cursor-pointer ${idx === 0 ? 'bg-primary-container text-on-primary-container border-transparent' : 'bg-surface hover:bg-surface-variant text-on-surface border-outline-variant'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid Experiences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
        {experiences.map((exp) => (
          <div 
            key={exp.id} 
            onClick={() => onNavigate('experience_detail', exp.id)}
            className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer ${exp.featured ? 'md:col-span-2 lg:col-span-1 xl:col-span-2' : ''}`}
          >
            <div className={`relative ${exp.featured ? 'h-48 md:h-64' : 'h-48'} overflow-hidden`}>
              <img 
                alt={exp.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src={exp.image} 
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary-container fill">star</span>
                <span className="font-label-md text-label-md text-on-surface">{exp.rating}</span>
              </div>
              {exp.featured && (
                <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                  Bán chạy nhất
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 text-left">
              <div className="flex items-center gap-2 mb-2 text-on-surface-variant font-label-sm text-label-sm text-left">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>{exp.duration}</span>
                <span className="w-1 h-1 rounded-full bg-outline mx-1"></span>
                <span>{exp.category}</span>
              </div>
              <h3 className="font-headline-md text-[20px] leading-tight text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors text-left uppercase">
                {exp.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="text-left">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Từ</span>
                  <div className="font-headline-md text-[18px] text-on-surface">{exp.price}</div>
                </div>
                <button className="bg-secondary-container text-white px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm cursor-pointer border-none">
                  Đặt trải nghiệm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Experiences;
