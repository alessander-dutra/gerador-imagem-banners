import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './Button';

interface ImageEditorProps {
  imageSrc: string;
  onClose: () => void;
  onSave: () => void;
  onRegenerate?: () => void;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'Courier New, monospace' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Cursive', value: 'cursive' }
];

const PRESETS = [
  { name: 'Normal', b: 100, c: 100, s: 100, g: 0, sep: 0 },
  { name: 'Vivid', b: 115, c: 115, s: 140, g: 0, sep: 0 },
  { name: 'Vintage', b: 110, c: 85, s: 80, g: 0, sep: 40 },
  { name: 'Noir', b: 100, c: 130, s: 0, g: 100, sep: 0 },
  { name: 'Cinematic', b: 95, c: 125, s: 110, g: 0, sep: 0 },
  { name: 'Sepia', b: 105, c: 100, s: 100, g: 0, sep: 100 },
  { name: 'Warm', b: 105, c: 100, s: 110, g: 0, sep: 20 },
  { name: 'Cold', b: 100, c: 110, s: 80, g: 0, sep: 0 }, 
];

type ExportFormat = 'png' | 'jpeg' | 'webp';

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onClose, onSave, onRegenerate }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Export Settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(0.92);

  // Image Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  // Text Overlay
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState<CanvasTextAlign>('center');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  
  // Text Shadow
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [textShadowBlur, setTextShadowBlur] = useState(4);
  const [textShadowOffsetX, setTextShadowOffsetX] = useState(2);
  const [textShadowOffsetY, setTextShadowOffsetY] = useState(2);

  // Watermark
  const [watermarkType, setWatermarkType] = useState<'none' | 'text' | 'image'>('none');
  const [watermarkText, setWatermarkText] = useState('© Brand');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(80);
  const [watermarkSize, setWatermarkSize] = useState(20);
  const [watermarkSizeUnit, setWatermarkSizeUnit] = useState<'%' | 'px'>('%');
  const [watermarkX, setWatermarkX] = useState(90);
  const [watermarkY, setWatermarkY] = useState(90);
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const watermarkFileRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBrightness(preset.b);
    setContrast(preset.c);
    setSaturation(preset.s);
    setGrayscale(preset.g);
    setSepia(preset.sep);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const handleWatermarkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWatermarkImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearWatermarkImage = () => {
    setWatermarkImage(null);
    if (watermarkFileRef.current) {
        watermarkFileRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    try {
      if (!croppedAreaPixels) return;
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Apply filters for the image
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Reset filter for text/overlays so they remain crisp
      ctx.filter = 'none';
      const scaleFactor = canvas.width / 600;

      // Draw Main Text Overlay
      if (text) {
        ctx.font = `bold ${fontSize * scaleFactor}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';
        
        // Shadow configuration
        ctx.shadowColor = textShadowColor;
        ctx.shadowBlur = textShadowBlur * scaleFactor;
        ctx.shadowOffsetX = textShadowOffsetX * scaleFactor;
        ctx.shadowOffsetY = textShadowOffsetY * scaleFactor;

        ctx.fillText(text, (textX / 100) * canvas.width, (textY / 100) * canvas.height);
      }

      // Draw Watermark
      if (watermarkType !== 'none') {
        ctx.save();
        ctx.globalAlpha = watermarkOpacity / 100;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        const wx = (watermarkX / 100) * canvas.width;
        const wy = (watermarkY / 100) * canvas.height;

        let finalSize = watermarkSize;
        if (watermarkSizeUnit === '%') {
             finalSize = (watermarkSize / 100) * canvas.width;
        } else {
             finalSize = watermarkSize * scaleFactor;
        }

        if (watermarkType === 'text' && watermarkText) {
          ctx.font = `${finalSize}px sans-serif`;
          ctx.fillStyle = watermarkColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 2 * scaleFactor;
          ctx.fillText(watermarkText, wx, wy);
        } else if (watermarkType === 'image' && watermarkImage) {
          const wmImg = await createImage(watermarkImage);
          
          let targetWidth: number;
          if (watermarkSizeUnit === '%') {
             targetWidth = (watermarkSize / 100) * canvas.width;
          } else {
             targetWidth = watermarkSize * scaleFactor; 
          }
          
          const aspectRatio = wmImg.width / wmImg.height;
          const targetHeight = targetWidth / aspectRatio;
          
          ctx.drawImage(
            wmImg, 
            wx - targetWidth / 2, 
            wy - targetHeight / 2, 
            targetWidth, 
            targetHeight
          );
        }
        ctx.restore();
      }

      const mimeType = `image/${exportFormat}`;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `edited-banner-${Date.now()}.${exportFormat}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        onSave();
      }, mimeType, exportQuality);
    } catch (e) {
      console.error(e);
    }
  };

  const filterStyle = { filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)` };

  const getTextTransform = () => {
      if (textAlign === 'center') return 'translate(-50%, -50%)';
      if (textAlign === 'right') return 'translate(-100%, -50%)';
      return 'translate(0, -50%)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-gray-800 w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-semibold text-white">Advanced Image Editor</h3>
             {onRegenerate && (
                <button 
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900/30 text-brand-400 hover:text-white hover:bg-brand-600 rounded-lg text-xs font-bold transition-all border border-brand-500/20"
                  title="Generate a new version of this image using same prompt"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate New Image
                </button>
             )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor Canvas */}
          <div className="flex-1 relative bg-black overflow-hidden group">
            <div className="absolute inset-0" style={filterStyle}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
              />
            </div>

            {/* Main Text Overlay Preview */}
            {text && (
                <div 
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{ zIndex: 10 }}
                >
                    <div 
                        style={{
                            position: 'absolute',
                            left: `${textX}%`,
                            top: `${textY}%`,
                            transform: getTextTransform(),
                            color: textColor,
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            fontWeight: 'bold',
                            textShadow: `${textShadowOffsetX}px ${textShadowOffsetY}px ${textShadowBlur}px ${textShadowColor}`,
                            whiteSpace: 'nowrap',
                            textAlign: textAlign,
                        }}
                    >
                        {text}
                    </div>
                </div>
            )}

            {/* Watermark Preview */}
            {watermarkType !== 'none' && (
               <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ zIndex: 11 }}
               >
                  {watermarkType === 'text' && watermarkText && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${watermarkX}%`,
                        top: `${watermarkY}%`,
                        transform: 'translate(-50%, -50%)',
                        color: watermarkColor,
                        fontFamily: 'sans-serif',
                        fontSize: watermarkSizeUnit === '%' ? `${watermarkSize}vw` : `${watermarkSize}px`,
                        opacity: watermarkOpacity / 100,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {watermarkText}
                    </div>
                  )}
                  {watermarkType === 'image' && watermarkImage && (
                    <img 
                      src={watermarkImage}
                      alt="Watermark"
                      style={{
                        position: 'absolute',
                        left: `${watermarkX}%`,
                        top: `${watermarkY}%`,
                        transform: 'translate(-50%, -50%)',
                        width: watermarkSizeUnit === '%' ? `${watermarkSize}%` : `${watermarkSize}px`,
                        opacity: watermarkOpacity / 100,
                      }}
                    />
                  )}
               </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="w-full md:w-96 bg-gray-800 p-6 border-l border-gray-700 flex flex-col gap-6 overflow-y-auto">
            
            {/* Filter Presets */}
            <div className="space-y-4 border-b border-gray-700 pb-6">
                <h4 className="text-sm font-medium text-brand-400 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                    Filters
                </h4>
                <div className="grid grid-cols-4 gap-2">
                    {PRESETS.map((p) => (
                        <button 
                            key={p.name}
                            onClick={() => applyPreset(p)}
                            className="group relative flex flex-col items-center gap-1 focus:outline-none"
                        >
                            <div className="relative w-full aspect-square rounded overflow-hidden border border-gray-600 group-hover:border-brand-500 transition-colors">
                                <img 
                                    src={imageSrc} 
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: `brightness(${p.b}%) contrast(${p.c}%) saturate(${p.s}%) grayscale(${p.g}%) sepia(${p.sep}%)`
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 group-hover:text-white uppercase tracking-wide">{p.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Controls */}
            <div className="space-y-4 border-b border-gray-700 pb-6">
                <h4 className="text-sm font-medium text-brand-400 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Text Overlay
                </h4>
                
                <div>
                    <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="Enter ad copy..." 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-500"
                    />
                </div>

                {text && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Font</label>
                                <select 
                                    value={fontFamily} 
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-brand-500 outline-none"
                                >
                                    {FONTS.map(f => (
                                        <option key={f.name} value={f.value}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Color</label>
                                <input 
                                    type="color" 
                                    value={textColor} 
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="h-8 w-full rounded bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>

                         <div>
                            <label className="text-xs text-gray-400 mb-1 block">Alignment</label>
                            <div className="flex bg-gray-900 rounded border border-gray-600">
                                <button onClick={() => setTextAlign('left')} className={`flex-1 py-1.5 flex justify-center hover:bg-gray-700 ${textAlign === 'left' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => setTextAlign('center')} className={`flex-1 py-1.5 flex justify-center border-l border-r border-gray-600 hover:bg-gray-700 ${textAlign === 'center' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 15a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => setTextAlign('right')} className={`flex-1 py-1.5 flex justify-center hover:bg-gray-700 ${textAlign === 'right' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>Size</span>
                                <span>{fontSize}px</span>
                            </div>
                            <input
                                type="range" min={12} max={200} value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                            />
                        </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1"><span>Pos X</span></div>
                                <input type="range" min={0} max={100} value={textX} onChange={(e) => setTextX(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1"><span>Pos Y</span></div>
                                <input type="range" min={0} max={100} value={textY} onChange={(e) => setTextY(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-700 mt-2">
                             <div className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Shadow Effects</div>
                             <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Color</label>
                                    <input type="color" value={textShadowColor} onChange={(e) => setTextShadowColor(e.target.value)} className="h-6 w-full rounded cursor-pointer" />
                                </div>
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Blur: {textShadowBlur}px</label>
                                     <input type="range" min={0} max={20} value={textShadowBlur} onChange={(e) => setTextShadowBlur(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Offset X</label>
                                     <input type="range" min={-20} max={20} value={textShadowOffsetX} onChange={(e) => setTextShadowOffsetX(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                                </div>
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Offset Y</label>
                                     <input type="range" min={-20} max={20} value={textShadowOffsetY} onChange={(e) => setTextShadowOffsetY(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Watermark Controls */}
            <div className="space-y-4 border-b border-gray-700 pb-6">
                <h4 className="text-sm font-medium text-brand-400 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Watermark
                </h4>
                
                <div className="flex rounded-lg bg-gray-900 p-1 border border-gray-600">
                    {(['none', 'text', 'image'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setWatermarkType(type)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${watermarkType === type ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {watermarkType !== 'none' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        {watermarkType === 'text' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <input 
                                        type="text" value={watermarkText} 
                                        onChange={(e) => setWatermarkText(e.target.value)} 
                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-brand-500 outline-none"
                                        placeholder="Watermark text"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Color</label>
                                    <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} className="h-8 w-full rounded bg-transparent cursor-pointer"/>
                                </div>
                            </div>
                        )}

                        {watermarkType === 'image' && (
                            <div className="space-y-3">
                                <input 
                                    type="file" ref={watermarkFileRef}
                                    accept="image/*"
                                    onChange={handleWatermarkFileChange}
                                    className="hidden"
                                />
                                {!watermarkImage ? (
                                    <button
                                        onClick={() => watermarkFileRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-brand-500 hover:bg-gray-700/50 transition-all flex flex-col items-center gap-1 text-gray-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs">Upload Logo</span>
                                    </button>
                                ) : (
                                    <div className="relative group rounded-lg border border-gray-700 bg-gray-900 p-2 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                                            <img src={watermarkImage} alt="WM" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[10px] text-gray-400 truncate">Logo Active</p>
                                            <button onClick={() => watermarkFileRef.current?.click()} className="text-[10px] text-brand-400 font-bold hover:underline">Replace</button>
                                        </div>
                                        <button 
                                            onClick={clearWatermarkImage}
                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1"><span>Opacity</span><span>{watermarkOpacity}%</span></div>
                            <input type="range" min={0} max={100} value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-gray-300">Size</span>
                                <div className="flex bg-gray-900 rounded border border-gray-600 overflow-hidden">
                                    <button onClick={() => setWatermarkSizeUnit('%')} className={`px-2 py-0.5 text-[10px] ${watermarkSizeUnit === '%' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>%</button>
                                    <button onClick={() => setWatermarkSizeUnit('px')} className={`px-2 py-0.5 text-[10px] ${watermarkSizeUnit === 'px' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>PX</button>
                                </div>
                            </div>
                            <input 
                                type="range" min={watermarkSizeUnit === '%' ? 1 : 20} max={watermarkSizeUnit === '%' ? 100 : 800} 
                                value={watermarkSize} onChange={(e) => setWatermarkSize(Number(e.target.value))} 
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1"><span>Pos X</span></div>
                                <input type="range" min={0} max={100} value={watermarkX} onChange={(e) => setWatermarkX(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1"><span>Pos Y</span></div>
                                <input type="range" min={0} max={100} value={watermarkY} onChange={(e) => setWatermarkY(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Adjustments */}
            <div className="space-y-4 border-b border-gray-700 pb-6">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">Adjustments</h4>
              <div className="space-y-3">
                {['Zoom', 'Brightness', 'Contrast', 'Saturation', 'Grayscale', 'Sepia'].map(label => {
                  const stateMap: any = { Zoom: [zoom, setZoom, 1, 3, 0.1], Brightness: [brightness, setBrightness, 0, 200, 1], Contrast: [contrast, setContrast, 0, 200, 1], Saturation: [saturation, setSaturation, 0, 200, 1], Grayscale: [grayscale, setGrayscale, 0, 100, 1], Sepia: [sepia, setSepia, 0, 100, 1] };
                  const [val, setter, min, max, step] = stateMap[label];
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-300 mb-1"><span>{label}</span><span>{val}{label === 'Zoom' ? 'x' : '%'}</span></div>
                      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Download Options */}
            <div className="mt-auto pt-4 space-y-4">
               <div>
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wide">Export Format</label>
                  <div className="flex rounded-lg bg-gray-900 p-1 border border-gray-700">
                      {(['png', 'jpeg', 'webp'] as const).map(f => (
                          <button
                              key={f}
                              onClick={() => setExportFormat(f)}
                              className={`flex-1 py-1.5 text-xs font-bold rounded uppercase transition-all ${exportFormat === f ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                              {f}
                          </button>
                      ))}
                  </div>
               </div>

               {exportFormat !== 'png' && (
                   <div className="animate-in fade-in slide-in-from-bottom-2">
                       <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>Quality</span>
                           <span>{Math.round(exportQuality * 100)}%</span>
                       </div>
                       <input 
                           type="range" min={0.1} max={1.0} step={0.01} 
                           value={exportQuality} onChange={(e) => setExportQuality(Number(e.target.value))} 
                           className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                       />
                   </div>
               )}

              <div className="space-y-3 pt-2">
                <Button onClick={handleDownload} className="w-full justify-center py-3 shadow-brand-900/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export & Download
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full justify-center">
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};