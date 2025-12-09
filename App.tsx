import React, { useState } from 'react';
import { Recipe, AppState } from './types';
import { generateRecipe } from './services/geminiService';
import RecipeDisplay from './components/RecipeDisplay';
import CookingMode from './components/CookingMode';
import ChatInterface from './components/ChatInterface';
import { ChefHat, Search, Sparkles, Utensils, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  "Spicy Thai Basil Chicken with Jasmine Rice",
  "Creamy Mushroom Risotto with Truffle Oil",
  "Classic Beef Wellington for a dinner party",
  "Vegan Buddha Bowl with Peanut Sauce",
  "Gluten-free Chocolate Lava Cake"
];

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (searchPrompt: string = prompt) => {
    if (!searchPrompt.trim()) return;
    
    setIsGenerating(true);
    setState(AppState.GENERATING_RECIPE);
    try {
      const result = await generateRecipe(searchPrompt);
      setRecipe(result);
      setState(AppState.VIEWING_RECIPE);
    } catch (e) {
      console.error(e);
      alert("Something went wrong in the kitchen! Please try again.");
      setState(AppState.IDLE);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-chef-200 selection:text-chef-900">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-stone-100 sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setState(AppState.IDLE)}
          >
            <div className="bg-chef-600 text-white p-1.5 rounded-lg">
                <ChefHat className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-xl text-stone-800 tracking-tight">CookVoice AI</span>
          </div>
          {state !== AppState.IDLE && (
              <button 
                onClick={() => setState(AppState.IDLE)} 
                className="text-sm font-medium text-stone-500 hover:text-chef-600"
              >
                New Search
              </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {state === AppState.IDLE && (
          <div className="max-w-3xl mx-auto mt-12 md:mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800 mb-6 leading-tight">
              What are you craving <br/>
              <span className="text-chef-600">today?</span>
            </h1>
            <p className="text-lg text-stone-500 mb-10 max-w-xl mx-auto">
              Your intelligent kitchen companion. I can create unique recipes, visualize them, and guide you step-by-step.
            </p>

            <div className="relative max-w-2xl mx-auto mb-12 group">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g., 'A healthy pasta dish with spinach' or 'What can I make with eggs and avocado?'"
                className="w-full p-6 pl-14 rounded-2xl border-2 border-stone-100 shadow-lg shadow-stone-200/50 focus:border-chef-400 focus:ring-4 focus:ring-chef-100 outline-none text-lg transition-all"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-stone-400 w-6 h-6 group-focus-within:text-chef-500 transition-colors" />
              <button 
                onClick={() => handleGenerate()}
                disabled={!prompt.trim()}
                className="absolute right-3 top-3 bottom-3 bg-chef-600 text-white px-6 rounded-xl font-medium hover:bg-chef-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                Cook <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-stone-700 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 text-amber-500 mr-2" /> 
                        Try these ideas
                    </h3>
                    <div className="space-y-2">
                        {SUGGESTIONS.slice(0, 3).map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleGenerate(s)}
                                className="block w-full text-left text-stone-500 hover:text-chef-600 hover:bg-chef-50 px-3 py-2 rounded-lg text-sm transition-colors truncate"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-chef-50 to-white p-6 rounded-xl border border-stone-100 shadow-sm">
                    <h3 className="font-bold text-stone-700 mb-2 flex items-center">
                        <Utensils className="w-4 h-4 text-chef-500 mr-2" />
                        Kitchen Features
                    </h3>
                    <ul className="text-sm text-stone-500 space-y-2 mt-3">
                        <li className="flex items-center"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>AI-Powered Recipe Generation</li>
                        <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>Realistic Dish Visualization</li>
                        <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Voice-Guided Cooking Mode</li>
                    </ul>
                </div>
            </div>
          </div>
        )}

        {state === AppState.GENERATING_RECIPE && (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-chef-200 border-t-chef-600 rounded-full animate-spin"></div>
                    <ChefHat className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-chef-600 w-10 h-10 animate-pulse" />
                </div>
                <h2 className="mt-8 text-2xl font-serif font-bold text-stone-800">Chef is thinking...</h2>
                <p className="text-stone-500 mt-2">Crafting the perfect recipe for you.</p>
                <div className="mt-6 flex space-x-2">
                    <span className="w-2 h-2 bg-chef-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-chef-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-chef-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
            </div>
        )}

        {state === AppState.VIEWING_RECIPE && recipe && (
            <RecipeDisplay 
                recipe={recipe} 
                onBack={() => setState(AppState.IDLE)} 
                onCook={() => setState(AppState.COOKING_MODE)}
            />
        )}

      </main>

      {/* Cooking Mode Overlay */}
      {state === AppState.COOKING_MODE && recipe && (
          <CookingMode recipe={recipe} onClose={() => setState(AppState.VIEWING_RECIPE)} />
      )}

      {/* Chat Bot Widget */}
      {state !== AppState.COOKING_MODE && (
          <ChatInterface recipeContext={recipe ? recipe.title : undefined} />
      )}

    </div>
  );
}