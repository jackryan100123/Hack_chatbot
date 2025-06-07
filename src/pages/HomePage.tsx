import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import About from '../components/Home/About';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Hero />
      <Features />
      <About />
    </div>
  );
};

export default HomePage;