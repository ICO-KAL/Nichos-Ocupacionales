import axios from 'axios';

const PUBLIC_API_URL = 'https://ocupa2.ia3x.com/apix';

type ApiResponse<T> = {
  ok: boolean;
  data: T;
};

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

async function getPublicContent<T>(path: string) {
  const response = await axios.get<ApiResponse<T>>(`${PUBLIC_API_URL}${path}`, {
    timeout: 15000,
  });

  if (!response.data.ok) {
    throw new Error('El servicio no pudo completar la solicitud.');
  }

  return response.data.data;
}

export function getNews(limit = 12) {
  return getPublicContent<NewsItem[]>(`/news?limit=${limit}`);
}

export function getVideos() {
  return getPublicContent<Video[]>('/videos');
}
