function Footer() {
  return (
    <footer className="w-full py-12 border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        <div>
          <h4 className="text-xl font-bold text-blue-600 mb-4">Globetrot</h4>
          <p className="text-sm font-['Plus_Jakarta_Sans'] text-slate-500 mb-4 text-left">© 2026 Globetrot Travel Media. All rights reserved.</p>
        </div>
        <div>
          <h5 className="font-label-md text-on-surface mb-4">Công ty</h5>
          <ul className="space-y-2 list-none p-0">
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Về chúng tôi</button></li>
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Tuyển dụng</button></li>
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Phát triển bền vững</button></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-md text-on-surface mb-4">Hỗ trợ</h5>
          <ul className="space-y-2 list-none p-0">
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Trung tâm trợ giúp</button></li>
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Chính sách bảo mật</button></li>
            <li><button className="text-slate-500 hover:text-orange-500 transition-colors hover:underline decoration-orange-500 underline-offset-4 font-label-md cursor-pointer border-none bg-transparent p-0">Điều khoản dịch vụ</button></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-md text-on-surface mb-4">Đăng ký nhận tin</h5>
          <div className="flex gap-2">
            <input className="bg-surface border border-outline-variant rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-primary outline-none" placeholder="Email của bạn" type="email" />
            <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-label-md hover:bg-surface-tint cursor-pointer transition-colors border-none">Gửi</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
