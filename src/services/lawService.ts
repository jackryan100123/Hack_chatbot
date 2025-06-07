import bnsData from '../data/laws/bns.json';
import bnssData from '../data/laws/bnss.json';
import bsaData from '../data/laws/bsa.json';

interface LawSection {
  number: string;
  title: string;
  description: string;
  keywords?: string[];
  punishment?: string;
  examples?: string[];
  law?: string;
}

const normalize = (text: string): string => text.toLowerCase().trim();

const matchesQuery = (section: any, query: string): boolean => {
  const q = normalize(query);

  return (
    normalize(section.title).includes(q) ||
    normalize(section.description).includes(q) ||
    (section.keywords && section.keywords.some((k: string) => normalize(k).includes(q)))
  );
};

export const searchLaws = (query: string): LawSection[] => {
  const q = normalize(query);
  const allResults: LawSection[] = [];

  // Search BNS
  const bnsMatches = bnsData.sections.filter(section => matchesQuery(section, q));
  allResults.push(...bnsMatches.map(s => ({ ...s, law: 'BNS' })));

  // Search BNSS
  const bnssMatches = bnssData.sections.filter(section => matchesQuery(section, q));
  allResults.push(...bnssMatches.map(s => ({ ...s, law: 'BNSS' })));

  // Search BSA
  const bsaMatches = bsaData.sections.filter(section => matchesQuery(section, q));
  allResults.push(...bsaMatches.map(s => ({ ...s, law: 'BSA' })));

  return allResults;
};

export const getLawSection = (law: string, sectionNumber: string): LawSection | null => {
  switch (law.toUpperCase()) {
    case 'BNS':
      return bnsData.sections.find(s => s.number === sectionNumber) || null;
    case 'BNSS':
      return bnssData.sections.find(s => s.number === sectionNumber) || null;
    case 'BSA':
      return bsaData.sections.find(s => s.number === sectionNumber) || null;
    default:
      return null;
  }
};
