import os
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

def generate_synthetic_data_and_train():
    print("Iniciando geração de dados sintéticos de saúde...")
    np.random.seed(42)
    n_samples = 300
    
    # 1. Random Features
    ages = np.random.randint(18, 80, size=n_samples)
    genders = np.random.randint(0, 2, size=n_samples) # 1: Male, 0: Female
    weights = np.random.uniform(50.0, 130.0, size=n_samples)
    cal_intakes = np.random.uniform(1400, 4200, size=n_samples)
    cal_diffs = np.random.uniform(-800, 1200, size=n_samples)
    activities = np.random.randint(1, 4, size=n_samples) # 1: Sedentary, 2: Moderate, 3: Active
    diets = np.random.randint(0, 4, size=n_samples) # 0: Balanced, 1: Low-Carb, 2: Vegan, 3: High-Calorie
    
    # 2. Determine Labels (1: Healthy, 0: Unhealthy) based on clinical logic
    labels = []
    for i in range(n_samples):
        score = 50.0
        
        # Diet contribution
        if diets[i] == 0: # Balanced
            score += 15
        elif diets[i] == 2: # Vegan
            score += 10
        elif diets[i] == 1: # Low-carb
            score += 5
        elif diets[i] == 3: # High-calorie
            score -= 15
            
        # Activity Level contribution
        if activities[i] == 3: # Active
            score += 25
        elif activities[i] == 2: # Moderate
            score += 10
        elif activities[i] == 1: # Sedentary
            score -= 15
            
        # Calories intake
        if 1800 <= cal_intakes[i] <= 2500:
            score += 15
        elif cal_intakes[i] > 3200 or cal_intakes[i] < 1400:
            score -= 15
            
        # Calories difference
        abs_diff = abs(cal_diffs[i])
        if abs_diff <= 250:
            score += 10
        elif cal_diffs[i] < -600:
            score -= 8
        elif cal_diffs[i] > 600 and activities[i] != 3:
            score -= 12
            
        # Weight & Activity
        if weights[i] > 100 and activities[i] == 1:
            score -= 10
            
        labels.append(1 if score >= 50 else 0)
        
    X = np.column_stack((ages, genders, weights, cal_intakes, cal_diffs, activities, diets))
    y = np.array(labels)
    
    # 3. Fit StandardScaler and LogisticRegression
    print("Efetuando o treinamento do modelo e normalização...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = LogisticRegression(C=1.0, random_state=42)
    model.fit(X_scaled, y)
    
    # 4. Save artifacts
    os.makedirs("modelos", exist_ok=True)
    joblib.dump(model, os.path.join("modelos", "health_lifestyle_model.pkl"))
    joblib.dump(scaler, os.path.join("modelos", "health_scaler.pkl"))
    
    print("Modelos salvos com sucesso em 'modelos/'!")

if __name__ == "__main__":
    generate_synthetic_data_and_train()
