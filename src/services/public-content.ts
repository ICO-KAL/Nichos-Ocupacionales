import { requestApi } from '@/lib/api/client';

export type NewsItem = {
  title: string;
  image: string;
  summary: string;
  date: string;
  url: string;
  source: string;
};

export type Video = {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  order: number;
};

export async function getNews(limit = 12) {
  const payload = await requestApi<NewsItem[]>({
    method: 'GET',
    path: '/news',
    params: { limit },
  });
  return Array.isArray(payload) ? payload : [];
}

export async function getVideos() {
  const payload = await requestApi<Video[]>({ method: 'GET', path: '/videos' });
  return Array.isArray(payload) ? payload : [];
}
