// Alternative order API using fetch
interface OrderItem {
  id_menu: number;
  qty: number;
}

interface CreateOrderData {
  id_stan: number;
  pesan: OrderItem[];
}

interface OrderDetailType {
  id: number;
  id_transaksi: number;
  id_menu: number;
  qty: number;
  harga_beli: number;
  created_at: string;
  updated_at: string;
}

interface OrderDataType {
  id: number;
  tanggal: string;
  id_siswa: number;
  id_stan: number;
  status: string;
  maker_id: number;
  created_at: string;
  updated_at: string;
}

interface CreateOrderResponse {
  status: boolean;
  message: string;
  data: {
    order: OrderDataType;
    detail: OrderDetailType[];
  };
}

export const createOrderAPI = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  const token = localStorage.getItem('authToken');
  const makerID = localStorage.getItem('makerID') || '1';

  console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'makerID': makerID,
  };

  // Only add Authorization if token exists
  if (token && token.trim() !== '') {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const response = await fetch('/api/pesan', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

  const contentType = response.headers.get('content-type');
  console.log('📄 Content-Type:', contentType);

  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Non-JSON response:', text.substring(0, 500));
    throw new Error('Server returned non-JSON response. Please check the API.');
  }

  const data = await response.json();
  console.log('✅ Parsed response:', data);

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};
