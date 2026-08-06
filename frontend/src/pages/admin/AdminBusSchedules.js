import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, 
  FiClock, FiMapPin, FiTruck, FiCheckCircle, FiXCircle, FiDollarSign, FiX 
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import busCitiesData from '../../data/busCities.json';

const AdminBusSchedules = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Schedule Form State
  const [formData, setFormData] = useState({
    operator_id: 1,
    bus_number: '',
    bus_type: 'AC Volvo Multi-Axle',
    is_ac: true,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '10:00 PM',
    arrival_time: '06:00 AM',
    duration: '8h 00m',
    price_per_seat: 1500,
    total_seats: 40,
    boarding_points: 'Arambagh Counter (10:00 PM), Kalabagan Counter (10:30 PM)',
    dropping_points: 'Kolatoli Point (06:00 AM), Dolphin Goli (06:15 AM)',
  });

  // Fetch declared bus schedules from MySQL database API
  const { data: schedules = [], isLoading, refetch } = useQuery(
    ['adminBusSchedules', selectedOperator, searchQuery],
    async () => {
      try {
        const res = await api.get(`/admin/bus/schedules?operator=${selectedOperator}&search=${encodeURIComponent(searchQuery)}`, { silent: true });
        return res.data?.data || res.data || [];
      } catch (e) {
        console.warn('Bus schedules fetch fallback:', e);
        return [];
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Mutation to Declare New Schedule
  const createScheduleMutation = useMutation(
    async (payload) => {
      const res = await api.post('/admin/bus/schedules', payload);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBusSchedules');
        setShowAddModal(false);
        alert('✅ Bus route & schedule declared successfully!');
        setFormData({
          operator_id: 1,
          bus_number: '',
          bus_type: 'AC Volvo Multi-Axle',
          is_ac: true,
          from_city: 'Dhaka',
          to_city: 'Cox\'s Bazar',
          departure_time: '10:00 PM',
          arrival_time: '06:00 AM',
          duration: '8h 00m',
          price_per_seat: 1500,
          total_seats: 40,
          boarding_points: '',
          dropping_points: '',
        });
      },
      onError: (err) => {
        alert('❌ Error declaring bus schedule: ' + (err.response?.data?.message || err.message));
      },
    }
  );

  // Mutation to Delete Schedule
  const deleteScheduleMutation = useMutation(
    async (id) => {
      await api.delete(`/admin/bus/schedules/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBusSchedules');
      },
    }
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.bus_number || !formData.price_per_seat) {
      alert('Please fill out Bus Number and Ticket Price.');
      return;
    }

    const boardingArray = formData.boarding_points.split(',').map((s) => s.trim()).filter(Boolean);
    const droppingArray = formData.dropping_points.split(',').map((s) => s.trim()).filter(Boolean);

    createScheduleMutation.mutate({
      ...formData,
      boarding_points: boardingArray,
      dropping_points: droppingArray,
    });
  };

  const cities = busCitiesData.map((c) => c.name);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiTruck className="text-[#E41D57]" /> Declare Bus Routes & Schedules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Declare daily intercity bus schedules, pricing, route stops, and operator seat availability in MySQL.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E41D57] text-white rounded-xl font-medium shadow-sm hover:bg-[#d0174a] transition-colors cursor-pointer"
        >
          <FiPlus className="w-5 h-5" /> Declare New Bus Schedule
        </button>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#E41D57]">
            <FiTruck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{schedules.length} Active</div>
            <div className="text-xs text-gray-500 font-medium">Declared Schedules</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">29 Destinations</div>
            <div className="text-xs text-gray-500 font-medium">Bangladesh Intercity</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">5 Operators</div>
            <div className="text-xs text-gray-500 font-medium">Green Line, Hanif, Ena...</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">৳850 - ৳1,800</div>
            <div className="text-xs text-gray-500 font-medium">Ticket Price Range</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search operator, city, bus number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
          >
            <option value="All">All Operators</option>
            <option value="GREENLINE">Green Line Paribahan</option>
            <option value="HANIF">Hanif Enterprise</option>
            <option value="SHOHAG">Shohag Elite</option>
            <option value="ENA">Ena Transport</option>
            <option value="SHYAMOLI">Shyamoli Paribahan</option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Operator & Bus Number</th>
                  <th className="py-4 px-6">Route</th>
                  <th className="py-4 px-6">Departure / Arrival</th>
                  <th className="py-4 px-6">Bus Class</th>
                  <th className="py-4 px-6">Ticket Fare</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{schedule.operator_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{schedule.bus_number}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <span>{schedule.from_city}</span>
                        <span className="text-gray-400">→</span>
                        <span>{schedule.to_city}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{schedule.departure_time}</div>
                      <div className="text-xs text-gray-500">Reaches: {schedule.arrival_time} ({schedule.duration})</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        schedule.is_ac ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {schedule.bus_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#E41D57]">
                      ৳{schedule.price_per_seat.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      {schedule.total_seats} Seats
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this bus schedule from MySQL?')) {
                            deleteScheduleMutation.mutate(schedule.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Declare Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiTruck className="text-[#E41D57]" /> Declare New Bus Schedule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Operator */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bus Operator</label>
                  <select
                    value={formData.operator_id}
                    onChange={(e) => setFormData({ ...formData, operator_id: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                  >
                    <option value={1}>Green Line Paribahan</option>
                    <option value={2}>Hanif Enterprise</option>
                    <option value={3}>Shohag Elite</option>
                    <option value={4}>Ena Transport</option>
                    <option value={5}>Shyamoli Paribahan</option>
                  </select>
                </div>

                {/* Bus Number */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bus Number / Registration</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Metro-BA 18-9922"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#E41D57]"
                    required
                  />
                </div>

                {/* From City */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">From Departure City</label>
                  <select
                    value={formData.from_city}
                    onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* To City */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">To Destination City</label>
                  <select
                    value={formData.to_city}
                    onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Departure Time */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 PM"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                    required
                  />
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Expected Arrival Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:00 AM"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Bus Type */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bus Class & Model</label>
                  <input
                    type="text"
                    placeholder="e.g. AC Volvo Multi-Axle / Non-AC Chair Coach"
                    value={formData.bus_type}
                    onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Seat Plan Layout */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Seat Plan Layout</label>
                  <select
                    value={formData.seat_plan || '2x2'}
                    onChange={(e) => {
                      const plan = e.target.value;
                      const seats = plan === '2x1' ? 28 : plan === '2x2_36' ? 36 : 40;
                      setFormData({ ...formData, seat_plan: plan, total_seats: seats });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                  >
                    <option value="2x2">2x2 Standard Layout (40 Seats)</option>
                    <option value="2x1">2x1 Business / Sleeper (28 Seats)</option>
                    <option value="2x2_36">2x2 Executive Layout (36 Seats)</option>
                  </select>
                </div>

                {/* Ticket Price */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ticket Price per Seat (৳)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={formData.price_per_seat}
                    onChange={(e) => setFormData({ ...formData, price_per_seat: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              {/* Boarding Points */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Boarding Counters (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Arambagh Counter (10:00 PM), Kalabagan Counter (10:30 PM)"
                  value={formData.boarding_points}
                  onChange={(e) => setFormData({ ...formData, boarding_points: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                />
              </div>

              {/* Dropping Points */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dropping Counters (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Kolatoli Point (06:00 AM), Dolphin Goli (06:15 AM)"
                  value={formData.dropping_points}
                  onChange={(e) => setFormData({ ...formData, dropping_points: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createScheduleMutation.isLoading}
                  className="px-6 py-2.5 bg-[#E41D57] hover:bg-[#d0174a] text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {createScheduleMutation.isLoading ? 'Saving...' : 'Save & Declare Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusSchedules;
