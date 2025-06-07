import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone } from 'lucide-react';
import ContactForm from '../components/Contact/ContactForm';
import EmergencyContacts from '../components/Contact/EmergencyContacts';
import emergencyContacts from '../data/emergencyContacts';
import { ContactFormData } from '../types';
import { sendEmail } from '../services/emailService';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  const handleSubmit = async (data: ContactFormData) => {
    try {
      await sendEmail(data);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          {t('contact.title')}
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-primary-800 text-white p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:support@policeassistant.gov.in" className="text-primary-200 hover:text-white">
                      support@policeassistant.gov.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:1800123456" className="text-primary-200 hover:text-white">
                      1800-123-456
                    </a>
                    <p className="text-sm text-primary-300">Monday to Friday, 9am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>
            
            <EmergencyContacts contacts={emergencyContacts} />
          </div>
          
          <div>
            <ContactForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;