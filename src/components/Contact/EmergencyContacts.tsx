import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, AlertTriangle } from 'lucide-react';
import { EmergencyContact } from '../../types';
import Card from '../ui/Card';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ contacts }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-accent-600 mr-2" />
          <h2 className="text-lg font-semibold text-neutral-800">
            {t('contact.emergency.title')}
          </h2>
        </div>
        
        <p className="text-neutral-600 mb-6">
          {t('contact.emergency.description')}
        </p>
        
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="flex items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-accent-300 transition-colors"
            >
              <div className="bg-accent-100 p-2 rounded-full mr-3">
                <Phone className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">{contact.name}</h3>
                <div className="flex items-center">
                  <a 
                    href={`tel:${contact.number}`}
                    className="text-accent-600 font-bold text-lg"
                  >
                    {contact.number}
                  </a>
                  <span className="text-xs text-neutral-500 ml-3">
                    {contact.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default EmergencyContacts;