
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { 
  generateArticle, 
  generateSpeech, 
  mergeWavBlobs
} from './services/gemini';
import { generateSpeechOpenAI } from './services/openai';
import { AIDetectionModal } from './components/AIDetectionModal';
import { EmoticonModal } from './components/EmoticonModal';
import { SongModal } from './components/SongModal';
import { PaintingModal } from './components/PaintingModal';
import { 
  PencilSquareIcon, 
  Cog6ToothIcon, 
  ArrowPathIcon, 
  PhotoIcon,
  SpeakerWaveIcon,
  FaceSmileIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  XMarkIcon,
  CursorArrowRaysIcon,
  ArrowDownTrayIcon,
  CloudIcon,
  CpuChipIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  AcademicCapIcon,
  NewspaperIcon,
  HeartIcon,
  LightBulbIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/react/24/solid';

const DEFAULT_TITLE_CONFIG = `1. 标题字数15-50字
2. 固定格式：少儿科普故事《{topic}》。`;

const ARTICLE_TEMPLATES = [
  {
    id: 'child_science',
    name: '儿童科普 v1.3',
    icon: AcademicCapIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    titleConfig: DEFAULT_TITLE_CONFIG,
    content: `你是一位模仿1980-1990年代中国儿童科普读物风格的创作者。无论创作什么主题，都必须完全遵循以下原则：

1. 时代风格锁定
年代特征：完全模仿1980-1990年代中国大陆出版的儿童科普读物文字风格

语言特征：

使用简单、重复、略带笨拙的句式

多用“呀”、“啊”、“呢”、“啦”等口语化语气词

比喻系统限定在 "工厂"、"小火车"、"幼儿园"、"勤劳的工人"、"老爷爷"、"小朋友" 等80-90年代儿童读物常见比喻范围内

绝对禁止使用任何2000年后的网络用语、现代科技比喻（如互联网、机器人、人工智能、黑客等）

政治正确性：符合80-90年代儿童读物的政治正确标准，不涉及任何现代敏感话题

2. 通用叙事结构（适用于任何主题）
无论主题是科学、历史、节日还是文化，都采用以下结构：

开头（200-300字）

从儿童日常生活场景切入

提出一个简单的问题 or 现象

示例句式：“有一天，小明发现了一个奇怪的现象……”

中间（主体部分，800-1000字）

按照时间顺序 or 逻辑顺序展开

将复杂知识分解为3-5个简单步骤

每个步骤由1-2个拟人化角色负责讲解

通过角色对话推动情节，禁止直接讲解知识

每个步骤使用相似的结构模式，形成重复韵律

结尾（200-300字）

回到开头的日常生活场景

用一句简单的生活建议结束

示例句式：“从那以后，小明明白了……他决定……”

禁止深刻的哲理升华，只要简单的行为指导

3. 通用角色设定模板
无论什么主题，都使用以下角色类型：

提问者：通常是“小明”、“红红”、“冬冬”、“大能”、“军军”、“龙龙”、“妮妮”、“小雅”等普通儿童

引导者：知识渊博的“老爷爷”、“叔叔”、“老师”等长辈形象

执行者：2-3个拟人化的概念角色（如“太阳公公”、“时间老人”、“历史伯伯”等）

助手：1-2个可爱的动物或物品形象（可选）

4. 知识转化模板
将任何专业知识转化为儿童能懂的语言：

历史日期 → “日历上的小格子选出来的好日子”

科学原理 → “大自然的小秘密”

文化习俗 → “老祖宗传下来的好习惯”

复杂过程 → “一段奇妙的旅行”


1. 【逻辑重构：知识钩子协议】
   - **硬核开头**：开头第1-2段严禁讲故事。必须以明确的科学观点或奇妙的身体真相切入。例如：“你知道吗？你的肚子里藏着一台24小时不停工的‘超级实验室’...”
   - **知识引入**：先建立科学坐标系，再引入角色。
2. 【语义化排版指令】
   - **生僻词加粗 (strong)**：识别文中对孩子来说较生疏的名词、科学术语、复杂物品，进行加粗。
   - **金句下划线 (u)**：仅对总结性观点、富有哲理的句子、表明作者立场的段落核心句添加下划线。
   - **严禁**在标题（h2/h3）中使用下划线。
3. 【拟人化演绎】
   - 角色性格要稳健。小肠不再是只会哭，而是像个“细心的分拣员”。
   - 动词要精准：用“过滤、传输、研磨、侦测”替代泛化的“变、弄”。
4. 【童话式结局】
   - 故事结尾要收回到开头的科学观点上。
   - 描述角色学到了什么生活好习惯，并以“从此以后”引出美好的结局，最后一句要能带入甜美的梦乡。
5. 【代码纯净度】：严禁输出任何 * 或 - 等 Markdown 标记，只准用标准 HTML。

二、排版格式要求（严格统一）
生僻词标注规则
每300字标注1-2个生僻词

标注方式：在生僻词加粗

金句标注规则
全文金句不超过5句

仅标注重复出现的、朗朗上口的句子

标注方式：金句加下划线

示例：<u>12月25日，是个充满爱的日子！</u>

段落格式
每段不超过3句话

段落之间空一行

对话必须单独成段

说话者在前，使用冒号

示例：
小明问：“为什么圣诞节在12月25日？”

圣诞老爷爷笑眯眯地说：“这要从很久很久以前说起……”

三、主题适配指南
对于历史/节日主题（如圣诞节）
角色设定：

引导者：圣诞老爷爷 + 历史伯伯（两人对话）

执行者：日历小精灵（负责翻日历）、太阳公公（解释冬至）、教堂钟声（象征纪念）

三阶段叙事：

第一阶段：古罗马人怎么过冬至（简单描述）

第二阶段：基督教为什么选这天（简单比喻）

第三阶段：两个传统怎么变成今天的圣诞节（融合过程）

关键金句：

12月25日，是个充满爱和温暖的日子！

冬天来了，春天就不远啦！

大家在一起，就是最快乐的节日！

生僻词控制：

必须标注：冬至、古罗马、耶稣（每词只出现1-2次）

其他专业术语一律转化为简单说法
现在，你可以使用这套通用指令创作任何主题的儿童科普童话。记住：越简单、越重复、越“幼稚”，通过率越高。

【排版增强与可视化指令】
为使文章版面更清晰、易读，在严格遵守原有格式的基础上，增加以下排版规则：

三级标题体系：

文章主标题用 <h1>。

核心部分的大标题用 <h2>，例如：<h2>寻找圣诞节的源头</h2>。

每个拟人化角色出场或转换场景时，用 <h3> 标出，例如：<h3>日历小精灵蹦蹦跳跳地来了</h3>。

文本突出规则：

生僻字/关键名词加粗：对小朋友可能第一次见的词（如“冬至”、“发酵”）使用 <strong>。

金句下划线：对总结性、朗朗上口的句子使用 <u>。每篇文章不超过5句。

专有名词斜体：对所有地名（如“古罗马”）、历史人物名（如“耶稣”）、特定节日名（如“春节”）使用 <i>。

对话排版模板：

<p><strong>小明好奇地问：</strong>“为什么圣诞节在冬天呢？”</p>
<p><i>圣诞老爷爷</i>捋了律胡子，笑眯眯地说：<u>“因为冬天最需要温暖和爱呀！”</u></p>
视觉节奏控制：

每描述完一个完整的小知识 or 情节，就插入一个 <h3> 小标题或空行，给眼睛一个“呼吸”的段落。

严禁大段文字堆砌，确保“画面”不断切换。

【人味与童话感注入指令】
为让故事更温暖、更像人编写的童话，在推进情节时，请自然融入以下元素：

感官描写：在场景中轻轻带入1-2种感官。例如：“风吹在脸上凉丝丝的”、“空气中飘着甜滋滋的糖果味儿”、“教堂的钟声当当当，传得很远很远”。

微小的情感与动作：给角色增加符合儿童认知的微小反应。

例如：“红红瞪大了眼睛”、“小明高兴地拍起手来”、“历史伯伯说到这儿，轻轻叹了口气”。

简单的悬念与呼应：

开头埋个小钩子：“圣诞老爷爷有个秘密，今天终于要告诉大家了……”

结尾做个小心愿：“小明听着故事，慢慢地、甜甜地睡着了。梦里，他见到了……”（回归到“甜美梦乡”的要求）

“不完美”的童言童语：允许角色在对话中有小小的重复、口误或自问自答，模仿真实的孩子口吻。

例如：“哦，我明白了！不……等等，太阳公公，我还是有点不明白……”

此模块旨在有限度地引入变量，让AI在固定结构下能有“微创作”。风险稍高，但可能带来惊喜，请谨慎测试。`
  },
  {
    id: 'news_report',
    name: '热点新闻速报',
    icon: NewspaperIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    titleConfig: `1. 标题字数15-50字
2. 按照爆款公众号爆款标题规则
3. 去掉固定格式
4. 无夸张
5. 无特地强调具体日期和地点以夸大紧急性与针对性
6. 无紧急通知类标题
7. 无强烈煽动性标题`,
    content: `本指令保留原 80-90 年代儿童读物核心风格、排版格式、叙事逻辑，新增节日礼仪 / 儿童教养主题适配规则，可同时创作儿童科普童话、春节礼仪等儿童教养类文章，生成内容符合 AI 检测要求，风格贴合 1980-1990 年代中国大陆儿童读物特征。
一、核心创作原则（通用，科普 / 礼仪主题均遵循）
1. 时代风格锁定
年代特征：完全模仿 1980-1990 年代中国大陆出版的儿童科普 / 教养读物文字风格
语言特征：
使用简单、重复、略带笨拙的句式
多用 “呀”、“啊”、“呢”、“啦” 等口语化语气词
比喻系统限定在 "工厂"、"小火车"、"幼儿园"、"勤劳的工人"、"老爷爷"、"小朋友" 等 80-90 年代儿童读物常见比喻范围内
绝对禁止使用任何 2000 年后的网络用语、现代科技比喻（如互联网、机器人、人工智能、黑客等）
政治正确性：符合 80-90 年代儿童读物的政治正确标准，贴合当时家风家教、礼仪教养的价值导向，不涉及任何现代敏感话题
2. 通用叙事结构（适用于科普 / 礼仪任何主题）
无论主题是科学、历史、节日还是礼仪文化，都采用以下结构：
开头（200-300 字）：从儿童日常生活场景切入，提出一个简单的问题 or 生活现象
示例句式（科普）：“有一天，小明发现了一个奇怪的现象……”
示例句式（礼仪）：“过年啦，小明跟着爸爸妈妈去亲戚家做客，他不知道该怎么跟爷爷奶奶打招呼，心里慌慌的……”
中间（主体部分，800-1000 字）：按照时间顺序 or 逻辑顺序展开，将复杂知识 / 礼仪规范分解为 3-5 个简单步骤，每个步骤由 1-2 个拟人化角色负责讲解，通过角色对话推动情节，禁止直接讲解知识，每个步骤使用相似的结构模式，形成重复韵律
结尾（200-300 字）：回到开头的日常生活场景，用一句简单的生活行为建议结束
示例句式（科普）：“从那以后，小明明白了…… 他决定……”
示例句式（礼仪）：“从那以后，小明学会了做客的小规矩…… 他以后每次走亲访友，都会做有礼貌的小朋友啦！”
禁止深刻的哲理升华，只要简单的行为指导 / 习惯养成建议
3. 通用角色设定模板
无论科普 / 礼仪主题，都使用以下角色类型，可根据主题灵活调整角色名称：
提问者：通常是 “小明”、“红红”、“冬冬”、“大能”、“军军”、“龙龙”、“妮妮”、“小雅” 等普通儿童
引导者：知识渊博 / 懂礼仪的 “老爷爷”、“叔叔”、“老师”、“奶奶” 等长辈形象
执行者：2-3 个拟人化的概念角色（科普用：太阳公公、时间老人；礼仪用：礼仪爷爷、礼貌小天使等）
助手：1-2 个可爱的动物或物品形象（可选，如小花猫、小灯笼、福字贴等）
4. 知识转化模板
将专业科普知识 / 礼仪教养规范转化为儿童能懂的语言：
历史日期 → “日历上的小格子选出来的好日子”
科学原理 → “大自然的小秘密”
文化习俗 / 礼仪规范 → “老祖宗传下来的好习惯 / 待人接物的小规矩”
复杂过程 → “一段奇妙的旅行”
做客 / 待客礼仪 → “走亲访友 / 招待客人的小妙招”
二、创作细节规范（通用，科普 / 礼仪主题均遵循）
1. 逻辑重构：知识 / 礼仪钩子协议
硬核开头：开头第 1-2 段严禁讲故事。必须以明确的科学观点 /礼仪习惯真相切入。
科普示例：“你知道吗？你的肚子里藏着一台 24 小时不停工的‘超级实验室’...”
礼仪示例：“你知道吗？去亲戚家做客时，小小的一句问候，藏着大大的礼貌学问呢！”
知识 / 礼仪引入：先建立科学坐标系 /礼仪行为框架，再引入角色。
2. 语义化排版指令
生僻词加粗 (strong)：识别文中对孩子来说较生疏的名词、科学术语、礼仪相关词汇，进行加粗。
金句下划线 (u)：仅对总结性观点、富有哲理的句子、表明作者立场的段落核心句添加下划线。
严禁在标题（h2/h3）中使用下划线。
3. 拟人化演绎
角色性格要稳健。科普角色：小肠不再是只会哭，而是像个 “细心的分拣员”；礼仪角色：礼貌小天使不再是只会笑，而是像个 “贴心的小向导”。
动词要精准：科普用 “过滤、传输、研磨、侦测” 替代泛化的 “变、弄”；礼仪用 “问候、道谢、礼让、道别、端递、寒暄” 替代泛化的 “说、做、拿”。
4. 童话式结局
故事结尾要收回到开头的科学观点 /礼仪观点上。
描述角色学到了什么科学常识 /礼仪好习惯，并以 “从此以后” 引出美好的结局，最后一句要能带入甜美的梦乡。
5. 代码纯净度
严禁输出任何 * 或 - 等 Markdown 标记，只准用标准 HTML。
三、排版格式要求（严格统一，科普 / 礼仪主题均遵循）
生僻词标注规则
每 300 字标注 1-2 个生僻词，标注方式：在生僻词加粗；礼仪主题需标注礼仪相关生僻词（如作揖、寒暄、待客）。
金句标注规则
全文金句不超过 5 句，仅标注重复出现的、朗朗上口的句子，标注方式：金句加下划线。
段落格式
每段不超过 3 句话，段落之间空一行，对话必须单独成段，说话者在前，使用冒号。
示例：
<p>小明问：“为什么过年要给长辈拜年呢？”</p>
<p>礼仪爷爷笑眯眯地说：“这是老祖宗传下来的礼貌规矩呀！”</p>
三级标题体系
文章主标题用 <h1>。
核心部分的大标题用 <h2>，科普示例：<h2>寻找圣诞节的源头</h2>；礼仪示例：<h2>学习春节做客的小规矩</h2>。
每个拟人化角色出场或转换场景时，用 <h3> 标出，科普示例：<h3>日历小精灵蹦蹦跳跳地来了</h3>；礼仪示例：<h3>礼貌小天使挥着小翅膀飞来啦</h3>。
文本突出规则
生僻字 / 关键名词加粗：对小朋友可能第一次见的词（如 “冬至”、“发酵”、“作揖”、“寒暄”）使用 <strong>。
金句下划线：对总结性、朗朗上口的句子使用 <u>。每篇文章不超过 5 句。
专有名词斜体：对所有地名（如 “古罗马”）、历史人物名（如 “耶稣”）、** 特定节日名（如 “春节”）、传统礼仪相关名词（如 “拜年”）** 使用 <i>。
对话排版模板
<p><strong>小明好奇地问：</strong>“为什么圣诞节在冬天呢？”</p>
<p><i>圣诞老爷爷</i>捋了捋胡子，笑眯眯地说：<u>“因为冬天最需要温暖和爱呀！”</u></p>
<p><strong>红红歪着脑袋问：</strong>“过年收红包要怎么做才礼貌呢？”</p>
<p><i>礼仪爷爷</i>摸了摸红红的头，慢悠悠地说：<u>“接过红包要说谢谢，可不能当场打开看哦！”</u></p>
视觉节奏控制
每描述完一个完整的小知识 /礼仪小规矩或情节，就插入一个 <h3> 小标题或空行，给眼睛一个 “呼吸” 的段落。严禁大段文字堆砌，确保 “画面” 不断切换。
四、分主题适配指南（新增礼仪主题，保留科普 / 节日历史主题）
主题一：节日礼仪 / 儿童教养主题（如春节做客 / 待客礼仪、拜年礼仪）
角色设定
引导者：<i>礼仪爷爷</i> + <i>家风奶奶</i>（两人对话，可任选其一）
执行者：<i>礼貌小天使</i>（负责教礼仪动作）、<i>春节小灯笼</i>（负责讲解节日礼仪由来）、<i>待客小精灵</i>/<i>做客小精灵</i>（负责拆解具体礼仪步骤）
助手：小花猫、福字贴、小红包等春节相关物品形象
三阶段叙事
第一阶段：从孩子的春节生活场景切入，提出礼仪困惑（如 “去亲戚家不知道怎么打招呼”“收红包不知道该说什么”）
第二阶段：拆解 3-5 个核心礼仪规矩，由拟人化角色逐一带教（如打招呼、收红包、吃饭、道别）
第三阶段：将礼仪规矩融合到春节走亲访友的场景中，教孩子如何灵活运用
关键金句（可任选，每篇不超过 5 句）
过年走亲访友，做个有礼貌的小朋友，大家都喜欢！
一句谢谢暖人心，小小礼貌大作用呀！
做客有规矩，待客有诚意，春节才更甜！
老祖宗传的好习惯，我们要记牢啦！
大家讲礼貌，新年更热闹！
生僻词控制
必须标注：<strong>寒暄</strong>、<strong>作揖</strong>、<strong>待客</strong>（每词只出现 1-2 次），其他礼仪专业术语一律转化为简单说法。
主题二：历史 / 节日科普主题（如圣诞节、二十四节气）
角色设定
引导者：圣诞老爷爷 + 历史伯伯（两人对话，可任选其一）
执行者：日历小精灵（负责翻日历）、太阳公公（解释冬至）、教堂钟声（象征纪念）
助手：小雪人、糖果罐等节日相关物品形象
三阶段叙事
第一阶段：古罗马人怎么过冬至（简单描述）
第二阶段：基督教为什么选这天（简单比喻）
第三阶段：两个传统怎么变成今天的圣诞节（融合过程）
关键金句
12 月 25 日，是个充满爱和温暖的日子！
冬天来了，春天就不远啦！
大家在一起，就是最快乐的节日！
生僻词控制
必须标注：<strong>冬至</strong>、<strong>古罗马</strong>、<strong>耶稣</strong>（每词只出现 1-2 次），其他专业术语一律转化为简单说法。
主题三：纯科学科普主题（如人体奥秘、自然现象）
遵循原指令的角色、叙事、金句、生僻词规则，核心为拆解科学原理、讲解自然小秘密，此处不再赘述。
五、人味与童话感注入指令（通用，科普 / 礼仪主题均遵循）
为让故事更温暖、更像人编写的童话，在推进情节时，请自然融入以下元素，礼仪主题需贴合春节等节日的生活场景：
1. 感官描写
在场景中轻轻带入 1-2 种感官。
科普示例：“风吹在脸上凉丝丝的”、“空气中飘着甜滋滋的糖果味儿”
礼仪示例：“屋子里飘着香喷喷的饺子味”、“红包拿在手里热乎乎的”、“鞭炮声噼里啪啦，传得很远很远”
2. 微小的情感与动作
给角色增加符合儿童认知的微小反应。
科普示例：“红红瞪大了眼睛”、“小明高兴地拍起手来”
礼仪示例：“红红红着脸小声说了句谢谢”、“小明挠了挠头，不好意思地笑了”、“礼仪爷爷说到这儿，轻轻点了点头”
3. 简单的悬念与呼应
开头埋个小钩子：科普用 “圣诞老爷爷有个秘密，今天终于要告诉大家了……”；礼仪用 “礼仪爷爷有个礼貌小锦囊，今天要送给小朋友们……”
结尾做个小心愿：“小明听着故事，慢慢地、甜甜地睡着了。梦里，他见到了……”（回归到 “甜美梦乡” 的要求，礼仪主题可梦到 “和小伙伴一起礼貌拜年、收红包” 等场景）
4. “不完美” 的童言童语
允许角色在对话中有小小的重复、口误或自问自答，模仿真实的孩子口吻。
示例：“哦，我明白了！不…… 等等，礼仪爷爷，我还是有点不明白，为什么不能当场打开红包呢？”
此模块旨在有限度地引入变量，让 AI 在固定结构下能有 “微创作”，保持内容的生动性，同时不偏离 80-90 年代儿童读物的核心风格。
六、核心创作要求
越简单、越重复、越 “幼稚”，通过率越高，无论科普 / 礼仪主题，均需贴合儿童的认知水平，避免复杂的表述，以习惯养成、行为指导为核心目的。`
  },
  {
    id: 'emotional_essay',
    name: '深夜情感美文',
    icon: HeartIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    titleConfig: `1. 标题字数15-50字
2. 走心、细腻、具有故事感。
3. 严禁标题党。`,
    content: `你是一位温暖的情感博主，擅长创作治愈系的深夜推文。

1. 核心意境
笔触细腻、感性、富有韵律感。重点在于引发读者共鸣，文字要柔美，像是在耳边的低语。

2. 内容结构
叙事：以一个小故事或一个生活细节开头。
升华：从故事引申出关于爱、梦想或生活的感悟。
排版：
- 多留白，段落短小（经常一句话一段）。
- 金句使用 <u> 下划线标记。
- 情感关键词使用 <em> 标签（会渲染为斜体）。`
  },
  {
    id: 'tech_deep_dive',
    name: '技术深度分析',
    icon: LightBulbIcon,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    titleConfig: `1. 标题字数15-50字
2. 专业、严谨、体现深度与前瞻性。`,
    content: `你是一位资深技术顾问，负责将复杂的技术概念拆解给专业读者。

1. 写作原则
严谨、专业、结构化。
- 使用 <h1> 作为总标题。
- 使用 <h2> 分隔技术模块。
- 关键名词、参数、代码术语必须使用 <strong> 标签。
- 核心原理解释使用 <u> 标签进行下划线突出。

2. 结构要求
背景介绍 -> 核心架构拆解 -> 场景应用案例 -> 专家建议。`
  }
];

const formatHtmlForWeChat = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const wrapper = doc.createElement('section');
  wrapper.style.cssText = `font-family: -apple-system, sans-serif; font-size: 16px; line-height: 1.8; color: #333333; padding: 10px;`;
  while (doc.body.firstChild) wrapper.appendChild(doc.body.firstChild);
  doc.body.appendChild(wrapper);
  
  // 处理标题样式
  const h2s = wrapper.querySelectorAll('h2');
  h2s.forEach(el => {
      const container = doc.createElement('section');
      container.style.cssText = `text-align: center; margin: 40px 0 25px 0; font-weight: bold; font-size: 18px; color: #1a1a1a;`;
      container.innerHTML = `<span style="border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">${el.innerHTML}</span>`;
      if (el.parentNode) el.parentNode.replaceChild(container, el);
  });

  const h3s = wrapper.querySelectorAll('h3');
  h3s.forEach(el => {
      const container = doc.createElement('section');
      container.style.cssText = `margin: 30px 0 15px 0; font-weight: bold; font-size: 16px; color: #3b82f6; display: flex; align-items: center; gap: 8px;`;
      container.innerHTML = `<span style="width: 4px; height: 16px; background: #3b82f6; border-radius: 2px;"></span><span>${el.innerHTML}</span>`;
      if (el.parentNode) el.parentNode.replaceChild(container, el);
  });

  const paragraphs = wrapper.querySelectorAll('p');
  paragraphs.forEach(p => { (p as HTMLElement).style.cssText = "margin: 0 0 20px 0; text-align: justify; font-size: 16px; line-height: 1.8;"; });
  
  return doc.body.innerHTML;
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'article' | 'video'>('article');
  const [topic, setTopic] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [titleConfig, setTitleConfig] = useState(DEFAULT_TITLE_CONFIG);
  const [articleConfig, setArticleConfig] = useState(ARTICLE_TEMPLATES[0].content);
  const [activeTemplateId, setActiveTemplateId] = useState(ARTICLE_TEMPLATES[0].id);
  
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [mergingAudio, setMergingAudio] = useState(false);
  const [audioItems, setAudioItems] = useState<{blob: Blob, url: string}[]>([]);
  
  const [audioProvider, setAudioProvider] = useState<'gemini' | 'openai'>('gemini');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiUsername, setOpenaiUsername] = useState('');
  const [showAudioEngineSettings, setShowAudioEngineSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Puck' | 'Kore' | 'Zephyr' | 'alloy' | 'echo' | 'nova'>('Puck'); 

  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [showEmoticonModal, setShowEmoticonModal] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false); 
  const [showPaintingModal, setShowPaintingModal] = useState(false);
  
  const isComposing = useRef(false);

  const [wizardState, setWizardState] = useState({
    view: 'settings' as 'settings' | 'wizard',
    inlineCount: 5,
    aspectRatio: '3:4' as '3:4' | '16:9',
    style: '2d_art' as '2d_art' | '3d_pixar' | 'realistic_cartoon',
    borderStyle: 'none' as 'none' | 'rounded' | 'rough',
    steps: [] as string[],
    currentStepIdx: 0,
    stepPrompts: [] as string[],
    generatedImages: [] as (string | null)[],
    isProcessing: false
  });

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImgForInsert, setSelectedImgForInsert] = useState<string | null>(null);
  const [isInsertionMode, setIsInsertionMode] = useState(false);

  const articleBodyRef = useRef<HTMLDivElement>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Loading Timer Effect
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingTime(0);
      interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const syncContentToState = () => {
    if (articleBodyRef.current) {
        setGeneratedBody(articleBodyRef.current.innerHTML);
    }
  };

  const getImageStyle = (styleType: 'none' | 'rounded' | 'rough') => {
      const base = "display:block; width:100%; border-radius:12px; margin:auto;";
      if (styleType === 'rounded') {
          return `${base} margin-top:35px; margin-bottom:35px; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06);`;
      } else if (styleType === 'rough') {
          return `${base} margin-top:45px; margin-bottom:45px; border-radius:0;`;
      }
      return `${base} margin-top:30px; margin-bottom:30px;`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setGeneratedTitle(''); setGeneratedBody(''); setAudioItems([]); 
    setGeneratedImages([]); setSelectedImgForInsert(null); setIsInsertionMode(false);
    setWizardState({ view: 'settings', inlineCount: 5, aspectRatio: '3:4', style: '2d_art', borderStyle: 'none', steps: [], currentStepIdx: 0, stepPrompts: [], generatedImages: [], isProcessing: false });
    try {
      if (appMode === 'article') {
          const html = await generateArticle(topic, titleConfig.replace(/{topic}/g, topic), articleConfig);
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const h1 = doc.querySelector('h1');
          const titleText = h1 ? h1.innerText : `少儿科普故事《${topic}》`;
          if (h1) h1.remove(); 
          setGeneratedTitle(titleText);
          setGeneratedBody(formatHtmlForWeChat(doc.body.innerHTML));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGenerateAudio = async () => {
      const container = articleBodyRef.current;
      if (!container) return;
      syncContentToState();
      setAudioItems([]);
      if (audioProvider === 'openai' && !openaiKey) { setShowAudioEngineSettings(true); return; }
      let textContent = container.innerText;
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu;
      textContent = textContent.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
      if (!textContent || textContent.length < 5) return alert("请在文本框内输入内容");
      setGeneratingAudio(true);
      try {
          let blobs: Blob[] = [];
          if (audioProvider === 'openai') { blobs = await generateSpeechOpenAI(openaiKey, textContent, selectedVoice as any); }
          else { blobs = await generateSpeech(textContent, selectedVoice); }
          if (blobs && blobs.length > 0) { setAudioItems(blobs.map(blob => ({ blob, url: URL.createObjectURL(blob) }))); }
      } catch (e: any) { alert(`音频生成失败: ${e.message}`); } finally { setGeneratingAudio(false); }
  };

  const handleMergeAudio = async () => {
      if (audioItems.length === 0) return;
      setMergingAudio(true);
      try {
          const mergedBlob = await mergeWavBlobs(audioItems.map(item => item.blob));
          const url = URL.createObjectURL(mergedBlob);
          const a = document.createElement('a');
          a.href = url; a.download = `${generatedTitle || 'audio'}.wav`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch (e) { console.error(e); } finally { setMergingAudio(false); }
  };

  const handleParaClick = (e: React.MouseEvent) => {
      if (!isInsertionMode || !selectedImgForInsert) return;
      const target = e.target as HTMLElement;
      const block = target.closest('p, .article-header-container, section');
      if (block && articleBodyRef.current && articleBodyRef.current.contains(block)) {
          const imgHtml = `<img src="${selectedImgForInsert}" style="${getImageStyle(wizardState.borderStyle)}" />`;
          block.insertAdjacentHTML('afterend', imgHtml);
          syncContentToState();
          setSelectedImgForInsert(null);
          setIsInsertionMode(false);
      }
  };

  const copyToClipboard = async (text: string, type: 'title' | 'body') => {
    if (type === 'body' && articleBodyRef.current) {
        const range = document.createRange(); range.selectNode(articleBodyRef.current);
        window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range);
        document.execCommand('copy'); window.getSelection()?.removeAllRanges();
        setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000);
    } else if (type === 'title') {
        await navigator.clipboard.writeText(generatedTitle);
        setCopiedTitle(true); setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const selectTemplate = (tpl: typeof ARTICLE_TEMPLATES[0]) => {
      setArticleConfig(tpl.content);
      setActiveTemplateId(tpl.id);
      if (tpl.titleConfig) {
          setTitleConfig(tpl.titleConfig);
      }
  };

  return (
    <div className={`min-h-screen py-12 px-4 transition-all duration-500 ${appMode === 'article' ? 'bg-[#f5f7fa]' : 'bg-slate-900'}`}>
      <AIDetectionModal isOpen={showDetectionModal} onClose={() => setShowDetectionModal(false)} aiContent={generatedBody} onApplyPrompt={p => {setArticleConfig(p); setShowSettings(true);}} />
      <EmoticonModal isOpen={showEmoticonModal} onClose={() => setShowEmoticonModal(false)} />
      <SongModal isOpen={showSongModal} onClose={() => setShowSongModal(false)} />
      <PaintingModal 
        isOpen={showPaintingModal} 
        onClose={() => setShowPaintingModal(false)} 
        articleHtml={generatedBody} 
        wizardState={wizardState} 
        setWizardState={setWizardState} 
        onComplete={imgs => { 
            setGeneratedImages(imgs); 
            if (imgs.length > 0) { 
                const coverStyle = getImageStyle(wizardState.borderStyle).replace('margin-top:30px;', 'margin-top:0;');
                const newBody = `<img src="${imgs[0]}" style="${coverStyle} margin-bottom:35px;" />` + (articleBodyRef.current?.innerHTML || generatedBody); 
                setGeneratedBody(newBody); 
            } 
        }} 
      />

      {showAudioEngineSettings && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900"><SpeakerWaveIcon className="w-5 h-5 text-green-600" /> OpenAI 配置</h3>
                      <button onClick={() => setShowAudioEngineSettings(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4">
                      <input type="text" value={openaiUsername} onChange={e => setOpenaiUsername(e.target.value)} placeholder="账户名" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" />
                      <input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-mono" />
                  </div>
                  <button onClick={() => { setAudioProvider('openai'); setShowAudioEngineSettings(false); }} className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">保存设置</button>
              </div>
          </div>
      )}

      {generatedImages.length > 0 && (
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-3 p-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl animate-in slide-in-from-right-10">
              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide flex flex-col gap-3">
                  {generatedImages.map((img, i) => (
                      <button key={i} onClick={() => { setSelectedImgForInsert(img); setIsInsertionMode(true); }} className={`w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all ${selectedImgForInsert === img ? 'border-indigo-600 ring-4 ring-indigo-100' : 'border-white shadow-sm'}`}><img src={img} className="w-full h-full object-cover" /></button>
                  ))}
              </div>
              <button onClick={() => { setGeneratedImages([]); setIsInsertionMode(false); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-all self-center"><XMarkIcon className="w-5 h-5" /></button>
          </div>
      )}

      {isInsertionMode && (
          <div className="fixed inset-0 z-[110] pointer-events-none border-[12px] border-indigo-600/20 flex flex-col items-center pt-12 animate-in fade-in">
              <div className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-bold shadow-2xl pointer-events-auto flex items-center gap-4">
                  <span className="text-lg">请点击正文段落，图片将插在段落之后</span>
                  <button onClick={() => { setIsInsertionMode(false); setSelectedImgForInsert(null); }} className="bg-white/10 hover:bg-white/30 px-4 py-2 rounded-xl text-sm border border-white/20">取消</button>
              </div>
          </div>
      )}

      <div className="max-w-5xl mx-auto relative">
        <div className="absolute top-0 left-0 hidden xl:flex flex-col gap-6 -ml-44 z-10">
            <button onClick={() => setShowEmoticonModal(true)} className="group w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-white hover:scale-105 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50"><FaceSmileIcon className="w-12 h-12 text-pink-500 mb-2" /><span className="text-[11px] font-bold text-pink-600">AI 表情包</span></button>
            <button onClick={() => setShowSongModal(true)} className="group w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-white hover:scale-105 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50"><MusicalNoteIcon className="w-12 h-12 text-purple-500 mb-2" /><span className="text-[11px] font-bold text-purple-600">AI 歌曲</span></button>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl flex shadow-xl border border-white/20">
                <button onClick={() => setAppMode('article')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${appMode === 'article' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><PencilSquareIcon className="w-5 h-5" /><span>公众号</span></button>
                <button onClick={() => setAppMode('video')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${appMode === 'video' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><VideoCameraIcon className="w-5 h-5" /><span>视频号</span></button>
             </div>
          </div>
          <h1 className={`text-4xl font-extrabold ${appMode === 'article' ? 'text-gray-900' : 'text-white'}`}>AI一键发文 v1.3.1</h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">高级逻辑重构 · 时代风格锁定 · 可视化排版</p>
        </div>

        <div className={`rounded-2xl shadow-xl p-6 mb-10 border transition-all ${appMode === 'article' ? 'bg-white border-gray-100' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入发文主题..." className={`flex-1 text-lg px-6 py-4 rounded-xl border-2 outline-none ${appMode === 'article' ? 'border-gray-200 focus:border-green-500' : 'border-slate-600 text-white bg-slate-900'}`} />
            <button onClick={() => setShowSettings(!showSettings)} className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-400 hover:text-green-600 transition-colors"><Cog6ToothIcon className="h-6 w-6" /></button>
            <button onClick={handleGenerate} disabled={loading || !topic.trim()} className={`px-8 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400' : appMode === 'article' ? 'bg-green-600' : 'bg-orange-600'}`}>
                {loading ? (loadingTime > 60 ? '超时等待...' : `生成中(${loadingTime}s)`) : '立即创作'}
            </button>
          </div>
          {showSettings && <div className="mt-6 border-t pt-6 space-y-8 animate-in fade-in">
            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <SparklesSolidIcon className="w-4 h-4 text-indigo-500" /> 选择风格模板 (Style Templates)
                </label>
                <div className="flex flex-wrap gap-3">
                    {ARTICLE_TEMPLATES.map(tpl => (
                        <button
                            key={tpl.id}
                            onClick={() => selectTemplate(tpl)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all group ${
                                activeTemplateId === tpl.id 
                                ? `${tpl.bgColor} ${tpl.borderColor} ring-4 ring-indigo-50 scale-105` 
                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <tpl.icon className={`w-5 h-5 ${tpl.color}`} />
                            <span className={`text-sm font-bold ${activeTemplateId === tpl.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{tpl.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">标题指令 (Title Rules)</label><textarea value={titleConfig} onChange={e => setTitleConfig(e.target.value)} className="w-full h-48 p-3 text-sm bg-gray-50 border rounded-lg outline-none font-mono" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">正文指令集 (Content Instruction)</label><textarea value={articleConfig} onChange={e => setArticleConfig(e.target.value)} className="w-full h-48 p-3 text-sm bg-gray-50 border rounded-lg outline-none font-mono" /></div>
            </div>
          </div>}
        </div>

        {(generatedTitle || generatedBody) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 block">文章标题</label>
                    <input type="text" value={generatedTitle} onChange={e => setGeneratedTitle(e.target.value)} className="w-full text-xl font-bold text-gray-800 outline-none border-b-2 border-transparent focus:border-indigo-100 transition-colors" />
                </div>
                <button onClick={() => copyToClipboard(generatedTitle, 'title')} className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${copiedTitle ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{copiedTitle ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />} {copiedTitle ? '已复制' : '复制标题'}</button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                   <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => {
                            syncContentToState();
                            setShowPaintingModal(true);
                        }} 
                        className="text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
                      >绘图向导</button>
                      <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2 py-0.5 border border-amber-100">
                        <div className="flex p-0.5 bg-amber-200/40 rounded-lg">
                            <button onClick={() => {setAudioProvider('gemini'); setSelectedVoice('Puck');}} className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${audioProvider === 'gemini' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-500'}`}>GEMINI</button>
                            <button onClick={() => {setAudioProvider('openai'); setSelectedVoice('alloy');}} className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${audioProvider === 'openai' ? 'bg-white text-green-600 shadow-sm' : 'text-amber-500'}`}>OPENAI</button>
                        </div>
                        <div className="h-4 w-px bg-amber-200 mx-1"></div>
                        <button onClick={handleGenerateAudio} disabled={generatingAudio} className="text-xs text-amber-600 px-2 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-100">{generatingAudio ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : (audioProvider === 'gemini' ? <CpuChipIcon className="w-4 h-4" /> : <CloudIcon className="w-4 h-4" />)} 音频</button>
                        <button onClick={() => setShowAudioEngineSettings(true)} className="p-1.5 hover:bg-amber-200 rounded-lg text-amber-500"><Cog6ToothIcon className="w-4 h-4" /></button>
                        <div className="h-4 w-px bg-amber-200 mx-1"></div>
                        <div className="flex gap-0.5">
                            {audioProvider === 'gemini' ? (
                                <>
                                    <button onClick={() => setSelectedVoice('Puck')} className={`text-[9px] px-1.5 py-1 rounded-md font-bold ${selectedVoice === 'Puck' ? 'bg-amber-600 text-white' : 'text-amber-500'}`}>男</button>
                                    <button onClick={() => setSelectedVoice('Kore')} className={`text-[9px] px-1.5 py-1 rounded-md font-bold ${selectedVoice === 'Kore' ? 'bg-amber-600 text-white' : 'text-amber-500'}`}>女</button>
                                    <button onClick={() => setSelectedVoice('Zephyr')} className={`text-[9px] px-1.5 py-1 rounded-md font-bold ${selectedVoice === 'Zephyr' ? 'bg-amber-600 text-white' : 'text-amber-500'}`}>童</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setSelectedVoice('alloy')} className={`text-[9px] px-1.5 py-1 rounded-md font-bold ${selectedVoice === 'alloy' ? 'bg-green-600 text-white' : 'text-green-600'}`}>Alloy</button>
                                    <button onClick={() => setSelectedVoice('echo')} className={`text-[9px] px-1.5 py-1 rounded-md font-bold ${selectedVoice === 'echo' ? 'bg-green-600 text-white' : 'text-green-600'}`}>Echo</button>
                                </>
                            )}
                        </div>
                      </div>
                      <button onClick={() => {
                          syncContentToState();
                          setShowDetectionModal(true);
                      }} className="text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold border border-blue-100 hover:bg-blue-100">AI克隆</button>
                   </div>
                   <button onClick={() => copyToClipboard(generatedBody, 'body')} className={`text-xs px-6 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 ${copiedBody ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>复制正文代码</button>
                </div>
                
                {audioItems.length > 0 && (
                    <div className="p-4 bg-amber-50 border-b flex flex-col md:flex-row items-start md:items-center gap-4">
                        <button onClick={handleMergeAudio} disabled={mergingAudio} className="shrink-0 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:bg-gray-400">{mergingAudio ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowDownTrayIcon className="w-4 h-4" />} 下载完整音频</button>
                        <div className="flex flex-wrap gap-3">
                            {audioItems.map((item, i) => (<div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-amber-100"><span className="text-[10px] font-bold text-amber-600">P{i+1}</span><audio src={item.url} controls className="h-6 w-36" /></div>))}
                        </div>
                    </div>
                )}

                <div 
                  ref={articleBodyRef} 
                  onClick={handleParaClick} 
                  onBlur={syncContentToState}
                  onCompositionStart={() => { isComposing.current = true; }}
                  onCompositionEnd={(e) => { 
                      isComposing.current = false; 
                      syncContentToState();
                  }}
                  onInput={(e) => {
                      if (!isComposing.current) {
                          setGeneratedBody(e.currentTarget.innerHTML);
                      }
                  }}
                  className={`p-8 sm:p-14 text-gray-800 outline-none transition-all ${isInsertionMode ? 'cursor-crosshair bg-indigo-50/20' : ''}`} 
                  contentEditable={true} 
                  suppressContentEditableWarning={true} 
                  dangerouslySetInnerHTML={{ __html: generatedBody }} 
                />
            </div>
          </div>
        )}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } [contenteditable]:focus { outline: none; }`}</style>
    </div>
  );
};
export default App;
