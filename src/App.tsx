/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from 'react-konva';
import { Upload, Download, RefreshCw, Shield, Layout, Camera, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BannerStats, BannerConfig } from './types';

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 630;

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [config, setConfig] = useState<BannerConfig>({
    headline: 'BREAKING NEWS',
    subHeadline: 'EXCLUSIVE COVERAGE BY BHADKO NEWS',
    accentColor: '#ef4444', // Red-500
  });
  
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
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
        img.onload = () => {
          setImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `bhadko-news-banner-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Log generation to backend
    try {
      await fetch('/api/log-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoName: imageName, bannerType: 'news-standard' }),
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to log generation', err);
    }
  };

  const reset = () => {
    setImage(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl italic skew-x-[-10deg]">
              B
            </div>
            <span className="font-bold tracking-tighter text-xl italic uppercase">Bhadko News</span>
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
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Professional Banner Maker</span>
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
              {/* Preview Area */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light tracking-tight">Banner <span className="font-serif italic">Preview</span></h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={reset}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                      title="Reset"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative aspect-[1200/630] w-full bg-[#141414] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                  {!image ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-white/40" />
                      </div>
                      <p className="text-white/60 font-medium">Upload your photo to begin</p>
                      <p className="text-white/20 text-sm mt-1">Recommended: 1200x630px or higher</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Stage width={BANNER_WIDTH} height={BANNER_HEIGHT} ref={stageRef} scaleX={0.5} scaleY={0.5} className="origin-center scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-100">
                        <Layer>
                          {/* Background */}
                          <Rect width={BANNER_WIDTH} height={BANNER_HEIGHT} fill="#000" />
                          
                          {/* User Image */}
                          {image && (
                            <Group>
                              <KonvaImage
                                image={image}
                                width={BANNER_WIDTH}
                                height={BANNER_HEIGHT}
                                opacity={0.8}
                                x={0}
                                y={0}
                                crop={{
                                  x: 0,
                                  y: 0,
                                  width: image.width,
                                  height: image.height,
                                }}
                              />
                              {/* Gradient Overlay */}
                              <Rect 
                                width={BANNER_WIDTH} 
                                height={BANNER_HEIGHT} 
                                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                                fillLinearGradientEndPoint={{ x: 0, y: BANNER_HEIGHT }}
                                fillLinearGradientColorStops={[0, 'transparent', 0.6, 'rgba(0,0,0,0.4)', 1, 'rgba(0,0,0,0.9)']}
                              />
                            </Group>
                          )}

                          {/* News Frame */}
                          <Rect 
                            x={0} 
                            y={BANNER_HEIGHT - 140} 
                            width={BANNER_WIDTH} 
                            height={140} 
                            fill="rgba(0,0,0,0.8)" 
                          />
                          
                          {/* Accent Bar */}
                          <Rect 
                            x={0} 
                            y={BANNER_HEIGHT - 140} 
                            width={10} 
                            height={140} 
                            fill={config.accentColor} 
                          />

                          {/* Headline */}
                          <Text 
                            text={config.headline}
                            x={40}
                            y={BANNER_HEIGHT - 110}
                            fontSize={64}
                            fontFamily="sans-serif"
                            fontStyle="bold"
                            fill="#fff"
                            letterSpacing={-2}
                          />

                          {/* Sub-headline */}
                          <Text 
                            text={config.subHeadline}
                            x={40}
                            y={BANNER_HEIGHT - 45}
                            fontSize={20}
                            fontFamily="sans-serif"
                            fontStyle="bold"
                            fill={config.accentColor}
                            letterSpacing={2}
                          />

                          {/* Branding Logo */}
                          <Group x={BANNER_WIDTH - 220} y={40}>
                            <Rect width={180} height={60} fill={config.accentColor} cornerRadius={4} skewX={-10} />
                            <Text 
                              text="BHADKO"
                              x={15}
                              y={15}
                              fontSize={32}
                              fontFamily="sans-serif"
                              fontStyle="bold italic"
                              fill="#fff"
                            />
                          </Group>

                          {/* Copyright */}
                          <Text 
                            text="© Copyright to Bhadko News"
                            x={BANNER_WIDTH - 250}
                            y={BANNER_HEIGHT - 30}
                            fontSize={14}
                            fontFamily="sans-serif"
                            fill="rgba(255,255,255,0.4)"
                          />
                        </Layer>
                      </Stage>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <Shield className="text-emerald-500" size={20} />
                  <p className="text-sm text-white/60">
                    Your photo is processed locally in your browser. We only log the generation event for statistics.
                  </p>
                </div>
              </div>

              {/* Controls Area */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60">Headline</label>
                      <input 
                        type="text" 
                        value={config.headline}
                        onChange={(e) => setConfig({...config, headline: e.target.value.toUpperCase()})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60">Sub-headline</label>
                      <input 
                        type="text" 
                        value={config.subHeadline}
                        onChange={(e) => setConfig({...config, subHeadline: e.target.value.toUpperCase()})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60">Accent Color</label>
                      <div className="flex gap-2">
                        {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setConfig({...config, accentColor: color})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.accentColor === color ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Actions</h3>
                  <div className="grid gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                    >
                      <Camera size={20} />
                      {image ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    
                    <button 
                      disabled={!image}
                      onClick={handleDownload}
                      className="w-full bg-red-600 disabled:bg-red-900/50 disabled:text-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
                    >
                      <Download size={20} />
                      Download Banner
                    </button>
                  </div>
                </section>

                <div className="p-6 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl border border-red-600/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Layout className="text-red-500" size={18} />
                    <span className="font-bold text-sm">Pro Tip</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Use high-resolution landscape photos for the best results. The banner is optimized for social media sharing (1200x630).
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
                <h2 className="text-3xl font-light tracking-tight">Generation <span className="font-serif italic">Insights</span></h2>
                <button 
                  onClick={fetchStats}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">Total Banners Created</p>
                  <p className="text-5xl font-bold tracking-tighter">{stats?.total || 0}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">Active Users</p>
                  <p className="text-5xl font-bold tracking-tighter">Live</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <p className="text-white/40 text-sm font-medium mb-1">System Status</p>
                  <p className="text-5xl font-bold tracking-tighter text-emerald-500">OK</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-bold">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="px-6 py-4 font-medium">ID</th>
                        <th className="px-6 py-4 font-medium">Photo Name</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats?.recent.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-white/40">#{row.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{row.user_photo_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded uppercase tracking-wider border border-red-500/20">
                              {row.banner_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/40">
                            {new Date(row.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recent || stats.recent.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">
                            No activity recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 opacity-40">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-black italic skew-x-[-10deg]">
            B
          </div>
          <span className="font-bold tracking-tighter text-lg italic uppercase">Bhadko News</span>
        </div>
        <p className="text-white/20 text-xs tracking-widest uppercase font-bold">
          © Copyright to Bhadko News • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
