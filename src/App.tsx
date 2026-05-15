import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  User as UserIcon, 
  LogOut, 
  MessageSquare, 
  Heart, 
  ArrowLeft,
  BookOpen,
  Filter,
  Sparkles,
  Wand2,
  Loader2,
  Check
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  User,
  updateProfile // Added updateProfile
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from './lib/firebase';
import { Initiative, OperationType } from './types';
import { handleFirestoreError } from './lib/error-handler';

// --- Components ---

function Navbar({ user, onSignOut, onHome }: { user: User | null, onSignOut: () => void, onHome: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/80 backdrop-blur-md border-b border-warm-ink/5 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onHome}
        >
          <div className="bg-olive p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="serif text-2xl font-bold tracking-tight">Sáng Kiến Việt</span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-ink/5 border border-warm-ink/10">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || ''} 
                  className="w-6 h-6 rounded-full border border-warm-ink/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-olive/10 flex items-center justify-center text-[10px] font-bold text-olive">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium hidden sm:inline">{user.displayName || user.email}</span>
            </div>
            <button 
              onClick={onSignOut}
              className="p-2 hover:bg-warm-ink/5 rounded-full transition-colors text-warm-ink/60 hover:text-warm-ink"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}

function AuthForm({ 
  mode, 
  onSwitch, 
  onGoogleSignIn 
}: { 
  mode: 'login' | 'register', 
  onSwitch: () => void,
  onGoogleSignIn: () => void 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // --- Gửi email xác thực ---
        try {
          await sendEmailVerification(userCredential.user);
          setSuccess('Tài khoản đã được tạo! Một email xác nhận đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra và xác thực trước khi sử dụng đầy đủ tính năng.');
        } catch (mailErr: any) {
          console.error("Lỗi gửi email:", mailErr);
          setSuccess('Tài khoản đã được tạo, nhưng không thể gửi email xác nhận lúc này. Bạn vẫn có thể đăng nhập.');
        }

        // Sync user profile
        const userRef = doc(db, 'profiles', userCredential.user.uid);
        await setDoc(userRef, {
          displayName,
          email,
          photoURL: null,
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[32px] shadow-2xl border border-warm-ink/5 w-full max-w-md mx-auto text-center"
      >
        <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <p className="text-sm font-medium leading-relaxed">{success}</p>
        </div>
        <button
          onClick={onSwitch}
          className="w-full bg-olive text-white py-3 rounded-full font-bold shadow-lg shadow-olive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Quay lại Đăng nhập
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[32px] shadow-2xl border border-warm-ink/5 w-full max-w-md mx-auto"
    >
      <h2 className="serif text-3xl font-bold mb-6 text-center">
        {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-warm-ink/40 mb-1.5 ml-4">Họ và Tên</label>
            <input
              type="text"
              required
              className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        )}
        
        <div>
          <label className="block text-[10px] font-bold tracking-widest uppercase text-warm-ink/40 mb-1.5 ml-4">Email</label>
          <input
            type="email"
            required
            className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-widest uppercase text-warm-ink/40 mb-1.5 ml-4">Mật khẩu</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-olive text-white py-3 rounded-full font-bold shadow-lg shadow-olive/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-warm-ink/10"></div>
          </div>
          <span className="relative px-4 bg-white text-[10px] font-bold tracking-widest uppercase text-warm-ink/30 italic">Hoặc</span>
        </div>

        <button
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-warm-ink/10 py-3 rounded-full hover:bg-warm-bg transition-colors font-medium text-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Tiếp tục với Google
        </button>

        <p className="mt-8 text-center text-sm text-warm-ink/50">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button
            onClick={onSwitch}
            className="ml-1.5 text-olive font-bold hover:underline"
          >
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

function LandingHero({ onSignIn }: { onSignIn: () => void }) {
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <span className="inline-block px-3 py-1 bg-olive/10 text-olive rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            Nền tảng chia sẻ sáng kiến
          </span>
          <h1 className="serif text-5xl md:text-7xl font-bold leading-[1.1] mb-8">
            Lan tỏa tri thức,<br />
            <span className="italic text-olive underline decoration-olive/20 underline-offset-8">Nâng tầm giáo dục.</span>
          </h1>
          <p className="text-lg text-warm-ink/60 mb-8 max-w-xl leading-relaxed">
            Nơi lưu giữ và chia sẻ những sáng kiến kinh nghiệm quý báu từ cộng đồng giáo dục Việt Nam. Hãy trở thành một phần của cộng đồng tri thức ngay hôm nay.
          </p>
          
          <div className="flex items-center gap-6 text-warm-ink/40">
            <div className="flex flex-col">
              <span className="serif text-3xl font-bold text-warm-ink/80 tracking-tight">500+</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Sáng kiến</span>
            </div>
            <div className="w-px h-8 bg-warm-ink/10" />
            <div className="flex flex-col">
              <span className="serif text-3xl font-bold text-warm-ink/80 tracking-tight">1k+</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Thành viên</span>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {authMode === 'landing' ? (
              <motion.div
                key="landing-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-4 max-w-xs mx-auto lg:mx-0"
              >
                <button
                  onClick={() => setAuthMode('register')}
                  className="bg-olive text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-olive/90 transition-all shadow-xl shadow-olive/20 hover:scale-105 active:scale-95"
                >
                  Đăng ký tài khoản
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className="bg-white border border-warm-ink/10 text-warm-ink px-8 py-4 rounded-full text-lg font-bold hover:bg-warm-bg transition-all hover:scale-105 active:scale-95"
                >
                  Đăng nhập
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-warm-ink/30 text-sm italic">
                  <Sparkles className="w-4 h-4" />
                  <span>Hoặc khám phá thư viện ngay</span>
                </div>
              </motion.div>
            ) : (
              <AuthForm 
                mode={authMode === 'login' ? 'login' : 'register'} 
                onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                onGoogleSignIn={onSignIn}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InitiativeGrid({ 
  initiatives, 
  onSelect, 
  onAdd,
  currentUserId
}: { 
  initiatives: Initiative[], 
  onSelect: (init: Initiative) => void,
  onAdd: () => void,
  currentUserId: string
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Tất cả');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  
  const categories = ['Tất cả', 'Mầm non', 'Tiểu học', 'Trung học Cơ sở', 'Trung học Phổ thông', 'Quản lý Giáo dục'];

  const filtered = initiatives.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         i.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'Tất cả' || i.category === selectedCat;
    const matchesMine = !showOnlyMine || i.authorId === currentUserId;
    return matchesSearch && matchesCat && matchesMine;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="serif text-4xl font-bold mb-2">Thư viện Sáng kiến</h2>
            <p className="text-warm-ink/50">Khám phá sức sáng tạo từ {initiatives.length} sáng kiến đã đăng tải</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showOnlyMine 
                ? 'bg-olive text-white shadow-lg' 
                : 'bg-warm-ink/5 text-warm-ink/60 hover:bg-warm-ink/10'
              }`}
            >
              {showOnlyMine ? 'Tất cả sáng kiến' : 'Sáng kiến của tôi'}
            </button>
            <button 
              onClick={onAdd}
              className="bg-olive text-white p-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all active:scale-95"
              title="Thêm sáng kiến mới"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative group flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-ink/30 group-focus-within:text-olive transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm theo tên sáng kiến, tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-warm-ink/10 rounded-2xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all text-sm shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all ${
                  selectedCat === cat
                  ? 'bg-warm-ink text-white shadow-md'
                  : 'bg-white border border-warm-ink/10 text-warm-ink/40 hover:border-warm-ink/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((init, idx) => (
            <motion.div
              layout
              key={init.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(init)}
              className="bg-white rounded-[32px] p-8 border border-warm-ink/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-olive/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-olive/10 transition-colors" />
              
              <div className="mb-6">
                <span className="px-3 py-1 bg-olive/10 text-olive rounded-full text-[10px] font-black tracking-widest uppercase inline-block">
                  {init.category}
                </span>
              </div>
              
              <h3 className="serif text-2xl font-bold mb-4 group-hover:text-olive transition-colors line-clamp-2 leading-tight">
                {init.title}
              </h3>
              
              <p className="text-sm text-warm-ink/50 mb-8 line-clamp-3 leading-relaxed flex-grow italic">
                "{init.description || 'Chưa có tóm tắt nội dung...'}"
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-warm-ink/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warm-ink/5 flex items-center justify-center text-xs font-bold text-warm-ink/40 group-hover:bg-olive group-hover:text-white transition-all">
                    {init.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-warm-ink/30">Tác giả</span>
                    <span className="text-sm font-semibold text-warm-ink/70">{init.authorName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-warm-ink/30">Yêu thích</span>
                    <span className="text-xs font-bold text-warm-ink/60">{init.likesCount || 0}</span>
                  </div>
                  <Heart className="w-5 h-5 text-warm-ink/10 group-hover:text-red-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="bg-warm-ink/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-warm-ink/20" />
            </div>
            <h3 className="serif text-2xl font-bold text-warm-ink/40 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-warm-ink/20">Thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsSection({ 
  initiativeId, 
  user 
}: { 
  initiativeId: string, 
  user: User | null 
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'initiatives', initiativeId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setComments(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `initiatives/${initiativeId}/comments`);
    });

    return () => unsubscribe();
  }, [initiativeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'initiatives', initiativeId, 'comments'), {
        initiativeId,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `initiatives/${initiativeId}/comments`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-warm-ink/5">
      <h3 className="serif text-2xl font-bold mb-8 flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-olive" />
        Thảo luận ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative group">
          <textarea
            required
            rows={3}
            placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn về sáng kiến này..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all text-sm leading-relaxed"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute bottom-4 right-4 bg-olive text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-olive/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi góp ý'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={comment.id}
            className="flex gap-4 p-6 bg-warm-ink/5 rounded-3xl"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-olive shadow-sm shrink-0">
              {comment.authorName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-warm-ink/80">{comment.authorName}</span>
                <span className="text-[10px] font-bold text-warm-ink/30 uppercase tracking-widest">
                  {comment.createdAt?.toDate().toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-warm-ink/60 leading-relaxed">
                {comment.text}
              </p>
            </div>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-10 text-warm-ink/20 italic text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên đóng góp ý kiến!
          </div>
        )}
      </div>
    </div>
  );
}

function InitiativeDetail({ 
  initiative, 
  onBack, 
  onLike,
  user
}: { 
  initiative: Initiative, 
  onBack: () => void,
  onLike: (id: string) => void,
  user: User | null
}) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 pt-32 pb-20"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-warm-ink/50 hover:text-warm-ink mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-warm-ink/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <span className="inline-block px-3 py-1 bg-olive/10 text-olive rounded-full text-xs font-bold tracking-widest uppercase">
            {initiative.category}
          </span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-warm-ink/40 text-sm">
              <UserIcon className="w-4 h-4" />
              {initiative.authorName}
            </div>
            <button 
              onClick={() => {
                if (!liked) {
                  onLike(initiative.id);
                  setLiked(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                liked 
                ? 'bg-red-50 border-red-100 text-red-500 scale-105' 
                : 'border-warm-ink/10 text-warm-ink/40 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-bold">{initiative.likesCount + (liked ? 1 : 0)}</span>
            </button>
          </div>
        </div>

        <h1 className="serif text-4xl md:text-5xl font-bold mb-10 leading-tight">
          {initiative.title}
        </h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-xl text-warm-ink/60 mb-12 italic border-l-4 border-olive/20 pl-6 py-2">
            {initiative.description}
          </p>
          <div className="whitespace-pre-wrap text-lg leading-relaxed text-warm-ink/80">
            {initiative.content}
          </div>
        </div>

        <CommentsSection initiativeId={initiative.id} user={user} />
      </div>
    </motion.div>
  );
}


const TEMPLATE_PROMPT = `
Bạn là một trợ lý chuyên gia viết Sáng kiến kinh nghiệm trong giáo dục tại Việt Nam. 
Nhiệm vụ của bạn là viết một bài báo cáo sáng kiến kinh nghiệm chi tiết dựa trên chủ đề hoặc yêu cầu của người dùng.
Bài báo cáo PHẢI tuân thủ chính xác cấu trúc sau:

I. ĐẶT VẤN ĐỀ
1. Tên sáng kiến hoặc giải pháp: [Tên sáng kiến]
2. Sự cần thiết, mục đích của việc thực hiện sáng kiến: [Tại sao cần sáng kiến này? Mục đích đạt được là gì?]

II. NỘI DUNG SÁNG KIẾN HOẶC GIẢI PHÁP
1. Thực trạng tại đơn vị:
a. Thuận lợi: [Nêu ít nhất 3 điểm thuận lợi]
b. Khó khăn: [Nêu ít nhất 3 điểm khó khăn]
2. Nguyên nhân và hạn chế: [Tại sao lại có những khó khăn trên?]
3. Các biện pháp thực hiện: [Trình bày chi tiết các bước, các phương pháp đã triển khai. Đây là phần quan trọng nhất, hãy viết cụ thể và có tính ứng dụng cao.]

III. ĐÁNH GIÁ VỀ TÍNH MỚI, TÍNH HIỆU QUẢ VÀ KHẢ THI, PHẠM VI ÁP DỤNG
1. Tính mới: [Sáng kiến này có gì khác biệt so với cách làm cũ?]
2. Tính hiệu quả và khả thi: [Kết quả đạt được thực tế như thế nào? Có dễ dàng áp dụng không?]
3. Phạm vi áp dụng: [Có thể áp dụng ở quy mô nào? Tổ, trường, hay liên trường?]

IV. KẾT LUẬN
[Tóm tắt lại giá trị của sáng kiến và bài học kinh nghiệm.]

Yêu cầu:
- Ngôn ngữ: Tiếng Việt, trang trọng, chuyên nghiệp trong lĩnh vực giáo dục.
- Nội dung: Khoa học, cụ thể, dễ hiểu.
- Không sử dụng các ký tự Markdown đặc biệt như ** hay #. Hãy trình bày theo kiểu văn bản báo cáo truyền thống.
`;

function AIAssistant({ onApply }: { onApply: (content: string, title: string) => void }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch("/api/ai/generate-initiative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với máy chủ AI");
      }

      const data = await response.json();
      const text = data.text;
      
      if (!text) throw new Error("Không nhận được nội dung từ AI");

      // Extract title if possible
      const titleMatch = text.match(/Tên sáng kiến hoặc giải pháp:\s*(.*)/i);
      const generatedTitle = titleMatch ? titleMatch[1].trim() : topic;

      onApply(text, generatedTitle);
      setIsOpen(false);
      setTopic('');
    } catch (err: any) {
      console.error(err);
      setError("Có lỗi khi kết nối với AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-olive to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-olive/20 hover:scale-105 active:scale-95 transition-all group"
      >
        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        Trợ lý AI viết sáng kiến
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-4 w-full md:w-[400px] bg-white rounded-3xl shadow-2xl border border-warm-ink/10 p-6 z-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-olive/10 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-olive" />
              </div>
              <h3 className="serif text-xl font-bold">Viết nội dung bằng AI</h3>
            </div>
            
            <p className="text-xs text-warm-ink/50 mb-6 leading-relaxed">
              Bạn chỉ cần nhập tên chủ đề hoặc ý tưởng ngắn gọn, AI sẽ tự động hoàn thiện báo cáo theo mẫu chuẩn 4 chương.
            </p>

            <textarea
              className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all mb-4"
              rows={3}
              placeholder="Ví dụ: Giúp trẻ mầm non làm quen với toán học qua các trò chơi dân gian..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            {error && <p className="text-red-500 text-[10px] font-bold mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-warm-ink/40 hover:bg-warm-ink/5 transition-all"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={generateReport}
                disabled={loading || !topic.trim()}
                className="flex-[2] bg-olive text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-olive/10 hover:bg-olive/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang viết...
                  </>
                ) : (
                  'Bắt đầu viết'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InitiativeForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: Partial<Initiative>) => void, 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Mầm non' as any
  });

  const categories = ['Mầm non', 'Tiểu học', 'Trung học Cơ sở', 'Trung học Phổ thông', 'Quản lý Giáo dục', 'Khác'];

  const handleAIApply = (content: string, title: string) => {
    setFormData({
      ...formData,
      content,
      title: title || formData.title,
      description: `Báo cáo sáng kiến về chủ đề: ${title || 'Chưa đặt tên'}`
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto px-6 pt-32 pb-20"
    >
      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-warm-ink/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h2 className="serif text-4xl font-bold">Chia sẻ Sáng kiến</h2>
          <AIAssistant onApply={handleAIApply} />
        </div>
        
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-warm-ink/40 mb-3">Tiêu đề</label>
            <input 
              type="text" 
              required
              placeholder="Nhập tiêu đề sáng kiến của bạn..."
              className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all serif text-xl font-medium"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-warm-ink/40 mb-3">Phân loại</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat as any})}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      formData.category === cat 
                      ? 'bg-olive text-white shadow-md shadow-olive/20' 
                      : 'bg-warm-ink/5 text-warm-ink/60 hover:bg-warm-ink/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-warm-ink/40 mb-3">Tóm tắt</label>
            <textarea 
              rows={3}
              placeholder="Vài dòng giới thiệu ngắn gọn về sáng kiến..."
              className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-warm-ink/40 mb-3">Nội dung chi tiết</label>
            <textarea 
              rows={12}
              required
              placeholder="Trình bày chi tiết sáng kiến, kinh nghiệm của bạn..."
              className="w-full bg-warm-bg/50 border border-warm-ink/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/50 transition-all font-mono text-sm leading-relaxed"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-warm-ink/5">
            <button 
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-warm-ink/60 hover:bg-warm-ink/5 transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={() => onSubmit(formData)}
              className="bg-olive text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-olive/20 hover:scale-105 active:scale-95 transition-all"
            >
              Đăng tải ngay
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main App ---

function VerificationPending({ user, onResend, onSignOut }: { user: User, onResend: () => Promise<void>, onSignOut: () => void }) {
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setError('');
    try {
      await onResend();
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      if (e.code === 'auth/too-many-requests') {
        setError('Bạn gửi yêu cầu quá nhanh. Vui lòng đợi một lát.');
      } else {
        setError('Có lỗi xảy ra khi gửi email.');
      }
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-warm-ink/5 max-w-md w-full text-center"
      >
        <div className="bg-olive/10 text-olive w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="serif text-3xl font-bold mb-4">Xác thực tài khoản</h2>
        <p className="text-warm-ink/60 mb-8 leading-relaxed">
          Chào <strong>{user.displayName || user.email}</strong>, bạn cần xác nhận địa chỉ email <strong>{user.email}</strong> để sử dụng Sáng Kiến Việt.
        </p>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4 text-left">
            <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Vui lòng kiểm tra hộp thư đến. Nếu không thấy, hãy kiểm tra kỹ trong mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo</strong> để kích hoạt tài khoản.
              </span>
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full bg-olive text-white py-3 rounded-full font-bold shadow-lg shadow-olive/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại email xác nhận'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-warm-ink/5 text-warm-ink py-3 rounded-full font-bold hover:bg-warm-ink/10 transition-all"
          >
            Tôi đã xác nhận xong
          </button>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          {sent && !error && <p className="text-green-600 text-xs font-medium">Đã gửi email xác nhận mới!</p>}

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 text-warm-ink/40 hover:text-warm-ink transition-colors text-sm font-medium pt-4"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'grid' | 'form' | 'detail'>('grid');
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);

  // Added logic to check verification
  const isEmailVerified = user?.emailVerified || user?.providerData.some(p => p.providerId === 'google.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Sync user profile - only if verified or google
        if (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com')) {
          const userRef = doc(db, 'profiles', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            try {
              await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: 'user',
                createdAt: serverTimestamp()
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, `profiles/${user.uid}`);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isEmailVerified) {
      setInitiatives([]);
      return;
    }

    const q = query(
      collection(db, 'initiatives'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Initiative[];
      setInitiatives(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'initiatives');
    });

    return () => unsubscribe();
  }, [user, isEmailVerified]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const handleResendEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.error("Failed to resend", e);
      }
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleAddInitiative = async (data: Partial<Initiative>) => {
    if (!user || !isEmailVerified) return;
    
    try {
      await addDoc(collection(db, 'initiatives'), {
        ...data,
        authorId: user.uid,
        authorName: user.displayName,
        status: 'published',
        likesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setView('grid');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'initiatives');
    }
  };

  const handleLike = async (id: string) => {
    if (!isEmailVerified) return;
    try {
      const docRef = doc(db, 'initiatives', id);
      await updateDoc(docRef, {
        likesCount: increment(1)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `initiatives/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg">
        <Sparkles className="w-10 h-10 text-olive animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar 
        user={user} 
        onSignOut={handleSignOut} 
        onHome={() => { setView('grid'); setSelectedInitiative(null); }} 
      />
      
      {!user ? (
        <LandingHero onSignIn={handleSignIn} />
      ) : !isEmailVerified ? (
        <VerificationPending user={user} onResend={handleResendEmail} onSignOut={handleSignOut} />
      ) : (
        <main>
          {view === 'grid' && (
            <InitiativeGrid 
              initiatives={initiatives} 
              onSelect={(init) => { setSelectedInitiative(init); setView('detail'); }}
              onAdd={() => setView('form')}
              currentUserId={user.uid}
            />
          )}

          {view === 'form' && (
            <InitiativeForm 
              onSubmit={handleAddInitiative} 
              onCancel={() => setView('grid')} 
            />
          )}

          {view === 'detail' && selectedInitiative && (
            <InitiativeDetail 
              initiative={selectedInitiative} 
              onBack={() => setView('grid')}
              onLike={handleLike}
              user={user}
            />
          )}
        </main>
      )}

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(90,90,64,0.05)_0%,transparent_50%)]" />
    </div>
  );
}
