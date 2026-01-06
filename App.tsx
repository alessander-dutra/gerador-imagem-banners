import React, { useState, useEffect } from 'react';
import { BannerGenerator } from './components/BannerGenerator';
import { Gallery } from './components/Gallery';
import { ApiKeySelector } from './components/ApiKeySelector';
import { ImageEditor } from './components/ImageEditor';
import { GeneratedImage, GenerationConfig, AspectRatio, ImageSize } from './types';
import { generateBannerImage } from './services/geminiService';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  const handleGenerateSuccess = (url: string, config: GenerationConfig, referenceImage?: string) => {
    const promptUsed = `
      Create a high-end, professional advertising banner for a product named "${config.productName}".
      Product Description: ${config.description}.
      ${config.url ? `Product URL context: ${config.url}` : ''}
      Style: Commercial photography, studio lighting, highly detailed, photorealistic, visually striking, minimal text, focus on the product.
    `.trim();

    const newImage: GeneratedImage = {
      id: generateId(),
      url,
      prompt: promptUsed,
      aspectRatio: config.aspectRatio,
      size: config.imageSize,
      timestamp: Date.now(),
      referenceImage
    };
    setImages(prev => [newImage, ...prev]);
  };

  const handleRegenerate = async (image: GeneratedImage) => {
    setEditingImage(null); // Close modal
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateBannerImage(image.prompt, image.aspectRatio, image.size, image.referenceImage);
      const newImage: GeneratedImage = {
        ...image,
        id: generateId(),
        url,
        timestamp: Date.now()
      };
      setImages(prev => [newImage, ...prev]);
      setEditingImage(newImage); // Auto-open the new one in editor
    } catch (err: any) {
      setError(err.message || "Failed to regenerate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleError = (msg: string) => {
    setError(msg);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
             </div>
             <h1 className="text-xl font-bold tracking-tight text-white">AdGenius <span className="text-brand-400">AI</span></h1>
          </div>
          <div>
            {apiKeyReady && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    System Online
                </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
             <div className="lg:sticky lg:top-24 space-y-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-brand-900/20 rounded-xl p-4 border border-brand-500/20 mb-6">
                    <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wide mb-1">New Feature</h3>
                    <p className="text-sm text-gray-300">
                        Now powered by <strong>Gemini 3.0 Pro</strong> (Banana Pro) for ultra-high fidelity 4K rendering.
                    </p>
                </div>

                <BannerGenerator 
                    onGenerateSuccess={handleGenerateSuccess} 
                    onError={handleError}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                />

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        <span>{error}</span>
                    </div>
                )}
             </div>
          </div>

          {/* Right Column: Gallery */}
          <div className="lg:col-span-8 xl:col-span-8">
            <Gallery images={images} isLoading={isGenerating} onEdit={setEditingImage} />
          </div>

        </div>
      </main>

      {editingImage && (
        <ImageEditor 
          imageSrc={editingImage.url} 
          onClose={() => setEditingImage(null)}
          onSave={() => setEditingImage(null)}
          onRegenerate={() => handleRegenerate(editingImage)}
        />
      )}
    </div>
  );
};

export default App;