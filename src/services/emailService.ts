import emailjs from '@emailjs/browser';
import { ContactFormData } from '../types';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendEmail = async (formData: ContactFormData): Promise<void> => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('Email service configuration is missing');
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
      PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};