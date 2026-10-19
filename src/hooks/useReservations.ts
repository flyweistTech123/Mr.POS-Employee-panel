import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getReservations, 
  createReservation, 
  updateReservation, 
  deleteReservation 
} from '../api/reservationApi';
import type { CreateReservationPayload, UpdateReservationPayload } from '../types/reservation';

export const useReservations = () => {
  const queryClient = useQueryClient();

  // Fetch Query
  const { data: reservations = [], isLoading, isError } = useQuery({
    queryKey: ['reservations'],
    queryFn: getReservations,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateReservationPayload) => createReservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] }); // Refresh list
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateReservationPayload) => updateReservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  return {
    reservations,
    isLoading,
    isError,
    createReservation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReservation: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReservation: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};