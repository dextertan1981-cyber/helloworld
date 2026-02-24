
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, PhotoIcon, SparklesIcon, SwatchIcon, 
  Square2StackIcon, AdjustmentsHorizontalIcon, CheckCircleIcon,
  ChevronRightIcon, ChevronLeftIcon, ArrowPathIcon, ArrowUturnLeftIcon,
  BellIcon, ExclamationTriangleIcon,
  StopIcon, StopCircleIcon, ScissorsIcon
} from '@heroicons/react/24/outline';
import { extractParagraphsForPainting, generateSingleIllustration } from '../services/gemini';

interface PaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleHtml: string;
  onComplete: (images: string[]) => void;
  
  // 状态提升
  wizardState: {
    view: 'settings' | 'wizard';
    inlineCount: number;
    aspectRatio: '3:4' | '16:9';
    style: '2d_art' | '3d_pixar' | 'realistic_cartoon';
    borderStyle: 'none' | 'rounded' | 'rough';
    steps: string[];
    currentStepIdx: number;
    stepPrompts: string[];
    generatedImages: (string | null)[];
    isProcessing: boolean;
  };
  setWizardState: React.Dispatch<React.SetStateAction<any>>;
}

export const PaintingModal: React.FC<PaintingModalProps> = ({ 
    isOpen, onClose, articleHtml, onComplete, wizardState, setWizardState 
}) => {
  const { view, inlineCount, aspectRatio, style, borderStyle, steps, currentStepIdx, stepPrompts, generatedImages, isProcessing } = wizardState;

  const [systemSignal, setSystemSignal] = useState<string | null>(null);
  const [showConfirmLayer, setShowConfirmLayer] = useState(false);
  const [drawingTime, setDrawingTime] = useState(0);

  // 绘图倒计时逻辑
  useEffect(() => {
    let interval: any;
    if (isProcessing && view === 'wizard') {
        interval = setInterval(() => {
            setDrawingTime(prev => prev + 1);
        }, 1000);
    } else {
        setDrawingTime(0);
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing, view]);

  const handleStartWizard = async () => {
    setWizardState((prev: any) => ({ ...prev, isProcessing: true }));
    try {
      // 这里的 articleHtml 是主界面的正文 HTML
      const paras = await extractParagraphsForPainting(articleHtml, inlineCount + 1);
      
      // 增强稳定性：如果 AI 没能成功提取段落，则提供兜底占位符，防止文本框为空
      const finalSteps = paras && paras.length > 0 
        ? paras 
        : new Array(inlineCount + 1).fill("请在此输入画面描述，例如：一个在图书馆看书的小男孩...");

      setWizardState((prev: any) => ({
        ...prev,
        steps: finalSteps,
        stepPrompts: [...finalSteps],
        generatedImages: new Array(finalSteps.length).fill(null),
        view: 'wizard',
        currentStepIdx: 0,
        isProcessing: false
      }));
    } catch (e) {
      alert("内容识别失败，请检查网络或重试");
      setWizardState((prev: any) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPrompts = [...stepPrompts];
    if (newPrompts[currentStepIdx] !== undefined) {
        newPrompts[currentStepIdx] = "已经收到！系统感知到您的重置意图，请在弹出的面板中确认。";
        setWizardState((p: any) => ({ ...p, stepPrompts: newPrompts }));
    }
    setSystemSignal("已经收到！物理信号传导正常。");
    setShowConfirmLayer(true);
  };

  const executePhysicalReset = () => {
    setWizardState({
      view: 'settings',
      inlineCount: 5,
      aspectRatio: '3:4',
      style: '2d_art',
      borderStyle: 'none',
      steps: [],
      currentStepIdx: 0,
      stepPrompts: [],
      generatedImages: [],
      isProcessing: false
    });
    setShowConfirmLayer(false);
    setSystemSignal(null);
  };

  const handleGenerateCurrentStep = async () => {
    setWizardState((prev: any) => ({ ...prev, isProcessing: true }));
    try {
      // 核心修复：优先从实时输入的 stepPrompts 中获取内容
      const prompt = stepPrompts[currentStepIdx] || steps[currentStepIdx] || "描述内容丢失，请手动输入";
      const ratio = currentStepIdx === 0 ? '16:9' : aspectRatio;
      // 传递 borderStyle 物理参数
      const img = await generateSingleIllustration(prompt, ratio, style, borderStyle);
      
      const newImages = [...generatedImages];
      newImages[currentStepIdx] = img;
      setWizardState((prev: any) => ({ ...prev, generatedImages: newImages, isProcessing: false }));
    } catch (e) {
      alert("绘图失败，请稍后重试");
      setWizardState((prev: any) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleFinish = () => {
    const finalImages = generatedImages.filter(img => img !== null) as string[];
    onComplete(finalImages);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex overflow-hidden border border-gray-100 relative">
        
        {systemSignal && (
            <div className="absolute top-0 left-0 right-0 h-10 bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 z-[200] animate-in slide-in-from-top duration-300">
                <BellIcon className="w-4 h-4 animate-bounce" />
                {systemSignal}
            </div>
        )}

        {showConfirmLayer && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-lg z-[180] flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 bg-orange-100 rounded-full mb-6">
                    <ExclamationTriangleIcon className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">确认重新向导？</h3>
                <p className="text-gray-500 text-center mb-8 max-w-md leading-relaxed">
                    当前进度将被永久移除。如果您在确认前看到描述框显示了<span className="text-indigo-600 font-bold">“已经收到！”</span>，说明系统通讯逻辑完全正常。
                </p>
                <div className="flex flex-col w-full max-w-sm gap-3">
                    <button 
                        onClick={executePhysicalReset}
                        className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg active:scale-95"
                    >
                        确认重置并返回初始页面
                    </button>
                    <button 
                        onClick={() => { setShowConfirmLayer(false); setSystemSignal(null); }}
                        className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                    >
                        点错了，返回
                    </button>
                </div>
            </div>
        )}

        <div className="w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 border-r border-gray-100 relative overflow-hidden">
            <div className="absolute top-8 left-6 flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest z-10">
                <SparklesIcon className="w-4 h-4" />
                {currentStepIdx === 0 ? '封面预览' : `插图 ${currentStepIdx} 预览`}
            </div>
            
            <div className={`w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col relative transition-all duration-500 ${currentStepIdx === 0 || aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[3/4] w-2/3'}`}>
                {generatedImages[currentStepIdx] ? (
                    <img src={generatedImages[currentStepIdx]!} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" alt="Preview" />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                        <PhotoIcon className="w-20 h-20 opacity-20 mb-4" />
                        <span className="text-sm font-bold opacity-40 uppercase tracking-widest">等待生成...</span>
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <h4 className="text-indigo-600 text-xs font-bold animate-pulse">处理中({drawingTime}s)...</h4>
                    </div>
                )}
            </div>
            
            {view === 'wizard' && (
                <div className="mt-6 flex gap-1.5">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStepIdx ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'}`} />
                    ))}
                </div>
            )}
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="px-8 py-4 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white z-[110] mt-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                    <SwatchIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">AI 绘图向导 v1.2</h2>
             </div>
             <div className="flex items-center gap-2">
                {view === 'wizard' && (
                  <button 
                    onClick={handleResetClick} 
                    className="relative z-[120] text-[10px] bg-orange-50 text-orange-600 border border-orange-100 font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-all shadow-sm active:scale-95"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    重新向导
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <XMarkIcon className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              {view === 'settings' ? (
                  <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                          <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-2 text-sm">
                              <SparklesIcon className="w-4 h-4" /> 第一步：规划配图方案
                          </h3>
                          <p className="text-xs text-indigo-700 leading-relaxed">
                              系统将分析您的文章内容，自动提取核心情节。请先确定您需要在正文中插入多少张图片。
                          </p>
                      </div>

                      <section className="space-y-4 pt-4">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <Square2StackIcon className="w-4 h-4" /> 正文插图数量
                          </h3>
                          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-medium text-gray-500 tracking-wider">MIN 1</span>
                                  <span className="text-xs font-bold text-indigo-600 bg-white px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">{inlineCount} 张插图</span>
                                  <span className="text-[10px] font-medium text-gray-500 tracking-wider">MAX 10</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" value={inlineCount} 
                                onChange={e => setWizardState((p:any)=>({...p, inlineCount: parseInt(e.target.value)}))} 
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                          </div>
                      </section>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col space-y-4 animate-in slide-in-from-right-8 duration-500 h-full">
                      <div className="grid grid-cols-1 gap-3.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[2px]">
                              {currentStepIdx === 0 ? "封面头图配置" : `正文插图 ${currentStepIdx} 配置`}
                          </p>
                          
                          <div className="flex gap-4">
                              {currentStepIdx > 0 && (
                                <section className="flex-1">
                                    <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">插图比例</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setWizardState((p:any)=>({...p, aspectRatio:'3:4'}))} className={`py-1.5 rounded-lg border-2 font-bold text-[10px] transition-all ${aspectRatio === '3:4' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>3:4 竖版</button>
                                        <button onClick={() => setWizardState((p:any)=>({...p, aspectRatio:'16:9'}))} className={`py-1.5 rounded-lg border-2 font-bold text-[10px] transition-all ${aspectRatio === '16:9' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>16:9 横版</button>
                                    </div>
                                </section>
                              )}

                              <section className="flex-[1.5]">
                                  <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">绘画风格</h3>
                                  <div className="flex flex-wrap gap-1.5">
                                      {[
                                        { id: '2d_art', label: '2D艺术' },
                                        { id: '3d_pixar', label: '3D皮克斯' },
                                        { id: 'realistic_cartoon', label: '写实卡通' }
                                      ].map(s => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => setWizardState((p:any)=>({...p, style:s.id as any}))} 
                                            className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-bold transition-all ${style === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            {s.label}
                                        </button>
                                      ))}
                                  </div>
                              </section>
                          </div>

                          <section>
                              <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">图案边框</h3>
                              <div className="flex flex-wrap gap-1.5">
                                  {[
                                    { id: 'none', label: '无', icon: StopIcon },
                                    { id: 'rounded', label: '圆角白边', icon: StopCircleIcon },
                                    { id: 'rough', label: '无规则白边', icon: ScissorsIcon }
                                  ].map(b => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => setWizardState((p:any)=>({...p, borderStyle:b.id as any}))} 
                                        className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-bold transition-all flex items-center gap-1.5 ${borderStyle === b.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                    >
                                        <b.icon className="w-3 h-3" />
                                        {b.label}
                                    </button>
                                  ))}
                              </div>
                          </section>
                      </div>

                      <div className="flex-1 flex flex-col min-h-0 bg-white">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                              <span>描述文本 (核心参考)</span>
                              <span className="text-[8px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">Input Required</span>
                          </label>
                          <textarea 
                            value={stepPrompts[currentStepIdx] || ''} 
                            onChange={e => {
                                const newPrompts = [...stepPrompts];
                                newPrompts[currentStepIdx] = e.target.value;
                                setWizardState((p:any) => ({ ...p, stepPrompts: newPrompts }));
                            }}
                            className="flex-1 p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs text-gray-700 leading-relaxed font-medium focus:border-indigo-600 focus:bg-white transition-all resize-none shadow-inner"
                            placeholder="请描述您想要的画面细节..."
                          />
                      </div>

                      <div className="pt-2">
                          <button 
                            onClick={handleGenerateCurrentStep}
                            disabled={isProcessing}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            {isProcessing ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <SparklesIcon className="w-4 h-4" />
                            )}
                            {isProcessing ? `绘图中(${drawingTime}s)...` : (generatedImages[currentStepIdx] ? "重新绘制当前插图" : "立即绘制插图")}
                          </button>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <button 
                            onClick={() => setWizardState((p:any) => ({ ...p, currentStepIdx: Math.max(0, p.currentStepIdx - 1) }))}
                            disabled={currentStepIdx === 0}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 font-bold transition-all text-xs disabled:opacity-0"
                          >
                              <ChevronLeftIcon className="w-3.5 h-3.5" /> 上一步
                          </button>

                          {currentStepIdx < (steps?.length || 0) - 1 ? (
                              <button 
                                onClick={() => setWizardState((p:any) => ({ ...p, currentStepIdx: Math.min((steps?.length || 1) - 1, p.currentStepIdx + 1) }))}
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold transition-all text-xs"
                              >
                                  下一步 <ChevronRightIcon className="w-3.5 h-3.5" />
                              </button>
                          ) : (
                              <button 
                                onClick={handleFinish}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition-all text-xs"
                              >
                                  确认并完成
                              </button>
                          )}
                      </div>
                  </div>
              )}
          </div>

          {view === 'settings' && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                  <button onClick={handleStartWizard} disabled={isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-indigo-100">
                    {isProcessing ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                    一键分析文章并启动向导
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
