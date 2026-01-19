const BASE_URL = 'https://ukk-p2.smktelkom-mlg.sch.id/api';

export interface MenuItem {
  id: number;
  nama: string;
  harga: number;
  deskripsi: string;
  foto: string;
  kategori: 'makanan' | 'minuman';
  stok: number;
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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Menu Management
  async getFoodMenu(search: string = ''): Promise<MenuItem[]> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request('/getmenumakanan', {
      method: 'POST',
      body: formData,
    });
  }

  async getBeverageMenu(search: string = ''): Promise<MenuItem[]> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request('/getmenuminuman', {
      method: 'POST',
      body: formData,
    });
  }

  async getMenuDetails(id: number): Promise<MenuItem> {
    return this.request(`/detail_menu/${id}`);
  }

  async deleteMenu(id: number): Promise<void> {
    return this.request(`/delete_menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getOrdersByStatus(status: string = 'dimasak'): Promise<Order[]> {
    return this.request(`/showorder/${status}`);
  }

  async getOrdersByMonthByStudent(date: string): Promise<Order[]> {
    return this.request(`/showorderbymonthbysiswa/${date}`);
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
      nama_siswa: string;
      alamat: string;
      telp: string;
      username: string;
      foto?: File;
    }
  ): Promise<Student> {
    const formData = new FormData();
    formData.append('nama_siswa', data.nama_siswa);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.telp);
    formData.append('username', data.username);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request(`/update_student/${id}`, {
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
}

export const apiClient = new ApiClient();
