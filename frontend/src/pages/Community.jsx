function Community() {
  const posts = [
    {
      id: 1,
      author: 'Minh Trí',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiBF_H5kWwbY1NBDohtqug9NTlejFlA9Ej8E5bkhATQ-DYaXs-hetnzmyG3wwngrWTwrIwvVs_ZTLu9h7qSmxX67Vcj-6dLyMiOf4WhRYnjCJS73x0aB8HbCNskELZWZLZyML1zrg9DfXHRIaU8jO97anFy1rkKNWomuf2pKlY0hO8-Tlf3d8QA1U832LgmrO3ADRrVTVLnITnKRm8Y4VaPFO3hBOwh1f-fC7Y8Sz2IFXrr-aTIqGyZnxhJkruHE8DvY3528YAo6MD',
      time: '2 giờ trước',
      location: 'Hà Giang, Việt Nam',
      content: 'Đèo Mã Pí Lèng chưa bao giờ làm tôi thất vọng. Quy mô của những ngọn núi này thực sự hùng vĩ. Đạp xe qua sương mù sáng nay và tầm nhìn ở đỉnh đèo xứng đáng với mọi khúc cua gắt. 🏍️⛰️ #HaGiangLoop #VietnamTravel',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe8OE-AGF3bIpAd7swbazfjYR7wbkc1LQW_pIf1PnJS1augEt7-cBFxof5bGQG4KDMC2jEgv6twsWEPsJV7Wwa6E13FMgztoYEa-eFwD6ggAaEkopFP9fL3ABwF_dVti5ciM2Rjit35l1OfNXIeRkMWJpEpKfLZbEVr-53Ucf3geKD4ZxTfqgYx3Hqr4fkNkxzvj8kFKSwtzX0M3-DemYv00Dbl35wQB7ijjJ9Nh4b3ncbkQmKFbVNjUEFq6TmZGDAiEc2KorsHqL',
      likes: 245,
      comments: 42
    },
    {
      id: 2,
      author: 'Linh Nguyễn',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC40Zmd24RIbWd2P5U3xN8RG41FL_iViMAAWnf1VsxtM_ikIwwnOcZbGnvlc4olwt5ZKH6g3ra-AO6eo3iXS6yggOBVlH1E7-yBIdSPPZr6jZZpgVYhtB_niIBV17gHdG7exRBAgUPFWM5dFh-XIRhJpsIY2gGEYvWoX7WqtUtNGuO9dCsdxMYyjNxNjBviOkKtXuoIJF32mgaWJxJGYu-v6mgtEc8X2VFnFKcXRTzVCDz0w5G2qioQUw5bxFqkwPUqII3UZibwgZ72',
      time: '5 giờ trước',
      location: 'Hội An, Việt Nam',
      content: 'Góc nhỏ bình yên tại Hội An. Ánh đèn lồng lung linh và tiếng mái chèo khua nước trên sông Hoài mang lại cảm giác thật thư thái. 🍵🌸 #HoiAn #Vietnam #Peaceful',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoU-g-2fjNB3c-cixppv0qF2IC9ukxFCcxlqzuvq0Ei-zDEz9UXu2Vi6X24R4aLj9bdEpUnhvn_2XPyQXcT2tNQOCkFA4PoCdToFlgFv7GQ9EHhHS_UXpEcn5Mb4x3i_exxuPUqNkOYxnYrRIl4-kpnfQzPnWj3WJKNA1idvSX6TbU6-mHdiWk3j5TQUMf0xSQ8l5UYqAt4qHc0O3LOQN9knhuVzshFMPKZq_NIlnhirzL4IKn3Ko5PCUwnrYT5-VzsiWGe3Hn_c_S',
      likes: 892,
      comments: 128
    }
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter pt-8 text-left">
      {/* Center Column (Feed) */}
      <main className="col-span-1 md:col-span-8 space-y-lg pb-xl text-left">
        {/* Create Post Input */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-md flex items-center gap-md text-left">
          <img 
            alt="User avatar" 
            className="w-10 h-10 rounded-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyVMJC0-SwrhS48sGcnqjRrBa2vvqnuxqGIy_GcO1QWSwSyrTcB1_GOge2P_fE0D8qqw-swLU5IHI-d68tgPLbA-t-Z7Qg8KAzdtGI12YHblPrSbbjvp1bTQNiDplHeqOJpBgCjqJiY8XG8n2GjfPgZ3rwCiedGFQH40_8KL-6io5eAdqCLZvqIynTlcibLDaKnf4mLUf8otoukq6DQOtwGoTU36yTF-pJMdzMEA-bjUGNPXCDMLdPZ-giXAatYYintrwT2xI79vK5" 
          />
          <button className="flex-1 text-left px-4 py-3 bg-surface-container-low rounded-full text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors cursor-pointer border-none uppercase">
            Chia sẻ hành trình của bạn...
          </button>
          <button className="p-2 text-primary hover:bg-primary-container rounded-full transition-colors cursor-pointer border-none bg-transparent">
            <span className="material-symbols-outlined fill">image</span>
          </button>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <article key={post.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden text-left">
            <div className="p-md flex items-center justify-between text-left">
              <div className="flex items-center gap-sm text-left">
                <img alt={post.author} className="w-12 h-12 rounded-full object-cover" src={post.avatar} />
                <div className="text-left">
                  <h3 className="font-label-md text-label-md text-on-surface uppercase">{post.author}</h3>
                  <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mt-1 text-left">
                    <span>{post.time}</span>
                    <span>•</span>
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{post.location}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-outline hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="px-md pb-sm font-body-md text-body-md text-on-surface text-left">
              <p className="text-left">{post.content}</p>
            </div>
            <div className="w-full aspect-[4/3] bg-surface-container overflow-hidden">
              <img alt="Post visual" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" src={post.image} />
            </div>
            <div className="p-md flex items-center justify-between border-t border-surface-variant text-left">
              <div className="flex gap-4 text-left">
                <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined">favorite</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span>{post.comments}</span>
                </button>
              </div>
              <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer border-none bg-transparent">
                <span className="material-symbols-outlined">share</span>
                <span>Chia sẻ</span>
              </button>
            </div>
          </article>
        ))}
      </main>

      {/* Right Column (Sidebar) */}
      <aside className="hidden md:block col-span-4 space-y-lg text-left">
        {/* Trending Locations */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-md text-left">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Xu hướng địa điểm</h3>
          <div className="space-y-md text-left">
            {[
              { name: 'Hội An, Việt Nam', posts: '12.5k bài viết', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFnpYlQDiA9bJnLwbR1mFDJFsfHFz0iUaE3hN_ASb9l1OPUWNtADjrmBA3acxJ1VZyyNHRd6_8w4SHbhOlNVp2Xyk2LOKWHMdc6ylDvqy4J7y_u7BNHmgkefsa_ZYzAjdl5W0xPNtY1pBtHLJHTSn8AGh1sDbH0YGe-Ttwo9G53h2pjz9HBt9xvxdUzPfMAuB8zNYSsasE3C7LsTejdu7mb_j7p_35elpm_Vqzo7vqif5vDL3Y3jmwHBJ_xr2xiBqc-cUTRYJSdIfd' },
              { name: 'Paris, Pháp', posts: '9.2k bài viết', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8GtP2EX_rqtIcAHYDvlXBuivXs-3Ge1dugETOoX_IwcDkJ8C7sdlmqgAcGT54C_TW7vibSM7D2n7ZVmEVKr3DH16uezECAew0IarfY1ayWsK26K5xqU0HB9zC8k-RkgYkT-HTAMwU9csHtpMVFuQxlkpcWZm3xEh4rZsqDsEJkZFloCAO9ijLrkuihrOrxPzNNRtJw7RPwUrx6KbAqSvBfhUvFdbGU3c0TUdQG_ccfm9wFnr-B7VOFT-eFh1NsQR6KM4gBT43jeWE' }
            ].map((loc) => (
              <div key={loc.name} className="flex items-center gap-sm group cursor-pointer text-left">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 text-left">
                  <img alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src={loc.img} />
                </div>
                <div className="text-left">
                  <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors uppercase">{loc.name}</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{loc.posts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Travelers */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-md text-left">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Người du lịch nên theo dõi</h3>
          <div className="space-y-md text-left">
            {[
              { name: 'Alex Chen', loc: 'Tại Bali, Indonesia', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuX9bbk6Dtnaj2WJDCzR8aw2GCa8XIOmgFYDRGcKkCQ0B_muq5la4xYliHSwdYdL9BFvBDAYUeAI1p9igR56BhMhGiqhkkOGTNV85dOXkcqlxK9dBZMg_CvQJm96bPR7qvoIEiEf5_OGK-bl9jU4rPgWp8n_ikqFRpGEe05iMLpLbFM_NBbW2eNCWMtEjX1XpHZeBEfLZCIFW2fp2FZF5Tq30wDNTJyvezpU0rvjHSlJqzTRvZcqK9LxJaYpM-xHx4Y24q0hhl7Lxq' },
              { name: 'Elena Rossi', loc: 'Chuyên gia ẩm thực', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOHPhsU3qHSo_KuX-FmqucaPy_ActSmOKgXl2XWIp_PW7mt6n-Y7ttMG3Vss7CIBq7TPIJJBeetyHLLQqjuCAlkOvtiLgzdbsGWszTw2mNR5sTlQvo3rioF3Yjfx52GyLcdKVk-HVjwVA3iqbmC2Wuki1ZzKp4F0VwqJyCPMecEy9Dx22ieWokkzoioiM-CYHpxayPxUso9H8B7kkG02pjkyueZ_HbmL2teLUJWMW4f9-RxW31FJX_645hXDS2Tdd7URaNCy4cyrSm' }
            ].map((user) => (
              <div key={user.name} className="flex items-center justify-between text-left">
                <div className="flex items-center gap-sm text-left">
                  <img alt={user.name} className="w-10 h-10 rounded-full object-cover" src={user.avatar} />
                  <div className="text-left">
                    <h4 className="font-label-md text-label-md text-on-surface uppercase">{user.name}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{user.loc}</p>
                  </div>
                </div>
                <button className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-3 py-1.5 rounded-full hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border-none">Theo dõi</button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Floating Action Button (Mobile) */}
      <button className="md:hidden fixed bottom-28 right-6 w-14 h-14 bg-secondary-container text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer border-none">
        <span className="material-symbols-outlined text-3xl">edit</span>
      </button>
    </div>
  );
}

export default Community;
