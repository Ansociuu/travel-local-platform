import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans'] text-left">
      <div className="max-w-5xl w-full flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30">
        
        {/* Left Side: Image & Branding */}
        <div className="hidden lg:block w-1/2 relative bg-primary overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC1B8iNqZW9uQLtd9IFKHQwLio1GSf1o8rFbZEMsKgC0JW9BwUiUHqXEEnNPyadJm0i_2E4_KvewlNQ6i3axEFq6XtCr3vW3P52wUivOSUIV-yL6NLe0J1NMbQJivqlUybE1ZmOGvErbotVFsBMgXcnZjFBN9UfsdSwGJLm6WNEiaU1hdruwK8iy-inVNrJmCNIHErjTSCvjH4tJmUAuXttUrXcwGLsNS4kEJlrl-GV-JgP8ug28ZyEqOHmnt5l8sr50ZoseMIJvwD" 
            alt="Travel inspiration" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="relative h-full flex flex-col justify-end p-12 text-white text-left">
             <button onClick={() => navigate('/')} className="absolute top-12 left-12 text-2xl font-bold tracking-tight bg-transparent border-none text-white cursor-pointer hover:opacity-80 transition-opacity">Globetrot</button>
             <h2 className="text-4xl font-extrabold mb-4">Chào mừng quay trở lại!</h2>
             <p className="text-lg text-white/90 mb-8">Tiếp tục hành trình khám phá những địa điểm tuyệt vời nhất cùng Globetrot.</p>
             <div className="flex gap-2">
                <span className="w-12 h-1 bg-white rounded-full"></span>
                <span className="w-4 h-1 bg-white/40 rounded-full"></span>
                <span className="w-4 h-1 bg-white/40 rounded-full"></span>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-left">
            <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng nhập</h1>
            <p className="text-on-surface-variant font-medium">Bạn chưa có tài khoản? <button onClick={() => navigate('/register')} className="text-primary hover:underline font-bold bg-transparent border-none p-0 cursor-pointer">Đăng ký ngay</button></p>
          </div>

          <form className="space-y-6">
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-on-surface uppercase tracking-wide">Mật khẩu</label>
                <button type="button" className="text-xs text-primary hover:underline font-bold bg-transparent border-none p-0 cursor-pointer">Quên mật khẩu?</button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline-variant">lock</span>
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="remember_me" 
                name="remember_me" 
                type="checkbox" 
                className="h-5 w-5 text-primary focus:ring-primary border-outline-variant rounded-md transition-all cursor-pointer" 
              />
              <label htmlFor="remember_me" className="ml-3 block text-sm text-on-surface-variant font-medium cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] shadow-lg shadow-primary/20 border-none cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-8 text-left">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-on-surface-variant font-semibold">Hoặc tiếp tục với</span>
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

export default Login;
