import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithChef } from '../services/geminiService';

interface ChatInterfaceProps {
  recipeContext?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ recipeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Bonjour! I'm here to help. Questions about substitutions or technique? Just ask!", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build context
    const history = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`);
    if (recipeContext) {
      history.unshift(`CONTEXT RECIPE: ${recipeContext}`);
    }

    try {
      const responseText = await chatWithChef(history, userMsg.text);
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Apologies, I dropped my whisk. Could you repeat that?", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-chef-600 text-white p-4 rounded-full shadow-xl shadow-chef-900/20 hover:bg-chef-700 transition-all z-40 flex items-center space-x-2 animate-bounce-subtle"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-bold hidden md:inline">Ask Chef</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-stone-200 z-40 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="font-bold text-stone-700">Chef Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm font-medium">Close</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-chef-600 text-white rounded-br-none' 
                  : 'bg-white border border-stone-200 text-stone-700 shadow-sm rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-stone-100 p-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-stone-100 bg-white rounded-b-2xl">
        <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-chef-200 transition-all"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about substitutes, pairing..."
            className="flex-grow bg-transparent outline-none text-stone-700 placeholder-stone-400 text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="text-chef-600 disabled:opacity-50 hover:text-chef-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
