import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApiClient, Student, ApiResponse } from './student-api';

// Query Keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  detail: (id: number) => [...studentKeys.all, 'detail', id] as const,
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

// Create Student Mutation
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      student_name: string;
      address: string;
      phone: string;
      username: string;
      password: string;
      photo?: File;
    }) => studentApiClient.createStudent(data),
    onSuccess: () => {
      // Invalidate and refetch students after creating
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
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
    },
  });
}
