import { CONFIG_OPENAI_TOKEN, OpenAIConfig } from '@/common/config/app.config';
import { Injectable, Inject } from '@nestjs/common';
import OpenAI from 'openai';
// import { CONFIG_OPENAI_TOKEN, OpenAIConfig } from 'src/config/openai.config';
@Injectable()
export class OpenaiService {
  private client: OpenAI;
  private model: string;

  constructor(
    @Inject(CONFIG_OPENAI_TOKEN)
    private readonly openaiConfig: OpenAIConfig
  ) {
    this.client = new OpenAI({
      apiKey: this.openaiConfig.apiKey,
    });

    this.model = this.openaiConfig.model;
  }

  async askGPT(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content;
  }

  async analyseNews(newsText: string): Promise<string> {
    /* const prompt = `
Siz tajribali moliyaviy tahlilchi sifatida javob bering.
Quyidagi kompaniyaga oid yangilik beriladi.

📰 Yangilik:
${newsText}

📊 VAZIFA:
1) Avval BATAFSIL MOLIYAVIY TAHLIL yozing (pastdagi format bo‘yicha).
2) Tahlil tugagach, oxirida STRICT JSON qaytaring (format pastda).

====================================================
📌 1–QISM: ANALITIK TAHLIL (MATN)
====================================================

Tahlil quyidagi formatda bo‘lsin:

1) **Qisqa muddatli ta’sir (1 kun / 1 hafta / 1 oy)**
   - Aksiya narxiga ta’sir ehtimoli (%)
   - Ijobiy / salbiy / neytral
   - Investor sentiment (euphoria, fear, uncertainty, hype)

2) **O‘rta muddatli ta’sir (3–6 oy)**
   - Fundamental ta’sir
   - Raqobatchilar kontekstida o‘zgarish
   - Bozor segmentiga ta’sir

3) **Uzoq muddatli ta’sir (6–12 oy)**
   - Strategik qiymat
   - Texnologik / regulyator risklar
   - Potensial o‘sish diapazoni (%)

4) **Risklar**
   - Texnik risklar
   - Regulyator / qonunchilik risklari
   - Moliyaviy risklar
   - Bozor risklari

5) **Imkoniyatlar**
   - Savdo / daromad o‘sishi imkoniyati
   - Bozor ulushi kengayishi
   - Hamkorlik va yangi mahsulotlar salohiyati

6) **Tarixiy o‘xshash hodisalar**
   - 2–3 ta real misol
   - Ularning aksiyaga ta’siri (foizlar bilan)

7) **Yakuniy xulosa**
   - Yangilikning umumiy ta’siri: ijobiy / salbiy / neytral
   - Bu investitsiya tavsiyasi emas — analitik baho

====================================================
📌 2–QISM: STRICT JSON FORMATDA QAYTARING
====================================================

Matn tahlilidan keyin alohida STRICT JSON qaytaring:

{
  "sentiment": "ijobiy | salbiy | neytral",
  "confidence": 0-100,
  "impact_type": "short-term | medium-term | long-term",
  "impact_strength": 0-100,
  "reason": "1-2 jumlalik juda qisqa izoh"
}

‼ Muhim:
- JSON oldidan 'JSON:' deb yozing
- JSON dan tashqari hech qanday qo‘shimcha belgi bo‘lmasin
- JSON sintaksisi to‘liq valid bo‘lsin
- Tahlil investitsiya tavsiyasi emas.
`;
 */

    const prompt = `
Quyidagi kompaniya yangiligi bo'yicha aksiyaga ta'sirni baholang. Faqat STRICT JSON qaytaring.

📰 Yangilik:
${newsText}

📊 VAZIFA:
JSON quyidagi formatda bo'lsin:

{
  "sentiment": "ijobiy | salbiy | neytral",
  "confidence": 0-100,
  "impact_type": "short-term | medium-term | long-term",
  "impact_strength": 0-100,
  "expected_move_percent": {
    "min": -50 to +50,
    "max": -50 to +50
  },
  "reason": "1-2 jumlalik qisqa izoh"
}

Qoidalar:
- Faqat JSON qaytaring.
- Hech qanday qo‘shimcha matn, izoh yoki belgilar bo‘lmasin.
- expected_move_percent: aksiyaning ehtimoliy narx o'zgarishi (%) diapazoni.
- Tahlil investitsiya tavsiyasi emas.
`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    });
    console.log(response);

    return response.choices[0].message.content;
  }
  async analyseNewsWithMarket(
    ticker: string,
    title: string,
    description: string,
    market: any
  ): Promise<any> {
    //     const prompt = `
    // Quyidagi kompaniya yangiligi bo'yicha aksiyaga ta'sirni baholang.
    // Faqat STRICT JSON qaytaring.
    // Hech qanday matn, izoh, kod bloklari, backtick yoki qo'shimcha belgilar bo'lmasin.
    // Faqat quyidagi JSON formatida javob bering.

    // 📰 Yangilik sarlavhasi:
    // ${title}

    // 📄 Yangilik matni:
    // ${description}

    // 📊 Market ma'lumotlar:
    // - Price: ${market.context.price}
    // - ATR(14): ${market.context.atr}
    // - Volatility(30d): ${market.context.volatilityPercent}%
    // - MarketCap: ${market.context.marketCap}
    // - Sector: ${market.context.sector}

    // JSON formati:

    // {
    //   "sentiment": "ijobiy | salbiy | neytral",
    //   "confidence": 0-100,
    //   "impact_type": "short-term | medium-term | long-term",
    //   "impact_strength": 0-100,
    //   "expected_move_percent": {
    //     "min": -50,
    //     "max": 50
    //   },
    //   "reason": "1-2 jumlalik qisqa izoh"
    // }

    // Qoidalar:
    // - Faqat JSON qaytaring.
    // - JSON dan tashqari matn, izoh, belgilar bo'lmasin.
    // - expected_move_percent: narx o'zgarish diapazoni (%).
    // - Tahlil investitsiya tavsiyasi emas.
    // `;

    const prompt = `
Evaluate the stock price impact of the following company news.
Return ONLY STRICT JSON.
Do NOT include any text, explanation, markdown, code blocks, backticks, or extra characters.
Respond ONLY in the JSON format specified below.

🧾 Company Ticker:
${ticker}

📰 News Title:
${title}

📄 News Content:
${description}

📊 Market Context:
- Price: ${market.context.price}
- ATR(14): ${market.context.atr}
- Volatility(30d): ${market.context.volatilityPercent}%
- Market Cap: ${market.context.marketCap}
- Sector: ${market.context.sector}

JSON schema (STRICT):

{
  "sentiment": "ijobiy | salbiy | neytral",
  "confidence": 0-100,
  "impact_type": "short-term | medium-term | long-term",
  "impact_strength": 0-100,
  "expected_move_percent": {
    "min": -50,
    "max": 50
  },
  "analyst_signal": "yes | no",
  "news_category": "latest | analyst_ratings | fda_approvals | mergers_acquisitions | svb_news",
  "reason": "1-2 jumlalik juda qisqa izoh (FAQAT O‘ZBEK TILIDA)"
}

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT add any text outside JSON.
- The values of "sentiment" MUST be in Uzbek: ijobiy, salbiy, or neytral.
- The "reason" field MUST be written ONLY in Uzbek.
- expected_move_percent represents the estimated stock price move range (%).
- This analysis is NOT an investment recommendation.
`;

    console.log(prompt);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    });
    console.log(response);

    const raw = response.choices[0].message.content || '';
    console.log(raw);

    // ----------------------------
    // CLEANER – JSON parse uchun tayyorlash
    // ----------------------------
    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^`+|`+$/g, '') // boshida/oxirida backtick bo‘lsa olib tashlaydi
      .trim();

    // ----------------------------
    // PARSE + ERROR HANDLING
    // ----------------------------
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('❌ AI noto‘g‘ri JSON qaytardi:');
      console.error('Raw:', raw);
      console.error('Cleaned:', cleaned);
      throw new Error('AI JSON formatida javob qaytarmadi.');
    }
  }
}
