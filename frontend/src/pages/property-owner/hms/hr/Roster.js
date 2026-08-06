import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiCalendar, FiSave, FiChevronLeft, FiChevronRight, FiUser, FiInfo } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Roster = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rosterData, setRosterData] = useState({}); // { 'empId-date': shiftId }
    const [isSaving, setIsSaving] = useState(false);

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const { data: employees } = useQuery('hms-employees', () => 
        api.get('/hms/hr/employees').then(res => res.data?.data?.employees || [])
    );

    const { data: shifts } = useQuery('hms-shifts', () => 
        api.get('/hms/hr/shifts').then(res => res.data?.data?.shifts || [])
    );

    const { data: rosters, isLoading: rosterLoading } = useQuery(['hms-rosters', month, year], () => 
        api.get(`/hms/hr/rosters?month=${month}&year=${year}`).then(res => res.data?.data?.rosters || [])
    );

    useEffect(() => {
        if (rosters) {
            const data = {};
            rosters.forEach(r => {
                // If r.date is already a string like "2026-05-01", use it directly.
                // If it has a time component, take the first 10 characters.
                const dateStr = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
                data[`${r.employee_id}-${dateStr}`] = r.shift_id;
            });
            setRosterData(data);
        }
    }, [rosters]);

    const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
    const daysCount = getDaysInMonth(month, year);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    const handleShiftChange = (empId, day, shiftId) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setRosterData(prev => ({
            ...prev,
            [`${empId}-${dateStr}`]: shiftId ? parseInt(shiftId) : null
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const assignments = Object.entries(rosterData).map(([key, shiftId]) => {
                const parts = key.split('-');
                const employee_id = parts[0];
                const date = parts.slice(1).join('-');
                return { employee_id: parseInt(employee_id), date, shift_id: shiftId };
            });

            await api.post('/hms/hr/rosters/bulk', { assignments });
            showSuccess('Roster saved successfully');
            queryClient.invalidateQueries('hms-rosters');
        } catch (error) {
            showError('Failed to save roster');
        } finally {
            setIsSaving(false);
        }
    };

    const nextMonth = () => setCurrentDate(new Date(year, month, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));

    if (rosterLoading) return <LoadingSpinner />;

    return (
        <div className="max-w-[100vw] overflow-hidden p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FiCalendar className="text-emerald-600" /> Duty Roster
                    </h1>
                    <p className="text-sm text-gray-500">Plan and manage employee shifts for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-50 border-r border-gray-200 transition-colors">
                            <FiChevronLeft />
                        </button>
                        <div className="px-4 py-2 font-bold text-gray-700 min-w-[150px] text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-50 border-l border-gray-200 transition-colors">
                            <FiChevronRight />
                        </button>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="btn-primary flex items-center gap-2 bg-[#004D40] hover:bg-[#003d33] disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : <><FiSave /> Save Roster</>}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#CFD8DC]">
                            <th className="sticky left-0 z-10 bg-[#CFD8DC] px-4 py-3 border-b border-gray-200 min-w-[200px] text-left text-xs font-bold text-[#455A64] uppercase">
                                Employee
                            </th>
                            {days.map(day => (
                                <th key={day} className="px-2 py-3 border-b border-gray-200 min-w-[100px] text-center text-xs font-bold text-[#455A64] uppercase">
                                    {day} {new Date(year, month - 1, day).toLocaleString('default', { weekday: 'short' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees?.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50/50">
                                <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-gray-100 font-bold text-gray-800 whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm">{emp.name}</div>
                                            <div className="text-[10px] text-gray-400 font-normal">{emp.designation_name}</div>
                                        </div>
                                    </div>
                                </td>
                                {days.map(day => {
                                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const currentShiftId = rosterData[`${emp.id}-${dateStr}`];
                                    const isWeekend = [0, 6].includes(new Date(year, month - 1, day).getDay());
                                    
                                    return (
                                        <td key={day} className={`px-1 py-2 border-r border-gray-50 ${isWeekend ? 'bg-gray-50/30' : ''}`}>
                                            <select 
                                                value={currentShiftId || ''} 
                                                onChange={(e) => handleShiftChange(emp.id, day, e.target.value)}
                                                className={`w-full text-[11px] font-bold p-1 rounded border outline-none transition-all ${currentShiftId ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                            >
                                                <option value="" className="bg-white text-gray-400">Off Day</option>
                                                {shifts?.map(s => (
                                                    <option key={s.id} value={s.id} className="bg-white text-gray-800">
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
                <FiInfo className="text-emerald-600 mt-1" />
                <div className="text-xs text-emerald-800 leading-relaxed">
                    <p className="font-bold mb-1">How to use Duty Roster:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>Select a shift from the dropdown for each employee and date.</li>
                        <li>Shifts marked in <span className="font-bold">Green</span> are assigned. <span className="font-bold">Off Day</span> means the employee is not working.</li>
                        <li>Don't forget to click the <span className="font-bold">"Save Roster"</span> button after making changes.</li>
                        <li>Staff members will see their assigned shifts on their personal dashboard.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Roster;
