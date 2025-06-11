import React, { useState, useEffect } from 'react';

interface SpeechInputProps {
  onTextChange: (text: string, language: string) => void;
  onError: (error: any) => void;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({ onTextChange, onError }) => {
  // ... component implementation ...
}; 