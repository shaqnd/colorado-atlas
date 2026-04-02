import rawArticles from './nakedDenverArticles.json';

export interface NakedDenverArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  summary?: string | null;
  developmentType?: string | null;
  tags?: string[];
}

export const NAKED_DENVER_ARTICLES: NakedDenverArticle[] = (rawArticles as NakedDenverArticle[]).filter(
  (article) =>
    typeof article?.id === 'string' &&
    typeof article?.title === 'string' &&
    typeof article?.url === 'string',
);

export const NAKED_DENVER_MAPPED_ARTICLES = NAKED_DENVER_ARTICLES.filter(
  (article): article is NakedDenverArticle & { lat: number; lng: number } =>
    typeof article.lat === 'number' && Number.isFinite(article.lat) &&
    typeof article.lng === 'number' && Number.isFinite(article.lng),
);
