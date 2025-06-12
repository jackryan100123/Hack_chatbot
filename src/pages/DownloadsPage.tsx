import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { LawBooklet } from '../types';
import lawBooklets from '../data/lawBooklets';
import DownloadCard from '../components/Downloads/DownloadCard';

type Category = 'ALL' | 'BNS' | 'BNSS' | 'BSA' | 'SOP' | 'FORMS';

const DownloadsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');

  const filteredBooklets = lawBooklets.filter((booklet) => {
    const matchesSearch =
      booklet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booklet.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || booklet.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories: { value: Category; label: string }[] = [
    { value: 'ALL', label: t('downloads.categories.all') },
    { value: 'BNS', label: t('downloads.categories.bns') },
    { value: 'BNSS', label: t('downloads.categories.bnss') },
    { value: 'BSA', label: t('downloads.categories.bsa') },
    { value: 'SOP', label: t('downloads.categories.sop') },
    { value: 'FORMS', label: t('downloads.categories.forms') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          {t('downloads.title')}
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          {t('downloads.subtitle')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder={t('downloads.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  selectedCategory === category.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booklets Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredBooklets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooklets.map((booklet) => (
              <DownloadCard key={booklet.id} booklet={booklet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('downloads.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;