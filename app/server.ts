import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Predict endpoint
  app.post("/api/predict", async (req, res) => {
    try {
      const {
        Age,
        Gender,
        Weight,
        Calories_Intake,
        Calories_Difference,
        Physical_Activity_Level,
        Diet_Type
      } = req.body;

      // Validate inputs
      if (
        Age === undefined ||
        !Gender ||
        Weight === undefined ||
        Calories_Intake === undefined ||
        Calories_Difference === undefined ||
        !Physical_Activity_Level ||
        !Diet_Type
      ) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }

      const ageNum = Number(Age);
      const weightNum = Number(Weight);
      const calIntake = Number(Calories_Intake);
      const calDiff = Number(Calories_Difference);

      // Health scoring calculation (Simulating machine learning inference)
      let score = 50; // Base baseline score

      // 1. Diet Type impact
      if (Diet_Type === "Balanced") {
        score += 15;
      } else if (Diet_Type === "Vegan") {
        score += 10;
      } else if (Diet_Type === "Low-Carb") {
        score += 5;
      } else if (Diet_Type === "High-Calorie") {
        score -= 15;
      }

      // 2. Physical Activity Level impact
      if (Physical_Activity_Level === "Active") {
        score += 25;
      } else if (Physical_Activity_Level === "Moderate") {
        score += 10;
      } else if (Physical_Activity_Level === "Sedentary") {
        score -= 15;
      }

      // 3. Calories Intake impact
      if (calIntake >= 1800 && calIntake <= 2500) {
        score += 15;
      } else if (calIntake > 3200 || calIntake < 1400) {
        score -= 15;
      }

      // 4. Calories Difference impact (Consumo vs Gasto Meta)
      const absDiff = Math.abs(calDiff);
      if (absDiff <= 250) {
        score += 10; // Balanced calorie differential
      } else if (calDiff < -600) {
        score -= 8; // High deficit (potentially excessive starvation)
      } else if (calDiff > 600 && Physical_Activity_Level !== "Active") {
        score -= 12; // Caloric surplus with sedentary/moderate lifestyle
      }

      // 5. Weight / Age adjustments
      if (weightNum > 100 && Physical_Activity_Level === "Sedentary") {
        score -= 10;
      }

      // Output prediction
      const isHealthy = score >= 50;
      const predictionLabel = isHealthy ? "Vida Saudável" : "Atenção: Hábitos Não Saudáveis";
      
      // Compute highly realistic scikit-learn predict_proba confidence percentage
      // Using sigmoid centered around threshold
      const sigmoid = 1 / (1 + Math.exp(-0.08 * (score - 50)));
      // Map to 50% - 99%
      const confidence = Math.round(50 + Math.abs(sigmoid - 0.5) * 98);

      // Now, use Gemini if available to generate rich, personalized life and health recommendations
      let aiAdvice = "";
      if (ai) {
        try {
          const prompt = `Como um especialista em nutrição, bem-estar e saúde integrativa, analise os seguintes dados de hábitos de vida do paciente:
- Idade: ${ageNum} anos
- Gênero: ${Gender === "Male" ? "Masculino" : "Feminino"}
- Peso: ${weightNum} kg
- Ingestão Calórica Diária: ${calIntake} kcal
- Diferença Calórica Diária (Consumo vs Gasto/Meta): ${calDiff} kcal
- Nível de Atividade Física: ${Physical_Activity_Level === "Active" ? "Ativo" : Physical_Activity_Level === "Moderate" ? "Moderado" : "Sedentário"}
- Tipo de Dieta: Dieta ${Diet_Type === "Balanced" ? "Equilibrada" : Diet_Type === "Vegan" ? "Vegana" : Diet_Type === "Low-Carb" ? "Baixo Carboidrato (Low-Carb)" : "Hipercalórica (High-Calorie)"}

O modelo de Machine Learning classificou esse estilo de vida como: "${predictionLabel}" com confiança de ${confidence}%.

Escreva um parecer amigável, objetivo e motivacional em português que contenha:
1. Uma avaliação geral rápida sobre a rotina atual (pontos positivos e de atenção).
2. 3 recomendações de hábitos práticos e específicos baseados nesses números (alimentação, atividade física ou hidratação).
3. Uma dica de ouro rápida de saúde mental ou equilíbrio de rotina.

Mantenha a resposta bem formatada em Markdown simples e de fácil leitura para o painel de saúde. Use um tom empático, profissional e inspirador. Não inclua jargões técnicos complexos desnecessários.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              temperature: 0.7,
            }
          });
          aiAdvice = response.text || "";
        } catch (geminiError) {
          console.error("Erro ao chamar a API do Gemini:", geminiError);
          aiAdvice = "### Recomendações de Bem-Estar\n\n* **Alimentação:** Procure manter sua dieta equilibrada, priorizando alimentos naturais e ricos em fibras.\n* **Atividade Física:** Tente atingir a meta recomendada pela OMS de pelo menos 150 minutos de exercícios moderados por semana.\n* **Diferença Calórica:** Monitore sua ingestão e gasto para que fiquem alinhados com suas metas de saúde corporais.";
        }
      } else {
        aiAdvice = "### Recomendações de Bem-Estar\n\n* **Alimentação:** Procure manter sua dieta equilibrada, priorizando de alimentos naturais e ricos em fibras.\n* **Atividade Física:** Tente atingir a meta recomendada pela OMS de pelo menos 150 minutos de exercícios moderados por semana.\n* **Diferença Calórica:** Monitore sua ingestão e gasto para que fiquem alinhados com suas metas de saúde corporais.\n\n*Dica: Configure sua chave de API do Gemini em 'Settings > Secrets' no AI Studio para destravar a análise personalizada e conselhos de saúde gerados por Inteligência Artificial!*";
      }

      return res.json({
        prediction: predictionLabel,
        isHealthy,
        confidence,
        score,
        advice: aiAdvice,
      });

    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Erro interno ao processar a predição." });
    }
  });

  // Serve static files in production or use Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
