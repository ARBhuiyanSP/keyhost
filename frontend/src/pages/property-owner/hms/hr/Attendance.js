import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiUsers, FiClock, FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import api from '../../../../utils/api';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { getImageUrl } from '../../../../utils/imageUrl';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: attendance, isLoading } = useQuery(['hms-attendance-daily', selectedDate], () => 
        api.get(`/hms/hr/attendance/daily?date=${selectedDate}`).then(res => res.data?.data?.attendance || [])
    );

    const getLateDuration = (punchIn, startTime) => {
        if (!punchIn || !startTime) return null;
        const punch = new Date(punchIn);
        const [sh, sm] = startTime.split(':').map(Number);
        const shiftStart = new Date(punch);
        shiftStart.setHours(sh, sm, 0, 0);
        const diffMs = punch - shiftStart;
        if (diffMs <= 0) return null;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const getEarlyOutDuration = (punchOut, endTime) => {
        if (!punchOut || !endTime) return null;
        const punch = new Date(punchOut);
        const [eh, em] = endTime.split(':').map(Number);
        const shiftEnd = new Date(punch);
        shiftEnd.setHours(eh, em, 0, 0);
        const diffMs = shiftEnd - punch;
        if (diffMs <= 0) return null;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const getOvertime = (workHours, startTime, endTime) => {
        if (!workHours || !startTime || !endTime) return 0;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        let shiftHours = eh - sh + (em - sm) / 60;
        if (shiftHours < 0) shiftHours += 24;
        const ot = parseFloat(workHours) - shiftHours;
        return ot > 0 ? ot.toFixed(2) : 0;
    };

    const stats = {
        total: attendance?.length || 0,
        late: attendance?.filter(a => !!getLateDuration(a.punch_in, a.start_time)).length || 0,
        earlyOut: attendance?.filter(a => !!getEarlyOutDuration(a.punch_out, a.end_time)).length || 0,
        overtime: attendance?.filter(a => getOvertime(a.work_hours, a.start_time, a.end_time) > 0).length || 0,
    };

    const filteredAttendance = attendance?.filter(a => 
        a.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Attendance Monitoring</h1>
                    <p className="text-sm text-gray-500">Track real-time staff presence and shift status</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-semibold"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                        <FiUsers />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Staff</div>
                        <div className="text-xl font-black text-gray-800">{stats.total}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl">
                        <FiClock />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Late In</div>
                        <div className="text-xl font-black text-gray-800">{stats.late}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                        <FiClock />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Early Out</div>
                        <div className="text-xl font-black text-gray-800">{stats.earlyOut}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                        <FiClock />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Overtime</div>
                        <div className="text-xl font-black text-gray-800">{stats.overtime}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by staff name or department..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#CFD8DC] text-[#455A64] text-xs font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Shift</th>
                                <th className="px-6 py-4 text-center">Punch In</th>
                                <th className="px-6 py-4 text-center">Punch Out</th>
                                <th className="px-6 py-4 text-center">Work Hours</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="7" className="py-10 text-center"><LoadingSpinner /></td></tr>
                            ) : filteredAttendance?.length > 0 ? filteredAttendance.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {a.photo ? (
                                                <img src={getImageUrl(a.photo)} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    {a.employee_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="font-bold text-gray-800">{a.employee_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{a.department_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                            {a.shift_name || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-sm font-bold text-gray-800">{a.punch_in ? new Date(a.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                                            {getLateDuration(a.punch_in, a.start_time) && (
                                                <span className="text-[10px] font-black text-rose-600 uppercase">
                                                    Late ({getLateDuration(a.punch_in, a.start_time)})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-sm font-bold text-gray-800">{a.punch_out ? new Date(a.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                                            {getEarlyOutDuration(a.punch_out, a.end_time) && (
                                                <span className="text-[10px] font-black text-amber-600 uppercase">
                                                    Early ({getEarlyOutDuration(a.punch_out, a.end_time)})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="font-black text-gray-900">
                                                {a.work_hours || '0.00'} <span className="text-[10px] text-gray-400 font-normal">hrs</span>
                                            </div>
                                            {getOvertime(a.work_hours, a.start_time, a.end_time) > 0 && (
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">
                                                    +{getOvertime(a.work_hours, a.start_time, a.end_time)} OT
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            a.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                            a.status === 'late' ? 'bg-amber-100 text-amber-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="py-16 text-center text-gray-400 italic">No attendance records found for this date.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
