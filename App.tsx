import React, { useState, useEffect, useMemo } from 'react';
import { SOURCES, N8N_TEMPLATE, CLEANER_CODE, PARSER_CODE } from './constants';
import { Source } from './types';
import { SourceCard } from './components/SourceCard';
import { CodeBlock } from './components/CodeBlock';
import { generateAgentPrompt } from './services/geminiService';

export default function App() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(SOURCES.map(s => s.id)));
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'agent'>('code');
  const [agentFocus, setAgentFocus] = useState<string>('technical');
  const [outputLanguage, setOutputLanguage] = useState<string>('Turkish');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSource = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedSources = useMemo(() => 
    SOURCES.filter(s => selectedIds.has(s.id)), 
  [selectedIds]);

  const n8nCode = useMemo(() => {
    const sourcesJson = JSON.stringify(
      selectedSources.map(({ name, url, category }) => ({ name, url, category })),
      null,
      2
    );
    return N8N_TEMPLATE.replace('{{SOURCES_JSON}}', sourcesJson);
  }, [selectedSources]);

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const prompt = await generateAgentPrompt(selectedSources, agentFocus, outputLanguage);
      setGeneratedPrompt(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-n8n-primary/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-n8n-primary to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-900/20">
              AI
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">n8n Haber Akışı Oluşturucu</h1>
              <p className="text-xs text-slate-400 font-mono">Otomatik Haber Toplama Mimarı</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{selectedSources.length} kaynak seçildi</span>
            <a href="https://n8n.io" target="_blank" rel="noreferrer" className="hover:text-n8n-primary transition-colors">
              n8n dokümantasyon &rarr;
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Source Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-n8n-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Kaynakları Seçin
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedIds(new Set(SOURCES.map(s => s.id)))}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Tümünü Seç
              </button>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="grid gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {SOURCES.map(source => (
              <SourceCard 
                key={source.id} 
                source={source} 
                isSelected={selectedIds.has(source.id)} 
                onToggle={toggleSource} 
              />
            ))}
          </div>
        </div>

        {/* Right Column: Output & Tools */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Tabs */}
          <div className="flex p-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1. JS Kodu (n8n)
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'agent' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              2. AI Agent Promptu
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'guide' ? 'bg-slate-700 text-white shadow-sm ring-2 ring-red-500/50' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3. Sorun Giderme & Rehber
            </button>
          </div>

          <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 shadow-xl overflow-hidden relative">
            
            {activeTab === 'code' && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Code Node Konfigürasyonu</h3>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    n8n 'Code' Düğümüne Yapıştırın
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Bu JavaScript kodu, otomasyonunuzun hedefleyeceği site listesini oluşturur. Bu düğümün çıktısını "Split In Batches" düğümüne bağlayarak her siteyi tek tek işleyin.
                </p>
                <CodeBlock code={n8nCode} label="Javascript (n8n Code Node)" />
              </div>
            )}

            {activeTab === 'agent' && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                 <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Gemini Agent Konfigürasyonu</h3>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Gemini 2.5 ile Güçlendirilmiş
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  n8n içindeki "AI Agent" düğümü için katı bir sistem talimatı (System Instruction) oluşturun. Bu, AI'ın HTML/Markdown içeriğinden tam olarak ne çıkarması gerektiğini belirler.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Odak Alanı</label>
                      <select 
                        value={agentFocus}
                        onChange={(e) => setAgentFocus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-n8n-primary transition-colors"
                      >
                        <option value="technical">Teknik Uygulama & Kod</option>
                        <option value="business">İş Dünyası & Girişimler</option>
                        <option value="research">Akademik Araştırmalar</option>
                        <option value="general">Genel Özetler (Kısa & Öz)</option>
                      </select>
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Özet Dili</label>
                      <select 
                        value={outputLanguage}
                        onChange={(e) => setOutputLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-n8n-primary transition-colors"
                      >
                        <option value="Turkish">Türkçe</option>
                        <option value="English">İngilizce</option>
                      </select>
                   </div>
                   <div className="col-span-2 mt-2">
                      <button
                        onClick={handleGeneratePrompt}
                        disabled={isGenerating || selectedSources.length === 0}
                        className={`
                          w-full py-2 px-4 rounded-lg text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                          ${isGenerating 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-n8n-primary to-n8n-dark text-white hover:brightness-110 active:scale-95'}
                        `}
                      >
                         {isGenerating ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Oluşturuluyor...
                           </>
                         ) : (
                           <>
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                             </svg>
                             Sistem Talimatı Oluştur (Prompt)
                           </>
                         )}
                      </button>
                   </div>
                </div>

                {generatedPrompt ? (
                  <div className="mt-4">
                    <CodeBlock code={generatedPrompt} label="System Instruction (n8n AI Agent içine kopyalayın)" language="markdown" />
                  </div>
                ) : (
                  <div className="mt-4 border border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center text-slate-500">
                    <p className="mb-2">Gemini API kullanarak özel bir prompt oluşturmak için "Oluştur"a basın.</p>
                    <p className="text-xs">Seçtiğiniz kaynakları ({selectedSources.length}) analiz ederek bağlama uygun talimatlar hazırlar.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guide' && (
               <div className="space-y-6 animate-in fade-in zoom-in duration-300 h-full overflow-y-auto custom-scrollbar">
                  
                   {/* JSON Parse Error Solution Block */}
                   <div className="bg-yellow-500/10 border-2 border-yellow-500/40 rounded-lg p-5 shadow-lg shadow-yellow-900/20">
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-500/20 p-2 rounded-full">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-400 text-lg mb-2">"JSON Parse Error" (```json) Çözümü</h4>
                        <p className="text-slate-300 mb-3 text-sm">
                           Eğer n8n'de <code>Structured Output Parser</code> veya <code>JSON.parse</code> hatası alıyorsanız, sebebi Gemini'nin çıktının başına ve sonuna <strong>```json</strong> gibi markdown işaretleri koymasıdır.
                        </p>
                        
                        <div className="space-y-4">
                           <div className="bg-slate-950 p-3 rounded border border-yellow-500/30">
                              <h5 className="text-sm font-semibold text-white mb-2">Çözüm Kodu</h5>
                              <p className="text-xs text-slate-400 mb-2">
                                 Aşağıdaki kodu kopyalayın ve <strong>AI Agent düğümünden HEMEN SONRA</strong> bir "Code" düğümü oluşturup içine yapıştırın. Bu kod, markdown işaretlerini temizler.
                              </p>
                              <CodeBlock code={PARSER_CODE} label="JavaScript (JSON Temizleyici)" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Critical Error Solution Block */}
                  <div className="bg-red-500/10 border-2 border-red-500/40 rounded-lg p-5 shadow-lg shadow-red-900/20">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-500/20 p-2 rounded-full">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-400 text-lg mb-2">"Prompt Too Long" Hatası İçin Çözüm</h4>
                        <p className="text-slate-300 mb-3 text-sm">
                           n8n'de <code>204411 tokens {'>'} 200000 maximum</code> hatası alıyorsanız, site verisi (HTML) modelin hafızasını aşıyor demektir.
                        </p>
                        
                        <div className="space-y-4">
                           <div className="bg-slate-950 p-3 rounded border border-red-500/30">
                              <h5 className="text-sm font-semibold text-white mb-1">Adım 1: HTML to Markdown Node'u Ekleyin</h5>
                              <p className="text-xs text-slate-400">HTTP Request düğümünden sonra mutlaka ekleyin. Bu %90 veri tasarrufu sağlar.</p>
                           </div>

                           <div className="bg-slate-950 p-3 rounded border border-red-500/30">
                              <h5 className="text-sm font-semibold text-white mb-2">Adım 2 (KESİN ÇÖZÜM): Temizleme Kodu Ekleyin</h5>
                              <p className="text-xs text-slate-400 mb-2">
                                 Aşağıdaki kodu kopyalayın ve <strong>AI Agent düğümünden HEMEN ÖNCE</strong> bir "Code" düğümü oluşturup içine yapıştırın. Bu kod, metin çok uzunsa otomatik olarak kesecek ve hatayı engelleyecektir.
                              </p>
                              <CodeBlock code={CLEANER_CODE} label="JavaScript (Temizleme & Kısaltma)" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  {/* API Key Instructions Block */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-400 text-sm mb-1">🔑 Gemini API Anahtarı ve Limitler</h4>
                        <p className="text-sm text-slate-300 mb-2">
                          API anahtarınızı <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 underline hover:text-blue-300">Google AI Studio</a>'dan alabilirsiniz.
                        </p>
                        <div className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700">
                          <strong>Kota/Maliyet Takibi:</strong>
                          <ul className="list-disc ml-4 mt-1">
                            <li>Ücretsiz Katman (Free Tier): Dakikada ~15 istek. Bu projede 10 siteyi döngüyle taradığınız için sorun olmaz.</li>
                            <li>Bakiye Kontrolü: Eğer faturalandırmayı açtıysanız <a href="https://console.cloud.google.com/billing" target="_blank" className="text-blue-400 hover:underline">Google Cloud Console</a> üzerinden maliyetinizi görebilirsiniz.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold">İdeal n8n İş Akışı Yapısı</h3>
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-800">
                    
                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center font-bold text-green-500">1</div>
                      <h4 className="font-medium text-slate-200">Schedule Trigger</h4>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-n8n-primary flex items-center justify-center font-bold text-n8n-primary">2</div>
                      <h4 className="font-medium text-slate-200">Code Node (Kaynaklar)</h4>
                      <p className="text-sm text-slate-400">1. Sekmedeki kod buraya.</p>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center font-bold text-blue-500">3</div>
                      <h4 className="font-medium text-slate-200">Split In Batches (1'er 1'er)</h4>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center font-bold text-purple-500">4</div>
                      <h4 className="font-medium text-slate-200">HTTP Request + HTML to Markdown</h4>
                    </div>

                    <div className="relative pl-12">
                       <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center font-bold text-red-500 animate-pulse">!</div>
                       <h4 className="font-bold text-red-400">AI ÖNCESİ: Temizleme Code Node'u</h4>
                       <p className="text-sm text-slate-400">"Cleaner Code" burada çalışır.</p>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-pink-500 flex items-center justify-center font-bold text-pink-500">5</div>
                      <h4 className="font-medium text-slate-200">AI Agent (Girdi: cleanedContent)</h4>
                    </div>

                    <div className="relative pl-12">
                       <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-yellow-900/50 border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-500 animate-pulse">!</div>
                       <h4 className="font-bold text-yellow-400">AI SONRASI: JSON Parser Node</h4>
                       <p className="text-sm text-slate-400">"Parser Code" burada çalışır (Markdown temizliği için).</p>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-red-500 flex items-center justify-center font-bold text-red-500">6</div>
                      <h4 className="font-medium text-slate-200">Gmail (Bitiş)</h4>
                    </div>

                  </div>
               </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}