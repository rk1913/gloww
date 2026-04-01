/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Droplet, 
  Sparkles, 
  Scissors, 
  ShieldCheck, 
  ChevronLeft, 
  ArrowLeft, 
  FlaskConical, 
  LayoutGrid, 
  Activity, 
  Waves,
  ZapOff,
  Dna,
  Atom,
  ShieldAlert,
  BrainCircuit,
  Send,
  Loader2,
  Microscope,
  Camera,
  X,
  Zap,
  Clock,
  Moon,
  Wind,
  Layers,
  CheckCircle2,
  AlertCircle,
  Utensils,
  RefreshCcw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const THEMES = {
  normal: { primary: 'teal', bg: 'bg-slate-950', text: 'text-teal-400', accent: 'bg-teal-500', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-600', neonShadow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]' },
  oily: { primary: 'amber', bg: 'bg-slate-950', text: 'text-amber-400', accent: 'bg-amber-500', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-600', neonShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  dry: { primary: 'sky', bg: 'bg-slate-950', text: 'text-sky-400', accent: 'bg-sky-500', border: 'border-sky-500/30', gradient: 'from-sky-500 to-indigo-600', neonShadow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]' },
  combination: { primary: 'violet', bg: 'bg-slate-950', text: 'text-violet-400', accent: 'bg-violet-500', border: 'border-violet-500/30', gradient: 'from-violet-500 to-purple-600', neonShadow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' },
  sensitive: { primary: 'rose', bg: 'bg-slate-950', text: 'text-rose-400', accent: 'bg-rose-500', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-600', neonShadow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
  hair_oily: { primary: 'emerald', bg: 'bg-slate-950', text: 'text-emerald-400', accent: 'bg-emerald-500', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-600', neonShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
  hair_dry: { primary: 'orange', bg: 'bg-slate-950', text: 'text-orange-400', accent: 'bg-orange-500', border: 'border-orange-500/30', gradient: 'from-orange-500 to-red-600', neonShadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
  hair_thinning: { primary: 'indigo', bg: 'bg-slate-950', text: 'text-indigo-400', accent: 'bg-indigo-500', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-blue-600', neonShadow: 'shadow-[0_0_20px_rgba(79,70,229,0.3)]' },
  hair_curly: { primary: 'fuchsia', bg: 'bg-slate-950', text: 'text-fuchsia-400', accent: 'bg-fuchsia-500', border: 'border-fuchsia-500/30', gradient: 'from-fuchsia-500 to-purple-600', neonShadow: 'shadow-[0_0_20px_rgba(217,70,239,0.3)]' }
};

const APP_DATA = {
  skin: {
    types: [
      { id: 'normal', name: 'Normal Skin', icon: <Waves className="w-8 h-8" />, effect: 'Balanced', suggest: 'Squalane', chemicals: ['Niacinamide (5%)', 'Hyaluronic Acid'], diet: ['Mixed Berries', 'Avocado', 'Watermelon'], rationale: "Normal skin requires 'maintenance' molecules that support the natural barrier without over-stimulating oil glands." },
      { id: 'oily', name: 'Oily Skin', icon: <Droplet className="w-8 h-8" />, effect: 'Regulation', suggest: 'Niacinamide', chemicals: ['Salicylic Acid (2%)', 'Zinc PCA'], diet: ['Cucumber', 'Lemon Water', 'Green Tea'], rationale: "Oily skin benefits from lipophilic (oil-loving) acids that penetrate pores to dissolve sebum plugs." },
      { id: 'dry', name: 'Dry Skin', icon: <ZapOff className="w-8 h-8" />, effect: 'Repair', suggest: 'Ceramides', chemicals: ['Panthenol (B5)', 'Glycerin'], diet: ['Walnuts', 'Salmon', 'Sweet Potatoes'], rationale: "Dry skin lacks structural lipids. We use humectants to pull water into the skin and occlusives to trap it." },
      { id: 'combination', name: 'Combination', icon: <Layers className="w-8 h-8" />, effect: 'Dual Zone', suggest: 'PHA', chemicals: ['Lactic Acid', 'Witch Hazel'], diet: ['Flaxseeds', 'Spinach', 'Oats'], rationale: "Combination skin requires 'intelligent' exfoliation that removes T-zone oil while hydrating the cheeks." }
    ],
    concerns: [
      { id: 'acne', name: 'Acne Prone', icon: <Sparkles className="w-6 h-6" />, suggest: 'Salicylic Acid', diet: { eat: ['Pumpkin Seeds', 'Fatty Fish'], avoid: ['Skim Milk', 'Sugar'] } },
      { id: 'aging', name: 'Aging', icon: <Clock className="w-6 h-6" />, suggest: 'Retinol', diet: { eat: ['Walnuts', 'Bone Broth'], avoid: ['Fried Foods'] } },
      { id: 'darkspots', name: 'Dark Spots', icon: <Atom className="w-6 h-6" />, suggest: 'Vitamin C', diet: { eat: ['Tomatoes', 'Red Peppers'], avoid: ['Alcohol'] } }
    ]
  },
  hair: {
    types: [
      { id: 'hair_oily', name: 'Oily Scalp', icon: <Droplet className="w-8 h-8" />, effect: 'Clarifying', suggest: 'Apple Cider Vinegar', chemicals: ['Salicylic Acid', 'Tea Tree Oil'], diet: ['Spinach', 'Lentils', 'Citrus'], rationale: "Sebum buildup on the scalp can suffocate the follicle. Clarifying agents remove biofilm without stripping the shaft." },
      { id: 'hair_dry', name: 'Dry/Damaged', icon: <ZapOff className="w-8 h-8" />, effect: 'Restorative', suggest: 'Argan Oil', chemicals: ['Hydrolyzed Keratin', 'Amino Acids'], diet: ['Eggs', 'Avocado', 'Almonds'], rationale: "Damaged hair has a porous cuticle. Keratin fills the gaps in the protein structure to prevent further snapping." },
      { id: 'hair_thinning', name: 'Thinning', icon: <Dna className="w-8 h-8" />, effect: 'Growth Boost', suggest: 'Minoxidil/Redensyl', chemicals: ['Caffeine', 'Biotin'], diet: ['Oysters', 'Greek Yogurt', 'Berries'], rationale: "Caffeine stimulates micro-circulation to the dermal papilla, ensuring the follicle receives oxygenated blood." },
      { id: 'hair_curly', name: 'Curly/Coiled', icon: <RefreshCcw className="w-8 h-8" />, effect: 'Definition', suggest: 'Shea Butter', chemicals: ['Aloe Vera', 'Behentrimonium Chloride'], diet: ['Chia Seeds', 'Coconut Oil', 'Beans'], rationale: "Curly patterns prevent natural oils from traveling down the shaft. We need synthetic slip to prevent friction." }
    ],
    concerns: [
      { id: 'dandruff', name: 'Dandruff', icon: <Wind className="w-6 h-6" />, suggest: 'Ketoconazole', diet: { eat: ['Pumpkin Seeds', 'Yogurt'], avoid: ['Yeasty Breads', 'Dairy'] } },
      { id: 'frizz', name: 'Frizz Control', icon: <Zap className="w-6 h-6" />, suggest: 'Silicone/Oils', diet: { eat: ['Salmon', 'Walnuts'], avoid: ['Dehydrating Coffee'] } },
      { id: 'breakage', name: 'Breakage', icon: <Scissors className="w-6 h-6" />, suggest: 'Bond Builders', diet: { eat: ['Lean Poultry', 'Soy'], avoid: ['High Mercury Fish'] } }
    ]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'skin' | 'hair'>('skin'); 
  const [primarySelection, setPrimarySelection] = useState('normal');
  const [secondarySelection, setSecondarySelection] = useState('acne');
  const [showRoutine, setShowRoutine] = useState(false);
  
  // AI & Camera State
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTabSwitch = (tab: 'skin' | 'hair') => {
    setActiveTab(tab);
    setShowRoutine(false);
    setAiResult(null);
    setAiInput("");
    stopCamera();
    if (tab === 'hair') {
      setPrimarySelection('hair_oily');
      setSecondarySelection('dandruff');
    } else {
      setPrimarySelection('normal');
      setSecondarySelection('acne');
    }
  };

  const theme = THEMES[primarySelection as keyof typeof THEMES] || THEMES.normal;

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setAiError("Camera access denied.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      return canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    }
    return null;
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    
    const base64Image = isCameraActive ? captureFrame() : null;
    if (!aiInput.trim() && !base64Image) {
      setIsAiLoading(false);
      return;
    }

    try {
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: [{ 
          parts: [
            { text: aiInput || `Analyze this ${activeTab} image.` },
            ...(base64Image ? [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }] : [])
          ] 
        }],
        config: {
          systemInstruction: `You are a clinical dermatological assistant. Analyze the user's text AND any provided image of their ${activeTab}. Use visual evidence to confirm textures (sebum levels, inflammation, or follicle health). 
          Format your response as a JSON object with these keys: 
          "diagnosis" (concise clinical term), 
          "explanation" (one sentence biological rationale), 
          "top_ingredient" (best active compound), 
          "safety_note" (one caution),
          "suggested_profile_id" (match one of these exactly: ${APP_DATA[activeTab].types.map(t => t.id).join(', ')})`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING },
              explanation: { type: Type.STRING },
              top_ingredient: { type: Type.STRING },
              safety_note: { type: Type.STRING },
              suggested_profile_id: { type: Type.STRING }
            },
            required: ["diagnosis", "explanation", "top_ingredient", "safety_note", "suggested_profile_id"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        setAiResult(parsed);
        if (parsed.suggested_profile_id) {
          setPrimarySelection(parsed.suggested_profile_id);
        }
      }
      stopCamera();
    } catch (err) {
      console.error(err);
      setAiError("Analysis offline. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getSolution = useMemo(() => {
    const p = APP_DATA[activeTab].types.find(x => x.id === primarySelection) || APP_DATA[activeTab].types[0];
    const s = APP_DATA[activeTab].concerns.find(x => x.id === secondarySelection) || APP_DATA[activeTab].concerns[0];
    return { p, s };
  }, [activeTab, primarySelection, secondarySelection]);

  const toggleRoutine = () => setShowRoutine(!showRoutine);

  const getShoppingLink = (query: string, platform: 'amazon' | 'flipkart') => {
    const encoded = encodeURIComponent(query);
    return platform === 'amazon' 
      ? `https://www.amazon.in/s?k=${encoded}`
      : `https://www.flipkart.com/search?q=${encoded}`;
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-700 font-sans pb-20 text-slate-200`}>
      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className={`${theme.accent} p-1.5 rounded-lg shadow-lg ${theme.neonShadow} transition-all duration-500`}
            >
              <ShieldCheck className="text-white w-5 h-5" />
            </motion.div>
            <span className={`text-xl font-black tracking-tight uppercase italic ${theme.text}`}>GlowCode</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <div className="flex bg-white/5 p-1 rounded-xl">
            {(['skin', 'hair'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white/10 shadow-md text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!showRoutine ? (
            <motion.div 
              key="diagnostic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              {/* Hero */}
              <header className="px-2 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
                      Precision {activeTab === 'skin' ? 'Skin' : 'Hair'} <span className={`${theme.text}`}>Diagnostic</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-xl text-sm md:text-base">
                      Synthesizing chemical efficacy with bio-morphic diagnostics for localized cellular optimization.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] flex items-center gap-4 backdrop-blur-md">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Powered by</p>
                      <p className="text-xs font-bold text-white uppercase">Gemini Flash 3.0</p>
                    </div>
                  </div>
              </header>

              {/* AI SCANNER SECTION */}
              <section className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
                  <div className="glass-panel rounded-[3rem] p-6 md:p-10 border border-white/5 bg-slate-900/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Microscope className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Intelligent Scan Input</h2>
                      </div>
                      <button 
                        onClick={isCameraActive ? stopCamera : startCamera}
                        className={`p-3 rounded-full border border-white/10 transition-all ${isCameraActive ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                      >
                        {isCameraActive ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {isCameraActive && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-video max-w-md mx-auto overflow-hidden rounded-[2rem] border-2 border-white/10"
                        >
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                          <canvas ref={canvasRef} className="hidden" />
                        </motion.div>
                      )}

                      <div className="relative">
                        <textarea 
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          placeholder={`Describe your ${activeTab} texture, concerns, or recent changes...`}
                          className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all min-h-[120px] resize-none pr-16"
                        />
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={runAiAnalysis}
                          disabled={isAiLoading || (!aiInput.trim() && !isCameraActive)}
                          className={`absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAiLoading ? 'bg-slate-800' : `${theme.accent} shadow-lg ${theme.neonShadow}`}`}
                        >
                          {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
                        </motion.button>
                      </div>
                    </div>

                    {aiError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-4 flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase px-4 py-2 bg-rose-400/10 rounded-full w-fit"
                      >
                        <AlertCircle className="w-3 h-3" /> {aiError}
                      </motion.div>
                    )}

                    {aiResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 grid md:grid-cols-2 gap-6"
                      >
                        <div className={`p-6 rounded-[2rem] bg-white/5 border ${theme.border} flex items-start gap-4`}>
                          <div className={`p-3 rounded-2xl ${theme.accent} text-white shadow-lg`}>
                             <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Diagnostic Result</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{aiResult.diagnosis}</h4>
                            <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">"{aiResult.explanation}"</p>
                          </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg">
                             <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Clinical Protocol</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{aiResult.top_ingredient}</h4>
                            <p className={`text-[10px] font-bold mt-2 uppercase text-amber-500`}>CAUTION: {aiResult.safety_note}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
              </section>

              {/* Selection Grid */}
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <LayoutGrid className="w-4 h-4" /> 01. Biological Base Profile
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {APP_DATA[activeTab].types.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPrimarySelection(type.id)}
                        className={`relative group rounded-[2.5rem] p-6 border-2 transition-all aspect-[3/4] flex flex-col justify-end overflow-hidden ${primarySelection === type.id ? `${theme.border} bg-white/5 ${theme.neonShadow} z-10` : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <div className={`mb-auto transition-all duration-500 ${primarySelection === type.id ? theme.text : 'text-slate-500'}`}>
                          {type.icon}
                        </div>
                        <div className="text-left relative z-10">
                          <h3 className={`font-black text-base leading-tight uppercase tracking-tighter ${primarySelection === type.id ? 'text-white' : 'text-slate-400'}`}>{type.name}</h3>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.text}`}>{type.effect}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <Activity className="w-4 h-4" /> 02. Targeted Concerns
                  </h2>
                  <div className="space-y-3">
                    {APP_DATA[activeTab].concerns.map((concern) => (
                      <motion.button
                        key={concern.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSecondarySelection(concern.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all ${secondarySelection === concern.id ? `${theme.border} bg-white/10 shadow-lg` : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${secondarySelection === concern.id ? `${theme.border} ${theme.text}` : 'border-white/10 text-slate-500'}`}>
                          {concern.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-white text-xs uppercase tracking-tight">{concern.name}</h3>
                          <p className={`text-[10px] font-bold uppercase ${theme.text} opacity-70`}>{concern.suggest}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-8 z-40">
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleRoutine}
                  className={`w-full bg-gradient-to-r ${theme.gradient} text-white p-6 rounded-[3rem] shadow-2xl flex items-center justify-between group transition-all ${theme.neonShadow}`}
                >
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <FlaskConical className="w-7 h-7" />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-0.5">Initialize Formulation</p>
                        <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{getSolution.p.name} × {getSolution.s.name}</h4>
                     </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xl">
                     <ArrowLeft className="w-6 h-6 rotate-180" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="routine"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-12"
            >
               <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-sm">
                 <button onClick={toggleRoutine} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${theme.text} hover:opacity-70 transition-opacity`}>
                   <ChevronLeft className="w-4 h-4" /> Reset Analysis
                 </button>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black uppercase text-slate-400">Clinical Validation Active</span>
                    </div>
                 </div>
               </div>

               {/* AI Custom Insight */}
               {aiResult && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/5 border border-teal-500/20 p-6 rounded-[2.5rem] flex items-center gap-6"
                 >
                    <div className={`p-4 rounded-full bg-teal-500/10 ${theme.text}`}>
                      <BrainCircuit className="w-8 h-8" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-teal-400 uppercase tracking-widest">AI Custom Insight</h5>
                      <p className="text-sm text-slate-300 font-medium">Your routine is optimized for {aiResult.diagnosis}. Suggested inclusion: <strong>{aiResult.top_ingredient}</strong>.</p>
                    </div>
                 </motion.div>
               )}

               {/* Protocol Grid */}
               <div className="grid lg:grid-cols-3 gap-8">
                  {/* Routine Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <RefreshCcw className="w-4 h-4" /> Daily Protocol
                       </h2>
                       <span className="text-[10px] font-bold text-slate-600 uppercase">AM / PM Cycles</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                             </div>
                             <h3 className="text-lg font-black text-white uppercase italic">Morning Cycle</h3>
                          </div>
                          <ul className="space-y-4">
                             {['Gentle Cleansing', 'Active Serum', 'Moisture Barrier', 'Broad Spectrum SPF'].map((step, i) => (
                               <li key={i} className="flex items-center gap-4 group">
                                  <span className="text-[10px] font-black text-slate-600 w-4">{i+1}</span>
                                  <div className="h-px flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                  <span className="text-sm font-bold text-slate-300">{step}</span>
                               </li>
                             ))}
                          </ul>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <Moon className="w-5 h-5" />
                             </div>
                             <h3 className="text-lg font-black text-white uppercase italic">Evening Cycle</h3>
                          </div>
                          <ul className="space-y-4">
                             {['Double Cleanse', 'Targeted Treatment', 'Night Repair', 'Occlusive Layer'].map((step, i) => (
                               <li key={i} className="flex items-center gap-4 group">
                                  <span className="text-[10px] font-black text-slate-600 w-4">{i+1}</span>
                                  <div className="h-px flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                  <span className="text-sm font-bold text-slate-300">{step}</span>
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    {/* Chemical Analysis */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <FlaskConical className="w-4 h-4" /> Chemical Formulation
                       </h3>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div>
                             <p className="text-sm text-slate-400 mb-4 leading-relaxed">{getSolution.p.rationale}</p>
                             <div className="flex flex-wrap gap-2">
                                {getSolution.p.chemicals.map((chem, i) => (
                                   <span key={i} className={`px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase ${theme.text}`}>
                                      {chem}
                                   </span>
                                ))}
                             </div>
                          </div>
                          <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Targeted Molecule</p>
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${theme.accent} flex items-center justify-center shadow-lg`}>
                                   <Atom className="text-white w-6 h-6" />
                                </div>
                                <div>
                                   <h4 className="text-xl font-black text-white uppercase">{getSolution.s.suggest}</h4>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase">Concentrated Efficacy</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Metabolic & Shopping Column */}
                  <div className="space-y-8">
                     <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Utensils className="w-4 h-4" /> Metabolic Support
                        </h3>
                        <div className="space-y-6">
                           <div>
                              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Bio-Available Intake</p>
                              <div className="grid grid-cols-2 gap-2">
                                 {(getSolution.s.diet as any).eat.map((food: string, i: number) => (
                                    <div key={i} className="bg-emerald-400/5 p-3 rounded-2xl border border-emerald-400/10 flex items-center gap-2">
                                       <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                       <span className="text-[10px] font-bold text-slate-300 uppercase">{food}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-3">Inflammatory Triggers</p>
                              <div className="grid grid-cols-2 gap-2">
                                 {(getSolution.s.diet as any).avoid.map((food: string, i: number) => (
                                    <div key={i} className="bg-rose-400/5 p-3 rounded-2xl border border-rose-400/10 flex items-center gap-2">
                                       <AlertCircle className="w-3 h-3 text-rose-400" />
                                       <span className="text-[10px] font-bold text-slate-300 uppercase">{food}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <ShoppingBag className="w-4 h-4" /> Procurement
                        </h3>
                        <div className="space-y-3">
                           <a 
                             href={getShoppingLink(`${getSolution.s.suggest} ${activeTab}care`, 'amazon')}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group transition-all"
                           >
                              <span className="text-xs font-black text-white uppercase">Amazon Prime</span>
                              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                           </a>
                           <a 
                             href={getShoppingLink(`${getSolution.s.suggest} ${activeTab}care`, 'flipkart')}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group transition-all"
                           >
                              <span className="text-xs font-black text-white uppercase">Flipkart Plus</span>
                              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        :root {
          font-family: 'Inter', sans-serif;
        }

        .font-display {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
        }

        .glass-panel {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .neon-glow-teal { box-shadow: 0 0 20px rgba(20, 184, 166, 0.3); }
        .neon-glow-amber { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
        .neon-glow-sky { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
        .neon-glow-violet { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        .neon-glow-rose { box-shadow: 0 0 20px rgba(244, 63, 94, 0.3); }
        .neon-glow-emerald { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
        .neon-glow-orange { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
        .neon-glow-indigo { box-shadow: 0 0 20px rgba(79, 70, 229, 0.3); }
        .neon-glow-fuchsia { box-shadow: 0 0 20px rgba(217, 70, 239, 0.3); }

        textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
