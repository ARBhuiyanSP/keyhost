import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiSearch, FiFilter, FiCheckCircle, FiClock, FiXCircle, 
  FiUser, FiPhone, FiMail, FiTruck, FiDollarSign, FiDownload, FiEye, FiX 
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBusBookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch real passenger bus reservations from MySQL database
  const { data: bookings = [], isLoading } = useQuery(
    ['adminBusBookings', searchQuery, statusFilter],
    async () => {
      try {
        const res = await api.get(`/admin/bus/bookings?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`, { silent: true });
        return res.data?.data || res.data || [];
      } catch (e) {
        console.warn('Bus bookings fetch fallback:', e);
        return [];
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiTruck className="text-[#E41D57]" /> Passenger Bus Ticket Reservations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live overview of all passenger bus bookings, ticket reference codes, reserved seat maps, and payment status.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search booking ref, passenger name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><LoadingSpinner /></div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No passenger bus reservations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Passenger Contact</th>
                  <th className="py-4 px-6">Operator & Route</th>
                  <th className="py-4 px-6">Journey Date</th>
                  <th className="py-4 px-6">Seats Reserved</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#E41D57]">
                      {b.booking_ref}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{b.passenger_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiPhone className="w-3 h-3 text-gray-400" /> {b.passenger_phone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{b.operator_name || 'Green Line'}</div>
                      <div className="text-xs text-gray-500">{b.from_city} → {b.to_city}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800">{b.journey_date}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[150px]">{b.boarding_point}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(b.seats || []).map((seat, i) => (
                          <span key={i} className="px-2 py-0.5 bg-pink-50 text-[#E41D57] rounded text-xs font-bold border border-pink-100">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      ৳{b.total_price.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        b.payment_status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}>
                        <FiCheckCircle className="w-3.5 h-3.5" /> {b.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Reservation Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Reservation Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference:</span>
                <span className="font-bold text-[#E41D57] font-mono">{selectedBooking.booking_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Passenger Name:</span>
                <span className="font-bold text-gray-900">{selectedBooking.passenger_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile Phone:</span>
                <span className="font-semibold text-gray-900">{selectedBooking.passenger_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seats Reserved:</span>
                <span className="font-bold text-[#E41D57]">{(selectedBooking.seats || []).join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Boarding Counter:</span>
                <span className="font-medium text-gray-800 truncate max-w-[200px]">{selectedBooking.boarding_point}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dropping Counter:</span>
                <span className="font-medium text-gray-800 truncate max-w-[200px]">{selectedBooking.dropping_point}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold">
                <span>Total Fare Paid:</span>
                <span className="text-green-600">৳{selectedBooking.total_price.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-[#1e2049] text-white font-bold text-xs rounded-xl hover:bg-[#161836] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusBookings;
