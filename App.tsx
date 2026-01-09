import React, { useState, useRef, useEffect } from 'react';
import BioFilter3D from './components/BioFilter3D';
import { askBiomimicryExpert } from './services/geminiService';
import { SimulationState, ChatMessage, ViewMode } from './types';
import { 
  Play, 
  Pause, 
  Wind, 
  Settings2, 
  MessageSquare, 
  Send,
  Loader2,
  Droplets,
  ShieldAlert,
  Sprout,
  Factory,
  CheckCircle2,
  XOctagon
} from 'lucide-react';

export default function App() {
  // State
  const [simulationState, setSimulationState] = useState<SimulationState>({
    flowRate: 1.0,
    particleDensity: 300,
    efficiency: 99,
    isRunning: true
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('NATURE');

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am BioGuide. I can explain how this fish-inspired filter uses fluid dynamics to separate plastics, algae, and sediment. Ask me how this works in washing machines!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSimulation = () => {
    setSimulationState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = `
      The user is viewing a 3D simulation of a bio-inspired water filter (Basking Shark model).
      Current View Mode: ${viewMode} (user can switch between NATURE and PRODUCT view).
      
      Simulation State:
      - Flow Rate: ${simulationState.flowRate.toFixed(1)}x
      - Particle Load: ${simulationState.particleDensity} units
      - Efficiency: ${simulationState.efficiency}% (Inertial separation active)
      - Animation Status: ${simulationState.isRunning ? 'Running' : 'Paused'}
      
      Mechanism:
      - Blue particles: Water (permeates through).
      - Red particles: Microplastics.
      - Green particles: Algae/Organic Matter.
      - Brown particles: Sediment/Sand.
      
      All solid particles (Red, Green, Brown) are concentrated into the sludge output due to the "Cross-Flow" effect.
      
      Human Application (Product Mode):
      - This "solid-state" filter has no moving parts.
      - Can be retrofitted to washing machines to catch microfibers.
      - Used in industrial wastewater treatment.
      - Used in autonomous ocean-cleaning drones.
      - Advantages: Does NOT clog like mesh screens because of the tangential cross-flow.
    `;

    const responseText = await askBiomimicryExpert(userMsg.text, context);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative w-full h-screen text-slate-100 overflow-hidden bg-[#020617] font-sans selection:bg-cyan-500/30">
      {/* 3D Background */}
      <BioFilter3D simulationState={simulationState} viewMode={viewMode} />

      {/* --- UI LAYER --- */}

      {/* Top Left: Header & Legend */}
      <div className="absolute top-0 left-0 p-8 flex flex-col gap-8 pointer-events-none z-10 max-w-sm">
        {/* Brand Block */}
        <div>
          <div className="w-24 h-8 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-sm mb-3 shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
          <h1 className="text-sm font-bold tracking-[0.2em] text-cyan-100/90 uppercase drop-shadow-md">
            Fish-Mouth Filtration Tech
          </h1>
        </div>

        {/* Legend Panel */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-lg pointer-events-auto w-64 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="space-y-3">
             <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                <span className="text-xs text-slate-300 font-medium tracking-wide">Clean Water</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-3 h-3 relative flex items-center justify-center">
                    <span className="absolute w-full h-full bg-red-500 rotate-45 rounded-[1px] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                </span>
                <span className="text-xs text-slate-300 font-medium tracking-wide">Plastic (Microfibers)</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-xs text-slate-300 font-medium tracking-wide">Algae / Organic</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-sm bg-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.6)]"></span>
                <span className="text-xs text-slate-300 font-medium tracking-wide">Sediment / Sand</span>
             </div>
           </div>
        </div>
      </div>

      {/* Top Right: View Toggle */}
      <div className="absolute top-8 right-8 z-10 pointer-events-auto">
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-lg flex shadow-2xl">
            <button 
                onClick={() => setViewMode('NATURE')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-300 ${viewMode === 'NATURE' ? 'bg-[#1e293b] text-white shadow-inner border border-slate-600/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Sprout className="w-3.5 h-3.5" />
                Nature
            </button>
            <button 
                onClick={() => setViewMode('PRODUCT')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-300 ${viewMode === 'PRODUCT' ? 'bg-[#1d4ed8] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Factory className="w-3.5 h-3.5" />
                Product
            </button>
        </div>
      </div>

      {/* Bottom Left: Controls Panel */}
      <div className="absolute bottom-8 left-8 w-80 pointer-events-auto z-10 flex flex-col gap-4">
        {/* Main Controls */}
        <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-lg tracking-tight text-white">System Controls</h2>
          </div>

          <div className="space-y-6">
            {/* Play/Pause Button - Big & Prominent */}
            <button 
              onClick={toggleSimulation}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-300 shadow-md ${
                simulationState.isRunning 
                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              {simulationState.isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {simulationState.isRunning ? 'Pause Simulation' : 'Resume Flow'}
            </button>

            {/* Sliders */}
            <div className="space-y-5">
              {/* Flow Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Flow Velocity</span>
                  </div>
                  <span className="font-mono text-cyan-300">{simulationState.flowRate.toFixed(1)}x</span>
                </div>
                <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" 
                        style={{ width: `${(simulationState.flowRate / 5) * 100}%` }}
                    ></div>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="5.0" 
                        step="0.1"
                        value={simulationState.flowRate}
                        onChange={(e) => setSimulationState(s => ({ ...s, flowRate: parseFloat(e.target.value) }))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
              </div>

              {/* Density */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-purple-500" />
                    <span>Density</span>
                  </div>
                  <span className="font-mono text-purple-300">{simulationState.particleDensity}</span>
                </div>
                <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" 
                        style={{ width: `${(simulationState.particleDensity / 1000) * 100}%` }}
                    ></div>
                    <input 
                        type="range" 
                        min="50" 
                        max="1000" 
                        step="50"
                        value={simulationState.particleDensity}
                        onChange={(e) => setSimulationState(s => ({ ...s, particleDensity: parseInt(e.target.value) }))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Alert Box */}
        <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl">
           <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
             <ShieldAlert className="w-4 h-4" />
             <span>Problem: Filter Clogging</span>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed">
             Our filter mimics this: particles ricochet off the mesh to a collection tank, keeping the water outlet clear.
           </p>
        </div>
      </div>

      {/* Right Chat Panel (Hidden/Shown) */}
      <div className={`absolute top-0 right-0 h-full w-[400px] bg-[#0f172a]/95 backdrop-blur-xl border-l border-slate-800 transform transition-transform duration-500 ease-out z-30 flex flex-col pointer-events-auto shadow-2xl ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0B1221]">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/50">
                <MessageSquare className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="font-bold text-base text-white tracking-wide">BioGuide AI</h3>
               <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-bold mt-0.5 tracking-wider">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SYSTEM ONLINE
               </p>
             </div>
           </div>
           <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-full hover:bg-slate-700">
             <XOctagon className="w-5 h-5" />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#020617]/50">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
               <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#1d4ed8] text-white rounded-br-none' : 'bg-[#1e293b] border border-slate-700 text-slate-200 rounded-bl-none'}`}>
                 {msg.text}
               </div>
             </div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
               <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 flex gap-1.5 items-center">
                 <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-slate-800 bg-[#0B1221]">
          <form onSubmit={handleSendMessage} className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about human applications..." 
              className="w-full bg-[#1e293b] text-sm text-white placeholder-slate-500 rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 border border-slate-700 transition-all shadow-inner"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Chat FAB (Bottom Right) */}
      <button 
        onClick={() => setChatOpen(true)}
        className={`absolute bottom-8 right-8 w-14 h-14 bg-[#0ea5e9] hover:bg-[#0284c7] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 pointer-events-auto z-20 ${chatOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0ea5e9]"></span>
      </button>

    </div>
  );
}