export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawBooklet {
  id: string;
  title: string;
  description: string;
  filename: string;
  fileSize: string;
  fileType: string;
  category: 'BNS' | 'BNSS' | 'BSA' | 'OTHER';
  language: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}