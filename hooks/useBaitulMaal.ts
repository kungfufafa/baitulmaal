import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPaymentMethods, 
  fetchMemberPrayers, 
  postMemberPrayer, 
  toggleAmen, 
  fetchVideos, 
  fetchArticles, 
  submitDonation 
} from '../lib/api/services';
import { 
  MOCK_PAYMENT_METHODS, 
  MOCK_MEMBER_PRAYERS, 
  MOCK_VIDEOS, 
  MOCK_ARTICLES 
} from '../lib/mock-data';
import { MemberPrayer, Donation } from '../types';

// Feature flag for using real API vs Mock Data
// Set to true to test API integration
const USE_REAL_API = false;

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
    onSuccess: (newPrayer) => {
      queryClient.setQueryData(['member-prayers', 1], (oldData: MemberPrayer[] | undefined) => {
        return oldData ? [newPrayer, ...oldData] : [newPrayer];
      });
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
     onSuccess: (_, prayerId) => {
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
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...data as any // Cast for mock convenience
      };
      
      return simulateApiCall(mockDonation);
    },
  });
};
