import React, { useState, useEffect } from 'react';
import { Recipe, AppState } from '../types';
import { Clock, Users, Flame, ChefHat, Volume2, ArrowLeft, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { generateDishImage, generateSpeech } from '../services/geminiService';

interface RecipeDisplayProps {
  recipe: Recipe;
  onBack: () => void;
  onCook: () => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onBack, onCook }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    const fetchImage = async () => {
      setLoadingImage(true);
      const url = await generateDishImage(recipe.title + ", " + recipe.description);
      if (mounted) {
        setImageUrl(url);
        setLoadingImage(false);
      }
    };
    fetchImage();
    return () => { mounted = false; };
  }, [recipe]);

  const toggleIngredient = (idx: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedIngredients(next);
  };

  const readOverview = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const text = `Today we are making ${recipe.title}. ${recipe.description}. It takes about ${recipe.prepTime} to prep and ${recipe.cookTime} to cook. Let's get started.`;
    const buffer = await generateSpeech(text);
    if (buffer) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } else {
        setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 w-full rounded-b-3xl overflow-hidden shadow-xl mb-6 bg-stone-200 group">
        <button 
            onClick={onBack}
            className="absolute top-4 left-4 z-20 bg-white/90 p-2 rounded-full shadow hover:bg-white transition-colors"
        >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        
        {loadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10">
                <div className="flex flex-col items-center text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">Generating visual...</span>
                </div>
            </div>
        )}
        
        {imageUrl ? (
             <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
             <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                <ChefHat className="w-16 h-16 opacity-20" />
             </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
            <div className="flex items-center space-x-2 text-chef-200 text-sm font-bold uppercase tracking-wider mb-2">
                <span>{recipe.cuisine}</span>
                <span>•</span>
                <span>{recipe.difficulty}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 shadow-sm">{recipe.title}</h1>
            <p className="text-stone-200 line-clamp-2 md:line-clamp-none max-w-2xl">{recipe.description}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 md:px-0 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 flex justify-between items-center text-stone-700">
             <div className="flex flex-col items-center w-1/3 border-r border-stone-100">
                <Clock className="w-5 h-5 text-chef-500 mb-1" />
                <span className="text-xs text-stone-400 font-medium uppercase">Time</span>
                <span className="font-semibold">{parseInt(recipe.cookTime) + parseInt(recipe.prepTime) || recipe.cookTime}</span>
             </div>
             <div className="flex flex-col items-center w-1/3 border-r border-stone-100">
                <Users className="w-5 h-5 text-chef-500 mb-1" />
                <span className="text-xs text-stone-400 font-medium uppercase">Serves</span>
                <span className="font-semibold">{recipe.servings} ppl</span>
             </div>
             <div className="flex flex-col items-center w-1/3">
                <Flame className="w-5 h-5 text-chef-500 mb-1" />
                <span className="text-xs text-stone-400 font-medium uppercase">Energy</span>
                <span className="font-semibold">{recipe.calories || 450} kcal</span>
             </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Ingredients Column */}
        <div className="md:col-span-1">
            <div className="sticky top-6">
                <h3 className="font-serif text-2xl font-bold text-stone-800 mb-4 flex items-center">
                    Ingredients
                    <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-sans">{recipe.ingredients.length} items</span>
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                    {recipe.ingredients.map((ing, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => toggleIngredient(idx)}
                            className={`p-3 border-b border-stone-50 flex items-start cursor-pointer transition-colors hover:bg-stone-50 ${checkedIngredients.has(idx) ? 'bg-stone-50' : ''}`}
                        >
                            <div className={`mt-0.5 mr-3 transition-colors ${checkedIngredients.has(idx) ? 'text-chef-500' : 'text-stone-300'}`}>
                                {checkedIngredients.has(idx) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className={`font-medium ${checkedIngredients.has(idx) ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{ing.item}</p>
                                <p className="text-sm text-stone-500">{ing.amount} {ing.notes && <span className="italic text-stone-400">- {ing.notes}</span>}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Instructions Column */}
        <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-2xl font-bold text-stone-800">Preparation</h3>
                <button 
                    onClick={readOverview}
                    disabled={isPlaying}
                    className="flex items-center space-x-2 text-sm text-chef-600 hover:text-chef-700 font-medium px-3 py-1.5 bg-chef-50 rounded-full transition-colors disabled:opacity-50"
                >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                    <span>{isPlaying ? 'Speaking...' : 'Read Overview'}</span>
                </button>
            </div>
            
            <div className="space-y-6">
                {recipe.steps.map((step, idx) => (
                    <div key={idx} className="group flex space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold flex items-center justify-center mt-1 group-hover:bg-chef-500 group-hover:text-white transition-colors">
                            {idx + 1}
                        </div>
                        <div className="flex-grow pt-1">
                            <p className="text-stone-700 leading-relaxed text-lg">{step.instruction}</p>
                            {step.tip && (
                                <div className="mt-3 bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-start">
                                    <div className="mr-2 font-bold">💡 Chef Tip:</div>
                                    <div>{step.tip}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-chef-50 rounded-xl flex items-center justify-between border border-chef-100">
                <div>
                    <h4 className="font-serif text-xl font-bold text-chef-900 mb-1">Ready to cook?</h4>
                    <p className="text-chef-700 text-sm">Enter step-by-step cooking mode for hands-free help.</p>
                </div>
                <button 
                    onClick={onCook}
                    className="bg-chef-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-chef-200 hover:bg-chef-700 transform hover:-translate-y-0.5 transition-all"
                >
                    Start Cooking
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;
