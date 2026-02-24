
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * OpenAI 官方语音合成接口 (TTS-1)
 */
export async function generateSpeechOpenAI(apiKey: string, text: string, voice: string = 'alloy'): Promise<Blob[]> {
  try {
    // OpenAI 单次支持 4096 字符，文章通常较长，我们按段落切分以保证稳定性
    const segments = text.split(/\n+/).filter(s => s.trim().length > 0);
    const blobs: Blob[] = [];

    for (const segment of segments) {
        if (segment.length > 4000) {
            // 如果单段超长（极少见），进一步切分
            const chunks = segment.match(/.{1,3000}/g) || [];
            for (const chunk of chunks) {
                const blob = await callOpenAITTS(apiKey, chunk, voice);
                if (blob) blobs.push(blob);
            }
        } else {
            const blob = await callOpenAITTS(apiKey, segment, voice);
            if (blob) blobs.push(blob);
        }
    }
    return blobs;
  } catch (error) {
    console.error("OpenAI TTS 失败:", error);
    throw error;
  }
}

async function callOpenAITTS(apiKey: string, input: string, voice: string): Promise<Blob | null> {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: voice, // alloy, echo, fable, onyx, nova, shimmer
            input: input,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OpenAI API 请求失败");
    }

    return await response.blob();
}

/**
 * 现有的音乐相关接口保持不变
 */
export async function generateOpenAIAudio(apiKey: string, text: string): Promise<string | null> {
  try {
    const blob = await callOpenAITTS(apiKey, text, 'alloy');
    return blob ? URL.createObjectURL(blob) : null;
  } catch (error) {
    console.error("OpenAI Audio Generation Failed:", error);
    throw error;
  }
}

export async function generateOpenAILyrics(apiKey: string, topic: string): Promise<string> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                  { role: "system", content: "You are a creative songwriter." },
                  { role: "user", content: `Write a short haiku or lyrics about: ${topic}` }
              ],
            }),
          });
      
          if (!response.ok) return "Music generation style analysis.";
          const data = await response.json();
          return data.choices[0]?.message?.content || "No lyrics generated.";
    } catch (e) {
        return "Error generating lyrics.";
    }
}
