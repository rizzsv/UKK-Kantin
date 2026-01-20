// Student API with proper endpoint structure
const BASE_URL = '/api'; // Proxy to https://ukk-p2.smktelkom-mlg.sch.id/api

export interface Student {
  id: number;
  student_name: string;
  address: string;
  phone: string;
  photo: string | null;
  user_id: number;
  maker_id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: boolean | string;
  message: string;
  data: T;
}

class StudentApiClient {
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

  // POST get all students (correct endpoint: /get_all_siswa)
  async getAllStudents(): Promise<ApiResponse<Student[]>> {
    const formData = new FormData();
    formData.append('search', ''); // Empty search to get all students
    
    return this.request<Student[]>('/get_all_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // POST create new student (endpoint: /tambah_siswa with correct field names)
  async createStudent(data: {
    student_name: string;
    address: string;
    phone: string;
    username: string;
    password: string;
    photo?: File;
  }): Promise<ApiResponse<Student>> {
    const formData = new FormData();
    // Map to backend expected field names
    formData.append('nama_siswa', data.student_name);
    formData.append('alamat', data.address);
    formData.append('telp', data.phone);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    formData.append('maker_id', this.makerID);

    return this.request<Student>('/tambah_siswa', {
      method: 'POST',
      body: formData,
    });
  }

  // DELETE student (correct endpoint: /delete_siswa)
  async deleteStudent(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/delete_siswa/${id}`, {
      method: 'DELETE',
    });
  }
}

export const studentApiClient = new StudentApiClient();
