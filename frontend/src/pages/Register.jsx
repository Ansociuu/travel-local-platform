import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] text-left">
      <div className="max-w-5xl w-full flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30">
        
        {/* Left Side: Image & Branding */}
        <div className="hidden lg:block w-1/2 relative bg-secondary overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsEamC16ZYNKqM_ITQys3f8j_V5JVIPO5EL7U1wDXVpfkN4SaLtxT6RUfxa4giw0BLZ12Jmpe-W2fr20yU-ilCdb7ECPDNzUl7blCInZp4maxxbzHzhemWyoKsRdx5M5RJbVvENFaOLI4rRd2szuJylnyikJqA67MN1YljPJHGx095QHK23MOs-dEFt3nn6z3aF-ExyHis2rqHmp27BeCW7TVToJY5zbzgQxG61BSYMqWKm3Fp4H8iGcIbcR8l-TUgsFAUpwDjhscV" 
            alt="Adventure awaits" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="relative h-full flex flex-col justify-end p-12 text-white text-left">
             <button onClick={() => navigate('/')} className="absolute top-12 left-12 text-2xl font-bold tracking-tight bg-transparent border-none text-white cursor-pointer hover:opacity-80 transition-opacity">Globetrot</button>
             <h2 className="text-4xl font-extrabold mb-4">Bắt đầu cuộc phiêu lưu!</h2>
             <p className="text-lg text-white/90 mb-8">Tạo tài khoản để mở khóa những tính năng cá nhân hóa, lưu địa điểm yêu thích và kết nối với cộng đồng du lịch.</p>
             <div className="flex gap-2">
                <span className="w-4 h-1 bg-white/40 rounded-full"></span>
                <span className="w-12 h-1 bg-white rounded-full"></span>
                <span className="w-4 h-1 bg-white/40 rounded-full"></span>
             </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="mb-10 text-left">
            <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng ký tài khoản</h1>
            <p className="text-on-surface-variant font-medium">Đã có tài khoản? <button onClick={() => navigate('/login')} className="text-primary hover:underline font-bold bg-transparent border-none p-0 cursor-pointer">Đăng nhập ngay</button></p>
          </div>

          <form className="space-y-5">
            <div className="text-left">
              <label className="block text-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Họ và tên</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline-variant">person</span>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Địa chỉ Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline-variant">mail</span>
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-sm font-bold text-on-surface mb-2 uppercase tracking-wide">Mật khẩu</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline-variant">lock</span>
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ cái và số.</p>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  className="h-5 w-5 text-primary focus:ring-primary border-outline-variant rounded-md transition-all cursor-pointer" 
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-on-surface-variant">
                  Tôi đồng ý với <a href="#" className="text-primary hover:underline font-bold">Điều khoản dịch vụ</a> và <a href="#" className="text-primary hover:underline font-bold">Chính sách bảo mật</a>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-secondary-container text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#e67300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all active:scale-[0.98] shadow-lg shadow-secondary/20 border-none cursor-pointer mt-2"
            >
              Đăng ký ngay
            </button>
          </form>

          <div className="mt-8 text-left">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-on-surface-variant font-semibold">Tạo tài khoản nhanh với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-outline-variant rounded-2xl bg-white hover:bg-surface-container-low transition-all cursor-pointer font-bold text-on-surface-variant">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-outline-variant rounded-2xl bg-white hover:bg-surface-container-low transition-all cursor-pointer font-bold text-on-surface-variant">
                 <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-5 w-5 mr-3" alt="Facebook" />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
