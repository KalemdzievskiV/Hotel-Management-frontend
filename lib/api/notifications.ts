import apiClient from './client';

export const notificationsApi = {
  // GET /api/Notifications/web-push/key - null while browser push isn't set up on the server
  getWebPushKey: async (): Promise<string | null> => {
    try {
      const response = await apiClient.get<{ publicKey: string }>('/Notifications/web-push/key');
      return response.data.publicKey;
    } catch {
      return null;
    }
  },

  // POST /api/Notifications/web-push - links this browser to the signed-in user
  registerWebPush: async (subscription: PushSubscriptionJSON, timeZone: string): Promise<void> => {
    await apiClient.post('/Notifications/web-push', { ...subscription, timeZone });
  },

  // DELETE /api/Notifications/web-push
  unregisterWebPush: async (endpoint: string): Promise<void> => {
    await apiClient.delete('/Notifications/web-push', { data: { endpoint } });
  },
};
