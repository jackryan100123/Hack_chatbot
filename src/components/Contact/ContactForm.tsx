import React, { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle } from 'lucide-react';
import { ContactFormData } from '../../types';
import Button from '../ui/Button';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(t('contact.form.error'));
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            {t('contact.form.success')}
          </h3>
          <p className="text-neutral-600">
            We will get back to you as soon as possible.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => setSuccess(false)}
          >
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              {t('contact.form.name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              {t('contact.form.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              {t('contact.form.subject')}
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              {t('contact.form.message')}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-accent-100 text-accent-800 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            icon={<Send className="h-4 w-4" />}
          >
            {t('contact.form.submit')}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;