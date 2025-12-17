import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [checking, setChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  const checkKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
        if (has) {
          onKeySelected();
        }
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success as per strict instructions to mitigate race condition
        setHasKey(true);
        onKeySelected();
      }
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  if (checking) return null; // Or a subtle loader

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-brand-900/50 rounded-full flex items-center justify-center border border-brand-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636a10.389 10.389 0 01-3.636 9.364l-1.518-1.518 1.518-1.518-1.518-1.518 1.518-1.518-1.518-1.518 1.518-1.518 1.518 1.518 1.518-1.518 1.518-1.518 9.364 3.636 5.743-7.744A6 6 0 0121 9z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          To generate high-quality 4K ads with Gemini 3 Pro, you need to select a billing-enabled project.
        </p>
        
        <Button onClick={handleSelectKey} className="w-full py-3 text-lg justify-center mb-4">
          Select API Key
        </Button>
        
        <p className="text-xs text-gray-500">
          Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">Gemini API billing</a>.
        </p>
      </div>
    </div>
  );
};