import React from 'react';
import { FileText, Download, File, FolderOpen, ScrollText } from 'lucide-react';
import { LawBooklet } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface DownloadCardProps {
  booklet: LawBooklet;
}

const DownloadCard: React.FC<DownloadCardProps> = ({ booklet }) => {
  const { t } = useTranslation();
  
  const getIcon = () => {
    switch (booklet.category) {
      case 'BNS':
        return <FileText className="h-10 w-10 text-primary-600" />;
      case 'BNSS':
        return <FileText className="h-10 w-10 text-secondary-600" />;
      case 'BSA':
        return <FileText className="h-10 w-10 text-accent-600" />;
      case 'SOP':
        return <ScrollText className="h-10 w-10 text-yellow-600" />;
      case 'FORMS':
        return <FolderOpen className="h-10 w-10 text-purple-600" />;
      default:
        return <File className="h-10 w-10 text-neutral-600" />;
    }
  };
  
  const getCategoryColor = () => {
    switch (booklet.category) {
      case 'BNS':
        return 'bg-primary-100 text-primary-800';
      case 'BNSS':
        return 'bg-secondary-100 text-secondary-800';
      case 'BSA':
        return 'bg-accent-100 text-accent-800';
      case 'SOP':
        return 'bg-yellow-100 text-yellow-800';
      case 'FORMS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const handleDownload = () => {
    let fileUrl = '';
    switch (booklet.category) {
      case 'SOP':
        fileUrl = `/downloads/SOP/${booklet.filename}`;
        break;
      case 'FORMS':
        fileUrl = `/downloads/Forms/${booklet.filename}`;
        break;
      default:
        fileUrl = `/downloads/${booklet.category.toLowerCase()}/${booklet.filename}`;
        break;
    }
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = booklet.filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card hoverable className="h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start">
          <div className="bg-neutral-100 p-3 rounded-lg">
            {getIcon()}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor()}`}>
            {booklet.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2 text-neutral-800">{booklet.title}</h3>
        <p className="text-neutral-600 text-sm mb-4">{booklet.description}</p>
        
        <div className="text-xs text-neutral-500 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">{booklet.fileType}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium">{booklet.fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Language:</span>
            <span className="font-medium">{booklet.language}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <Button
          variant="primary"
          className="w-full"
          icon={<Download className="h-4 w-4" />}
          onClick={handleDownload}
        >
          {t('downloads.downloadBtn')}
        </Button>
      </div>
    </Card>
  );
};

export default DownloadCard;