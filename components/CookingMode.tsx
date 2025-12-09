import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { ChevronRight, ChevronLeft, Volume2, X, Mic } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-read step when changed (optional, maybe too intrusive, let's keep it manual or user triggered for MVP)
  // Implementing manual trigger for better UX.

  const speakStep = async (stepIndex: number) => {
      if (isPlaying) return;
      setIsPlaying(true);
      
      const stepData = recipe.steps[stepIndex];
      const text = `Step ${stepIndex + 1}. ${stepData.instruction}. ${stepData.tip ? `Tip: ${stepData.tip}` : ''}`;
      
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

  useEffect(() => {
      // Announce step 1 on mount automatically
      const timer = setTimeout(() => {
          speakStep(0);
      }, 1000);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const nextStep = () => {
      if (currentStep < recipe.steps.length - 1) {
          const next = currentStep + 1;
          setCurrentStep(next);
          speakStep(next);
      } else {
          // Finished
          onClose();
      }
  };

  const prevStep = () => {
      if (currentStep > 0) {
          const prev = currentStep - 1;
          setCurrentStep(prev);
          speakStep(prev);
      }
  };

  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
      <div className="fixed inset-0 bg-stone-900 z-50 flex flex-col text-white">
          {/* Top Bar */}
          <div className="h-16 flex items-center justify-between px-6 bg-stone-800 border-b border-stone-700">
              <div className="flex items-center space-x-4">
                  <span className="text-chef-500 font-bold tracking-widest text-sm">COOKING MODE</span>
                  <span className="text-stone-400 hidden md:inline">|</span>
                  <span className="font-serif font-medium truncate max-w-[200px] md:max-w-md">{recipe.title}</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-stone-700 rounded-full transition-colors">
                  <X className="w-6 h-6" />
              </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-stone-800 w-full">
              <div className="h-full bg-chef-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Main Content */}
          <div className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-4xl mx-auto w-full">
              
              <div className="mb-8 text-chef-500 font-bold text-lg md:text-xl tracking-widest">
                  STEP {currentStep + 1} OF {recipe.steps.length}
              </div>

              <h2 className="text-2xl md:text-4xl font-serif font-medium leading-relaxed md:leading-normal mb-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                  {recipe.steps[currentStep].instruction}
              </h2>

              {recipe.steps[currentStep].tip && (
                  <div className="bg-stone-800/50 border border-stone-700 p-4 rounded-xl max-w-2xl animate-in zoom-in-95 duration-500">
                      <span className="text-blue-400 font-bold mr-2">CHEF'S TIP:</span>
                      <span className="text-stone-300">{recipe.steps[currentStep].tip}</span>
                  </div>
              )}
          </div>

          {/* Bottom Controls */}
          <div className="h-32 bg-stone-800 border-t border-stone-700 flex items-center justify-center space-x-4 md:space-x-12 px-6">
              
              <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="p-4 rounded-full bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                  <ChevronLeft className="w-8 h-8" />
              </button>

              <button 
                  onClick={() => speakStep(currentStep)}
                  className={`p-6 rounded-full ${isPlaying ? 'bg-chef-600 animate-pulse' : 'bg-stone-700 hover:bg-stone-600'} transition-all`}
              >
                  <Volume2 className="w-8 h-8" />
              </button>

               <button 
                  onClick={nextStep}
                  className="p-4 rounded-full bg-chef-600 hover:bg-chef-500 transition-all shadow-lg shadow-chef-900/50"
              >
                  {currentStep === recipe.steps.length - 1 ? (
                      <span className="font-bold px-2">FINISH</span>
                  ) : (
                      <ChevronRight className="w-8 h-8" />
                  )}
              </button>

          </div>
      </div>
  );
};

export default CookingMode;
