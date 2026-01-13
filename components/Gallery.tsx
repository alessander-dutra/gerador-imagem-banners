import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { Button } from './Button';

interface GalleryProps {
  images: GeneratedImage[];
  isLoading?: boolean;
  onEdit: (image: GeneratedImage) => void;
}

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 animate-pulse">
    <div className="aspect-video w-full bg-gray-700/50 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
    <div className="p-4 space-y-3">
        <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-700 rounded"></div>
            <div className="h-5 w-12 bg-gray-700 rounded"></div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

interface LightboxProps {
  image: GeneratedImage;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ image, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 10));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <div className="flex items-center gap-1 bg-gray-800/80 rounded-lg p-1 border border-gray-700 shadow-xl">
          <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Zoom Out">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          </button>
          <span className="text-xs font-mono text-gray-400 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(s + 0.5, 10))} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Zoom In">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          </button>
          <div className="w-px h-4 bg-gray-700 mx-1"></div>
          <button onClick={reset} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Reset Zoom">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011-1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
          aria-label="Close preview"
          title="Close preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
         <img 
            src={image.url} 
            alt="Inspection"
            className="max-w-none shadow-2xl transition-transform duration-75 ease-out"
            style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                pointerEvents: 'none'
            }}
         />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center gap-1">
          <p className="text-white font-medium text-sm">{image.aspectRatio} • {image.size}</p>
          <p className="text-gray-400 text-xs text-center line-clamp-1 max-w-md">{image.prompt}</p>
      </div>
    </div>
  );
};

export const Gallery: React.FC<GalleryProps> = ({ images, isLoading = false, onEdit }) => {
  const [inspectingImage, setInspectingImage] = useState<GeneratedImage | null>(null);

  if (images.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No ads generated yet</p>
        <p className="text-sm mt-2">Fill out the form to create your first campaign.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Generated Assets</h2>
          <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
              {isLoading ? 'Designing...' : `${images.length} items`}
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {isLoading && <SkeletonCard />}
          
          {images.map((image) => (
            <div key={image.id} className="group bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all hover:border-brand-500/50 hover:shadow-brand-900/10">
              <div className="relative aspect-video w-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  <img 
                      src={image.url} 
                      alt={`Generated Banner ${image.aspectRatio}`} 
                      className="max-h-full max-w-full shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                       onClick={() => setInspectingImage(image)}
                       className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all hover:scale-110 border border-white/20 shadow-xl"
                       title="Inspect Details"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                       </svg>
                     </button>
                    <button
                       onClick={() => onEdit(image)}
                       className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-500 transition-all flex items-center gap-2 shadow-xl hover:shadow-brand-500/40"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                       </svg>
                       Edit
                     </button>
                     <a 
                       href={image.url} 
                       download={`banner-${image.id}.png`}
                       className="bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2 shadow-xl"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                       Download
                     </a>
                  </div>
              </div>
              
              <div className="p-4 flex items-center justify-between bg-gray-800 border-t border-gray-700/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20">{image.aspectRatio}</span>
                     <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/20">{image.size}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-1 italic font-medium" title={image.prompt}>"{image.prompt}"</p>
                </div>
                <div className="text-[10px] text-gray-500 font-mono bg-gray-900/50 px-2 py-1 rounded">
                  {new Date(image.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {inspectingImage && (
        <Lightbox 
          image={inspectingImage} 
          onClose={() => setInspectingImage(null)} 
        />
      )}
    </>
  );
};