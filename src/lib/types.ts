export type UserProfile = {
  age: number;
  gender: 'Male' | 'Female';
  height: number;
  weight: number;
  dietaryPreference: 'Non-Vegetarian' | 'Vegetarian' | 'Vegan' | 'Eggetarian';
  chronicDisease:
    | 'None'
    | 'Diabetes'
    | 'Hypertension'
    | 'High Blood Pressure'
    | 'High Cholesterol'
    | 'Coronary Artery Disease'
    | 'Heart Disease'
    | 'Asthma'
  | 'Thyroid Disorders'
    | 'Chronic Kidney Disease'
    | 'Chronic Liver Disease'
    | 'Osteoarthritis'
    | 'Chronic Obstructive Pulmonary Disease'
    | 'PCOS';
  fitnessGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain Weight' | 'Muscle Gain';
  region: string;
  otherConditions?: string;
  
  // Legacy fields
  healthConditions?: string;
  dietaryPreferences?: string;
  personalGoals?: string;
};
