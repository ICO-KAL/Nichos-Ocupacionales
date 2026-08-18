import { create } from "zustand";
import { api, mensajeDeError } from '@/lib/api/client';
import type { JobType, Offer } from '../types/offers';

interface OffersState {
    offers: Offer[];
    jobTypes: JobType[];
    selectedJobType: string | null;
    isLoading: boolean;
    error: string | null;
    //funcion para obtener ofertas, acepta paramentro opcionales para los filtros
    fetchOffers: (jobTypeKey?: string, contractType?: string) => Promise<void>;
    fetchJobTypes: () => Promise<void>;
    setJobTypeFilter: (key: string | null) => void;
}

export const useOffersStore = create<OffersState>((set, get) => ({
  offers: [],
  jobTypes: [],
  selectedJobType: null,
  isLoading: false,
  error: null,

  fetchOffers: async (jobTypeKey, contractType) => {
    // 1. Iniciamos el estado de carga y limpiamos errores previos
    set({ isLoading: true, error: null });

    try {
      // 2. Construimos los parámetros de consulta si el usuario filtró la búsqueda
      const params = new URLSearchParams();
      if (jobTypeKey) params.append('jobTypeKey', jobTypeKey);
      if (contractType) params.append('contractType', contractType);

      const queryString = params.toString();
      const endpoint = queryString ? `/offers?${queryString}` : '/offers';

      // 3. Hacemos la petición al API
      const response = await api.get<Offer[]>(endpoint);

      // 4. Validamos la respuesta y actualizamos el estado
      if (response.data && response.data.ok) {
        set({ offers: response.data.data, isLoading: false });
      } else {
        set({ error: 'No se pudieron cargar las ofertas.', isLoading: false });
      }
    } catch (error) {
      set({ error: mensajeDeError(error), isLoading: false });
    }
  },
  fetchJobTypes: async () => {
    try {
        const response = await api.get<JobType[]>('/job-types');
        if (response.data && response.data.ok) {
            const activeTypes = response.data.data.filter((jt: JobType) => jt.active);
            set({ jobTypes: activeTypes})
        }
    } catch (error) {
        console.error("Error cargando tipos de trabajo", error);
    }
  },

  setJobTypeFilter: (key) => {
    set({selectedJobType: key});
    //al cambiar el filtro, disparammos la busqueda de ofertas automaticamente
    get().fetchOffers(key || undefined);

  }
}));