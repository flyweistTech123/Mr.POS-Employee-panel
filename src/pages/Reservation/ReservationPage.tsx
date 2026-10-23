import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
} from '../../redux/api/reservationApi';
import type {
  CreateReservationPayload,
  UpdateReservationPayload,
  Reservation,
} from '../../types/reservation';

const toastStyle = { borderRadius: '10px', background: '#333', color: '#fff' };

// ---------------------------------------------------------------------------
// Create Modal
// ---------------------------------------------------------------------------
const NewReservationModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReservationPayload) => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<CreateReservationPayload>({
    Reservations_online: false,
    Customer_id: 25,
    slots: 'Dinner',
    slots_time: '07:30 PM - 09:00 PM',
    title: 'Mohammed Al-Farsi',
    Floor: 1,
    Capacity_count: 4,
    people_count: 4,
    PaymentStatus: 'UnPaid',
    Table_id: 2,
    Date_time: '2026-04-15T19:30:00.000Z',
    Notes: 'Allergies: nuts',
    Status: true,
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            New Reservation
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Guest Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+974 55-000-1234"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Occasion</label>
                <input
                  type="text"
                  placeholder="Birthday, Business, VIP..."
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  placeholder="__hr __min"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Date & Time</label>
                <input
                  type="text"
                  name="Date_time"
                  value={formData.Date_time}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Party Size</label>
                <input
                  type="number"
                  name="people_count"
                  value={formData.people_count}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Assign Table</label>
                <select
                  name="Table_id"
                  value={formData.Table_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                >
                  <option value={2}>Table 2 - Available</option>
                  <option value={5}>Table 5 - Available</option>
                  <option value={7}>Table 7 - Available</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Notes</label>
                <input
                  type="text"
                  name="Notes"
                  value={formData.Notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-purple-300 text-purple-700 bg-white py-2.5 rounded-md font-medium text-sm hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] text-white py-2.5 rounded-md font-medium text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------
const EditReservationModal = ({
  reservation,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onSubmit: (data: UpdateReservationPayload) => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<UpdateReservationPayload>({
    id: 0,
    people_count: 1,
    Table_id: 1,
    PaymentStatus: 'UnPaid',
    Notes: '',
  });

  useEffect(() => {
    if (reservation) {
      setFormData({
        id: reservation.Reservations_id,
        people_count: reservation.people_count,
        Table_id: reservation.Table_id,
        PaymentStatus: reservation.PaymentStatus,
        Notes: reservation.Notes ?? '',
      });
    }
  }, [reservation]);

  if (!reservation) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'people_count' || name === 'Table_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Edit Reservation #{reservation.Reservations_id}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Guest Name</label>
              <input
                type="text"
                value={reservation.title ?? ''}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-md p-2 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Party Size</label>
                <input
                  type="number"
                  name="people_count"
                  value={formData.people_count}
                  onChange={handleChange}
                  min={1}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Assign Table</label>
                <select
                  name="Table_id"
                  value={formData.Table_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
                    <option key={t} value={t}>
                      Table {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Payment Status</label>
                <select
                  name="PaymentStatus"
                  value={formData.PaymentStatus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="UnPaid">UnPaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Notes</label>
                <input
                  type="text"
                  name="Notes"
                  value={formData.Notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-purple-300 text-purple-700 bg-white py-2.5 rounded-md font-medium text-sm hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] text-white py-2.5 rounded-md font-medium text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------
const DeleteConfirmModal = ({
  reservation,
  onClose,
  onConfirm,
  isDeleting,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  if (!reservation) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Reservation?</h2>
        <p className="text-sm text-gray-500 mb-6">
          This will permanently delete reservation{' '}
          <span className="font-medium text-gray-700">
            #{reservation.Reservations_id} — {reservation.title}
          </span>
          . This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 bg-white py-2.5 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-md font-medium text-sm shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ReservationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

  const [selectedForInline, setSelectedForInline] = useState<Reservation | null>(null);
  const [inlineForm, setInlineForm] = useState({
    title: '',
    people_count: 1,
    Date_time: '',
    Table_id: 1,
    Notes: '',
    PaymentStatus: 'UnPaid' as 'Paid' | 'UnPaid',
  });

  const { data: reservations = [], isLoading } = useGetReservationsQuery();
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation();
  const [updateReservation, { isLoading: isUpdating }] = useUpdateReservationMutation();
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation();

  useEffect(() => {
    if (selectedForInline) {
      setInlineForm({
        title: selectedForInline.title ?? '',
        people_count: selectedForInline.people_count,
        Date_time: selectedForInline.Date_time,
        Table_id: selectedForInline.Table_id,
        Notes: selectedForInline.Notes ?? '',
        PaymentStatus: selectedForInline.PaymentStatus as 'Paid' | 'UnPaid',
      });
    }
  }, [selectedForInline]);

  const resetInline = () => {
    setSelectedForInline(null);
    setInlineForm({
      title: '',
      people_count: 1,
      Date_time: '',
      Table_id: 1,
      Notes: '',
      PaymentStatus: 'UnPaid',
    });
  };

  const handleCreateReservation = async (data: CreateReservationPayload) => {
    try {
      await createReservation(data).unwrap();
      setIsModalOpen(false);
      toast.success('Reservation created successfully!', { style: toastStyle });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create reservation.', {
        style: toastStyle,
      });
    }
  };

  const handleUpdateReservation = async (data: UpdateReservationPayload) => {
    try {
      await updateReservation(data).unwrap();
      setEditingReservation(null);
      resetInline();
      toast.success('Reservation updated successfully!', { style: toastStyle });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update reservation.', {
        style: toastStyle,
      });
    }
  };

  const handleDeleteReservation = async () => {
    if (!deletingReservation) return;
    try {
      await deleteReservation(deletingReservation.Reservations_id).unwrap();
      if (selectedForInline?._id === deletingReservation._id) resetInline();
      setDeletingReservation(null);
      toast.success('Reservation deleted successfully!', { style: toastStyle });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete reservation.', {
        style: toastStyle,
      });
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedForInline) {
      handleUpdateReservation({
        id: selectedForInline.Reservations_id,
        people_count: Number(inlineForm.people_count),
        Table_id: Number(inlineForm.Table_id),
        PaymentStatus: inlineForm.PaymentStatus,
        Notes: inlineForm.Notes,
      });
    } else {
      const payload: CreateReservationPayload = {
        Reservations_online: false,
        Customer_id: 25,
        slots: 'Dinner',
        slots_time: '07:30 PM - 09:00 PM',
        title: inlineForm.title || 'Walk-in Guest',
        Floor: 1,
        Capacity_count: Number(inlineForm.people_count) || 4,
        people_count: Number(inlineForm.people_count) || 1,
        PaymentStatus: inlineForm.PaymentStatus,
        Table_id: Number(inlineForm.Table_id),
        Date_time: inlineForm.Date_time
          ? new Date(inlineForm.Date_time).toISOString()
          : new Date().toISOString(),
        Notes: inlineForm.Notes,
        Status: true,
      };
      handleCreateReservation(payload);
    }
  };

  const isInlineSubmitting = selectedForInline ? isUpdating : isCreating;

  // Mocking UI states to match Figma exactly (this mapping logic is based on your requirements)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="text-xs px-2 py-1 rounded-md border border-green-200 bg-green-50 text-green-700 font-medium">Confirmed</span>;
      case 'Tomorrow':
        return <span className="text-xs px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 font-medium">Tomorrow</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded-md border border-orange-200 bg-orange-50 text-orange-700 font-medium">Upcoming</span>;
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-800 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">Reservations</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] text-white px-5 py-2 rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          + New Reservation
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Reservation Queue */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Reservation Queue
            </h2>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  </div>
                ))
              ) : reservations.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-400">
                  No reservations yet. Create one to get started.
                </div>
              ) : (
                reservations.map((res, index) => {
                  const isSelected = selectedForInline?._id === res._id;
                  // Simulated status for Figma match
                  const mockStatus = index === 0 ? 'Upcoming' : index === 1 ? 'Upcoming' : index === 2 ? 'Tomorrow' : 'Confirmed';
                  
                  return (
                    <div
                      key={res._id}
                      className={`rounded-lg p-4 bg-white shadow-sm relative shrink-0 transition-colors ${
                        isSelected
                          ? 'border-2 border-purple-500'
                          : 'border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm">
                          {res.title || res.customer_name || 'Guest'} - {res.people_count} guests
                        </h3>
                        {getStatusBadge(mockStatus)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(res.Date_time).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        - Table {res.Table_id} {res.Notes ? `- ${res.Notes}` : ''}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setEditingReservation(res)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingReservation(res)}
                          className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => (isSelected ? resetInline() : setSelectedForInline(res))}
                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ml-auto ${
                            isSelected
                              ? 'border-gray-300 text-gray-600 bg-gray-100 hover:bg-gray-200'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {isSelected ? 'Deselect' : 'Quick Edit'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Inline Form */}
          <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {selectedForInline
                  ? `Edit Reservation #${selectedForInline.Reservations_id}`
                  : 'New Reservation'}
              </h2>
              {selectedForInline && (
                <button
                  type="button"
                  onClick={resetInline}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleInlineSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Guest name</label>
                  <input
                    type="text"
                    value={inlineForm.title}
                    onChange={(e) => setInlineForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Mohammed Al-Farsi"
                    disabled={!!selectedForInline}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+974 55-000-1234"
                    disabled={!!selectedForInline}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Occasion</label>
                  <input
                    type="text"
                    placeholder="Birthday, Business, VIP..."
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="__hr __min"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={inlineForm.Date_time ? new Date(inlineForm.Date_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setInlineForm((p) => ({ ...p, Date_time: e.target.value }))}
                    disabled={!!selectedForInline}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    value={inlineForm.people_count}
                    onChange={(e) => setInlineForm((p) => ({ ...p, people_count: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Assign Table</label>
                  <select
                    value={inlineForm.Table_id}
                    onChange={(e) => setInlineForm((p) => ({ ...p, Table_id: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
                      <option key={t} value={t}>Table {t} {t === 2 ? '- Available' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Notes</label>
                  <input
                    type="text"
                    value={inlineForm.Notes}
                    onChange={(e) => setInlineForm((p) => ({ ...p, Notes: e.target.value }))}
                    placeholder="Allergies: nuts"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isInlineSubmitting}
                className="mt-4 w-full bg-[linear-gradient(180deg,#6A1B9A_0%,#D32F2F_100%)] text-white py-3 rounded-md font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isInlineSubmitting ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column - Floor Map */}
        <div className="lg:w-[45%] xl:w-[50%]">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Floor Map - Reservation View
          </h2>

          <div className="grid grid-cols-4 gap-4">
            {/* T1 */}
            <div className="bg-[#EDE9FE] border-[1.5px] border-[#D8B4FE] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T1</span>
              <span className="text-[10px] text-[#9333EA] font-medium mt-1">Occupied</span>
            </div>

            {/* T2 */}
            <div className="bg-[#ECFDF5] border-[1.5px] border-[#86EFAC] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T2</span>
              <span className="text-[10px] text-[#16A34A] font-medium mt-1">Free</span>
            </div>

            {/* T3 */}
            <div className="bg-[#EDE9FE] border-[1.5px] border-[#D8B4FE] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T3</span>
              <span className="text-[10px] text-[#9333EA] font-medium mt-1">Occupied</span>
            </div>

            {/* T4 */}
            <div className="bg-[#DDEDFF] border-[1.5px] border-[#93C5FD] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T4</span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1">Reserved</span>
              <span className="text-[10px] text-[#2563EB]">7:30 PM</span>
            </div>

            {/* T5 */}
            <div className="bg-[#EDE9FE] border-[1.5px] border-[#D8B4FE] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T5</span>
              <span className="text-[10px] text-[#9333EA] font-medium mt-1">Occupied</span>
            </div>

            {/* T6 */}
            <div className="bg-[#ECFDF5] border-[1.5px] border-[#86EFAC] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T6</span>
              <span className="text-[10px] text-[#16A34A] font-medium mt-1">Free</span>
            </div>

            {/* T7 */}
            <div className="bg-[#ECFDF5] border-[1.5px] border-[#86EFAC] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T7</span>
              <span className="text-[10px] text-[#16A34A] font-medium mt-1">Free</span>
            </div>

            {/* T8 */}
            <div className="bg-[#DDEDFF] border-[1.5px] border-[#93C5FD] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T8</span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1">Reserved</span>
              <span className="text-[10px] text-[#2563EB]">8:30 PM</span>
            </div>

            {/* T9 */}
            <div className="bg-[#ECFDF5] border-[1.5px] border-[#86EFAC] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T9</span>
              <span className="text-[10px] text-[#16A34A] font-medium mt-1">Free</span>
            </div>

            {/* T10 */}
            <div className="bg-[#EDE9FE] border-[1.5px] border-[#D8B4FE] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T10</span>
              <span className="text-[10px] text-[#9333EA] font-medium mt-1">Occupied</span>
            </div>

            {/* T11 */}
            <div className="bg-[#DDEDFF] border-[1.5px] border-[#93C5FD] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T11</span>
              <span className="text-[10px] text-[#2563EB] font-medium mt-1">Reserved</span>
              <span className="text-[10px] text-[#2563EB]">10:30 PM</span>
            </div>

            {/* T12 */}
            <div className="bg-[#EDE9FE] border-[1.5px] border-[#D8B4FE] rounded-2xl p-2 flex flex-col items-center justify-center w-full aspect-[137/85]">
              <span className="font-bold text-gray-800 text-sm">T12</span>
              <span className="text-[10px] text-[#9333EA] font-medium mt-1">Occupied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReservation}
        isSubmitting={isCreating}
      />
      <EditReservationModal
        reservation={editingReservation}
        onClose={() => setEditingReservation(null)}
        onSubmit={handleUpdateReservation}
        isSubmitting={isUpdating}
      />
      <DeleteConfirmModal
        reservation={deletingReservation}
        onClose={() => setDeletingReservation(null)}
        onConfirm={handleDeleteReservation}
        isDeleting={isDeleting}
      />
    </div>
  );
}