import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPaymentMethods, 
  fetchMemberPrayers, 
  postMemberPrayer, 
  toggleAmen, 
  fetchVideos, 
  fetchArticles, 
  submitDonation,
  fetchDonationHistory,
  fetchDonationConfig,
  calculateZakat,
} from '../lib/api/services';
import { 
  MOCK_PAYMENT_METHODS, 
  MOCK_MEMBER_PRAYERS, 
  MOCK_VIDEOS, 
  MOCK_ARTICLES 
} from '../lib/mock-data';
import { MemberPrayer, Donation, DonationConfig, ZakatCalculationPayload, ZakatCalculationResult } from '../types';

const USE_REAL_API = !__DEV__ || true;

// Simulated delay for mock data
const SIMULATED_DELAY = 1000;

const simulateApiCall = async <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, SIMULATED_DELAY);
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchPaymentMethods();
      }
      return simulateApiCall(MOCK_PAYMENT_METHODS);
    },
  });
};

export const useMemberPrayers = (page = 1) => {
  return useQuery({
    queryKey: ['member-prayers', page],
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchMemberPrayers(page);
      }
      return simulateApiCall(MOCK_MEMBER_PRAYERS);
    },
  });
};

export const usePostMemberPrayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, isAnonymous }: { content: string; isAnonymous: boolean }) => {
      if (USE_REAL_API) {
        return postMemberPrayer(content, isAnonymous);
      }
      
      const newPrayer: MemberPrayer = {
        id: `prayer_${Date.now()}`,
        user: {
          id: 'current_user',
          name: isAnonymous ? 'Hamba Allah' : 'User', 
          avatarUrl: isAnonymous ? undefined : 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        },
        content,
        isAnonymous,
        likesCount: 0,
        status: 'published',
        createdAt: new Date().toISOString(),
      };
      
      return simulateApiCall(newPrayer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-prayers'] });
    },
  });
};

export const useAmenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerId: string) => {
      if (USE_REAL_API) {
        return toggleAmen(prayerId);
      }
      // Mock toggling amen logic
      return simulateApiCall({ success: true, likesCount: 0 }); 
    },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['member-prayers'] });
     }
  });
};

export const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchVideos();
      }
      return simulateApiCall(MOCK_VIDEOS);
    },
  });
};

export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchArticles();
      }
      return simulateApiCall(MOCK_ARTICLES);
    },
  });
};

export const useDonationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Donation>) => {
      if (USE_REAL_API) {
        return submitDonation(data);
      }
      
      const mockDonation: Donation = {
        id: `donation_${Date.now()}`,
        type: 'donation',
        category: data.category || 'infak',
        paymentType: data.paymentType || 'umum',
        amount: data.amount || 0,
        paymentMethodId: data.paymentMethodId || '',
        paymentMethod: data.paymentMethod,
        paymentMethodName: data.paymentMethodName,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      return simulateApiCall(mockDonation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-history'] });
    },
  });
};

export const useDonationConfig = () => {
  return useQuery({
    queryKey: ['donation-config'],
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchDonationConfig();
      }

      const mockConfig: DonationConfig = {
        categories: [
          {
            key: 'zakat',
            label: 'Zakat',
            paymentTypes: [
              { key: 'maal', label: 'Zakat Maal' },
              { key: 'fitrah', label: 'Zakat Fitrah' },
              { key: 'profesi', label: 'Zakat Profesi' },
            ],
          },
          {
            key: 'infak',
            label: 'Infak',
            paymentTypes: [
              { key: 'kemanusiaan', label: 'Infak Kemanusiaan' },
              { key: 'umum', label: 'Infak Umum' },
            ],
          },
          {
            key: 'sedekah',
            label: 'Sedekah',
            paymentTypes: [
              { key: 'jariyah', label: 'Sedekah Jariyah' },
              { key: 'umum', label: 'Sedekah Umum' },
            ],
          },
        ],
        contexts: {
          infak: [
            { slug: 'infak-pendidikan', label: 'Infak Pendidikan' },
            { slug: 'infak-kemanusiaan', label: 'Infak Kemanusiaan' },
          ],
          sedekah: [
            { slug: 'sedekah-jariyah', label: 'Sedekah Jariyah' },
            { slug: 'sedekah-subuh', label: 'Sedekah Subuh' },
          ],
        },
        zakat: {
          calculatorTypes: [
            { key: 'fitrah', label: 'Zakat Fitrah' },
            { key: 'maal', label: 'Zakat Maal' },
            { key: 'profesi', label: 'Zakat Profesi' },
          ],
          defaults: {
            fitrahRiceKgPerPerson: 2.5,
            maalNisabGoldGrams: 85,
            profesiNisabGoldGrams: 85,
          },
        },
        recommendedAmounts: [25000, 50000, 100000, 250000, 500000, 1000000],
      };

      return simulateApiCall(mockConfig);
    },
  });
};

export const useZakatCalculator = () => {
  return useMutation({
    mutationFn: async (payload: ZakatCalculationPayload): Promise<ZakatCalculationResult> => {
      if (USE_REAL_API) {
        return calculateZakat(payload);
      }

      return simulateApiCall({
        type: payload.type,
        recommendedAmount: 0,
        isObligatory: false,
        summary: 'Mock calculator',
        breakdown: {},
      });
    },
  });
};

export const useDonationHistory = (guestToken?: string, enabled = true) => {
  return useQuery({
    queryKey: ['donation-history', guestToken ?? 'auth'],
    enabled,
    queryFn: async () => {
      if (USE_REAL_API) {
        return fetchDonationHistory(guestToken);
      }

      return simulateApiCall([]);
    },
  });
};
