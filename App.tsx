import React, { useState, useEffect } from 'react';

// --- Icons ---
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
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

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [showWeChatModal, setShowWeChatModal] = useState(false);

  const testVideoUrl = "https://v16m-default.akamaized.net/b924741a0a091224a97bb8d825e46e7f/69295a07/video/tos/maliva/tos-maliva-ve-0068c799-us/owB8Al5HYFYDqE5gQpED1HfoI7o6gO3RDSfJcR/?a=1123&bti=OHYpMzg5Zik3OjlmOm01NTU6ZDQ0MDo%3D&ch=0&cr=0&dr=0&er=0&lr=all&net=0&cd=0%7C0%7C0%7C0&cv=1&br=2058&bt=1029&cs=0&ds=6&ft=EeF4ntZWD00Q12Nvw_Zl.IxRvJRHHQ_45SY&mime_type=video_mp4&qs=0&rc=NTVmaDczOmU8ZDc5aTw6ZkBpM3ZobHQ5cjVzNzMzZzczNEBfYzYwYV8xNjYxYGMwLV8xYSNucDRuMmRjNGNhLS1kMS9zcw%3D%3D&vvpl=1&l=2025112810144831AA92260DDF985B1120&btag=e000b8000";

  const t = {
    title: lang === 'zh' ? '无水印解析下载130多个平台视频，图片，实况Live图' : 'No Watermark Downloader for 130+ Platforms',
    subtitle: lang === 'zh' ? '免费不限次数，无需登录。支持130多个平台解析去水印。' : 'Free, unlimited, no login required. Supports 130+ platforms.',
    placeholder: lang === 'zh' ? '在此粘贴链接...' : 'Paste link here...',
    start: lang === 'zh' ? '开始解析' : 'Start Parsing',
    clear: lang === 'zh' ? '清除内容' : 'Clear',
    paste: lang === 'zh' ? '粘贴链接' : 'Paste',
    cheers: 'Cheers 🍻',
    downloadVideo: lang === 'zh' ? '下载无水印视频' : 'Download Video',
    copyLink: lang === 'zh' ? '复制无水印链接' : 'Copy Link',
    promoText: lang === 'zh' ? '本网站工具由喵库星球提供，接受捐赠。' : 'Tool provided by MeowCool Planet, donations accepted.',
    visitAccount: lang === 'zh' ? '访问公众号' : 'Visit Official Account',
    weChatId: 'mao3924984248',
    copyWeChat: lang === 'zh' ? '复制微信号' : 'Copy WeChat ID'
  };

  const handleStart = () => {
    if (!url) return;
    setIsLoading(true);
    setResult(null);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setResult(testVideoUrl);
    }, 1500);
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      alert('无法访问剪贴板，请手动粘贴 / Cannot access clipboard');
    }
  };

  const handleCopyLink = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert(lang === 'zh' ? '链接已复制' : 'Link Copied');
    }
  };

  const handleDownload = () => {
    if (result) {
      window.open(result, '_blank');
    }
  };

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText(t.weChatId);
    alert(lang === 'zh' ? '微信号已复制！' : 'WeChat ID Copied!');
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
      borderBottom: '1px solid #eee',
    },
    logo: {
      color: '#ef4444',
      fontWeight: 'bold',
      fontSize: '1.5rem',
      textDecoration: 'none',
    },
    langBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    main: {
      width: '100%',
      maxWidth: '800px',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1f2937',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      marginBottom: '2rem',
      maxWidth: '600px',
      lineHeight: '1.6',
    },
    inputGroup: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    input: {
      width: '100%',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    btnGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'opacity 0.2s',
      color: 'white',
    },
    btnBlue: { backgroundColor: '#3b82f6' },
    btnRed: { backgroundColor: '#ef4444' },
    btnGray: { backgroundColor: '#f3f4f6', color: '#374151' },
    btnGreen: { backgroundColor: '#22c55e', width: '100%', justifyContent: 'center', marginTop: '1rem' },
    
    // Result Card
    card: {
      marginTop: '3rem',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '500px',
    },
    cardHeader: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      textAlign: 'left',
    },
    videoWrapper: {
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#000',
      marginBottom: '1rem',
    },
    video: {
      width: '100%',
      display: 'block',
    },
    
    // Footer
    footer: {
      marginTop: 'auto',
      padding: '2rem',
      textAlign: 'center',
      color: '#6b7280',
    },
    promoTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      marginBottom: '1rem',
    },
    promoBtn: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      border: 'none',
      cursor: 'pointer',
    },

    // Modal
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      textAlign: 'center',
      minWidth: '300px',
    },
    weChatId: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '1rem 0',
      color: '#374151',
    },
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <a href="https://hello-world-leotan.vercel.app" style={styles.logo}>
          hello-world-leotan.vercel.app
        </a>
        <button onClick={toggleLang} style={styles.langBtn}>
          <GlobeIcon /> {lang === 'zh' ? 'Languages' : '语言'}
        </button>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder={t.placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div style={styles.btnGroup}>
            <button 
              onClick={handleStart} 
              style={{...styles.btn, ...styles.btnBlue}}
              disabled={isLoading}
            >
              {isLoading ? (lang === 'zh' ? '解析中...' : 'Parsing...') : t.start}
            </button>
            <button onClick={handleClear} style={{...styles.btn, ...styles.btnRed}}>
              {t.clear}
            </button>
            <button onClick={handlePaste} style={{...styles.btn, ...styles.btnGray}}>
              <PasteIcon /> {t.paste}
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>{t.cheers}</div>
            
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

            <button onClick={handleDownload} style={{...styles.btn, ...styles.btnGreen}}>
              <DownloadIcon /> {t.downloadVideo}
            </button>
            
            <button 
              onClick={handleCopyLink} 
              style={{...styles.btn, ...styles.btnBlue, marginTop: '0.5rem', width: '100%', justifyContent: 'center'}}
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
            <div style={styles.weChatId}>{t.weChatId}</div>
            <button onClick={handleCopyWeChat} style={{...styles.btn, ...styles.btnGreen}}>
              <CopyIcon /> {t.copyWeChat}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
