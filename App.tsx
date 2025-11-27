import React, { useState } from 'react';

const App: React.FC = () => {
  const [url, setUrl] = useState("https://www.tiktok.com/@thebrewpuff/video/7574936260247145783");

  const handleClear = () => setUrl('');
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      // Fallback or permission error handling
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-4 lg:px-20 h-16 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <a href="#" className="text-red-500 font-bold text-2xl tracking-tighter">
            KuKuTool.com
          </a>
          <span className="text-gray-400 text-sm hidden md:block mt-1">
            支持130+平台视频，图片，Live图去水印
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-blue-600 hover:text-blue-800 hidden md:block">批量解析</a>
          <a href="#" className="text-blue-600 hover:text-blue-800 hidden md:block">微博去水印</a>
          <a href="#" className="text-blue-600 hover:text-blue-800 hidden md:block">小红书去水印</a>
          <a href="#" className="text-red-500 hover:text-red-700 hidden sm:block">APP/小程序</a>
          <div className="relative group cursor-pointer hidden sm:flex items-center gap-1 text-blue-600">
            更多平台
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <button className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50 text-xs">
            Languages
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        
        {/* Hero Section */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
          无水印解析下载130多个平台视频，图片，实况Live图
        </h1>
        
        <p className="text-gray-500 text-base md:text-lg max-w-4xl mx-auto mb-8 leading-relaxed">
          免费不限次数，无需登录。支持130多个平台解析去水印。快手去水印，
          <br className="hidden md:block" />
          小红书去水印，快速视频、图片、实况Live图无水印下载
        </p>

        {/* Promotional Badge */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm text-orange-800">
            <span>❤️ iOS APP更加稳定、免费、支持批量去水印</span>
            <button className="bg-orange-300 hover:bg-orange-400 text-white text-xs px-2 py-0.5 rounded transition-colors">
              点击下载
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="请粘贴视频或图文链接..."
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm transition-shadow"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-3 rounded-md font-medium text-lg transition-colors shadow-sm">
              开始解析
            </button>
            <button 
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-10 py-3 rounded-md font-medium text-lg transition-colors shadow-sm"
            >
              清除内容
            </button>
            <button 
              onClick={handlePaste}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-md font-medium text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              粘贴链接
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            收藏本站快速访问: 按下 Ctrl + D (Mac 上 Command + D)
          </p>
        </div>

        {/* Result Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-700 font-medium">Cheers</span>
              <span className="text-xl">🍻</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-md font-medium transition-colors">
                下载无水印视频
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors">
                复制无水印链接
              </button>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Mock Image/Video Area */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 group cursor-pointer">
                 {/* Placeholder for the red bag image from screenshot */}
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-red-700 rounded-lg shadow-lg mb-2 relative transform group-hover:scale-105 transition-transform">
                            {/* Stylized bag handle */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 border-4 border-red-800 rounded-full clip-top"></div>
                        </div>
                    </div>
                 </div>
                 {/* Play button overlay */}
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
                {/* Decorative circles */}
                <div className="absolute right-10 -bottom-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-overlay opacity-50 blur-xl"></div>
                <div className="absolute left-10 -top-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-overlay opacity-50 blur-xl"></div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
