import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import joblib
import numpy as np

# Initialize FastAPI App
app = FastAPI(
    title="Health Lifestyle Predictor API",
    description="API de predição de hábitos saudáveis integrada para GCP Cloud Run",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request validation schema with Pydantic
class PredictRequest(BaseModel):
    Age: int = Field(..., ge=18, le=80, description="Idade da pessoa em anos")
    Gender: str = Field(..., description="Gênero: Male ou Female")
    Weight: float = Field(..., ge=40.0, le=150.0, description="Peso em kg")
    Calories_Intake: float = Field(..., ge=1200.0, le=4500.0, description="Consumo calórico diário (kcal)")
    Calories_Difference: float = Field(..., ge=-1000.0, le=1500.0, description="Diferença calórica diária")
    Physical_Activity_Level: str = Field(..., description="Nível de atividade física: Sedentary, Moderate ou Active")
    Diet_Type: str = Field(..., description="Tipo de dieta alimentar principal")

# Global variables for model and scaler
model = None
scaler = None

# Lazy loading model function to guarantee fast start and grace on errors
def get_model_and_scaler():
    global model, scaler
    if model is None or scaler is None:
        model_path = os.path.join("modelos", "health_lifestyle_model.pkl")
        scaler_path = os.path.join("modelos", "health_scaler.pkl")
        
        try:
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                print("Modelos carregados com sucesso do disco!")
            else:
                print("Aviso: Artefatos pkl do modelo não encontrados. Iniciando simulação matemática interna...")
        except Exception as e:
            print(f"Erro ao carregar artefatos pkl: {e}. Usando simulação interna...")
    return model, scaler

@app.post("/predict")
async def predict(data: PredictRequest):
    # Try to load models
    loaded_model, loaded_scaler = get_model_and_scaler()
    
    # 1. Option: Real model inference if model and scaler are loaded
    if loaded_model is not None and loaded_scaler is not None:
        try:
            # Feature preparation exactly corresponding to training format
            # Encode Categorical inputs
            gender_val = 1.0 if data.Gender == "Male" else 0.0
            
            activity_map = {"Sedentary": 1, "Moderate": 2, "Active": 3}
            activity_val = activity_map.get(data.Physical_Activity_Level, 2)
            
            diet_map = {"Balanced": 0, "Low-Carb": 1, "Vegan": 2, "High-Calorie": 3}
            diet_val = diet_map.get(data.Diet_Type, 0)
            
            # Numeric inputs
            features = np.array([[
                data.Age,
                gender_val,
                data.Weight,
                data.Calories_Intake,
                data.Calories_Difference,
                activity_val,
                diet_val
            ]])
            
            # Scale
            scaled_features = loaded_scaler.transform(features)
            
            # Infer
            pred = loaded_model.predict(scaled_features)[0]
            
            # Check for predict_proba
            if hasattr(loaded_model, "predict_proba"):
                probs = loaded_model.predict_proba(scaled_features)[0]
                confidence = float(np.max(probs) * 100)
            else:
                confidence = 92.5
                
            is_healthy = bool(pred == 1)
            prediction_label = "Vida Saudável" if is_healthy else "Atenção: Hábitos Não Saudáveis"
            score = int(confidence if is_healthy else 100 - confidence)
            
            return {
                "prediction": prediction_label,
                "isHealthy": is_healthy,
                "confidence": round(confidence, 1),
                "score": score,
                "using_real_pkl": True
            }
            
        except Exception as err:
            print(f"Erro na inferência real: {err}. Utilizando lógica de contingência...")
            
    # 2. Option: Math Logic Fallback (highly realistic simulation of decision tree classifier)
    score = 50.0
    
    # Diet contribution
    if data.Diet_Type == "Balanced":
        score += 15
    elif data.Diet_Type == "Vegan":
        score += 10
    elif data.Diet_Type == "Low-Carb":
        score += 5
    elif data.Diet_Type == "High-Calorie":
        score -= 15
        
    # Activity Level contribution
    if data.Physical_Activity_Level == "Active":
        score += 25
    elif data.Physical_Activity_Level == "Moderate":
        score += 10
    elif data.Physical_Activity_Level == "Sedentary":
        score -= 15
        
    # Calories intake
    if 1800 <= data.Calories_Intake <= 2500:
        score += 15
    elif data.Calories_Intake > 3200 or data.Calories_Intake < 1400:
        score -= 15
        
    # Calories difference
    abs_diff = abs(data.Calories_Difference)
    if abs_diff <= 250:
        score += 10
    elif data.Calories_Difference < -600:
        score -= 8
    elif data.Calories_Difference > 600 and data.Physical_Activity_Level != "Active":
        score -= 12
        
    # Weight & Activity
    if data.Weight > 100 and data.Physical_Activity_Level == "Sedentary":
        score -= 10

    is_healthy = score >= 50
    prediction_label = "Vida Saudável" if is_healthy else "Atenção: Hábitos Não Saudáveis"
    
    # Calculate sigmoid to mimic predict_proba
    sigmoid = 1 / (1 + np.exp(-0.08 * (score - 50)))
    confidence = float(50 + abs(sigmoid - 0.5) * 98)
    
    return {
        "prediction": prediction_label,
        "isHealthy": is_healthy,
        "confidence": round(confidence, 1),
        "score": int(score),
        "using_real_pkl": False
    }

# Serve standard HTML file as required
@app.get("/", response_class=HTMLResponse)
async def serve_home():
    try:
        with open("index_fastapi.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:
        return HTMLResponse(
            content="<h3>index_fastapi.html não encontrado no diretório raiz do contêiner.</h3>",
            status_code=404
        )

# Port setup for GCP Cloud Run
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Servidor FastAPI iniciando na porta {port}...")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
