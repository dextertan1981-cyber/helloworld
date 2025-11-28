import React, { useState, useEffect, useRef } from 'react';

// --- Icons ---
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const PasteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
);
const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

// --- Translation Data ---
type LangKey = 'zh' | 'en' | 'fr' | 'de' | 'ja';

const translations: Record<LangKey, any> = {
  zh: {
    name: '中文',
    title: '无水印解析下载130多个平台视频',
    subtitle: '免费不限次数，无需登录。支持 TikTok, 抖音, 快手, 小红书等平台解析去水印。',
    placeholder: '在此粘贴视频链接...',
    start: '开始解析',
    clear: '清除内容',
    paste: '粘贴链接',
    downloadVideo: '下载无水印视频',
    downloading: '下载中...',
    copyLink: '复制无水印链接',
    copySuccess: '复制成功！',
    promoText: '本网站工具由喵库星球提供，接受捐赠。',
    visitAccount: '访问公众号',
    copyWeChat: '复制微信号',
    parseError: '解析失败，请检查链接或稍后重试',
  },
  en: {
    name: 'English',
    title: 'No Watermark Video Downloader',
    subtitle: 'Free, unlimited, no login. Supports TikTok, Instagram, and 130+ platforms.',
    placeholder: 'Paste video link here...',
    start: 'Start Parsing',
    clear: 'Clear',
    paste: 'Paste Link',
    downloadVideo: 'Download Video',
    downloading: 'Downloading...',
    copyLink: 'Copy Link',
    copySuccess: 'Copied successfully!',
    promoText: 'Tool provided by MeowCool Planet.',
    visitAccount: 'Visit Official Account',
    copyWeChat: 'Copy ID',
    parseError: 'Parsing failed, check URL or try again later',
  },
  fr: {
    name: 'Français',
    title: 'Téléchargeur vidéo sans filigrane',
    subtitle: 'Gratuit, illimité. Prend en charge TikTok, Instagram et plus de 130 plateformes.',
    placeholder: 'Collez le lien ici...',
    start: 'Démarrer',
    clear: 'Effacer',
    paste: 'Coller',
    downloadVideo: 'Télécharger la vidéo',
    downloading: 'Téléchargement...',
    copyLink: 'Copier le lien',
    copySuccess: 'Copié avec succès!',
    promoText: 'Outil fourni par MeowCool Planet.',
    visitAccount: 'Compte officiel',
    copyWeChat: 'Copier ID',
    parseError: 'Échec de l\'analyse',
  },
  de: {
    name: 'Deutsch',
    title: 'Video-Downloader ohne Wasserzeichen',
    subtitle: 'Kostenlos, unbegrenzt. Unterstützt TikTok, Instagram und 130+ Plattformen.',
    placeholder: 'Link hier einfügen...',
    start: 'Starten',
    clear: 'Löschen',
    paste: 'Einfügen',
    downloadVideo: 'Video herunterladen',
    downloading: 'Wird heruntergeladen...',
    copyLink: 'Link kopieren',
    copySuccess: 'Erfolgreich kopiert!',
    promoText: 'Bereitgestellt von MeowCool Planet.',
    visitAccount: 'Offiziellen Account besuchen',
    copyWeChat: 'ID kopieren',
    parseError: 'Parsing fehlgeschlagen',
  },
  ja: {
    name: '日本語',
    title: '透かしなし動画ダウンローダー',
    subtitle: '無料、無制限。TikTok、Instagramなど130以上のプラットフォームに対応。',
    placeholder: 'リンクをここに貼り付け...',
    start: '解析開始',
    clear: 'クリア',
    paste: '貼り付け',
    downloadVideo: '動画を保存',
    downloading: 'ダウンロード中...',
    copyLink: 'リンクをコピー',
    copySuccess: 'コピーしました！',
    promoText: 'MeowCool Planet提供ツール。',
    visitAccount: '公式アカウント',
    copyWeChat: 'IDをコピー',
    parseError: '解析に失敗しました',
  }
};

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [lang, setLang] = useState<LangKey>('zh');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 点击外部关闭语言菜单
  const langMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = translations[lang];
  const defaultTestUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // API 解析逻辑
  const fetchTikTokVideo = async (inputUrl: string) => {
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data.data && data.data.play) {
        return {
            url: data.data.play,
            title: data.data.title || 'Video'
        };
      } else {
        throw new Error("API No Data");
      }
    } catch (error) {
      console.error("Parsing failed", error);
      return null;
    }
  };

  const handleStart = async () => {
    if (!url) return;

    setIsLoading(true);
    setResult(null);
    setVideoTitle('');

    if (url.includes('tiktok.com')) {
      const videoData = await fetchTikTokVideo(url);
      setIsLoading(false);
      if (videoData) {
        setResult(videoData.url);
        setVideoTitle(videoData.title);
      } else {
        alert(t.parseError);
      }
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      setTimeout(() => {
        setIsLoading(false);
        setResult(url);
        const fileName = url.split('/').pop()?.split('?')[0] || 'Video Result';
        setVideoTitle(fileName);
      }, 800);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setResult(defaultTestUrl);
        setVideoTitle('Test Video');
      }, 500);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setVideoTitle('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      alert('Cannot access clipboard. Please paste manually.');
    }
  };

  const handleCopyLink = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert(t.copySuccess);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
        const response = await fetch(result);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        window.open(result, '_blank');
    } finally {
        setIsDownloading(false);
    }
  };

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('mao3924984248');
    alert(t.copySuccess);
    setShowWeChatModal(false);
  };

  // Styles
  const styles: {[key: string]: React.CSSProperties} = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    navbar: {
      width: '100%',
      maxWidth: '1200px',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #f3f4f6',
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 10,
    },
    logo: {
      color: '#111827', // 醒目的深色
      fontWeight: '900', // 粗体
      fontSize: '1.8rem', // 加大字体
      textDecoration: 'none',
      letterSpacing: '-0.5px',
    },
    // 语言菜单相关样式
    langContainer: {
        position: 'relative',
    },
    langBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#374151',
      fontWeight: '500',
    },
    langDropdown: {
        position: 'absolute',
        top: '120%',
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '0.5rem',
        zIndex: 50,
        minWidth: '150px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    langOption: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#4b5563',
        background: 'transparent',
        border: 'none',
        width: '100%',
    },
    
    main: {
      width: '100%',
      maxWidth: '900px',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      marginBottom: '1rem',
      color: '#111827',
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      marginBottom: '2.5rem',
      maxWidth: '640px',
      lineHeight: '1.6',
    },
    
    // 搜索布局
    searchBoxContainer: {
        width: '100%',
        maxWidth: '750px',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        marginBottom: '1.5rem',
        alignItems: 'stretch',
    },
    input: {
      flex: '1 1 auto', // 自动伸缩
      width: '0', // 关键：允许 flex item 缩小到比内容小，从而触发 ellipsis
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      textOverflow: 'ellipsis', // 长文本显示省略号
    },
    
    // 按钮基础样式
    btn: {
      padding: '0.875rem 1.5rem',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'transform 0.1s, opacity 0.2s',
      color: 'white',
      whiteSpace: 'nowrap',
    },
    // 开始按钮：红色，醒目，偏大
    startBtn: {
        flex: '0 0 auto', // 不允许缩小
        minWidth: '160px', // 保证足够宽度
        backgroundColor: '#ef4444', // 红色
        fontSize: '1.1rem',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
    },
    
    // 工具栏
    toolsContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
    },
    // 清除：绿色
    btnClear: {
        backgroundColor: '#22c55e', // 绿色
    },
    // 粘贴：浅蓝色
    btnPaste: {
        backgroundColor: '#60a5fa', // 浅蓝色
    },
    // 复制链接：浅蓝色
    btnBlue: {
        backgroundColor: '#60a5fa', // 浅蓝色
    },
    // 下载：绿色
    btnDownload: {
        backgroundColor: '#22c55e', // 绿色
    },

    // 结果卡片
    card: {
      marginTop: '1rem',
      padding: '2rem',
      borderRadius: '16px',
      border: '1px solid #f3f4f6',
      backgroundColor: 'white',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '380px',
    },
    cardHeader: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '1rem',
      textAlign: 'center',
      color: '#374151',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    videoWrapper: {
      width: '260px',
      height: '375px',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#000',
      marginBottom: '1.5rem',
      margin: '0 auto 1.5rem auto',
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    
    footer: {
      marginTop: 'auto',
      padding: '2rem',
      textAlign: 'center',
      color: '#9ca3af',
    },
    promoTag: {
      display: 'inline-flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      marginBottom: '1rem',
    },
    promoBtn: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
    },

    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '20px',
      textAlign: 'center',
      minWidth: '320px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    weChatId: {
      fontSize: '1.75rem',
      fontWeight: '800',
      margin: '1.5rem 0',
      color: '#111827',
      letterSpacing: '1px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <a 
            href="https://mp.weixin.qq.com/s/xcW_AXeSG29KY45SuL1rHg" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.logo}
        >
          喵库星球
        </a>
        
        {/* 多语言下拉菜单 */}
        <div style={styles.langContainer} ref={langMenuRef}>
            <button onClick={() => setShowLangMenu(!showLangMenu)} style={styles.langBtn}>
                <GlobeIcon /> {translations[lang].name} <ChevronDownIcon />
            </button>
            {showLangMenu && (
                <div style={styles.langDropdown}>
                    {(Object.keys(translations) as LangKey[]).map((key) => (
                        <button 
                            key={key} 
                            style={{
                                ...styles.langOption,
                                backgroundColor: lang === key ? '#f3f4f6' : 'transparent',
                                fontWeight: lang === key ? 'bold' : 'normal'
                            }}
                            onClick={() => {
                                setLang(key);
                                setShowLangMenu(false);
                            }}
                        >
                            {translations[key].name}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>

        {/* 搜索行：布局优化 */}
        <div style={styles.searchBoxContainer}>
          <input
            style={styles.input}
            placeholder={t.placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={handleStart} 
            style={{...styles.btn, ...styles.startBtn}}
            disabled={isLoading}
          >
            {isLoading ? (lang === 'zh' ? '...' : '...') : t.start}
          </button>
        </div>

        {/* 辅助按钮行：颜色调整 */}
        <div style={styles.toolsContainer}>
           <button onClick={handleClear} style={{...styles.btn, ...styles.btnClear}}>
              <ClearIcon /> {t.clear}
            </button>
            <button onClick={handlePaste} style={{...styles.btn, ...styles.btnPaste}}>
              <PasteIcon /> {t.paste}
            </button>
        </div>

        {/* Result Card */}
        {result && (
          <div style={styles.card}>
            <div style={styles.cardHeader} title={videoTitle}>
                {videoTitle || 'No Title'}
            </div>
            
            <div style={styles.videoWrapper}>
              <video 
                controls 
                style={styles.video} 
                src={result}
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <button 
                onClick={handleDownload} 
                style={{...styles.btn, ...styles.btnDownload, width: '100%'}}
                disabled={isDownloading}
            >
              <DownloadIcon /> {isDownloading ? t.downloading : t.downloadVideo}
            </button>
            
            {/* 修复：确保使用了正确的样式对象 */}
            <button 
              onClick={handleCopyLink} 
              style={{...styles.btn, ...styles.btnBlue, marginTop: '0.8rem', width: '100%'}}
            >
              <CopyIcon /> {t.copyLink}
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <div style={styles.promoTag}>
            ❤️ {t.promoText} 
            <button onClick={() => setShowWeChatModal(true)} style={styles.promoBtn}>
              {t.visitAccount}
            </button>
          </div>
        </div>
      </main>

      {/* WeChat Modal */}
      {showWeChatModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWeChatModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{t.visitAccount}</h3>
            <div style={styles.weChatId}>mao3924984248</div>
            <button onClick={handleCopyWeChat} style={{...styles.btn, ...styles.btnDownload}}>
              <CopyIcon /> {t.copyWeChat}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;