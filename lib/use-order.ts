import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createOrderAPI } from "@/lib/order-api";

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

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (body: CreateOrderData) => {
      try {
        console.log('📦 Sending order data:', body);
        
        const response = await createOrderAPI(body);

        console.log('✅ Order response:', response);
        toast.success(response.message || "Pesanan berhasil diproses!");

        return response;
      } catch (error: any) {
        console.error('❌ Order error:', error);
        
        const errorMessage = error.message || "Gagal membuat pesanan, silakan coba lagi";
        toast.error(errorMessage);

        throw error;
      }
    },
  });
};
