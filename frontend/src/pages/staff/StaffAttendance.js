import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiClock, FiMapPin, FiCheckCircle, FiLogOut, FiLogIn, FiCalendar, FiBriefcase } from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StaffAttendance = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: status, isLoading } = useQuery('my-attendance', () => 
        api.get('/hms/hr/attendance/my').then(res => res.data?.data || null)
    );

    const handlePunch = async () => {
        try {
            const res = await api.post('/hms/hr/attendance/punch');
            showSuccess(res.data?.message);
            queryClient.invalidateQueries('my-attendance');
        } catch (error) {
            showError(error.response?.data?.message || 'Action failed');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    const attendance = status?.attendance;
    const roster = status?.roster;
    const today = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <div className="bg-[#101D2C] rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10">
                {/* Decorative circles */}
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 mb-4 font-bold tracking-widest uppercase text-xs">
                            <FiCalendar /> {today}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Work Desktop</h1>
                        <p className="text-gray-400 text-lg">Manage your daily attendance and duty schedule</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[220px]">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            Current Time
                        </div>
                        <div className="text-3xl font-black text-emerald-400 tracking-wider tabular-nums">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shift Info */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <FiBriefcase />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Your Shift Today</h2>
                    </div>

                    {roster ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                                <div className="text-2xl font-black text-blue-900 mb-1">{roster.shift_name}</div>
                                <div className="text-sm text-blue-600 font-bold flex items-center gap-2">
                                    <FiClock /> {roster.start_time} - {roster.end_time}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Start Time</div>
                                    <div className="text-lg font-black text-gray-800">{roster.start_time}</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">End Time</div>
                                    <div className="text-lg font-black text-gray-800">{roster.end_time}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-orange-50 rounded-[2rem] border-2 border-orange-200 border-dashed">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                                <FiCalendar />
                            </div>
                            <div className="font-black text-orange-900 text-xl">Off Day</div>
                            <p className="text-sm text-orange-700 mt-1">No shift assigned for today.</p>
                        </div>
                    )}
                </div>

                {/* Punch Action */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="mb-8">
                        {!attendance ? (
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner mb-4 mx-auto">
                                <FiLogIn />
                            </div>
                        ) : !attendance.punch_out ? (
                            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl shadow-inner mb-4 mx-auto animate-pulse">
                                <FiLogOut />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner mb-4 mx-auto">
                                <FiCheckCircle />
                            </div>
                        )}
                        <h2 className="text-2xl font-black text-gray-800">
                            {!attendance ? 'Ready to Start?' : !attendance.punch_out ? 'Work in Progress' : 'Work Completed'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            {!attendance ? 'Punch in to record your attendance' : !attendance.punch_out ? 'Remember to punch out when finished' : 'You have completed your shift for today'}
                        </p>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-8"></div>

                    <button 
                        onClick={handlePunch}
                        disabled={attendance?.punch_out}
                        className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all transform active:scale-95 shadow-xl ${
                            !attendance ? 'bg-green-600 hover:bg-green-700 text-white' :
                            !attendance.punch_out ? 'bg-red-600 hover:bg-red-700 text-white' :
                            'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {!attendance ? 'Punch In' : !attendance.punch_out ? 'Punch Out' : 'Shift Completed'}
                    </button>

                    {attendance && (
                        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 w-full">
                            <div className="text-left">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Punch In Time</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
                                        <FiClock /> 
                                    </div>
                                    <div className="font-black text-gray-800 text-base">
                                        {new Date(attendance.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            {attendance.punch_out && (
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Punch Out Time</div>
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="font-black text-gray-800 text-base">
                                            {new Date(attendance.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-lg">
                                            <FiClock /> 
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-center gap-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Network Location Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    <span className="text-[11px] font-bold text-gray-800">Your IP: 103.145.241.XX</span>
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;
