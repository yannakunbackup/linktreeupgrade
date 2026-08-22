import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  isRecommended: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type ProductCategory = 'base-code' | 'design-grafis' | 'project-preset';

export const COLLECTION_MAP: Record<ProductCategory, string> = {
  'base-code': 'baseCodeProducts',
  'design-grafis': 'designGrafisProducts',
  'project-preset': 'projectPresetProducts',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'base-code': 'Base Code',
  'design-grafis': 'Design Grafis',
  'project-preset': 'Project & Preset',
};

export interface ProductWithCategory extends Product {
  category: ProductCategory;
  categoryLabel: string;
}
