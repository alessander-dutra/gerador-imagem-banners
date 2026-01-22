import React, { useState, useRef } from 'react';
import { AspectRatio, ImageSize, GenerationConfig } from '../types';
import { Button } from './Button';
import { generateBannerImage } from '../services/geminiService';

interface BannerGeneratorProps {
  onGenerateSuccess: (url: string, config: GenerationConfig, referenceImage?: string) => void;
  onError: (error: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const BannerGenerator: React.FC<BannerGeneratorProps> = ({ 
  onGenerateSuccess, 
  onError,
  isGenerating,
  setIsGenerating
}) => {
  const [config, setConfig] = useState<GenerationConfig>({
    productName: '',
    description: '',
    url: '',
    aspectRatio: AspectRatio.RATIO_16_9,
    imageSize: ImageSize.SIZE_2K
  });
  const [batchMode, setBatchMode] = useState(false);
  const [selectedBatchRatios, setSelectedBatchRatios] = useState<AspectRatio[]>([
    AspectRatio.RATIO_16_9,
    AspectRatio.RATIO_1_1,
    AspectRatio.RATIO_9_16,
    AspectRatio.RATIO_4_3
  ]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        onError(""); 
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleBatchRatio = (ratio: AspectRatio) => {
    setSelectedBatchRatios(prev => 
      prev.includes(ratio) 
        ? prev.filter(r => r !== ratio)
        : [...prev, ratio]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.productName || !config.description) {
      onError("Please fill in the product name and description.");
      return;
    }

    setIsGenerating(true);
    onError(""); // Clear previous errors

    const basePrompt = `
      Create a high-end, professional advertising banner for a product named "${config.productName}".
      Product Description: ${config.description}.
      ${config.url ? `Product URL context: ${config.url}` : ''}
      Style: Commercial photography, studio lighting, highly detailed, photorealistic, visually striking, minimal text, focus on the product.
    `.trim();

    try {
      // Pass referenceImage if it exists
      const refImg = referenceImage || undefined;

      if (batchMode) {
        if (selectedBatchRatios.length === 0) {
           throw new Error("Please select at least one aspect ratio for batch generation.");
        }

        // Process sequentially to avoid rate limits or overwhelming the client
        for (const ratio of selectedBatchRatios) {
          const url = await generateBannerImage(basePrompt, ratio, config.imageSize, refImg);
          onGenerateSuccess(url, { ...config, aspectRatio: ratio }, refImg);
        }
      } else {
        // Single generation
        const url = await generateBannerImage(basePrompt, config.aspectRatio, config.imageSize, refImg);
        onGenerateSuccess(url, config, refImg);
      }
    } catch (err: any) {
      onError(err.message || "Failed to generate image. Please try again.");
      if (err.message && err.message.includes("Requested entity was not found")) {
         alert("API Key invalid or project not found. Please refresh to select a new key.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
        <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Ad Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={config.productName}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. NeoRunner X1"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Reference Image (Optional)</label>
             <div className="flex items-start gap-4">
               <input
                 type="file"
                 ref={fileInputRef}
                 accept="image/*"
                 onChange={handleFileChange}
                 className="hidden"
               />
               
               {!referenceImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-brand-500 hover:bg-gray-700/50 transition-colors text-gray-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Upload Reference</span>
                  </button>
               ) : (
                 <div className="relative w-full">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-600 bg-black/50">
                       <img src={referenceImage} alt="Reference" className="w-full h-full object-contain" />
                       <button 
                         type="button"
                         aria-label="Remove Reference Image"
                         onClick={clearReferenceImage}
                         className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-500/80 transition-colors"
                       >
                         <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                       </button>
                    </div>
                 </div>
               )}
             </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">Product URL (Optional)</label>
            <input
              type="url"
              id="url"
              name="url"
              value={config.url}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
              placeholder="https://example.com/product"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description & Ad Copy Idea</label>
            <textarea
              id="description"
              name="description"
              value={config.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Describe the product and the vibe of the ad. e.g. 'A futuristic running shoe on a neon city street, energetic, blue and purple lighting.'"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-1">
              Aspect Ratio {batchMode && <span className="text-xs text-brand-400 font-normal ml-2">(Defined below)</span>}
            </label>
            <select
              id="aspectRatio"
              name="aspectRatio"
              value={config.aspectRatio}
              onChange={handleInputChange}
              disabled={batchMode}
              className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none appearance-none ${batchMode ? 'opacity-50' : ''}`}
            >
              {Object.values(AspectRatio).map((ratio) => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageSize" className="block text-sm font-medium text-gray-300 mb-1">Resolution</label>
            <select
              id="imageSize"
              name="imageSize"
              value={config.imageSize}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none appearance-none"
            >
               {Object.values(ImageSize).map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="batchMode" 
                    checked={batchMode} 
                    onChange={(e) => setBatchMode(e.target.checked)}
                    className="w-4 h-4 text-brand-600 bg-gray-900 border-gray-700 rounded focus:ring-brand-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="batchMode" className="text-sm text-gray-300 select-none cursor-pointer">
                    Batch Generate (Generate multiple sizes at once)
                </label>
            </div>

            {batchMode && (
                <div className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Select Ratios for Batch
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.values(AspectRatio).map((ratio) => (
                            <label key={ratio} className={`
                                flex items-center gap-2 p-2 rounded cursor-pointer border transition-all
                                ${selectedBatchRatios.includes(ratio) 
                                    ? 'bg-brand-900/20 border-brand-500/50 text-white' 
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}
                            `}>
                                <input
                                    type="checkbox"
                                    checked={selectedBatchRatios.includes(ratio)}
                                    onChange={() => toggleBatchRatio(ratio)}
                                    className="rounded border-gray-600 text-brand-600 focus:ring-brand-500 bg-gray-900"
                                />
                                <span className="text-sm font-medium">{ratio}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            isLoading={isGenerating} 
            className="w-full py-3 text-lg justify-center font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-900/20"
          >
            {isGenerating ? 'Designing...' : batchMode ? `Generate ${selectedBatchRatios.length} Ads` : 'Generate Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
};