/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group, Text, Circle } from 'react-konva';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Shield, 
  Camera, 
  BarChart3, 
  Info,
  History,
  Settings2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Lock,
  LogOut,
  Sparkles,
  Tv,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BannerStats } from './types';

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 675;

const GREEN_BOX = {
  x: 53,
  y: 154,
  width: 297,
  height: 346
};

const TEMPLATE_URL = 'https://storage.googleapis.com/generativeai-downloads/images/bhadko_template.png';
const LOGO_URL = 'https://storage.googleapis.com/generativeai-downloads/images/bhadko_logo_new.png';

export default function App() {
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [view, setView] = useState<'landing' | 'editor' | 'login' | 'admin'>('landing');
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Load Template
    const tImg = new window.Image();
    tImg.crossOrigin = 'Anonymous';
    tImg.src = TEMPLATE_URL;
    tImg.onload = () => setTemplateImage(tImg);

    // Load Logo
    const lImg = new window.Image();
    lImg.crossOrigin = 'Anonymous';
    lImg.src = LOGO_URL;
    lImg.onload = () => setLogoImage(lImg);
  }, [fetchStats]);

  const handleImageUpload = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => setUserImage(img);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    setIsGenerating(true);
    
    await new Promise(r => setTimeout(r, 1000));

    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `bhadko-tv-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#ff0000', '#ffffff', '#000000']
    });

    try {
      await fetch('/api/log-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoName: imageName, bannerType: 'digital-tv-v3' }),
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to log generation', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        setView('admin');
        fetchStats();
      } else {
        setLoginError('Invalid password');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  const reset = () => {
    setUserImage(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-8 h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-5 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <div className="w-14 h-14 bg-brand-red rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-red/30 rotate-[-4deg] group-hover:rotate-0 transition-all duration-500">
              <span className="font-display font-black text-3xl italic">B</span>
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight leading-none uppercase italic">Bhadko Digital TV</h1>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mt-1.5">Elite Media Production</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-white/40">
              <button onClick={() => setView('landing')} className={`hover:text-white transition-colors ${view === 'landing' ? 'text-white' : ''}`}>Home</button>
              <button onClick={() => setView('editor')} className={`hover:text-white transition-colors ${view === 'editor' ? 'text-white' : ''}`}>Studio</button>
              <button onClick={() => setView(isLoggedIn ? 'admin' : 'login')} className={`hover:text-white transition-colors ${view === 'admin' || view === 'login' ? 'text-white' : ''}`}>Admin</button>
            </div>
            
            <button 
              onClick={() => setView('editor')}
              className="btn-brand !py-3 !px-6 !text-xs !rounded-xl hidden sm:flex"
            >
              START CREATING
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-24 max-w-screen-2xl mx-auto px-8 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-16"
            >
              <div className="space-y-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-2 bg-brand-red/10 border border-brand-red/20 rounded-full text-brand-red text-[10px] font-black uppercase tracking-[0.3em]"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  Elite Media Production Suite v3.0
                </motion.div>
                <h2 className="text-7xl md:text-9xl font-display font-black tracking-tighter italic uppercase leading-[0.85]">
                  The Future of <span className="text-brand-red">Broadcasting</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
                  Create professional-grade broadcast frames for Bhadko Digital TV in seconds. Elite quality, instant rendering, zero compromise.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <button 
                  onClick={() => setView('editor')} 
                  className="btn-brand !text-xl !px-16 !py-6 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    ENTER STUDIO
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
                <button 
                  onClick={() => setView('login')} 
                  className="btn-primary !bg-white/5 !text-white !border !border-white/10 !text-xl !px-16 !py-6 hover:!bg-white/10 transition-all"
                >
                  ADMIN ACCESS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-12">
                {[
                  { 
                    icon: Tv, 
                    title: 'Broadcast Ready', 
                    desc: 'Optimized for CMN World TV CH.No. 417 and all digital platforms.' 
                  },
                  { 
                    icon: Shield, 
                    title: 'Secure & Private', 
                    desc: 'Your media is processed locally. We value your privacy above all else.' 
                  },
                  { 
                    icon: BarChart3, 
                    title: 'Live Analytics', 
                    desc: 'Monitor generation trends and broadcast history in real-time.' 
                  }
                ].map((item, i) => (
                  <div key={i} className="glass-panel p-10 space-y-6 hover:border-brand-red/30 transition-all duration-500 group text-left">
                    <div className="w-16 h-16 rounded-2xl bg-brand-red/5 border border-brand-red/10 flex items-center justify-center group-hover:bg-brand-red/20 transition-all duration-500">
                      <item.icon className="text-brand-red" size={32} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-display font-bold uppercase italic tracking-tight">{item.title}</h4>
                      <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Section */}
              <div className="pt-20 border-t border-white/5 w-full flex flex-col items-center gap-8">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Trusted by Elite Broadcasters</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-20 grayscale">
                  <span className="font-display font-black text-2xl italic tracking-tighter">CMN WORLD TV</span>
                  <span className="font-display font-black text-2xl italic tracking-tighter">PLAYBOX TV</span>
                  <span className="font-display font-black text-2xl italic tracking-tighter">TVONE</span>
                  <span className="font-display font-black text-2xl italic tracking-tighter">DTH LIVE</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid lg:grid-cols-[1fr_440px] gap-16 items-start"
            >
              <div className="space-y-10">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-5xl font-display font-black tracking-tight italic uppercase">Studio <span className="text-brand-red">Canvas</span></h2>
                    <p className="text-white/30 mt-3 flex items-center gap-2 font-medium uppercase tracking-widest text-[10px]">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Live Rendering Engine Active
                    </p>
                  </div>
                  <button onClick={reset} className="group flex items-center gap-3 text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                    Clear Stage
                  </button>
                </div>

                <div 
                  className={`relative aspect-[1200/675] w-full glass-panel overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-700 ${isDragging ? 'scale-[1.03] border-brand-red/40 bg-brand-red/5 ring-4 ring-brand-red/10' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                >
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <Stage 
                      width={BANNER_WIDTH} 
                      height={BANNER_HEIGHT} 
                      ref={stageRef} 
                      className="origin-center scale-[0.3] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.8] xl:scale-100"
                    >
                      <Layer>
                        {/* Background */}
                        <Rect width={BANNER_WIDTH} height={BANNER_HEIGHT} fill="#fff" />
                        
                        {/* Template Background (if needed as a base) */}
                        {templateImage && (
                          <KonvaImage image={templateImage} width={BANNER_WIDTH} height={BANNER_HEIGHT} />
                        )}

                        {/* User Image in designated frame */}
                        {userImage ? (
                          <Group clipX={GREEN_BOX.x} clipY={GREEN_BOX.y} clipWidth={GREEN_BOX.width} clipHeight={GREEN_BOX.height}>
                            <KonvaImage
                              image={userImage}
                              x={GREEN_BOX.x}
                              y={GREEN_BOX.y}
                              width={GREEN_BOX.width}
                              height={GREEN_BOX.height}
                              crop={{ x: 0, y: 0, width: userImage.width, height: userImage.height }}
                            />
                            {/* Subtle Inner Shadow for User Image */}
                            <Rect 
                              x={GREEN_BOX.x} 
                              y={GREEN_BOX.y} 
                              width={GREEN_BOX.width} 
                              height={GREEN_BOX.height} 
                              stroke="#000" 
                              strokeWidth={2} 
                              opacity={0.2}
                            />
                          </Group>
                        ) : (
                          <Rect x={GREEN_BOX.x} y={GREEN_BOX.y} width={GREEN_BOX.width} height={GREEN_BOX.height} fill="#1a1a1a" />
                        )}

                        {/* LIVE Indicator */}
                        <Group x={40} y={40}>
                          <Rect width={100} height={40} fill="#ff0000" cornerRadius={4} shadowBlur={10} shadowColor="#ff0000" shadowOpacity={0.5} />
                          <Text text="LIVE" x={22} y={10} fontSize={20} fontFamily="sans-serif" fontStyle="bold" fill="#fff" />
                          <Circle x={12} y={20} radius={4} fill="#fff" />
                        </Group>

                        {/* Top Info Text with Shadow */}
                        <Text 
                          text="CMN world TV CH.No. 417  DTH Live TV, Playbox TV, TvOne"
                          x={160}
                          y={45}
                          fontSize={24}
                          fontFamily="sans-serif"
                          fontStyle="bold"
                          fill="#000"
                          shadowBlur={2}
                          shadowColor="rgba(0,0,0,0.2)"
                          shadowOffset={{ x: 1, y: 1 }}
                        />

                        {/* Bottom Ticker Background */}
                        <Rect 
                          x={380} 
                          y={520} 
                          width={800} 
                          height={60} 
                          fill="rgba(0,0,0,0.8)" 
                          cornerRadius={5}
                        />

                        {/* Bottom Info Text (Gujarati) */}
                        <Text 
                          text="તમારા એન્ડ્રોઇડ કે એપલ ટીવી, ફોન, અને સ્માર્ટ ટીવી અને કોમ્પ્યુટર કે લેપટોપ માં જોઈ શકાય છે"
                          x={380}
                          y={535}
                          fontSize={26}
                          fontFamily="sans-serif"
                          fontStyle="bold"
                          fill="#fff"
                          width={800}
                          align="center"
                          lineHeight={1.2}
                        />

                        {/* Viewer Testimonial Area */}
                        <Rect 
                          x={20} 
                          y={520} 
                          width={340} 
                          height={80} 
                          fill="#ff0000" 
                          cornerRadius={5}
                          shadowBlur={10}
                          shadowColor="#000"
                          shadowOpacity={0.3}
                        />
                        <Text 
                          text="હું ભડકો ડીજીટલ ટીવી મીડિયા નો દર્શક છું"
                          x={20}
                          y={540}
                          fontSize={24}
                          fontFamily="sans-serif"
                          fontStyle="bold"
                          fill="#fff"
                          width={340}
                          align="center"
                          lineHeight={1.2}
                        />

                        {/* Logo Overlay */}
                        {logoImage && (
                          <KonvaImage 
                            image={logoImage} 
                            x={BANNER_WIDTH - 240} 
                            y={20} 
                            width={200} 
                            height={100} 
                            shadowBlur={5}
                            shadowColor="#000"
                            shadowOpacity={0.2}
                          />
                        )}
                      </Layer>
                    </Stage>
                  </div>

                  {!userImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/20 backdrop-blur-[1px]">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                        <ImageIcon className="text-white/20" size={40} />
                      </div>
                      <p className="text-2xl font-display font-black tracking-tight uppercase italic">Import Media</p>
                      <p className="text-white/30 text-xs mt-3 font-bold uppercase tracking-widest">Drag & Drop or use the sidebar</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center"
                      >
                        <div className="relative w-20 h-20 mb-8">
                          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                          <div className="absolute inset-0 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="font-display font-black text-2xl tracking-tight italic uppercase">Exporting Frame</p>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Optimizing for Broadcast</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-panel p-8 flex items-start gap-6 group hover:bg-white/[0.02] transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Shield className="text-emerald-500" size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest">Privacy Guard</h4>
                      <p className="text-xs text-white/30 mt-2 leading-relaxed font-medium">End-to-end local rendering. Your personal media source is never uploaded to our servers.</p>
                    </div>
                  </div>
                  <div className="glass-panel p-8 flex items-start gap-6 group hover:bg-white/[0.02] transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="text-brand-red" size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest">Verified Frame</h4>
                      <p className="text-xs text-white/30 mt-2 leading-relaxed font-medium">Using the official 2026 Bhadko Digital TV broadcast template with pixel-perfect alignment.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10 sticky top-40">
                <div className="glass-panel p-10 space-y-10 shadow-2xl">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-brand-red rounded-full" />
                      <h3 className="font-display font-black text-2xl uppercase italic tracking-tight">Production</h3>
                    </div>

                    <div className="space-y-5">
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} accept="image/*" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="btn-primary w-full group !rounded-[1.25rem]">
                        <Camera size={22} className="group-hover:scale-110 transition-transform" />
                        {userImage ? 'Change Media' : 'Upload Photo'}
                      </button>
                      <button disabled={!userImage || isGenerating} onClick={handleDownload} className="btn-brand w-full group !rounded-[1.25rem]">
                        <Download size={22} className="group-hover:translate-y-1 transition-transform" />
                        Download Banner
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5" />

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Media Inspector</h4>
                    {userImage ? (
                      <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <ImageIcon size={20} className="text-white/20" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-black truncate">{imageName}</p>
                            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider mt-1">Verified Source</p>
                          </div>
                        </div>
                        <button onClick={reset} className="p-2 text-white/20 hover:text-brand-red transition-colors">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-white/10 transition-colors">
                        <Upload size={28} className="text-white/10 mb-4 group-hover:-translate-y-1 transition-transform" />
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No Media Active</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-10 bg-gradient-to-br from-brand-red/10 to-transparent border-brand-red/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-brand-red/20 flex items-center justify-center">
                      <History size={18} className="text-brand-red" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">Live Feed</span>
                  </div>
                  <div className="space-y-4">
                    {stats?.recent.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-white/40 truncate max-w-[160px] uppercase tracking-wider">{item.user_photo_name}</span>
                        <span className="text-white/20 font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                    <button onClick={() => setView(isLoggedIn ? 'admin' : 'login')} className="w-full mt-6 py-4 text-[10px] font-black text-white/20 hover:text-white border border-white/5 rounded-2xl transition-all flex items-center justify-center gap-3 group uppercase tracking-[0.2em]">
                      Access Admin Panel
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-md mx-auto"
            >
              <div className="glass-panel p-12 space-y-10 shadow-[0_0_100px_rgba(255,0,0,0.1)]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-red rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-red/30">
                    <Lock className="text-white" size={32} />
                  </div>
                  <h2 className="text-4xl font-display font-black tracking-tight italic uppercase">Admin <span className="text-brand-red">Access</span></h2>
                  <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Secure Gateway for Bhadko Media</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Access Key</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field w-full text-center tracking-[0.5em] text-xl"
                      autoFocus
                    />
                  </div>
                  {loginError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-red text-[10px] font-black uppercase tracking-widest text-center">
                      {loginError}
                    </motion.p>
                  )}
                  <button type="submit" className="btn-brand w-full !rounded-2xl">
                    Authenticate
                  </button>
                </form>

                <button onClick={() => setView('landing')} className="w-full text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em]">
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="space-y-16"
            >
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-6xl font-display font-black tracking-tighter italic uppercase leading-none">Control <span className="text-brand-red">Center</span></h2>
                  <p className="text-white/30 mt-4 text-xl font-medium">Global broadcast metrics and generation history</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={fetchStats} className="btn-primary !py-4 !px-8 !rounded-2xl">
                    <RefreshCw size={20} />
                    Sync Data
                  </button>
                  <button onClick={() => { setIsLoggedIn(false); setView('landing'); }} className="btn-primary !bg-white/5 !text-white !border !border-white/10 !py-4 !px-6 !rounded-2xl hover:!bg-brand-red hover:!text-white hover:!border-brand-red transition-all">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                {[
                  { label: 'Global Generations', value: stats?.total || 0, icon: BarChart3, color: 'brand-red' },
                  { label: 'Network Integrity', value: '100%', icon: CheckCircle2, color: 'emerald-500' },
                  { label: 'Broadcast Status', value: 'ACTIVE', icon: Tv, color: 'blue-500' }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-12 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                    <stat.icon className="text-white/20 mb-8 group-hover:text-white transition-colors" size={40} />
                    <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                    <p className="text-7xl font-display font-black tracking-tighter italic">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="glass-panel overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <h3 className="font-display font-black text-2xl uppercase italic tracking-tight">Broadcast History</h3>
                  <div className="flex items-center gap-4 px-5 py-2 bg-brand-red/10 rounded-full border border-brand-red/20">
                    <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Live Monitoring</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] border-b border-white/5">
                        <th className="px-10 py-8">Frame ID</th>
                        <th className="px-10 py-8">Media Source</th>
                        <th className="px-10 py-8">Timestamp</th>
                        <th className="px-10 py-8">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats?.recent.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-10 py-8 text-sm font-mono text-white/20 group-hover:text-white/60 transition-colors">#{row.id.toString().padStart(5, '0')}</td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ImageIcon size={16} className="text-white/20" />
                              </div>
                              <span className="text-sm font-black uppercase tracking-wider">{row.user_photo_name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-sm text-white/30 font-bold">
                            {new Date(row.timestamp).toLocaleString()}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 w-fit uppercase tracking-widest">
                              <CheckCircle2 size={12} />
                              Broadcasted
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-16 bg-brand-dark/40">
        <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:bg-brand-red transition-colors">
              <span className="font-display font-black text-2xl italic text-black group-hover:text-white transition-colors">B</span>
            </div>
            <span className="font-display font-black text-xl tracking-tight uppercase italic">Bhadko Digital TV</span>
          </div>
          
          <div className="flex items-center gap-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>

          <p className="text-white/10 text-[10px] font-black tracking-[0.4em] uppercase">
            © {new Date().getFullYear()} Bhadko Digital TV Media • Elite Suite
          </p>
        </div>
      </footer>
    </div>
  );
}
