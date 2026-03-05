'use client';

import { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  disabled?: boolean;
  appendMode?: boolean; // If true, appends to existing value; if false, replaces
}

export function VoiceInputButton({ 
  onTranscript, 
  className,
  disabled = false,
  appendMode = true
}: VoiceInputProps) {
  const [mounted, setMounted] = useState(false);
  
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    onResult: (transcript) => {
      onTranscript(transcript);
    },
    continuous: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or if not supported
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'bg-gray-700/50 text-gray-500 cursor-not-allowed',
          className
        )}
        title="Voice input"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'bg-gray-700/50 text-gray-500 cursor-not-allowed',
          className
        )}
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        isListening
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse ring-2 ring-red-500/50'
          : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:ring-2 hover:ring-cyan-500/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <div className="relative">
          <Mic className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}

// Wrapper component for input fields with voice capability
interface VoiceInputWrapperProps {
  children: React.ReactNode;
  onVoiceInput: (transcript: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInputWrapper({ 
  children, 
  onVoiceInput, 
  className,
  disabled = false
}: VoiceInputWrapperProps) {
  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="flex-1">
        {children}
      </div>
      <VoiceInputButton 
        onTranscript={onVoiceInput} 
        disabled={disabled}
      />
    </div>
  );
}
