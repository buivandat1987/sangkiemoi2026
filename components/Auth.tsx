
import React, { useState, useEffect } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, signInWithPopup, googleProvider, sendEmailVerification } from '../src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2, Sparkles, AlertCircle, CheckCircle, Chrome, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onSuccess: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.emailVerified) {
        onSuccess();
      }
    });
    return unsubscribe;
  }, [onSuccess]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.emailVerified) {
          onSuccess();
        } else {
          setError("Tài khoản chưa được xác thực. Vui lòng kiểm tra email.");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
        setError(null);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu (tối thiểu 6 ký tự).');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Đăng nhập bằng email/mật khẩu chưa được bật trong Firebase Console.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
      } else {
        setError('Đã xảy ra lỗi: ' + (err.message || 'Vui lòng thử lại.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (user && resendCooldown === 0) {
      setLoading(true);
      try {
        await sendEmailVerification(user);
        setResendCooldown(60);
        setError("Đã gửi lại email xác thực thành công!");
      } catch (err: any) {
        setError("Không thể gửi email: " + (err.message || "Thử lại sau."));
      } finally {
        setLoading(false);
      }
    }
  };

  // Verification Screen
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef2f3] p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-lg w-full text-center"
        >
          <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
            <Mail className="w-12 h-12 text-emerald-600" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">Xác thực tài khoản</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Chúng tôi đã gửi email xác thực đến:<br/>
            <span className="text-emerald-600 font-bold text-lg">{user.email}</span>
          </p>

          <div className="bg-emerald-50/50 p-6 rounded-3xl mb-8 text-left border border-emerald-100">
            <div className="flex gap-4 items-start">
              <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-emerald-900 text-sm mb-1 uppercase tracking-wider">Hướng dẫn kích hoạt:</p>
                <ul className="text-xs text-emerald-700 space-y-2 font-medium">
                  <li>• Tìm email từ "Sáng kiến Kinh nghiệm 4.0"</li>
                  <li>• Nhấn vào liên kết trong email để kích hoạt.</li>
                  <li>• Kiểm tra kỹ trong mục <b>Thư rác (Spam)</b> nếu không thấy.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
               onClick={() => window.location.reload()}
               className="w-full bg-[#1a4d44] text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-6 h-6" /> TÔI ĐÃ XÁC THỰC - VÀO APP
            </button>
            
            <div className="flex gap-3">
              <button
                disabled={loading || resendCooldown > 0}
                onClick={handleResendEmail}
                className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all text-sm"
              >
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email"}
              </button>
              <button
                onClick={() => signOut(auth)}
                className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm font-bold text-amber-600 bg-amber-50 py-3 rounded-xl border border-amber-100">
              {error}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f3] p-4 font-sans">
      <div className="max-w-[1000px] w-full flex bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Side - Promo/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1a4d44] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-400 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl font-black mb-6 leading-tight uppercase">Sáng kiến<br/>Kinh nghiệm <span className="text-emerald-400">4.0</span></h2>
            <div className="space-y-4">
              <div className="pt-4">
                <div className="bg-emerald-400/20 px-4 py-2 rounded-full inline-block border border-emerald-400/30">
                  <p className="text-sm font-black text-emerald-300">PHIÊN BẢN CHÍNH THỨC</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="bg-emerald-400/20 p-2 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Tự động soạn thảo nội dung chỉ với tên đề tài</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="bg-emerald-400/20 p-2 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Đảm bảo tính linh hoạt, logic và chuyên môn</p>
            </div>
            <p className="text-xs text-emerald-200/40 uppercase tracking-[0.2em] font-bold">Phát triển bởi: BÙI VĂN ĐẠT</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                {isLogin ? 'Chào mừng trở lại!' : 'Đăng ký tài khoản'}
              </h1>
              <p className="text-slate-500 font-medium">
                {isLogin ? 'Vui lòng đăng nhập để bắt đầu sáng tạo.' : 'Tạo tài khoản để lưu trữ các sáng kiến của bạn.'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-200 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <Chrome className="w-5 h-5 text-emerald-600" />
                Tiếp tục với Google
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hoặc sử dụng Email</span>
                <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Họ và tên</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        required
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-medium text-slate-700"
                        placeholder="Nhập họ tên đầy đủ"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold leading-snug">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a4d44] text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-900 transition-all shadow-2xl shadow-emerald-900/20 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                    {isLogin ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 font-bold">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4"
                >
                  {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
