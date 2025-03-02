interface ApiResponse<T> {
  data?: T
  error?: string
}

export const ApiClient = {
  async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data }; // API yanıtını direkt olarak data property'sine atıyoruz
    } catch (error) {
      console.error('API Client Error:', error);
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }
}; 