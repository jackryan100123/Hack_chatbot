import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

export interface ProcessedDocument {
  content: string;
  metadata: {
    type: string;
    title: string;
    date?: string;
  };
}

export class FileService {
  private readonly API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      let text = '';

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        // Extract text from each page
        // Note: This is a simplified version. You might want to use a more robust PDF parsing library
        text += `Page ${i + 1}\n`;
      }

      return text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  private async analyzeDocument(text: string): Promise<ProcessedDocument> {
    try {
      if (!this.API_KEY) throw new Error('GROQ API key is not configured');

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a legal document analyzer. Analyze the provided text and extract:
1. Document type (law, FIR, or complaint)
2. Relevant sections or articles
3. Key dates
4. Main subject matter
Format the response as a JSON object with the following structure:
{
  "type": "law|fir|complaint",
  "title": "document title",
  "sections": ["section1", "section2", ...],
  "date": "document date if available"
}`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return {
        text,
        metadata: analysis
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }

  public async processFile(file: File): Promise<ProcessedDocument> {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are supported');
      }

      // Extract text from PDF
      const text = await this.extractTextFromPDF(file);

      // Analyze document
      const analysis = await this.analyzeDocument(text);

      return analysis;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  public async queryDocument(document: ProcessedDocument, query: string): Promise<string> {
    try {
      // Simple document query implementation
      return `Response about document "${document.metadata.title}": ${query}`;
    } catch (error) {
      console.error('Error querying document:', error);
      throw error;
    }
  }
} 