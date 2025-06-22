import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIEnhanceButtonProps {
  fieldType: string;
  currentText: string;
  contextData: any;
  onEnhanced: (enhancedText: string) => void;
  disabled?: boolean;
  size?: 'sm' ;
}

export function AIEnhanceButton({ 
  fieldType, 
  currentText, 
  contextData, 
  onEnhanced, 
  disabled = false,
  size = 'sm'
}: AIEnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!currentText.trim() && fieldType !== 'handlingNotes' && fieldType !== 'specifications') {
      toast.error('Please enter some text first');
      return;
    }

    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldType,
          currentText: currentText.trim(),
          contextData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      
      if (data.success && data.enhancedText) {
        onEnhanced(data.enhancedText);
        toast.success('Text enhanced successfully!');
      } else {
        throw new Error('No enhanced text received');
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('Failed to enhance text. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="relative">
      {/* Sparkle animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-70 animation-delay-300"></div>
        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-70 animation-delay-600"></div>
        <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-70 animation-delay-900"></div>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={handleEnhance}
        disabled={disabled || isEnhancing}
        className={`
          ${size === 'sm' ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'}
          text-purple-600 hover:text-purple-700 hover:bg-purple-50
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-lg hover:shadow-purple-200/50
          active:scale-95
          relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-r 
          before:from-purple-500/20 before:via-blue-500/20 before:to-pink-500/20
          before:opacity-0 before:transition-opacity before:duration-300
          hover:before:opacity-100
          group
        `}
        title="Enhance with AI"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {isEnhancing ? (
          <Loader2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin text-purple-600`} />
        ) : (
          <Sparkles className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-pulse group-hover:animate-bounce transition-all duration-200`} />
        )}
      </Button>
      
      {/* Enhanced glow effect */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
    </div>
  );
}