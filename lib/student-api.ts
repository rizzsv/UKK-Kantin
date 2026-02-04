// Student API with proper endpoint structure
const BASE_URL = '/api'; // Proxy to https://ukk-p2.smktelkom-mlg.sch.id/api

export interface Student {
  id: number;
  nama_siswa: string;
  alamat: string;
  telp: string;
  foto: string | null;
  id_user: number;
  maker_id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

class StudentApiClient {
  private token: string = '';
  private makerID: string = '1';

  setToken(token: string) {
    this.token = token;
  }

  setMakerID(makerID: string) {
    this.makerID = makerID;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'makerID': this.makerID,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // GET all students (endpoint: POST /get_siswa with empty search)
  async getAllStudents(): Promise<ApiResponse<Student[]>> {
    const formData = new FormData();
    formData.append('search', ''); // Empty search to get all students

    return this.request<Student[]>('/get_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // POST search students (endpoint: POST /get_siswa with search body)
  async searchStudents(search: string): Promise<ApiResponse<Student[]>> {
    const formData = new FormData();
    formData.append('search', search);

    return this.request<Student[]>('/get_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // POST create new student (endpoint: POST /tambah_siswa)
  async createStudent(data: {
    nama_siswa: string;
    alamat: string;
    telp: string;
    username: string;
    password: string;
    foto?: File;
  }): Promise<ApiResponse<Student>> {
    const formData = new FormData();
    formData.append('nama_siswa', data.nama_siswa);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.telp);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request<Student>('/tambah_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // POST update student (endpoint: POST /ubah_siswa/:id)
  async updateStudent(
    id: number,
    data: {
      nama_siswa: string;
      alamat: string;
      telp: string;
      username: string;
      foto?: File;
    }
  ): Promise<ApiResponse<Student>> {
    const formData = new FormData();
    formData.append('nama_siswa', data.nama_siswa);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.telp);
    formData.append('username', data.username);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return this.request<Student>(`/ubah_siswa/${id}`, {
      method: 'POST',
      body: formData,
    });
  }

  // DELETE student (endpoint: DELETE /hapus_siswa/:id)
  async deleteStudent(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/hapus_siswa/${id}`, {
      method: 'DELETE',
    });
  }
}

export const studentApiClient = new StudentApiClient();
