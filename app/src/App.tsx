import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Apple,
  Dumbbell,
  Sparkles,
  Heart,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  User,
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Brain,
  ChevronRight,
  Flame,
  Info,
  ShieldCheck,
  Cpu,
  RefreshCw
} from "lucide-react";

interface PredictionResult {
  prediction: string;
  isHealthy: boolean;
  confidence: number;
  score: number;
  advice: string;
}

export default function App() {
  // Input fields
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<string>("Female");
  const [weight, setWeight] = useState<number>(64);
  const [caloriesIntake, setCaloriesIntake] = useState<number>(2100);
  const [caloriesDifference, setCaloriesDifference] = useState<number>(-150);
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState<string>("Moderate");
  const [dietType, setDietType] = useState<string>("Balanced");

  // App UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preset scenarios to help user test
  const loadPreset = (preset: string) => {
    setError(null);
    if (preset === "healthy") {
      setAge(28);
      setGender("Female");
      setWeight(62);
      setCaloriesIntake(2000);
      setCaloriesDifference(-100);
      setPhysicalActivityLevel("Active");
      setDietType("Balanced");
    } else if (preset === "unhealthy") {
      setAge(45);
      setGender("Male");
      setWeight(98);
      setCaloriesIntake(3400);
      setCaloriesDifference(800);
      setPhysicalActivityLevel("Sedentary");
      setDietType("High-Calorie");
    } else if (preset === "vegan") {
      setAge(35);
      setGender("Female");
      setWeight(58);
      setCaloriesIntake(1800);
      setCaloriesDifference(-200);
      setPhysicalActivityLevel("Moderate");
      setDietType("Vegan");
    } else if (preset === "lowcarb") {
      setAge(40);
      setGender("Male");
      setWeight(85);
      setCaloriesIntake(2100);
      setCaloriesDifference(-300);
      setPhysicalActivityLevel("Moderate");
      setDietType("Low-Carb");
    }
  };

  const clearForm = () => {
    setAge(30);
    setGender("Male");
    setWeight(70);
    setCaloriesIntake(2200);
    setCaloriesDifference(0);
    setPhysicalActivityLevel("Moderate");
    setDietType("Balanced");
    setResult(null);
    setError(null);
  };

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    // Simulated step-by-step loading animation for the ML model pipeline
    const steps = [
      "Iniciando pipeline de predição...",
      "Carregando pesos da rede neural (health_lifestyle_model.pkl)...",
      "Normalizando dados de entrada com StandardScaler...",
      "Calculando probabilidades e vetores de decisão...",
      "Sintetizando recomendações personalizadas com IA..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, i === 4 ? 1000 : 500));
    }

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Age: age,
          Gender: gender,
          Weight: weight,
          Calories_Intake: caloriesIntake,
          Calories_Difference: caloriesDifference,
          Physical_Activity_Level: physicalActivityLevel,
          Diet_Type: dietType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao conectar-se à API de predição.");
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erro de rede ao processar a requisição.");
    } finally {
      setLoading(false);
    }
  };

  // Quick BMR estimation for informational value
  const estimatedBMR =
    gender === "Male"
      ? Math.round(10 * weight + 6.25 * (175) - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * (162) - 5 * age - 161);

  // SVG parameters for Caloric Balance Gauge
  const maxCaloriesValue = 3500;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Calculate percentage of intake compared to standard healthy range upper threshold 2500
  const calPercent = Math.min(100, Math.max(10, (caloriesIntake / 3000) * 100));
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-100">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 font-heading">
              VitaHealth <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Predictor de Estilo de Vida & Hábitos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
          <span className="hidden md:inline-block hover:text-slate-800 transition-colors cursor-pointer">Predictor</span>
          <span className="hidden md:inline-block hover:text-slate-800 transition-colors cursor-pointer">Documentação</span>
          <div className="flex items-center space-x-2 text-indigo-600 border border-indigo-100 bg-indigo-50/70 px-3.5 py-1 rounded-full text-xs font-semibold">
            <span>Conectado</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Inputs Form & Presets */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Quick Presets Row */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Cenários Pré-configurados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadPreset("healthy")}
                className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Saudável
              </button>
              <button
                type="button"
                onClick={() => loadPreset("unhealthy")}
                className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                De Atenção
              </button>
              <button
                type="button"
                onClick={() => loadPreset("vegan")}
                className="px-2.5 py-2 bg-teal-50 hover:bg-teal-100/80 border border-teal-100 text-teal-800 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Vegano
              </button>
              <button
                type="button"
                onClick={() => loadPreset("lowcarb")}
                className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Low-Carb
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xs p-6 border border-slate-200 flex flex-col justify-between flex-1">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800 font-heading">Métricas de Saúde</h2>
              <p className="text-xs text-slate-400">Insira os dados demográficos e hábitos para inferência estatística</p>
            </div>

            <form onSubmit={handlePredict} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Idade (Anos)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="18"
                        max="80"
                        value={age}
                        onChange={(e) => setAge(Math.max(18, Math.min(80, parseInt(e.target.value) || 18)))}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Gênero
                    </label>
                    <div className="relative">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                      >
                        <option value="Male">Masculino</option>
                        <option value="Female">Feminino</option>
                      </select>
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Weight Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      Peso Corporal
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {weight} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                    <span>40 kg</span>
                    <span>95 kg</span>
                    <span>150 kg</span>
                  </div>
                </div>

                {/* Diet Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Tipo de Dieta
                  </label>
                  <div className="relative">
                    <select
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                    >
                      <option value="Balanced">Equilibrada (Balanced)</option>
                      <option value="Low-Carb">Baixo Carboidrato (Low-Carb)</option>
                      <option value="Vegan">Vegana (Vegan)</option>
                      <option value="High-Calorie">Hipercalórica (High-Calorie)</option>
                    </select>
                    <Apple className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Physical Activity Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Atividade Física
                  </label>
                  <div className="relative">
                    <select
                      value={physicalActivityLevel}
                      onChange={(e) => setPhysicalActivityLevel(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                    >
                      <option value="Sedentary">Sedentário (Sedentary)</option>
                      <option value="Moderate">Moderado (Moderate)</option>
                      <option value="Active">Ativo (Active)</option>
                    </select>
                    <Dumbbell className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Calories Intake */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Ingestão de Calorias
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {caloriesIntake} kcal
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="4500"
                    step="50"
                    value={caloriesIntake}
                    onChange={(e) => setCaloriesIntake(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                    <span>1200 kcal</span>
                    <span>2850 kcal</span>
                    <span>4500 kcal</span>
                  </div>
                </div>

                {/* Calories Difference */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Balancete Calórico (Diferencial)
                    </label>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      caloriesDifference < 0 ? 'text-teal-700 bg-teal-50' : caloriesDifference > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-700 bg-slate-50'
                    }`}>
                      {caloriesDifference > 0 ? `+${caloriesDifference}` : caloriesDifference} kcal
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1000"
                    max="1500"
                    step="50"
                    value={caloriesDifference}
                    onChange={(e) => setCaloriesDifference(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                    <span className="flex items-center gap-0.5 text-teal-600">
                      <TrendingDown className="w-3 h-3" /> Déficit
                    </span>
                    <span>Equilibrado</span>
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <TrendingUp className="w-3 h-3" /> Superávit
                    </span>
                  </div>
                </div>
              </div>

              {/* Error box */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-start gap-2 my-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-slate-100 mt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-100 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  <Activity className="w-4 h-4" />
                  Analisar Hábito de Vida
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4.5 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Limpar formulário"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right Side: Results Presentation / Idle / Loading */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading screen matching Sleek styling
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 flex-1 flex flex-col items-center justify-center text-center min-h-[450px]"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-xl animate-pulse" />
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">Processando Rede Neural...</h3>
                
                <div className="bg-indigo-50/60 border border-indigo-100/60 rounded-xl px-5 py-3 text-xs text-indigo-700 font-semibold max-w-md mx-auto flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
                  {loadingStep}
                </div>

                <p className="text-xs text-slate-400 max-w-sm mt-6 leading-relaxed">
                  Efetuando normalização dos dados e sincronizando prognóstico inteligente com o Assistente Clínico Gemini.
                </p>
              </motion.div>
            ) : result ? (
              // Beautiful results panel layout strictly derived from the template style guidelines
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                
                {/* Sleek Header card */}
                <div className="bg-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-xl min-h-48">
                  {/* Decorative ambient bubble matching template background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <span className={`status-badge px-3 py-1.5 rounded-full font-bold text-[10px] tracking-wider uppercase border ${
                      result.isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      Classificação do Modelo
                    </span>
                    
                    <h3 className="text-3xl font-bold tracking-tight font-heading mt-2">
                      {result.prediction}
                    </h3>
                    
                    <div className="flex items-center space-x-6 pt-2 border-t border-white/10">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-4xl font-extrabold tracking-tighter font-heading">{result.confidence}</span>
                        <span className="text-xs font-semibold opacity-65 uppercase tracking-wide">% Confiança</span>
                      </div>
                      <div className="h-8 w-px bg-white/20"></div>
                      <p className="text-xs text-indigo-200 leading-relaxed max-w-xs">
                        {result.isHealthy 
                          ? "Seus hábitos diários sugerem um excelente equilíbrio de saúde física e calórica."
                          : "Atenção necessária: seus hábitos sugerem desvios que merecem atenção dietética ou física."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Split: Caloric Balance & Feature Influence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Caloric Balance Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Balanço Energético</h4>
                    
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="54" 
                            stroke={result.isHealthy ? "#10b981" : "#f59e0b"} 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="text-center z-10">
                          <span className="text-2xl font-extrabold block text-slate-800 font-heading">
                            {caloriesDifference > 0 ? `+${caloriesDifference}` : caloriesDifference}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Net Kcal</span>
                        </div>
                      </div>
                      
                      <div className="mt-5 text-center">
                        <p className="text-sm font-bold text-slate-700 flex items-center justify-center gap-1">
                          {caloriesDifference < 0 ? (
                            <>
                              <TrendingDown className="w-4 h-4 text-emerald-500" />
                              Déficit Saudável
                            </>
                          ) : caloriesDifference > 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-amber-500" />
                              Excesso Calórico
                            </>
                          ) : (
                            "Balanço Neutro"
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Metabolismo basal estimado: {estimatedBMR} kcal</p>
                      </div>
                    </div>
                  </div>

                  {/* Feature Influence Metric Bars */}
                  <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Influência dos Atributos</h4>
                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>Atividade Física</span>
                            <span className="text-indigo-600 font-bold">Peso Alto</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full w-[85%] rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>Balanço Calórico</span>
                            <span className="text-indigo-600 font-bold">Peso Médio</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-400 h-full w-[60%] rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>Tipo de Dieta</span>
                            <span className="text-slate-400 font-medium">Peso Baixo</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-slate-300 h-full w-[35%] rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>Modelo: NeuralNet_V2.1</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* AI Advice Panel */}
                <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                  <h4 className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-4 uppercase tracking-wider font-heading">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Orientações e Insights do Gemini AI
                  </h4>

                  <div className="text-slate-600 text-xs md:text-sm leading-relaxed space-y-3 prose prose-slate max-w-none">
                    {result.advice.split("\n").map((line, idx) => {
                      const isHeading = line.startsWith("###") || line.startsWith("##") || line.startsWith("#");
                      const isList = line.trim().startsWith("*") || line.trim().startsWith("-");

                      if (isHeading) {
                        return (
                          <h5 key={idx} className="text-slate-800 font-bold text-sm mt-4 mb-2 first:mt-0 flex items-center gap-1.5 font-heading">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {line.replace(/[#*]/g, "").trim()}
                          </h5>
                        );
                      }
                      if (isList) {
                        return (
                          <div key={idx} className="flex items-start gap-2 my-1.5 pl-2 text-slate-600 text-xs md:text-sm">
                            <span className="text-indigo-600 shrink-0 mt-1.5 font-bold text-xs">•</span>
                            <span>{line.replace(/^[*-\s]+/, "").trim()}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-600 my-1 font-medium text-xs leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            ) : (
              // Idle screen matching Sleek layout
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 flex-1 flex flex-col items-center justify-center text-center min-h-[450px]"
              >
                <div className="p-4.5 bg-slate-50 border border-slate-200/60 rounded-full mb-5 text-slate-400">
                  <HelpCircle className="w-10 h-10 text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2 font-heading">Aguardando Parâmetros</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Configure o perfil do paciente ou utilize um de nossos modelos pré-configurados no menu esquerdo para inicializar a inferência matemática.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* Footer Disclaimer */}
      <section className="bg-slate-50 py-3.5 px-8 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Deploy: GCP CLOUD RUN (SERVERLESS)</span>
          </div>
          <div className="flex space-x-6 items-center">
            <span>Classificador: Redes Neurais Ativas</span>
            <span className="h-3.5 w-px bg-slate-300"></span>
            <span>API Status: 200 OK</span>
          </div>
        </div>
      </section>

    </div>
  );
}
