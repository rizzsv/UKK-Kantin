import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApiClient, MenuItemNew, ApiResponse } from './menu-api';

// Query Keys
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters: string) => [...menuKeys.lists(), { filters }] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: number) => [...menuKeys.details(), id] as const,
};

// Custom Hooks

// Get All Menus
export function useMenus() {
  return useQuery({
    queryKey: menuKeys.lists(),
    queryFn: async () => {
      const response = await menuApiClient.getAllMenus();
      return response.data;
    },
  });
}

// Get Menu Detail
export function useMenuDetail(id: number) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: async () => {
      const response = await menuApiClient.getMenuDetail(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create Menu Mutation
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      nama_makanan: string;
      harga: number;
      jenis: 'makanan' | 'minuman';
      deskripsi: string;
      foto?: File;
      id_stan?: number;
    }) => menuApiClient.createMenu(data),
    onSuccess: () => {
      // Invalidate and refetch menus after creating
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}

// Update Menu Mutation
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        nama_makanan: string;
        harga: number;
        jenis: 'makanan' | 'minuman';
        deskripsi: string;
        foto?: File;
        id_stan?: number;
      };
    }) => menuApiClient.updateMenu(id, data),
    onSuccess: (_, variables) => {
      // Invalidate list and specific detail
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(variables.id) });
    },
  });
}

// Delete Menu Mutation
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => menuApiClient.deleteMenu(id),
    onSuccess: () => {
      // Invalidate menus list after deletion
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}
