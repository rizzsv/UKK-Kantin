const BASE_URL = '/api'; // Use proxy instead of direct URL

export interface MenuItem {
  id: number | null;
  nama: string;
  harga: number;
  deskripsi: string;
  foto: string;
  kategori: 'makanan' | 'minuman';
  stok?: number;
  // New fields from API response
  food_name?: string;
  price?: number;
  type?: 'food' | 'drink';
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
  status: 'dikemas' | 'dikirim' | 'selesai';
  tanggal: string;
  siswa?: {
    nama_siswa: string;
    kelas: string;
  };
  menu?: MenuItem;
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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
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
      return response.json();
    }
    
    // Return empty object if no JSON response
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
  }): Promise<any> {
    return this.request('/pesan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async getOrdersByStatus(status: string = 'dimasak'): Promise<Order[]> {
    return this.request(`/showorder/${status}`);
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
}

export const apiClient = new ApiClient();
