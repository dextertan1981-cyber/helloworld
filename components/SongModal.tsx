
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  MusicalNoteIcon, 
  SparklesIcon, 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  PhotoIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  UserIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/react/24/solid';
import { analyzeMusicCover, generateMusicAudio } from '../services/gemini';
import { generateOpenAIAudio, generateOpenAILyrics } from '../services/openai';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Song {
  id: string;
  title: string;
  style: string;
  coverImage: string;
  audioUrl: string; // Real audio source
  duration: number; // in seconds
}

type Provider = 'gemini' | 'chatgpt';

export const SongModal: React.FC<SongModalProps> = ({ isOpen, onClose }) => {
  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null); // For handling click actions in playlist
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Creation State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [songStyle, setSongStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<Provider>('gemini');
  // Removed manual API key states to comply with guidelines
  const [openaiKey, setOpenaiKey] = useState("");
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'success'>('idle');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Limits
  const MAX_SONGS = 10;

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (audioRef.current) {
          audioRef.current.pause();
      }
      setShowSettings(false);
    }
  }, [isOpen]);

  // Handle Audio Element Logic
  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.error("Auto-play prevented:", error);
                  setIsPlaying(false);
              });
          }
      } else {
          audio.pause();
      }
  }, [isPlaying, currentSongId]); // Re-run when song changes

  // Update Volume
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = isMuted ? 0 : volume;
      }
  }, [volume, isMuted]);

  // Time Update Handler
  const handleTimeUpdate = () => {
      const audio = audioRef.current;
      if (audio) {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration || 0);
          setProgress((audio.currentTime / (audio.duration || 1)) * 100);
      }
  };

  const handleSongEnded = () => {
      handleNext();
  };

  const handleLoadedMetadata = () => {
      const audio = audioRef.current;
      if (audio) {
          setDuration(audio.duration);
      }
  };

  const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64 = ev.target.result as string;
          setUploadedImage(base64);
          
          // Trigger AI Analysis immediately
          if (provider === 'gemini') {
              setIsAnalyzingImage(true);
              try {
                 // Removed manual geminiKey as per guidelines
                 const analysis = await analyzeMusicCover(base64);
                 setSongTitle(analysis.title);
                 setSongStyle(analysis.style);
              } catch (err) {
                 console.error("Analysis failed", err);
              } finally {
                 setIsAnalyzingImage(false);
              }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (songs.length >= MAX_SONGS) {
      alert("⚠️ 存储已满！影碟机最多只能存储 10 首歌曲。请先删除一些旧歌。");
      return;
    }

    if (!uploadedImage) {
      alert("请先上传一张图片作为唱片封面");
      return;
    }

    setIsGenerating(true);

    try {
        let generatedAudioUrl: string | null = null;
        let finalTitle = songTitle || `Track ${songs.length + 1}`;
        let finalStyle = songStyle || "Electronic / Pop";

        if (provider === 'gemini') {
            // Gemini generation uses process.env.API_KEY managed by services/gemini.ts
            generatedAudioUrl = await generateMusicAudio(finalStyle, finalTitle);

        } else if (provider === 'chatgpt') {
            // OpenAI Generation still requires its own key
            if (!openaiKey) {
                alert("请先在设置中配置 ChatGPT API 密钥");
                setIsGenerating(false);
                return;
            }
            
            const lyrics = await generateOpenAILyrics(openaiKey, finalStyle);
            const prompt = `Now playing: ${finalTitle}. Style: ${finalStyle}. ${lyrics.substring(0, 50)}...`;
            generatedAudioUrl = await generateOpenAIAudio(openaiKey, prompt);
        }
        
        if (!generatedAudioUrl) {
            throw new Error("音频生成返回为空 (可能是 API 配额不足)");
        }

        const newSong: Song = {
            id: Date.now().toString(),
            title: finalTitle,
            style: finalStyle,
            coverImage: uploadedImage,
            audioUrl: generatedAudioUrl, 
            duration: 0 
        };

        const updatedSongs = [newSong, ...songs];
        setSongs(updatedSongs);
        setCurrentSongId(newSong.id);
        
        // Auto play new song
        setIsPlaying(true);
        
        // Reset Input
        setSongTitle("");
        setSongStyle("");
        setUploadedImage(null);
        
    } catch (error: any) {
        console.error("Generation Failed:", error);
        alert(`生成失败:\n${error.message || "未知错误，请检查控制台"}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("确定要删除这首歌曲吗？")) return;

    const newSongs = songs.filter(s => s.id !== id);
    setSongs(newSongs);
    
    // If we deleted the current song
    if (currentSongId === id) {
        if (newSongs.length > 0) {
            // Play the first one available
            setCurrentSongId(newSongs[0].id);
            setIsPlaying(false); // Stop playing to avoid blast
        } else {
            setCurrentSongId(null);
            setIsPlaying(false);
        }
    }
  };

  const handleDownload = (song: Song, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const a = document.createElement('a');
      a.href = song.audioUrl;
      a.download = `${song.title}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleClearAll = () => {
      if (confirm("确定要清空所有歌曲吗？")) {
          setSongs([]);
          setCurrentSongId(null);
          setIsPlaying(false);
      }
  };

  const handlePlayPause = () => {
    if (songs.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSongId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSongId(songs[nextIndex].id);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSongId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSongId(songs[prevIndex].id);
    setIsPlaying(true);
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      const audio = audioRef.current;
      if (audio) {
          audio.currentTime = (val / 100) * (audio.duration || 1);
          setProgress(val);
      }
  };

  const handleConnect = () => {
      // Validate based on provider
      if (provider === 'chatgpt' && !openaiKey) {
          alert("请输入 ChatGPT API 密钥");
          return;
      }

      setConnectionState('connecting');
      // Simulate connection delay
      setTimeout(() => {
          setConnectionState('success');
          // Auto close after success
          setTimeout(() => {
              setShowSettings(false);
              setConnectionState('idle');
          }, 1000);
      }, 1000);
  };

  const currentSong = songs.find(s => s.id === currentSongId) || songs[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-[#121212] w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden relative border border-zinc-800 text-zinc-100">
        
        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef}
            src={currentSong?.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleSongEnded}
            onLoadedMetadata={handleLoadedMetadata}
        />

        {/* --- LEFT PANEL: CREATION / SETTINGS (1/3 Width) --- */}
        <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-[#18181b] shrink-0 z-20 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#18181b] relative z-20">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className={`px-2 py-0.5 rounded text-sm font-extrabold ${provider === 'gemini' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                            {provider === 'gemini' ? 'SUNO' : 'GPT'}
                        </span>
                        AI 音乐工作台
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">图生音乐模式 (Image to Music)</p>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full transition-colors ${showSettings ? 'text-white bg-zinc-700' : 'text-zinc-500 hover:text-white hover:bg-zinc-700'}`}
                    title="设置"
                >
                    <Cog6ToothIcon className={`w-5 h-5 transition-transform duration-500 ${showSettings ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. CREATION FORM VIEW */}
                <div className={`
                    absolute inset-0 p-6 flex flex-col gap-6 overflow-y-auto transition-all duration-300
                    ${showSettings ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
                `}>
                    {/* Image Upload */}
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">1. 唱片封面 (必须)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                ${uploadedImage ? 'border-yellow-500/50 bg-black' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800'}
                            `}
                        >
                            {uploadedImage ? (
                                <>
                                    <img src={uploadedImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" alt="Cover" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowPathIcon className="w-8 h-8 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <PhotoIcon className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                                    <span className="text-sm text-zinc-400 font-medium">点击上传图片</span>
                                    <span className="text-xs text-zinc-600 block mt-1">支持 PNG, JPG</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                                <span>2. 歌曲标题 (可选)</span>
                                {isAnalyzingImage && <span className="text-yellow-500 animate-pulse">AI 思考中...</span>}
                            </label>
                            <input 
                                type="text" 
                                value={songTitle}
                                onChange={(e) => setSongTitle(e.target.value)}
                                placeholder={isAnalyzingImage ? "AI 正在读取封面..." : "例如：深夜的咖啡馆..."}
                                disabled={isAnalyzingImage}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all placeholder-zinc-600 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                                <span>3. 音乐风格 (可选)</span>
                                {isAnalyzingImage && <span className="text-yellow-500 animate-pulse">AI 分析中...</span>}
                            </label>
                            <input 
                                type="text" 
                                value={songStyle}
                                onChange={(e) => setSongStyle(e.target.value)}
                                placeholder={isAnalyzingImage ? "AI 正在分析风格..." : "例如：Jazz, Lofi, Cyberpunk..."}
                                disabled={isAnalyzingImage}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all placeholder-zinc-600 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Storage Indicator */}
                    <div className="mt-auto">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-500">存储空间</span>
                            <span className={`${songs.length >= MAX_SONGS ? 'text-red-500 font-bold' : 'text-zinc-400'}`}>
                                {songs.length} / {MAX_SONGS}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${songs.length >= MAX_SONGS ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                style={{width: `${(songs.length / MAX_SONGS) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. SETTINGS VIEW */}
                <div className={`
                    absolute inset-0 p-8 flex flex-col gap-6 transition-all duration-300 bg-[#18181b] z-10
                    ${showSettings ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
                `}>
                    <div className="mb-4">
                        <h3 className="text-2xl font-bold text-white mb-2">配置选项</h3>
                        <p className="text-zinc-400 text-sm">选择您的 AI 服务商。</p>
                    </div>

                    <div className="space-y-6">
                        
                        {/* PROVIDER SELECTOR */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                <ServerIcon className="w-4 h-4" /> 服务商 (Provider)
                            </label>
                            <div className="relative">
                                <select 
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value as Provider)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white appearance-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="gemini">Gemini (Google) - 推荐</option>
                                    <option value="chatgpt">ChatGPT (OpenAI)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ArrowDownTrayIcon className="w-4 h-4 text-zinc-500" />
                                </div>
                            </div>
                        </div>

                        {/* CHATGPT KEY INPUT */}
                        {provider === 'chatgpt' && (
                             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                    <KeyIcon className="w-4 h-4" /> OpenAI API Key
                                </label>
                                <input 
                                    type="password" 
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono"
                                />
                                <p className="text-[10px] text-zinc-600 mt-2">
                                    注意：ChatGPT 模式下将使用 TTS 模型模拟音频输出。
                                </p>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleConnect}
                                disabled={connectionState === 'success'}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide transform active:scale-[0.98]
                                    ${connectionState === 'success' 
                                        ? 'bg-green-600 hover:bg-green-500' 
                                        : 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/30'
                                    }
                                `}
                            >
                                {connectionState === 'connecting' ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        正在保存...
                                    </>
                                ) : connectionState === 'success' ? (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5" />
                                        保存成功
                                    </>
                                ) : (
                                    <>
                                        确认配置
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-auto p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-xs text-zinc-500 leading-relaxed">
                        <p>Gemini 服务使用系统配置的 API 密钥。</p>
                    </div>
                </div>

            </div>

            {/* Bottom Action Button Area - Swaps based on mode */}
            <div className="p-6 pt-0 mt-auto bg-[#18181b] relative z-20">
                {showSettings ? (
                    <button
                        onClick={() => setShowSettings(false)}
                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide bg-green-600 hover:bg-green-500 hover:shadow-green-500/20 active:scale-[0.98]"
                    >
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        返回工作台
                    </button>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !uploadedImage || songs.length >= MAX_SONGS || isAnalyzingImage}
                        className={`
                            w-full py-4 rounded-xl font-bold text-black shadow-lg flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide
                            ${isGenerating || !uploadedImage || songs.length >= MAX_SONGS || isAnalyzingImage
                                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 hover:shadow-yellow-500/20 active:scale-[0.98]'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                正在谱曲中 ({provider === 'gemini' ? 'Gemini' : 'ChatGPT'})...
                            </>
                        ) : songs.length >= MAX_SONGS ? (
                            <>
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                存储已满
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                立即创作 (Create)
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>

        {/* --- RIGHT PANEL (2/3 Width) - FLEX LAYOUT FOR PLAYER AND LIST --- */}
        <div className="w-2/3 flex bg-[#0e0e0e] relative overflow-hidden">
            
            {/* Background Atmosphere (Shared) */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none z-0"></div>

            {/* == SECTION 1: MAIN PLAYER (Center/Left) == */}
            <div className="flex-1 flex flex-col relative z-10 border-r border-zinc-800/50">
                
                {/* Visual Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                     {currentSong ? (
                        <>
                            {/* VINYL RECORD */}
                            <div className="relative group scale-90 md:scale-100 transition-transform duration-500">
                                {/* CUSTOM SVG TONEARM */}
                                <div className={`
                                    absolute -top-20 -right-10 w-40 h-64 pointer-events-none z-20 origin-[60%_15%] transition-transform duration-1000 ease-in-out drop-shadow-2xl
                                    ${isPlaying ? 'rotate-[25deg]' : 'rotate-0'}
                                `}>
                                     <svg viewBox="0 0 100 200" className="w-full h-full overflow-visible">
                                         {/* Base Pivot */}
                                         <circle cx="60" cy="30" r="12" fill="#27272a" stroke="#52525b" strokeWidth="2" />
                                         <circle cx="60" cy="30" r="4" fill="#18181b" />
                                         
                                         {/* The Arm */}
                                         <path d="M60 30 L55 150 L35 170" fill="none" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" />
                                         
                                         {/* Counterweight */}
                                         <rect x="52" y="10" width="16" height="20" rx="2" fill="#3f3f46" />
                                         
                                         {/* Headshell (Cartridge) */}
                                         <path d="M32 165 L20 185 L45 190 L52 170 Z" fill="#18181b" stroke="#52525b" strokeWidth="1" />
                                         <rect x="25" y="188" width="8" height="6" fill="#fbbf24" /> {/* Gold Needle */}
                                     </svg>
                                </div>

                                {/* The Record */}
                                <div className={`
                                    w-72 h-72 rounded-full bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-zinc-800 flex items-center justify-center relative overflow-hidden
                                    ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}
                                `} style={{animationPlayState: isPlaying ? 'running' : 'paused'}}>
                                    {/* Vinyl Grooves */}
                                    <div className="absolute inset-0 rounded-full opacity-40" style={{
                                        background: `repeating-radial-gradient(#333 0, #111 2px, #111 4px)`
                                    }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 rounded-full pointer-events-none"></div>

                                    {/* Album Cover */}
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-inner relative z-10">
                                        <img src={currentSong.coverImage} className="w-full h-full object-cover" alt="Vinyl Label" />
                                    </div>
                                    <div className="absolute w-3 h-3 bg-zinc-200 rounded-full z-20 shadow-inner"></div>
                                </div>

                                {/* Glow behind */}
                                <div className="absolute inset-0 bg-yellow-500/5 blur-3xl -z-10 rounded-full"></div>
                            </div>

                            {/* Song Info */}
                            <div className="mt-8 text-center">
                                <h3 className="text-2xl font-bold text-white tracking-tight px-4 truncate max-w-md mx-auto">{currentSong.title}</h3>
                                <p className="text-sm text-yellow-500 font-mono mt-1 uppercase tracking-widest">{currentSong.style}</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-600 opacity-50">
                             <MusicalNoteIcon className="w-24 h-24 mb-4" />
                             <p>等待播放...</p>
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="h-28 bg-[#18181b] border-t border-zinc-800 flex flex-col justify-center px-6 gap-3 shrink-0 z-20">
                    
                    {/* Time & Progress */}
                    <div className="flex items-center gap-3 w-full">
                        <span className="text-xs font-mono text-zinc-500 w-10 text-right">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleProgressBarChange}
                            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
                        />
                        <span className="text-xs font-mono text-zinc-500 w-10">{formatTime(duration)}</span>
                    </div>

                    {/* Buttons Row */}
                    <div className="flex items-center justify-between">
                         {/* Empty Left to balance */}
                         <div className="w-32 flex items-center gap-2">
                             <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-white">
                                {isMuted ? <SpeakerXMarkIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                             </button>
                             {/* Volume Slider */}
                             <input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-400 hover:accent-white"
                             />
                         </div>

                         {/* Main Controls */}
                         <div className="flex items-center gap-6">
                            <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition-colors">
                                <BackwardIcon className="w-8 h-8" />
                            </button>
                            <button 
                                onClick={handlePlayPause}
                                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                            >
                                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1" />}
                            </button>
                            <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-colors">
                                <ForwardIcon className="w-8 h-8" />
                            </button>
                        </div>
                        
                        <div className="w-32 text-right text-xs text-zinc-600 font-mono">
                            HIFI AUDIO
                        </div>
                    </div>
                </div>
            </div>

            {/* == SECTION 2: PLAYLIST (Right Fixed) == */}
            <div className="w-72 bg-black/20 backdrop-blur-md border-l border-zinc-800 flex flex-col shrink-0 relative">
                
                {/* Close Button MOVED OUT OF OVERLAP ZONE - actually we keep it absolute but add spacer */}
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 z-50 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white shadow-lg border border-zinc-700"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="p-4 pt-14 bg-[#0e0e0e]/95 border-b border-zinc-800 flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Playlist ({songs.length})
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto pb-16">
                    {songs.length === 0 ? (
                        <div className="p-8 text-center text-zinc-600 text-xs mt-10">
                            暂无歌曲<br/>请在左侧生成
                        </div>
                    ) : (
                        songs.map((song) => (
                            <div 
                                key={song.id}
                                className={`
                                    flex flex-col transition-colors border-l-2 border-b border-b-white/5
                                    ${currentSongId === song.id 
                                        ? 'bg-white/10 border-l-yellow-500' 
                                        : 'border-l-transparent hover:bg-white/5'
                                    }
                                `}
                            >
                                {/* Main Row */}
                                <div 
                                    className="flex items-center gap-3 p-3 cursor-pointer"
                                    onClick={() => {
                                        // Toggle expand or play
                                        if (currentSongId !== song.id) {
                                            setCurrentSongId(song.id);
                                            setIsPlaying(true);
                                        }
                                        setExpandedSongId(expandedSongId === song.id ? null : song.id);
                                    }}
                                >
                                    <div className="relative w-10 h-10 shrink-0">
                                        <img src={song.coverImage} className="w-full h-full rounded object-cover bg-zinc-800" alt="Thumb" />
                                        {currentSongId === song.id && isPlaying && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <div className="w-0.5 bg-yellow-500 animate-[pulse_0.5s_infinite] h-2"></div>
                                                    <div className="w-0.5 bg-yellow-500 animate-[pulse_0.7s_infinite] h-3"></div>
                                                    <div className="w-0.5 bg-yellow-500 animate-[pulse_0.4s_infinite] h-1"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-medium truncate ${currentSongId === song.id ? 'text-white' : 'text-zinc-400'}`}>
                                            {song.title}
                                        </h4>
                                        <p className="text-[10px] text-zinc-600 truncate">{song.style}</p>
                                    </div>
                                </div>

                                {/* Expanded Action Bar (Download / Delete) */}
                                {(expandedSongId === song.id || currentSongId === song.id) && (
                                    <div className="flex gap-1 px-3 pb-3 animate-in slide-in-from-top-1 duration-200">
                                        <button 
                                            onClick={(e) => handleDownload(song, e)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] py-1.5 rounded transition-colors"
                                        >
                                            <ArrowDownTrayIcon className="w-3 h-3" />
                                            下载
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(song.id, e)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 text-[10px] py-1.5 rounded transition-colors"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                            删除
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Bottom Clear All Bar */}
                {songs.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-[#0e0e0e] to-transparent">
                        <button 
                            onClick={handleClearAll}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-red-900/80 text-zinc-400 hover:text-red-200 py-2 rounded-lg text-xs font-bold transition-all border border-zinc-700 hover:border-red-800"
                        >
                            <TrashIcon className="w-4 h-4" />
                            清空播放列表
                        </button>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
