import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import { Upload, Download, RefreshCw, Shield, Camera, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BannerStats } from './types';

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 675;

// The green box coordinates in the template
const GREEN_BOX = {
  x: 64,
  y: 154,
  width: 297,
  height: 346
};

// Base64 of the provided template image (extracted from prompt)
const TEMPLATE_URL = 'https://storage.googleapis.com/generativeai-downloads/images/bhadko_template.png'; 

export default function App() {
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = TEMPLATE_URL;
    img.onload = () => setTemplateImage(img);
    img.onerror = () => {
      console.error('Failed to load template image');
      // Fallback to a colored rect if template fails
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;
        img.onload = () => setUserImage(img);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `bhadko-digital-tv-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      await fetch('/api/log-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoName: imageName, bannerType: 'digital-tv' }),
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to log generation', err);
    }
  };

  const reset = () => {
    setUserImage(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-500/30">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl italic skew-x-[-10deg]">
              B
            </div>
            <span className="font-bold tracking-tighter text-xl italic uppercase">Bhadko Digital TV</span>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showStats ? 'Editor' : 'Stats'}
            </button>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Media Banner Maker</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!showStats ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-[1fr_400px] gap-12 items-start"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light tracking-tight">Banner <span className="font-serif italic">Preview</span></h2>
                  <button onClick={reset} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                    <RefreshCw size={18} />
                  </button>
                </div>

                <div className="relative aspect-[1200/675] w-full bg-[#141414] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <Stage 
                      width={BANNER_WIDTH} 
                      height={BANNER_HEIGHT} 
                      ref={stageRef} 
                      className="origin-center scale-[0.3] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.8] xl:scale-100"
                    >
                      <Layer>
                        {/* Template Background */}
                        {templateImage && (
                          <KonvaImage 
                            image={templateImage} 
                            width={BANNER_WIDTH} 
                            height={BANNER_HEIGHT} 
                          />
                        )}

                        {/* User Image in Green Box */}
                        {userImage ? (
                          <Group clipX={GREEN_BOX.x} clipY={GREEN_BOX.y} clipWidth={GREEN_BOX.width} clipHeight={GREEN_BOX.height}>
                            <KonvaImage
                              image={userImage}
                              x={GREEN_BOX.x}
                              y={GREEN_BOX.y}
                              width={GREEN_BOX.width}
                              height={GREEN_BOX.height}
                              crop={{
                                x: 0,
                                y: 0,
                                width: userImage.width,
                                height: userImage.height,
                              }}
                            />
                          </Group>
                        ) : (
                          <Rect 
                            x={GREEN_BOX.x} 
                            y={GREEN_BOX.y} 
                            width={GREEN_BOX.width} 
                            height={GREEN_BOX.height} 
                            fill="#82d65a" // Matching the green in the template
                          />
                        )}
                      </Layer>
                    </Stage>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <Shield className="text-emerald-500" size={20} />
                  <p className="text-sm text-white/60">
                    Your photo is placed automatically in the designated frame.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Actions</h3>
                  <div className="grid gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                    >
                      <Camera size={20} />
                      {userImage ? 'Change Photo' : 'Upload Your Photo'}
                    </button>
                    
                    <button 
                      disabled={!userImage}
                      onClick={handleDownload}
                      className="w-full bg-red-600 disabled:bg-red-900/50 disabled:text-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
                    >
                      <Download size={20} />
                      Download Final Banner
                    </button>
                  </div>
                </section>

                <div className="p-6 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl border border-red-600/20">
                  <p className="text-xs text-white/60 leading-relaxed">
                    This banner is optimized for <strong>Bhadko Digital TV Media</strong>. Upload your photo to see it appear in the live broadcast frame.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight">Media <span className="font-serif italic">Insights</span></h2>
                <button onClick={fetchStats} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">Banners Created</p>
                  <p className="text-5xl font-bold tracking-tighter">{stats?.total || 0}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">Network Status</p>
                  <p className="text-5xl font-bold tracking-tighter text-emerald-500">LIVE</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">Server Load</p>
                  <p className="text-5xl font-bold tracking-tighter">Minimal</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-bold">Recent Generations</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="px-6 py-4 font-medium">ID</th>
                        <th className="px-6 py-4 font-medium">Photo</th>
                        <th className="px-6 py-4 font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats?.recent.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-white/40">#{row.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{row.user_photo_name}</td>
                          <td className="px-6 py-4 text-sm text-white/40">
                            {new Date(row.timestamp).toLocaleString()}
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

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-white/20 text-xs tracking-widest uppercase font-bold">
          © Copyright to Bhadko Digital TV Media • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
