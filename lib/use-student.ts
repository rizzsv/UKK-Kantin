import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApiClient, Student, ApiResponse } from './student-api';

// Query Keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  detail: (id: number) => [...studentKeys.all, 'detail', id] as const,
  search: (query: string) => [...studentKeys.all, 'search', query] as const,
};

// Get All Students
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.lists(),
    queryFn: async () => {
      const response = await studentApiClient.getAllStudents();
      return response.data;
    },
  });
}

// Search Students
export function useSearchStudents(searchQuery: string) {
  return useQuery({
    queryKey: studentKeys.search(searchQuery),
    queryFn: async () => {
      const response = await studentApiClient.searchStudents(searchQuery);
      return response.data;
    },
    enabled: searchQuery.trim().length > 0, // Only run search when there's a query
  });
}

// Create Student Mutation
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      nama_siswa: string;
      alamat: string;
      telp: string;
      username: string;
      password: string;
      foto?: File;
    }) => studentApiClient.createStudent(data),
    onSuccess: () => {
      // Invalidate and refetch students after creating
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

// Update Student Mutation
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: {
        nama_siswa: string;
        alamat: string;
        telp: string;
        username: string;
        foto?: File;
      };
    }) => studentApiClient.updateStudent(id, data),
    onSuccess: () => {
      // Invalidate and refetch students after updating
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

// Delete Student Mutation
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentApiClient.deleteStudent(id),
    onSuccess: () => {
      // Invalidate students list after deletion
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}
