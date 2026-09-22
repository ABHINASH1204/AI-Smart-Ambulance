# AI Model Evaluation Summary

This document reports the performance of the three trained models used for emergency priority scoring, ambulance recommendation, and hospital recommendation. All models were trained on synthetic data (see note in section 4) since real usage data does not yet exist for this project.

---

## 1. Emergency Priority Model

**File:** `trained_models/emergency_priority_model.pkl`
**Notebook:** `notebooks/emergency_priority_model.ipynb`
**Algorithm:** Random Forest Regressor (scikit-learn, 100 estimators)

**Inputs:**
- `emergency_type` (categorical: Accident, Cardiac, Fire, Fall, Breathing, Assault, Other)
- `severity` (categorical: LOW, MEDIUM, HIGH, CRITICAL)
- `patient_age` (numeric)
- `hour_of_day` (numeric, 0–23)
- `distance_to_nearest_hospital_km` (numeric)

**Output:** `priority_score` (0.0–1.0, higher = more urgent)

**Performance:**
- Mean Absolute Error (MAE): **0.0319** (~3.2% average error)

**Sanity checks:**
| Scenario | Predicted Score |
|---|---|
| Cardiac, CRITICAL, age 78, 3 AM, 15 km away | 1.000 |
| Fall, LOW, age 25, 2 PM, 2 km away | 0.203 |

The model correctly ranks severe, high-risk cases well above minor ones.

---

## 2. Ambulance Recommendation Model

**File:** `trained_models/ambulance_recommendation_model.pkl`
**Notebook:** `notebooks/ambulance_recommendation_model.ipynb`
**Algorithm:** Random Forest Regressor (scikit-learn, 100 estimators)

**Inputs:**
- `emergency_type` (categorical)
- `severity` (categorical)
- `ambulance_type` (categorical: BASIC, ADVANCED, ICU)
- `distance_km` (numeric)
- `ambulance_available` (binary: 1 = available, 0 = not)

**Output:** `suitability_score` (0.0–~1.2, higher = better match)

**Performance:**
- Mean Absolute Error (MAE): **0.0549** (~5.5% average error)

**Sanity checks:**
| Scenario | Predicted Score |
|---|---|
| CRITICAL cardiac, nearby (3 km) available ICU ambulance | 0.880 |
| Same emergency, far (20 km) unavailable BASIC ambulance | 0.004 |

The model correctly penalizes unavailable ambulances almost to zero, and rewards close, capability-matched ambulances.

---

## 3. Hospital Recommendation Model

**File:** `trained_models/hospital_recommendation_model.pkl`
**Notebook:** `notebooks/hospital_recommendation_model.ipynb`
**Algorithm:** Random Forest Regressor (scikit-learn, 100 estimators)

**Inputs:**
- `severity` (categorical)
- `needs_icu` (binary)
- `needs_trauma` (binary)
- `hospital_has_icu` (binary)
- `hospital_has_trauma` (binary)
- `available_beds` (numeric)
- `distance_km` (numeric)

**Output:** `match_score` (0.0–~1.2, higher = better match)

**Performance:**
- Mean Absolute Error (MAE): **0.0407** (~4.1% average error)

**Sanity checks:**
| Scenario | Predicted Score |
|---|---|
| CRITICAL, needs ICU, hospital has ICU + 15 beds, 3 km away | 0.980 |
| Same emergency, hospital has no ICU and 0 beds, 3 km away | 0.040 |

The model correctly identifies capability/capacity mismatches as unsuitable, regardless of proximity.

---

## 4. Important Note on Training Data

All three models were trained on **synthetically generated data** (500–800 rows each, created with fixed random seeds for reproducibility), not real historical records — no real usage data exists yet for this project. The synthetic data was designed to reflect realistic relationships (e.g., higher severity → higher priority; unavailable resources → zero suitability; capability mismatches → zero match), and the models successfully learned these patterns, as shown in the sanity checks above.

**Before relying on these models for a real deployment**, they should be retrained on genuine historical data once the system has been in use and has accumulated real emergency/trip records.

---

## 5. Integration Status

These three `.pkl` files are trained and saved but **not yet wired into the backend**. The backend currently uses simple rule-based fallback logic in:
- `backend/app/services/emergency_service.py` → `_fallback_priority_score()`
- `backend/app/services/ambulance_service.py` → `recommend_ambulance()`
- `backend/app/services/hospital_service.py` → `recommend_hospital()`

**Next step:** coordinate with the backend developer to load these `.pkl` files (via `joblib.load()`) inside those three functions, replacing the fallback logic while keeping the same function signatures so nothing else in the API needs to change.
