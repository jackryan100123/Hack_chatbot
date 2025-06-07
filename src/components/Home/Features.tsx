import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Mic, Globe, FileText } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: t('home.features.search.title'),
      description: t('home.features.search.description'),
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: t('home.features.voice.title'),
      description: t('home.features.voice.description'),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('home.features.multilingual.title'),
      description: t('home.features.multilingual.description'),
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('home.features.downloads.title'),
      description: t('home.features.downloads.description'),
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('home.features.title')}
          </h2>
          <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;