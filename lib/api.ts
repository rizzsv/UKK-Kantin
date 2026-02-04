const BASE_URL = '/api'; // Use proxy instead of direct URL

export interface MenuItem {
  id: number | null;
  nama: string;
  harga: number;
  deskripsi: string;
  foto: string;
  type: 'food' | 'drink'; // Required field from API
  kategori?: 'makanan' | 'minuman'; // Optional - legacy field
  stok?: number;
  // New fields from API response
  food_name?: string;
  price?: number;
  photo?: string;
  description?: string;
  id_stan?: number;
  stall_id?: number;
  maker_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  id_menu?: number;
  menu_id?: number;
  discount_name?: string | null;
  discount_percentage?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  discount_id?: number | null;
  // Indonesian field names
  nama_makanan?: string;
  jenis?: string;
  nama_diskon?: string | null;
  persentase_diskon?: number | null;
  tanggal_awal?: string | null;
  tanggal_akhir?: string | null;
  id_diskon?: number | null;
}

export interface Order {
  id: number;
  siswa_id: number;
  menu_id: number;
  jumlah: number;
  total_harga: number;
  status: 'dikemas' | 'dikirim' | 'selesai' | 'belum dikonfirm' | 'dimasak' | 'diantar' | 'sampai';
  tanggal: string;
  siswa?: {
    nama_siswa: string;
    kelas: string;
  };
  menu?: MenuItem;
}

export interface OrderDetail {
  id: number;
  id_transaksi: number;
  id_menu: number;
  qty: number;
  harga_beli: number;
  created_at: string;
  updated_at: string;
}

export interface OrderInfo {
  id: number;
  tanggal: string;
  id_siswa: number;
  id_stan: number;
  status: string;
  maker_id: number;
  created_at: string;
  updated_at: string;
}

export interface OrderResponse {
  order: OrderInfo;
  detail: OrderDetail[];
}

export interface Student {
  id: number;
  nama_siswa: string;
  alamat: string;
  telp: string;
  username: string;
  foto?: string;
}

export interface Stan {
  id: number;
  nama_stan: string;
  deskripsi: string;
  foto?: string;
}

class ApiClient {
  private baseURL: string;
  private makerID: string;
  private token: string;

  constructor() {
    this.baseURL = BASE_URL;
    this.makerID = '1'; // Default maker ID
    this.token = ''; // Set from localStorage or auth
  }

  setToken(token: string) {
    this.token = token;
  }

  setMakerID(makerID: string) {
    this.makerID = makerID;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: Record<string, string> = {
      makerID: this.makerID,
      ...(options.headers as Record<string, string>),
    };

    // Only add Authorization header if token exists and is not empty
    if (this.token && this.token.trim() !== '') {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    // Log request details for debugging
    console.log(`🌐 API Request:`, {
      endpoint,
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenPreview: this.token ? this.token.substring(0, 20) + '...' : 'No token',
      headers: {
        ...headers,
        Authorization: headers.Authorization ? headers.Authorization.substring(0, 30) + '...' : undefined,
      },
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📥 API Response:`, {
      endpoint,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      // Provide more specific error messages
      if (response.status === 401) {
        // Check if this is a login endpoint
        if (endpoint.includes('login')) {
          throw new Error('Username atau password salah. Silakan coba lagi.');
        } else {
          // For menu endpoints that might be public, provide a more helpful message
          if (endpoint.includes('getmenufood') || endpoint.includes('getmenuminuman')) {
            console.warn('Menu endpoint returned 401. This might be a backend configuration issue.');
            // Return empty array for menu endpoints instead of throwing
            return [];
          }
          throw new Error('Unauthorized. Silakan login terlebih dahulu.');
        }
      } else if (response.status === 404) {
        throw new Error('Endpoint tidak ditemukan.');
      } else if (response.status === 500) {
        throw new Error('Server error. Silakan coba lagi nanti.');
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ API Response JSON:`, {
        endpoint,
        hasData: !!data,
        dataType: typeof data,
      });
      return data;
    }

    // Return empty object if no JSON response
    console.log(`⚠️ API Response: No JSON content for ${endpoint}`);
    return {};
  }

  // Menu Management
  async getFoodMenu(search: string = ''): Promise<any> {
    const formData = new FormData();
    formData.append('search', search);

    const response = await this.request('/getmenufood', {
      method: 'POST',
      body: formData,
    });
    
    // Return the response as-is (may have .data wrapper)
    return response;
  }

  async getBeverageMenu(search: string = ''): Promise<any> {
    const formData = new FormData();
    formData.append('search', search);

    const response = await this.request('/getmenudrink', {
      method: 'POST',
      body: formData,
    });
    
    // Return the response as-is (may have .data wrapper)
    return response;
  }

  async getMenuDetails(id: number): Promise<MenuItem> {
    return this.request(`/detail_menu/${id}`);
  }

  async addMenu(data: {
    nama: string;
    harga: number;
    deskripsi: string;
    kategori: 'makanan' | 'minuman';
    stok: number;
    foto?: File;
  }): Promise<MenuItem> {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('harga', data.harga.toString());
    formData.append('deskripsi', data.deskripsi);
    formData.append('kategori', data.kategori);
    formData.append('stok', data.stok.toString());
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request('/tambah_menu', {
      method: 'POST',
      body: formData,
    });
  }

  async updateMenu(
    id: number,
    data: {
      nama: string;
      harga: number;
      deskripsi: string;
      kategori: 'makanan' | 'minuman';
      stok: number;
      foto?: File;
    }
  ): Promise<MenuItem> {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('harga', data.harga.toString());
    formData.append('deskripsi', data.deskripsi);
    formData.append('kategori', data.kategori);
    formData.append('stok', data.stok.toString());
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request(`/update_menu/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  async deleteMenu(id: number): Promise<void> {
    return this.request(`/delete_menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async createOrder(data: {
    id_stan: number;
    pesan: Array<{
      id_menu: number;
      qty: number;
    }>;
  }): Promise<OrderResponse> {
    const response = await this.request('/pesan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Handle response structure
    if (response && response.status && response.data) {
      return response.data;
    }
    return response;
  }

  async getOrdersByStatus(status: string = 'dimasak'): Promise<OrderResponse[]> {
    const response = await this.request(`/showorder/${status}`);

    // Handle response structure
    if (response && response.status && response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If single object, wrap in array
      return [response.data];
    }
    return [];
  }

  async getStudentOrders(): Promise<OrderResponse[]> {
    // Fetch all orders with different statuses
    // Statuses: belum dikonfirm, dimasak, diantar, sampai
    const statuses = ['belum dikonfirm', 'dimasak', 'diantar', 'sampai'];
    const allOrders: OrderResponse[] = [];

    for (const status of statuses) {
      try {
        console.log(`📋 Fetching order with status: "${status}"`);

        const response = await this.request(`/showorder/${status}`);

        console.log(`📦 Response for ${status}:`, response);

        // Handle the API response structure
        // Expected: { status: true, message: "...", data: { order: {...}, detail: [...] } }
        
        if (!response) {
          console.log(`⚠️ No response for status "${status}"`);
          continue;
        }

        // Check if the response has the expected structure
        if (response.status === true && response.data) {
          const { data } = response;
          
          // Case 1: Single order object { order: {...}, detail: [...] }
          if (data.order && Array.isArray(data.detail)) {
            const orderResponse: OrderResponse = {
              order: data.order,
              detail: data.detail
            };
            allOrders.push(orderResponse);
            console.log(`✅ Found 1 order with status "${status}" (ID: ${data.order.id})`);
          }
          // Case 2: Array of orders [{ order: {...}, detail: [...] }, ...]
          else if (Array.isArray(data)) {
            const validOrders = data
              .filter((item: any) => item.order && Array.isArray(item.detail))
              .map((item: any) => ({
                order: item.order,
                detail: item.detail
              }));
            
            if (validOrders.length > 0) {
              allOrders.push(...validOrders);
              console.log(`✅ Found ${validOrders.length} orders with status "${status}"`);
            }
          }
          else {
            console.log(`⚠️ Unexpected data structure for status "${status}":`, data);
          }
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback: response.data is directly an array
          const validOrders = response.data
            .filter((item: any) => item.order && Array.isArray(item.detail))
            .map((item: any) => ({
              order: item.order,
              detail: item.detail
            }));
          
          if (validOrders.length > 0) {
            allOrders.push(...validOrders);
            console.log(`✅ Found ${validOrders.length} orders with status "${status}"`);
          }
        } else {
          console.log(`ℹ️ No orders found with status: "${status}"`);
        }
      } catch (error) {
        console.error(`❌ Error fetching order with status "${status}":`, error);
        // Continue fetching other statuses even if one fails
      }
    }

    console.log(`📊 Total orders fetched: ${allOrders.length}`);

    // Sort by date (newest first)
    allOrders.sort((a, b) => {
      const dateA = new Date(a.order.created_at || a.order.tanggal);
      const dateB = new Date(b.order.created_at || b.order.tanggal);
      return dateB.getTime() - dateA.getTime();
    });

    return allOrders;
  }

  async getOrdersByMonthByStudent(date: string): Promise<Order[]> {
    return this.request(`/showorderbymonthbysiswa/${date}`);
  }

  async updateOrderStatus(id: number, status: string): Promise<any> {
    const formData = new FormData();
    formData.append('status', status);

    return this.request(`/updatestatus/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  async printReceipt(id: number): Promise<any> {
    return this.request(`/cetaknota/${id}`);
  }

  // Student Management
  async addStudent(data: {
    nama_siswa: string;
    alamat: string;
    telp: string;
    username: string;
    password: string;
    photo?: File;
  }): Promise<Student> {
    const formData = new FormData();
    formData.append('nama_siswa', data.nama_siswa);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.telp);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    return this.request('/tambah_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  async updateStudent(
    id: number,
    data: {
      student_name: string;
      address: string;
      phone: string;
      username: string;
      photo?: File;
    }
  ): Promise<Student> {
    const formData = new FormData();
    formData.append('student_name', data.student_name);
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    formData.append('username', data.username);
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    return this.request(`/change_student/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  async getStudentDetails(id: number): Promise<Student> {
    return this.request(`/detail_siswa/${id}`);
  }

  async getAllStudents(search: string = ''): Promise<Student[]> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request('/get_all_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteStudent(id: number): Promise<void> {
    return this.request(`/delete_siswa/${id}`, {
      method: 'DELETE',
    });
  }

  // User Profile
  async getUserProfile(): Promise<{
    id: number;
    student_name?: string;
    nama_siswa?: string;
    address?: string;
    alamat?: string;
    phone?: string;
    telp?: string;
    photo?: string | null;
    foto?: string | null;
    user_id: number;
    maker_id: number;
    created_at: string;
    updated_at: string;
    username: string;
    role: string;
  }> {
    const response = await this.request('/get_profile', {
      method: 'GET',
    });
    return response.data || response;
  }

  // Authentication
  async loginStudent(data: {
    username: string;
    password: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    return this.request('/login_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  async registerNewStudent(data: {
    nama_siswa: string;
    alamat: string;
    telp: string;
    username: string;
    password: string;
    foto?: File;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('nama_siswa', data.nama_siswa);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.telp);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request('/register_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // Stan Management
  async registerStudent(data: {
    name: string;
    school_class: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('school_class', data.school_class);

    return this.request('/reg_student', {
      method: 'POST',
      body: formData,
    });
  }

  async getMaker(): Promise<any> {
    return this.request('/get_maker');
  }

  async getAllStan(search: string = ''): Promise<Stan[]> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request('/get_all_stan', {
      method: 'POST',
      body: formData,
    });
  }

  // Stall Owner Authentication & Management
  async registerStall(data: {
    stall_name: string;
    owner_name: string;
    phone: string;
    username: string;
    password: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('nama_stan', data.stall_name);
    formData.append('nama_pemilik', data.owner_name);
    formData.append('telp', data.phone);
    formData.append('username', data.username);
    formData.append('password', data.password);

    return this.request('/register_stan', {
      method: 'POST',
      body: formData,
    });
  }

  async loginStall(data: {
    username: string;
    password: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    return this.request('/login_stan', {
      method: 'POST',
      body: formData,
    });
  }

  async updateStall(
    id: number,
    data: {
      stan_name: string;
      owner_name: string;
      phone: string;
      username: string;
    }
  ): Promise<any> {
    const formData = new FormData();
    formData.append('stan_name', data.stan_name);
    formData.append('owner_name', data.owner_name);
    formData.append('phone', data.phone);
    formData.append('username', data.username);

    return this.request(`/update_stan/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  // Reports
  async getMonthlyOrders(date: string): Promise<Order[]> {
    return this.request(`/showorderbymonth/${date}`);
  }

  async getMonthlyRevenue(date: string): Promise<any> {
    return this.request(`/rekappemasukan/${date}`);
  }

  // Admin Stan Order Management
  async getOrdersByStatusForStan(status: string): Promise<any> {
    // Endpoint: /getorder_dimasak, /getorder_belum dikonfirm, /getorder_diantar, /getorder_sampai
    return this.request(`/getorder_${status}`);
  }

  async getMonthlyRevenueByStan(date: string): Promise<any> {
    // Endpoint: /showpemasukanbybulan/2025-01-01
    return this.request(`/showpemasukanbybulan/${date}`);
  }
}

export const apiClient = new ApiClient();
