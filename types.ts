export interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

export interface RecipeStep {
  instruction: string;
  tip?: string;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  calories?: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cuisine: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_RECIPE = 'GENERATING_RECIPE',
  VIEWING_RECIPE = 'VIEWING_RECIPE',
  COOKING_MODE = 'COOKING_MODE',
}
