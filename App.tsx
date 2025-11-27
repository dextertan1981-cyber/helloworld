import React, { useState } from 'react';

const App: React.FC = () => {
  const [url, setUrl] = useState("https://www.tiktok.com/@thebrewpuff/video/7574936260247145783");
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [showWeChatModal, setShowWeChatModal] = useState(false);

  const translations = {
    zh: {
      subtitle: "支持130+平台视频，图片，Live图去水印",
      title: "无水印解析下载130多个平台视频，图片，实况Live图",
      desc: "免费不限次数，无需登录。支持130多个平台解析去水印。快手去水印，小红书去水印，快速视频、图片、实况Live图无水印下载",
      badgeText: "❤️ 本网站工具由喵库星球提供，接受捐赠",
      badgeBtn: "访问公众号",
      placeholder: "请粘贴视频或图文链接...",
      btnStart: "开始解析",
      btnClear: "清除内容",
      btnPaste: "粘贴链接",
      tip: "收藏本站快速访问: 按下 Ctrl + D (Mac 上 Command + D)",
      resultTitle: "Cheers 🍻",
      btnDownload: "下载无水印视频",
      btnCopy: "复制无水印链接",
      weChatModalTitle: "关注喵库星球",
      copyWeChat: "复制微信号",
      copySuccess: "已复制",
      langBtn: "English"
    },
    en: {
      subtitle: "Support 130+ platforms for video, image, and Live photo watermark removal",
      title: "Download No-Watermark Videos, Images, and Live Photos from 130+ Platforms",
      desc: "Free, unlimited use, no login required. Supports 130+ platforms. Fast watermark removal for TikTok, Instagram, RedNote, and more.",
      badgeText: "❤️ Tools provided by MeowKu Planet, donations accepted",
      badgeBtn: "Visit Official Account",
      placeholder: "Paste video or image link here...",
      btnStart: "Start Parsing",
      btnClear: "Clear",
      btnPaste: "Paste Link",
      tip: "Bookmark for quick access: Press Ctrl + D (Command + D on Mac)",
      resultTitle: "Cheers 🍻",
      btnDownload: "Download Video",
      btnCopy: "Copy Link",
      weChatModalTitle: "Follow MeowKu Planet",
      copyWeChat: "Copy WeChat ID",
      copySuccess: "Copied!",
      langBtn: "中文"
    }
  };

  const t = translations[lang];

  const handleClear = () => setUrl('');
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText("mao3924984248").then(() => {
      alert(lang === 'zh' ? "微信号已复制" : "WeChat ID copied");
      setShowWeChatModal(false);
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 relative">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-4 lg:px-20 h-16 flex items-center justify-between bg-white sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <a href="https://hello-world-leotan.vercel.app" className="text-red-500 font-bold text-lg md:text-xl tracking-tighter hover:opacity-80 transition-opacity">
            hello-world-leotan.vercel.app
          </a>
          <span className="text-gray-400 text-xs md:text-sm hidden md:block mt-1">
            {t.subtitle}
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <button 
            onClick={toggleLanguage}
            className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50 text-xs transition-colors"
          >
            {t.langBtn}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        
        {/* Hero Section */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 px-2">
          {t.title}
        </h1>
        
        <p className="text-gray-500 text-base md:text-lg max-w-4xl mx-auto mb-8 leading-relaxed px-2">
          {t.desc}
        </p>

        {/* Promotional Badge */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm text-orange-800">
            <span>{t.badgeText}</span>
            <button 
              onClick={() => setShowWeChatModal(true)}
              className="bg-orange-300 hover:bg-orange-400 text-white text-xs px-2 py-0.5 rounded transition-colors"
            >
              {t.badgeBtn}
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.placeholder}
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm transition-shadow"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-3 rounded-md font-medium text-lg transition-colors shadow-sm">
              {t.btnStart}
            </button>
            <button 
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-10 py-3 rounded-md font-medium text-lg transition-colors shadow-sm"
            >
              {t.btnClear}
            </button>
            <button 
              onClick={handlePaste}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-md font-medium text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              {t.btnPaste}
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            {t.tip}
          </p>
        </div>

        {/* Result Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-700 font-medium">{t.resultTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-md font-medium transition-colors">
                {t.btnDownload}
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors">
                {t.btnCopy}
              </button>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Mock Image/Video Area */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 group cursor-pointer">
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-red-700 rounded-lg shadow-lg mb-2 relative transform group-hover:scale-105 transition-transform">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 border-4 border-red-800 rounded-full clip-top"></div>
                        </div>
                    </div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center pl-1">
                        <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                 </div>
              </div>
              
              <h3 className="text-left font-bold text-gray-800 text-lg leading-tight mb-2">
                1975 - 2025: Junie's Retiring and Her Bag...
              </h3>
            </div>
          </div>
          
          {/* Ad Banner Area */}
          <div className="bg-gray-100 border-t border-gray-200 p-2 relative group cursor-pointer">
             <div className="bg-gradient-to-r from-red-600 via-orange-500 to-purple-600 h-24 rounded flex items-center justify-between px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-1">
                     <div className="bg-white/50 w-4 h-4 flex items-center justify-center rounded-sm text-[10px]">i</div>
                </div>
                <div className="text-white font-bold text-xl z-10">
                    Push your creative <br/> boundaries.
                </div>
                <div className="z-10">
                     <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase">Learn More</span>
                </div>
                <div className="absolute right-10 -bottom-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-overlay opacity-50 blur-xl"></div>
                <div className="absolute left-10 -top-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-overlay opacity-50 blur-xl"></div>
             </div>
          </div>
        </div>

      </main>

      {/* WeChat Modal */}
      {showWeChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full relative shadow-2xl transform transition-all scale-100">
            <button 
              onClick={() => setShowWeChatModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8.5,13.5A2.5,2.5 0 0,0 11,16A2.5,2.5 0 0,0 13.5,13.5A2.5,2.5 0 0,0 11,11A2.5,2.5 0 0,0 8.5,13.5M16,13.5A2.5,2.5 0 0,0 18.5,16A2.5,2.5 0 0,0 21,13.5A2.5,2.5 0 0,0 18.5,11A2.5,2.5 0 0,0 16,13.5M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.weChatModalTitle}</h3>
              <p className="text-gray-500 mb-6">微信号：mao3924984248</p>
              
              <button 
                onClick={handleCopyWeChat}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                {t.copyWeChat}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;