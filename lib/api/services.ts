import apiClient from './client';
import { 
  PaymentMethod, 
  MemberPrayer, 
  Video, 
  Article, 
  Donation 
} from '../../types';

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/payment-methods');
  return response.data;
};

export const fetchMemberPrayers = async (page = 1): Promise<MemberPrayer[]> => {
  const response = await apiClient.get<MemberPrayer[]>('/member-prayers', {
    params: { page },
  });
  return response.data;
};

export const postMemberPrayer = async (content: string, isAnonymous: boolean): Promise<MemberPrayer> => {
  const response = await apiClient.post<MemberPrayer>('/member-prayers', {
    content,
    isAnonymous,
  });
  return response.data;
};

export const toggleAmen = async (prayerId: string): Promise<{ success: boolean; likesCount: number }> => {
  const response = await apiClient.post<{ success: boolean; likesCount: number }>(`/member-prayers/${prayerId}/amen`);
  return response.data;
};

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await apiClient.get<Video[]>('/videos');
  return response.data;
};

export const fetchArticles = async (): Promise<Article[]> => {
  const response = await apiClient.get<Article[]>('/articles');
  return response.data;
};

export const submitDonation = async (data: Partial<Donation>): Promise<Donation> => {
  const response = await apiClient.post<Donation>('/donations', data);
  return response.data;
};
