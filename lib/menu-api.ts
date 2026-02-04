// New Menu API with proper endpoint structure
const BASE_URL = '/api'; // Proxy to https://ukk-p2.smktelkom-mlg.sch.id/api

export interface MenuItemNew {
  id: number | null;
  nama_makanan: string;
  harga: number;
  jenis: 'makanan' | 'minuman';
  foto: string;
  deskripsi: string;
  id_stan?: number;
  stall_id?: number;
  maker_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Alternative field names from API
  food_name?: string;
  price?: number;
  type?: 'food' | 'drink';
  photo?: string;
  description?: string;
  id_menu?: number;
  menu_id?: number;
  // Discount fields
  discount_name?: string | null;
  discount_percentage?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  discount_id?: number | null;
}

export interface ApiResponse<T> {
  status: boolean | string;
  message: string;
  data: T;
}

class MenuApiClient {
  private token: string = '';
  private makerID: string = '1';

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken') || '';
    }
    return this.token;
  }

  setMakerID(makerID: string) {
    this.makerID = makerID;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      makerID: this.makerID,
    };

    // Always try to get the latest token
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Sending request with token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token available for request');
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Silakan login terlebih dahulu.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET all menus (showmenu endpoint)
  async getAllMenus(): Promise<ApiResponse<MenuItemNew[]>> {
    return this.request<MenuItemNew[]>('/showmenu', {
      method: 'POST',
    });
  }

  // GET food menu with search
  async getFoodMenu(search: string = ''): Promise<ApiResponse<MenuItemNew[]>> {
    const formData = new FormData();
    formData.append('search', search);
    
    return this.request<MenuItemNew[]>('/getmenufood', {
      method: 'POST',
      body: formData,
    });
  }

  // GET beverage menu with search
  async getBeverageMenu(search: string = ''): Promise<ApiResponse<MenuItemNew[]>> {
    const formData = new FormData();
    formData.append('search', search);
    
    return this.request<MenuItemNew[]>('/getmenudrink', {
      method: 'POST',
      body: formData,
    });
  }

  // GET menu detail by ID
  async getMenuDetail(id: number): Promise<ApiResponse<MenuItemNew>> {
    return this.request<MenuItemNew>(`/detail_menu/${id}`, {
      method: 'GET',
    });
  }

  // POST create new menu (tambahmenu endpoint)
  async createMenu(data: {
    nama_makanan: string;
    harga: number;
    jenis: 'makanan' | 'minuman';
    deskripsi: string;
    foto?: File;
    id_stan?: number;
  }): Promise<ApiResponse<MenuItemNew>> {
    const formData = new FormData();
    // Use Indonesian field names as backend expects
    formData.append('nama_makanan', data.nama_makanan);
    formData.append('harga', data.harga.toString());
    formData.append('jenis', data.jenis);
    formData.append('deskripsi', data.deskripsi);
    if (data.foto) {
      formData.append('foto', data.foto);
    }
    if (data.id_stan) {
      formData.append('id_stan', data.id_stan.toString());
    }
    // Add maker_id from the client state
    formData.append('maker_id', this.makerID);

    return this.request<MenuItemNew>('/tambahmenu', {
      method: 'POST',
      body: formData,
    });
  }

  // POST update menu (updatemenu endpoint)
  async updateMenu(
    id: number,
    data: {
      nama_makanan: string;
      harga: number;
      jenis: 'makanan' | 'minuman';
      deskripsi: string;
      foto?: File;
      id_stan?: number;
    }
  ): Promise<ApiResponse<MenuItemNew>> {
    const formData = new FormData();
    // Use Indonesian field names as backend expects
    formData.append('nama_makanan', data.nama_makanan);
    formData.append('harga', data.harga.toString());
    formData.append('jenis', data.jenis);
    formData.append('deskripsi', data.deskripsi);
    // Photo is optional on update
    if (data.foto) {
      formData.append('foto', data.foto);
    }
    // Add maker_id from the client state
    formData.append('maker_id', this.makerID);
    // Add id_stan if provided
    if (data.id_stan) {
      formData.append('id_stan', data.id_stan.toString());
    }

    return this.request<MenuItemNew>(`/updatemenu/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  // DELETE menu (hapus_menu endpoint)
  async deleteMenu(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/hapus_menu/${id}`, {
      method: 'DELETE',
    });
  }

  // POST insert menu discount (insert_menu_diskon endpoint)
  async insertMenuDiscount(data: {
    id_diskon: number;
    id_menu: number;
  }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('id_diskon', data.id_diskon.toString());
    formData.append('id_menu', data.id_menu.toString());

    return this.request<any>('/insert_menu_diskon', {
      method: 'POST',
      body: formData,
    });
  }

  // POST get menu discounts (getmenudiskon endpoint)
  async getMenuDiscounts(search: string = ''): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request<any>('/getmenudiskon', {
      method: 'POST',
      body: formData,
    });
  }
}

export const menuApiClient = new MenuApiClient();
