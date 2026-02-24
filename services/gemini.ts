
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Uint8Array {
  const headerLength = 44;
  const dataLength = pcmData.length;
  const fileSize = headerLength + dataLength;
  const wavBuffer = new Uint8Array(fileSize);
  const view = new DataView(wavBuffer.buffer);
  const writeString = (v: DataView, o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); 
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); 
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  wavBuffer.set(pcmData, 44);
  return wavBuffer;
}

export async function mergeWavBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) return new Blob([]);
  if (blobs.length === 1) return blobs[0];
  const buffers = await Promise.all(blobs.map(b => b.arrayBuffer()));
  const firstBuffer = buffers[0];
  const header = firstBuffer.slice(0, 44);
  const headerView = new DataView(header);
  let totalDataLength = 0;
  const pcmParts: ArrayBuffer[] = [];
  for (const buffer of buffers) {
    const data = buffer.slice(44);
    pcmParts.push(data);
    totalDataLength += data.byteLength;
  }
  headerView.setUint32(4, 36 + totalDataLength, true);
  headerView.setUint32(40, totalDataLength, true);
  const combinedBuffer = new Uint8Array(44 + totalDataLength);
  combinedBuffer.set(new Uint8Array(header), 0);
  let offset = 44;
  for (const part of pcmParts) {
    combinedBuffer.set(new Uint8Array(part), offset);
    offset += part.byteLength;
  }
  return new Blob([combinedBuffer], { type: 'audio/wav' });
}

function splitTextForTTS(text: string, limit: number = 300): string[] {
    const segments: string[] = [];
    const sentences = text.match(/[^。！？；!?;]+[。！？；!?;]?/g) || [text];
    let currentSegment = "";
    for (const sentence of sentences) {
        if ((currentSegment + sentence).length > limit) {
            if (currentSegment) segments.push(currentSegment);
            currentSegment = sentence;
            while (currentSegment.length > limit) {
                segments.push(currentSegment.substring(0, limit));
                currentSegment = currentSegment.substring(limit);
            }
        } else {
            currentSegment += sentence;
        }
    }
    if (currentSegment.trim()) segments.push(currentSegment);
    return segments;
}

export async function generateSpeech(text: string, voiceName: string = 'Puck'): Promise<Blob[]> {
  const segments = splitTextForTTS(text, 280); 
  const blobs: Blob[] = [];
  let personaHint = "";
  switch(voiceName) {
      case 'Puck': personaHint = "沉稳男声："; break;
      case 'Kore': personaHint = "温柔女声："; break;
      case 'Zephyr': personaHint = "活泼童声："; break;
      default: personaHint = "朗读：";
  }
  for (const seg of segments) {
    if (seg.trim().length < 2) continue;
    try {
        const fullPrompt = `${personaHint}${seg}`;
        const res = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: fullPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
          }
        });
        const data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (data) {
          const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          blobs.push(new Blob([pcmToWav(bytes, 24000, 1, 16)], { type: 'audio/wav' }));
        }
    } catch(e) { console.error(e); }
  }
  return blobs;
}

export async function generateArticle(topic: string, titleInst: string, articleInst: string): Promise<string> {
    try {
      const prompt = `主题：${topic}\n标题指令：${titleInst}\n内容协议：${articleInst}\n输出标准 HTML。`;
      const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
      let text = res.text || "";
      return text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    } catch (e) { return "<h1>生成失败</h1>"; }
}

export async function extractParagraphsForPainting(html: string, count: number): Promise<string[]> {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const text = tempDiv.innerText;
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `分析提取 ${count} 个关键段落，首项封面。返回 JSON。${text.substring(0, 8000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(res.text || "[]");
    } catch (e) { return []; }
}

export async function generateSingleIllustration(
    prompt: string, 
    aspectRatio: '3:4' | '16:9', 
    style: '2d_art' | '3d_pixar' | 'realistic_cartoon',
    borderStyle: 'none' | 'rounded' | 'rough' = 'none'
): Promise<string | null> {
    try {
      const styleDesc = style === '2d_art' ? "Soft watercolor" : style === '3d_pixar' ? "Pixar style" : "Realistic cartoon";
      
      let borderInst = "";
      if (borderStyle === 'rounded') {
          borderInst = "[BORDER: Clean 5px white outer border, rounded corners, soft shadow, aesthetic card layout]";
      } else if (borderStyle === 'rough') {
          borderInst = "[BORDER: Rough white vignette edges, irregular hand-painted white border, artistic bleed effect, snowy textured edges, hand-drawn paper feel, NO clean edges]";
      } else {
          borderInst = "[BORDER: Full-screen, edge-to-edge, NO borders, NO margins]";
      }

      const finalPrompt = `${borderInst} [STYLE: ${styleDesc}] [SUBJECT: ${prompt}] [NO TEXT]`;
      const imgRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          // @ts-ignore
          imageConfig: { aspectRatio }
        }
      });
      const part = imgRes.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part?.inlineData?.data ? `data:image/jpeg;base64,${part.inlineData.data}` : null;
    } catch (e) { return null; }
}

export async function generateEmoticonSet(ref: string): Promise<string[]> {
    const data = ref.replace(/^data:image\/\w+;base64,/, "");
    const emotions = ["Happy", "Sad", "Angry", "Love", "Shocked", "Sleep", "OK", "Think"];
    const results: string[] = [];
    for (const em of emotions) {
        try {
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ inlineData: { data, mimeType: 'image/jpeg' } }, { text: `Sticker: ${em}. White background.` }] },
                config: { imageConfig: { aspectRatio: '1:1' } }
            });
            const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData?.data) results.push(`data:image/png;base64,${part.inlineData.data}`);
        } catch(e) {}
    }
    return results;
}

export async function generateAnimationSpriteSheet(img: string, label: string): Promise<string | null> {
    const data = img.replace(/^data:image\/\w+;base64,/, "");
    try {
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: { data, mimeType: 'image/jpeg' } }, { text: `2x2 sprite sheet: ${label}.` }] },
            config: { imageConfig: { aspectRatio: '1:1' } }
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch(e) { return null; }
}

export async function analyzeMusicCover(img: string): Promise<{ title: string, style: string }> {
    const data = img.replace(/^data:image\/\w+;base64,/, "");
    try {
        const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data, mimeType: 'image/jpeg' } }, { text: "Suggest song title and style. JSON." }] },
            config: { 
                responseMimeType: 'application/json',
                responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, style: { type: Type.STRING } }, required: ['title', 'style'] }
            }
        });
        return JSON.parse(res.text || '{"title":"Unknown","style":"Pop"}');
    } catch(e) { return { title: "Unknown", style: "Pop" }; }
}

export async function generateMusicAudio(style: string, title: string): Promise<string | null> {
    try {
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Humming ${style} song: ${title}.` }] }],
            config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } } }
        });
        const data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (data) {
            const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
            const wav = pcmToWav(bytes, 24000, 1, 16);
            return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
        }
    } catch(e) {}
    return null;
}

export async function compareStylesAndGeneratePrompt(aiT: string, huT: string): Promise<string> {
    const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Compare and rebuild prompt: AI:${aiT}\nHUMAN:${huT}` });
    return res.text || "";
}
