import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    FiArrowLeft, FiFileText, FiPrinter, FiDownload, FiPlus,
    FiCheck, FiClock, FiUser, FiHome, FiCalendar, FiDollarSign,
    FiPhone, FiMail, FiAlertTriangle, FiCheckCircle, FiList,
    FiFile, FiInfo, FiCreditCard, FiTag, FiExternalLink, FiMessageCircle,
    FiGlobe, FiShield
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import useSettingsStore from '../../store/settingsStore';
import { getImageUrl } from '../../utils/imageUrl';
import GuestProfileModal from '../../components/property-owner/GuestProfileModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d || '—'; } };
const fmtDateTime = (d) => { try { return format(new Date(d), 'dd MMM yyyy, hh:mm a'); } catch { return d || '—'; } };

const STATUS_CONFIG = {
    confirmed:        { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
    checked_in:       { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
    checked_out:      { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400' },
    cancelled:        { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
    pending:          { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
    request_accepted: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    paid:             { bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
};

const StatusBadge = ({ status, large }) => {
    const cfg = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase border ${
            large ? 'text-xs' : 'text-[10px]'
        } ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'checked_in' ? 'animate-pulse' : ''}`}/>
            {(status || '').replace(/_/g, ' ')}
        </span>
    );
};

const InfoChip = ({ icon: Icon, label, value, accent }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
        accent ? 'bg-[#004e59]/5 border-[#004e59]/20' : 'bg-white border-gray-100'
    } shadow-sm`}>
        {Icon && <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            accent ? 'bg-[#004e59]/10' : 'bg-gray-100'
        }`}><Icon size={15} className={accent ? 'text-[#004e59]' : 'text-gray-500'} /></div>}
        <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">{label}</div>
            <div className={`text-sm font-bold leading-tight ${accent ? 'text-[#004e59]' : 'text-gray-800'}`}>{value}</div>
        </div>
    </div>
);

// ─── Tab: Reservation Details ────────────────────────────────────────────────
const DetailsTab = ({ data, onViewGuestProfile }) => {
    const { reservation, payments, extraBills, foodOrders, summary, extraGuests } = data;
    const [nidImgError, setNidImgError] = useState(false);
    const [passportImgError, setPassportImgError] = useState(false);
    const guestName = reservation.guest_name ||
        (reservation.guest_first_name ? `${reservation.guest_first_name} ${reservation.guest_last_name}` : 'N/A');
    const guestEmail = reservation.guest_email || reservation.guest_user_email || '—';
    const guestPhone = reservation.guest_phone || reservation.guest_user_phone || '—';
    const initials = guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const paidPct = Math.min(100, summary.grand_total > 0 ? Math.round((summary.paid_amount / summary.grand_total) * 100) : 0);
    const imgSrc = (url) => getImageUrl(url);
    const hasIdentity = reservation.guest_nationality || reservation.guest_nid_number || reservation.guest_passport_number || reservation.guest_nid_document_url || reservation.guest_passport_document_url;

    return (
        <div className="space-y-6">

            {/* ── GUEST PROFILE HERO ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-white border border-gray-150">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004e59] to-[#00838f]" />
                <div className="p-6 pt-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="relative flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#004e59]/10 to-[#00838f]/10 border border-[#004e59]/20 flex items-center justify-center text-[#004e59] text-2xl font-black shadow-inner">
                            {initials}
                        </div>
                        {reservation.guest_id && (
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow" title="Verified Web Guest">
                                <FiCheck size={12} className="text-white" />
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                            <h2 
                                onClick={() => {
                                    if (guestPhone && guestPhone !== '—') onViewGuestProfile(guestPhone);
                                }}
                                className="text-gray-900 font-extrabold text-2xl tracking-tight leading-none cursor-pointer hover:text-[#004e59] hover:underline"
                                title="Click to view profile"
                            >
                                {guestName}
                            </h2>
                            {reservation.guest_id && (
                                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase tracking-wide">Web Guest</span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-2">
                            <a href={`mailto:${guestEmail}`} className="flex items-center gap-2 text-gray-600 hover:text-[#004e59] text-sm transition-colors">
                                <FiMail className="text-gray-400" size={14} />
                                <span>{guestEmail}</span>
                            </a>
                            <a href={`tel:${guestPhone}`} className="flex items-center gap-2 text-gray-600 hover:text-[#004e59] text-sm transition-colors font-semibold">
                                <FiPhone className="text-gray-400" size={14} />
                                <span>{guestPhone}</span>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        <div className="flex-1 md:flex-none flex items-center justify-between gap-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[120px]">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Stay Duration</span>
                            <span className="text-gray-800 font-black text-sm">{reservation.nights} Night{reservation.nights !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex-1 md:flex-none flex items-center justify-between gap-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[120px]">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Payment Status</span>
                            <StatusBadge status={reservation.payment_status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STAY & BOOKING INFO CARDS ──────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Stay Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-2">
                        <FiCalendar className="text-[#004e59]" /> Stay Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-In Date</span>
                            <span className="text-sm font-extrabold text-gray-800">{fmtDate(reservation.check_in_date)}</span>
                            <span className="block text-[10px] text-gray-400 mt-0.5">From 02:00 PM</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-Out Date</span>
                            <span className="text-sm font-extrabold text-gray-800">{fmtDate(reservation.check_out_date)}</span>
                            <span className="block text-[10px] text-gray-400 mt-0.5">Before 12:00 PM</span>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Room Allocation</span>
                            <span className="font-extrabold text-[#004e59] bg-[#004e59]/5 px-3 py-1 rounded-lg border border-[#004e59]/10">
                                Room {reservation.room_number || 'N/A'} ({reservation.room_type})
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-2.5">
                            <span className="text-gray-500 font-medium">Source / Channel</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {reservation.source || 'Walk-in'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-2.5">
                            <span className="text-gray-500 font-medium">Occupancy / Guests</span>
                            <span className="font-semibold text-gray-800">
                                {reservation.number_of_guests || 1} Adult{parseInt(reservation.number_of_guests) !== 1 ? 's' : ''}
                                {reservation.number_of_children > 0 && `, ${reservation.number_of_children} Child${parseInt(reservation.number_of_children) !== 1 ? 'ren' : ''}`}
                                {reservation.number_of_infants > 0 && `, ${reservation.number_of_infants} Infant${parseInt(reservation.number_of_infants) !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-2.5">
                            <span className="text-gray-500 font-medium">Booking Reference</span>
                            <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                {reservation.booking_reference}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-2">
                            <FiDollarSign className="text-[#004e59]" /> Financial Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-2.5 mt-4">
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Accommodation</span>
                                <span className="text-sm font-extrabold text-gray-800">৳{fmt(summary.room_total)}</span>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Services/Extras</span>
                                <span className="text-sm font-extrabold text-orange-600">৳{fmt(summary.extra_total)}</span>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Food &amp; Beverage</span>
                                <span className="text-sm font-extrabold text-purple-600">৳{fmt(summary.food_total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Grand Total</span>
                                <span className="text-xl font-black text-gray-900">৳{fmt(summary.grand_total)}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Due Amount</span>
                                <span className={`text-xl font-black ${summary.due_amount > 0 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100' : 'text-emerald-600'}`}>
                                    ৳{fmt(summary.due_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                                <span>PAID: ৳{fmt(summary.paid_amount)}</span>
                                <span>{paidPct}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        paidPct >= 100 ? 'bg-emerald-500' : paidPct > 50 ? 'bg-[#004e59]' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${paidPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── IDENTITY & DOCUMENTS ───────────────────────────────────────── */}
            {hasIdentity && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#004e59]/10 flex items-center justify-center">
                                <FiShield size={16} className="text-[#004e59]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-800">Identity &amp; Documents</h3>
                                <p className="text-[10px] text-gray-400">Verified official government credentials and photo IDs</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Guest
                        </span>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {reservation.guest_nationality && (
                                <div className="p-4 bg-slate-50/50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <FiGlobe size={13} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Nationality</span>
                                    </div>
                                    <span className="text-base font-extrabold text-gray-800">{reservation.guest_nationality}</span>
                                </div>
                            )}
                            {reservation.guest_nid_number && (
                                <div className="p-4 bg-slate-50/50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <FiShield size={13} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">NID Card Number</span>
                                    </div>
                                    <span className="text-base font-extrabold text-gray-800 font-mono tracking-wider">{reservation.guest_nid_number}</span>
                                </div>
                            )}
                            {reservation.guest_passport_number && (
                                <div className="p-4 bg-slate-50/50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <FiFile size={13} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Passport Number</span>
                                    </div>
                                    <span className="text-base font-extrabold text-gray-800 font-mono tracking-wider">{reservation.guest_passport_number}</span>
                                </div>
                            )}
                        </div>

                        {/* Document Upload Previews */}
                        {(reservation.guest_nid_document_url || reservation.guest_passport_document_url) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-50">
                                {reservation.guest_nid_document_url && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">NID Card Scan / Photo</label>
                                        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                                            {!nidImgError ? (
                                                <>
                                                    <img 
                                                        src={imgSrc(reservation.guest_nid_document_url)} 
                                                        alt="NID Document" 
                                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                                                        onError={() => setNidImgError(true)}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                                        <a href={imgSrc(reservation.guest_nid_document_url)} target="_blank" rel="noopener noreferrer" 
                                                            className="flex items-center gap-2 px-4 py-2 bg-white/95 text-[#004e59] text-xs font-bold rounded-xl shadow-lg hover:bg-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                            <FiExternalLink size={14} /> Open Full Size
                                                        </a>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white">
                                                    <FiShield size={24} className="mb-1 text-gray-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">NID photo unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {reservation.guest_passport_document_url && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Passport Scan / Photo</label>
                                        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                                            {!passportImgError ? (
                                                <>
                                                    <img 
                                                        src={imgSrc(reservation.guest_passport_document_url)} 
                                                        alt="Passport Document" 
                                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                                                        onError={() => setPassportImgError(true)}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                                        <a href={imgSrc(reservation.guest_passport_document_url)} target="_blank" rel="noopener noreferrer" 
                                                            className="flex items-center gap-2 px-4 py-2 bg-white/95 text-[#004e59] text-xs font-bold rounded-xl shadow-lg hover:bg-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                            <FiExternalLink size={14} /> Open Full Size
                                                        </a>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white">
                                                    <FiShield size={24} className="mb-1 text-gray-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Passport photo unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── ROOM OCCUPANTS / EXTRA GUESTS ──────────────────────────────── */}
            {extraGuests && extraGuests.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#004e59]/10 flex items-center justify-center">
                                <FiUser size={15} className="text-[#004e59]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-800">Room Occupants</h3>
                                <p className="text-[10px] text-gray-400">Additional guests checked in with this reservation</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-[#004e59]/10 border border-[#004e59]/20 text-[#004e59] text-[10px] font-bold rounded-full">
                            {extraGuests.length} Guest{extraGuests.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {extraGuests.map((g, idx) => {
                            const fullName = `${g.first_name} ${g.last_name || ''}`.trim();
                            const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            return (
                                <div key={g.id || idx} className="flex items-start gap-3 p-4 bg-slate-50/50 border border-gray-100 rounded-2xl hover:border-[#004e59]/20 hover:bg-[#004e59]/5 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-[#004e59]/10 border border-[#004e59]/20 flex items-center justify-center text-[#004e59] text-xs font-black flex-shrink-0">
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-extrabold text-gray-800 leading-tight truncate">{fullName}</p>
                                        {g.gender && <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{g.gender}</p>}
                                        {g.phone && (
                                            <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#004e59] transition mt-1">
                                                <FiPhone size={10} /> {g.phone}
                                            </a>
                                        )}
                                        {g.email && (
                                            <a href={`mailto:${g.email}`} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#004e59] transition">
                                                <FiMail size={10} /> <span className="truncate">{g.email}</span>
                                            </a>
                                        )}
                                        {g.nid_number && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-0.5">
                                                <FiShield size={10} /> <span>NID: {g.nid_number}</span>
                                            </div>
                                        )}
                                        {g.passport_number && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-0.5">
                                                <FiFile size={10} /> <span>Pass: {g.passport_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── PAYMENT HISTORY ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#004e59]/10 flex items-center justify-center">
                            <FiCreditCard size={15} className="text-[#004e59]" />
                        </div>
                        <h3 className="text-sm font-black text-gray-800">Payment Transactions</h3>
                    </div>
                    <span className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">{payments.length} Records</span>
                </div>
                {payments.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                            <FiCreditCard size={18} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No transactions recorded for this reservation</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                    {['Date & Time', 'Transaction Ref', 'Payment Method', 'Transaction Type', 'Amount Paid', 'Status', 'Notes', ''].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((p, idx) => (
                                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/10' : ''}`}>
                                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(p.created_at)}</td>
                                        <td className="px-5 py-4 font-mono text-xs text-blue-600 font-bold whitespace-nowrap">
                                            {p.payment_reference?.split('-').slice(0, 3).join('-')}
                                        </td>
                                        <td className="px-5 py-4 text-gray-700 font-bold capitalize">{p.payment_method || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {(p.transaction_type || '').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-extrabold text-emerald-600 text-sm">৳{fmt(p.cr_amount)}</td>
                                        <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                                        <td className="px-5 py-4 text-gray-400 text-xs max-w-[180px] truncate">{p.notes || '—'}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            {p.status === 'completed' && parseFloat(p.cr_amount || 0) > 0 && (
                                                <button
                                                    onClick={() => window.open(`/hms/receipt/${p.id}`, '_blank')}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004e59]/10 text-[#004e59] hover:bg-[#004e59] hover:text-white rounded-lg font-bold text-xs transition-all shadow-sm"
                                                >
                                                    <FiPrinter size={12} /> Invoice/Receipt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── EXTRA BILLS ────────────────────────────────────────────────── */}
            {extraBills.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                <FiTag size={15} className="text-orange-500" />
                            </div>
                            <h3 className="text-sm font-black text-gray-800">Additional Service Fees</h3>
                        </div>
                        <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-full">{extraBills.length} Items</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                    {['Service Name / Description', 'Charge Amount', 'Billing Date', 'Notes'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {extraBills.map((b, idx) => (
                                    <tr key={b.id} className={`hover:bg-slate-50/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/10' : ''}`}>
                                        <td className="px-5 py-4 font-bold text-gray-800 text-xs">{b.service_name}</td>
                                        <td className="px-5 py-4 font-black text-orange-600 text-sm">৳{fmt(b.amount)}</td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">{fmtDate(b.created_at)}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs">{b.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── SPECIAL REQUESTS ───────────────────────────────────────────── */}
            {reservation.special_requests && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50/60 border border-amber-200/80 rounded-2xl p-5 flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <FiInfo size={16} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Special Guest Instructions</h4>
                        <p className="text-sm text-amber-800/90 leading-relaxed font-medium">{reservation.special_requests}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Tab: Invoices ───────────────────────────────────────────────────────────
const InvoicesTab = ({ data, reservationId }) => {
    const { reservation, summary, extraBills, foodOrders, payments } = data;
    const { settings } = useSettingsStore();
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    // Query to fetch all invoices (including database + virtual ones)
    const { data: invoices, isLoading, refetch } = useQuery(
        ['hms-res-invoices', reservationId],
        () => api.get(`/property-owner/hms/reservations/${reservationId}/invoices`),
        { select: r => r.data?.data?.invoices || [] }
    );

    // Form states for generating a new invoice
    const [invoiceType, setInvoiceType] = useState('partial');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Checklist and custom amounts for separate dues
    const [selectedDues, setSelectedDues] = useState({ room: false, food: false, extra: false });
    const [dueAmounts, setDueAmounts] = useState({ room: '', food: '', extra: '' });
    
    // Optional instant payment logging
    const [recordPayment, setRecordPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Currently selected invoice for preview/print
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Calculate category-wise outstanding dues using invoice-item mappings & waterfall fallback
    const calculatedDues = React.useMemo(() => {
        const roomCost = parseFloat(reservation.total_amount || 0);
        const extraItems = extraBills
            ? extraBills.filter(b => !b.service_name?.startsWith('Food Order #'))
            : [];
        const extraCost = extraItems.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);

        const foodItems = foodOrders
            ? foodOrders.filter(f => f.status !== 'cancelled' && f.payment_status !== 'paid')
            : [];
        const foodCost = foodItems.reduce((acc, f) => acc + parseFloat(f.total_amount || 0), 0);

        let remainingRoom = roomCost;
        let remainingExtra = extraCost;
        let remainingFood = foodCost;

        let paidRoom = 0;
        let paidExtra = 0;
        let paidFood = 0;

        const completedPayments = payments
            ? payments.filter(p => p.status === 'completed' && parseFloat(p.cr_amount || 0) > 0)
            : [];

        completedPayments.forEach(payment => {
            // Check if this payment matches a non-virtual invoice
            const matchingInvoice = (invoices || []).find(
                inv => inv.invoice_number === payment.payment_reference && !inv.is_virtual
            );

            if (matchingInvoice && matchingInvoice.items_json) {
                try {
                    const items = JSON.parse(matchingInvoice.items_json);
                    if (Array.isArray(items) && items.length > 0) {
                        const invAmt = parseFloat(matchingInvoice.amount || 0);
                        const scale = invAmt > 0 ? (parseFloat(payment.cr_amount || 0) / invAmt) : 0;
                        items.forEach(item => {
                            const itemAmt = parseFloat(item.amount || 0) * scale;
                            if (item.type === 'room') {
                                paidRoom += itemAmt;
                                remainingRoom = Math.max(0, remainingRoom - itemAmt);
                            } else if (item.type === 'food') {
                                paidFood += itemAmt;
                                remainingFood = Math.max(0, remainingFood - itemAmt);
                            } else if (item.type === 'extra') {
                                paidExtra += itemAmt;
                                remainingExtra = Math.max(0, remainingExtra - itemAmt);
                            }
                        });
                        return; // Successfully matched and allocated
                    }
                } catch (e) {
                    console.error('Failed to parse items_json for invoice', matchingInvoice.invoice_number, e);
                }
            }

            // Waterfall fallback for direct payments without an items-defined invoice
            let paymentAmt = parseFloat(payment.cr_amount || 0);

            // 1. Room
            const rAlloc = Math.min(remainingRoom, paymentAmt);
            paidRoom += rAlloc;
            remainingRoom -= rAlloc;
            paymentAmt -= rAlloc;

            // 2. Extra
            if (paymentAmt > 0) {
                const eAlloc = Math.min(remainingExtra, paymentAmt);
                paidExtra += eAlloc;
                remainingExtra -= eAlloc;
                paymentAmt -= eAlloc;
            }

            // 3. Food
            if (paymentAmt > 0) {
                const fAlloc = Math.min(remainingFood, paymentAmt);
                paidFood += fAlloc;
                remainingFood -= fAlloc;
                paymentAmt -= fAlloc;
            }

            // Excess goes to room
            if (paymentAmt > 0) {
                paidRoom += paymentAmt;
            }
        });

        return {
            room: Math.max(0, roomCost - paidRoom),
            food: Math.max(0, foodCost - paidFood),
            extra: Math.max(0, extraCost - paidExtra)
        };
    }, [reservation, payments, extraBills, foodOrders, invoices]);

    // Grouped costs for references
    const costsBreakdown = React.useMemo(() => {
        const roomCost = parseFloat(reservation.total_amount || 0);
        const extraItems = extraBills ? extraBills.filter(b => !b.service_name?.startsWith('Food Order #')) : [];
        const extraCost = extraItems.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
        const foodItems = foodOrders ? foodOrders.filter(f => f.status !== 'cancelled' && f.payment_status !== 'paid') : [];
        const foodCost = foodItems.reduce((acc, f) => acc + parseFloat(f.total_amount || 0), 0);
        return { room: roomCost, food: foodCost, extra: extraCost };
    }, [reservation, extraBills, foodOrders]);

    // Set defaults when dues load or change
    React.useEffect(() => {
        setSelectedDues({
            room: calculatedDues.room > 0,
            food: calculatedDues.food > 0,
            extra: calculatedDues.extra > 0
        });
        setDueAmounts({
            room: calculatedDues.room > 0 ? calculatedDues.room.toFixed(2) : '',
            food: calculatedDues.food > 0 ? calculatedDues.food.toFixed(2) : '',
            extra: calculatedDues.extra > 0 ? calculatedDues.extra.toFixed(2) : ''
        });
    }, [reservationId, calculatedDues.room, calculatedDues.food, calculatedDues.extra]);

    // Automatically select the first invoice to preview once invoices load
    React.useEffect(() => {
        if (invoices && invoices.length > 0 && !selectedInvoice) {
            setSelectedInvoice(invoices[0]);
        }
    }, [invoices, selectedInvoice]);

    // Calculate dynamic total for the invoice to be generated
    const totalInvoiceAmount = React.useMemo(() => {
        const rAmt = selectedDues.room ? parseFloat(dueAmounts.room || 0) : 0;
        const fAmt = selectedDues.food ? parseFloat(dueAmounts.food || 0) : 0;
        const eAmt = selectedDues.extra ? parseFloat(dueAmounts.extra || 0) : 0;
        return rAmt + fAmt + eAmt;
    }, [selectedDues, dueAmounts]);

    const handleSave = async () => {
        setIsSaving(true);
        const amount = totalInvoiceAmount;
        if (amount <= 0) {
            showError('Please select at least one due category with a valid amount');
            setIsSaving(false);
            return;
        }

        // Validate partial amounts do not exceed actual dues or be less than/equal to 0
        if (selectedDues.room) {
            const val = parseFloat(dueAmounts.room || 0);
            if (val <= 0) {
                showError('Please enter a valid amount greater than 0 for Room Accommodation');
                setIsSaving(false);
                return;
            }
            if (val > calculatedDues.room) {
                showError(`Room payment cannot exceed room due of ৳${calculatedDues.room.toFixed(2)}`);
                setIsSaving(false);
                return;
            }
        }
        if (selectedDues.food) {
            const val = parseFloat(dueAmounts.food || 0);
            if (val <= 0) {
                showError('Please enter a valid amount greater than 0 for Food & Beverage');
                setIsSaving(false);
                return;
            }
            if (val > calculatedDues.food) {
                showError(`Food payment cannot exceed food due of ৳${calculatedDues.food.toFixed(2)}`);
                setIsSaving(false);
                return;
            }
        }
        if (selectedDues.extra) {
            const val = parseFloat(dueAmounts.extra || 0);
            if (val <= 0) {
                showError('Please enter a valid amount greater than 0 for Extra Service Charges');
                setIsSaving(false);
                return;
            }
            if (val > calculatedDues.extra) {
                showError(`Extras payment cannot exceed extras due of ৳${calculatedDues.extra.toFixed(2)}`);
                setIsSaving(false);
                return;
            }
        }

        const items = [];
        if (selectedDues.room && parseFloat(dueAmounts.room || 0) > 0) {
            items.push({
                type: 'room',
                amount: parseFloat(dueAmounts.room),
                label: `Accommodation: Room ${reservation.room_number || 'N/A'} (Partial)`,
                description: `${reservation.room_type} · ${reservation.property_title}`
            });
        }
        if (selectedDues.food && parseFloat(dueAmounts.food || 0) > 0) {
            items.push({
                type: 'food',
                amount: parseFloat(dueAmounts.food),
                label: 'Food & Beverage (Partial)',
                description: 'Gourmet menu items and refreshments'
            });
        }
        if (selectedDues.extra && parseFloat(dueAmounts.extra || 0) > 0) {
            items.push({
                type: 'extra',
                amount: parseFloat(dueAmounts.extra),
                label: 'Extra Services (Partial)',
                description: 'Service charges and extra room amenities'
            });
        }

        const invoiceNumber = `INV-${reservation.booking_reference}-${Date.now().toString().slice(-4)}`;

        try {
            await api.post(`/property-owner/hms/reservations/${reservationId}/invoices`, {
                invoice_number: invoiceNumber,
                invoice_type: invoiceType,
                amount: amount,
                notes,
                items,
                record_payment: recordPayment,
                payment_method: paymentMethod
            });
            showSuccess('Invoice generated successfully!');
            setNotes('');
            setRecordPayment(false);
            queryClient.invalidateQueries(['hms-res-invoices', reservationId]);
            queryClient.invalidateQueries(['hms-res-detail', reservationId]);
            refetch();
        } catch (e) {
            showError('Failed to save invoice');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => window.print();

    // Mapping for Invoice Type colors
    const typeColors = {
        full: 'bg-blue-100 text-blue-700 border-blue-200',
        due: 'bg-red-100 text-red-700 border-red-200',
        proforma: 'bg-purple-100 text-purple-700 border-purple-200',
        partial: 'bg-orange-100 text-orange-700 border-orange-200',
        booking_payment: 'bg-green-100 text-green-700 border-green-200',
        partial_payment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    const guestName = reservation.guest_name ||
        (reservation.guest_first_name ? `${reservation.guest_first_name} ${reservation.guest_last_name}` : 'Guest');

    const hasAnyDue = calculatedDues.room > 0 || calculatedDues.food > 0 || calculatedDues.extra > 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column: List of Invoices & Generate New Invoice Form */}
                <div className="print-hidden lg:col-span-1 space-y-6">
                    
                    {/* Invoice History List */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FiList className="text-[#004e59]" /> Invoices List
                        </h3>
                        {isLoading ? (
                            <div className="py-8 flex justify-center"><LoadingSpinner /></div>
                        ) : !invoices || invoices.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-xs">No invoices found.</div>
                        ) : (
                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                {invoices.map(inv => {
                                    const isSelected = selectedInvoice?.id === inv.id;
                                    return (
                                        <div
                                            key={inv.id}
                                            onClick={() => setSelectedInvoice(inv)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-[#004e59] bg-[#004e59]/5 shadow-sm'
                                                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-mono font-bold text-xs text-[#004e59] truncate w-[140px]" title={inv.invoice_number}>
                                                    {inv.invoice_number}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${typeColors[inv.invoice_type] || 'bg-gray-100 text-gray-700'}`}>
                                                    {(inv.invoice_type || '').replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-400">{fmtDate(inv.created_at)}</span>
                                                <span className="font-black text-gray-900 text-sm">৳{fmt(inv.amount)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Generate New Invoice Form */}
                    {hasAnyDue && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiPlus className="text-[#004e59]" /> Generate Invoice
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Dues Breakdown List */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select dues to invoice</label>
                                    
                                    {/* 1. Room Due */}
                                    {calculatedDues.room > 0 && (
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDues.room}
                                                        onChange={e => setSelectedDues({ ...selectedDues, room: e.target.checked })}
                                                        className="rounded text-[#004e59] focus:ring-[#004e59]"
                                                    />
                                                    Room Accommodation
                                                </label>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">৳{fmt(calculatedDues.room)} due</span>
                                            </div>
                                            {selectedDues.room && (
                                                <div className="flex items-center gap-2 pl-6">
                                                    <span className="text-xs text-gray-400">Amount:</span>
                                                    <input
                                                        type="number"
                                                        value={dueAmounts.room}
                                                        onChange={e => setDueAmounts({ ...dueAmounts, room: e.target.value })}
                                                        placeholder="৳0.00"
                                                        className="w-full max-w-[120px] border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. Food Due */}
                                    {calculatedDues.food > 0 && (
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDues.food}
                                                        onChange={e => setSelectedDues({ ...selectedDues, food: e.target.checked })}
                                                        className="rounded text-[#004e59] focus:ring-[#004e59]"
                                                    />
                                                    Food & Beverage
                                                </label>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">৳{fmt(calculatedDues.food)} due</span>
                                            </div>
                                            {selectedDues.food && (
                                                <div className="flex items-center gap-2 pl-6">
                                                    <span className="text-xs text-gray-400">Amount:</span>
                                                    <input
                                                        type="number"
                                                        value={dueAmounts.food}
                                                        onChange={e => setDueAmounts({ ...dueAmounts, food: e.target.value })}
                                                        placeholder="৳0.00"
                                                        className="w-full max-w-[120px] border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. Extras Due */}
                                    {calculatedDues.extra > 0 && (
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDues.extra}
                                                        onChange={e => setSelectedDues({ ...selectedDues, extra: e.target.checked })}
                                                        className="rounded text-[#004e59] focus:ring-[#004e59]"
                                                    />
                                                    Extra Service Charges
                                                </label>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">৳{fmt(calculatedDues.extra)} due</span>
                                            </div>
                                            {selectedDues.extra && (
                                                <div className="flex items-center gap-2 pl-6">
                                                    <span className="text-xs text-gray-400">Amount:</span>
                                                    <input
                                                        type="number"
                                                        value={dueAmounts.extra}
                                                        onChange={e => setDueAmounts({ ...dueAmounts, extra: e.target.value })}
                                                        placeholder="৳0.00"
                                                        className="w-full max-w-[120px] border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Summary details */}
                                <div className="p-3 bg-[#004e59]/5 rounded-xl border border-[#004e59]/10 flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-600">Total Invoice Amount:</span>
                                    <span className="font-black text-lg text-[#004e59]">৳{fmt(totalInvoiceAmount)}</span>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Invoice Type</label>
                                    <select
                                        value={invoiceType}
                                        onChange={e => setInvoiceType(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                    >
                                        <option value="partial">Partial Payment Invoice</option>
                                        <option value="due">Due Invoice</option>
                                        <option value="proforma">Pro-Forma Invoice</option>
                                        <option value="full">Full Invoice</option>
                                    </select>
                                </div>

                                {/* Record instant payment */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={recordPayment}
                                            onChange={e => setRecordPayment(e.target.checked)}
                                            className="rounded text-[#004e59] focus:ring-[#004e59]"
                                        />
                                        Record Payment Instantly (Paid)
                                    </label>
                                    {recordPayment && (
                                        <div className="space-y-2 pt-1 pl-5">
                                            <div>
                                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={e => setPaymentMethod(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                                >
                                                    <option value="cash">Cash Payment</option>
                                                    <option value="card">Credit/Debit Card</option>
                                                    <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                                                    <option value="bank_transfer">Bank Transfer</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Notes / Remarks</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="e.g. Received partial cash for food bill"
                                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#004e59] hover:bg-[#003d4d] text-white rounded-lg font-bold text-xs transition disabled:opacity-50"
                                >
                                    <FiCheck size={14} /> {isSaving ? 'Generating...' : 'Generate & Save'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Invoice Preview Pane & Print Controls */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedInvoice ? (() => {
                        const payId = selectedInvoice.id?.toString().startsWith('virtual-pay-')
                            ? selectedInvoice.id.toString().replace('virtual-pay-', '')
                            : payments?.find(p => p.payment_reference === selectedInvoice.invoice_number && p.status === 'completed' && parseFloat(p.cr_amount || 0) > 0)?.id;
                        
                        return (
                            <>
                            {/* Print Control Bar */}
                            <div className="print-hidden bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">
                                    Viewing Invoice: <strong className="text-gray-900">{selectedInvoice.invoice_number}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const subject = encodeURIComponent(`Invoice - Ref: ${reservation.booking_reference}`);
                                            const body = encodeURIComponent(`Dear ${guestName},\n\nPlease find your invoice here: ${window.location.origin}/hms/invoice/${reservation.id}\n\nThank you,\n${reservation.property_title || 'Management'}`);
                                            window.open(`mailto:${reservation.guest_email || ''}?subject=${subject}&body=${body}`, '_blank');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700 transition"
                                    >
                                        <FiMail size={14} /> Send Email
                                    </button>
                                    <button
                                        onClick={() => {
                                            const phone = reservation.guest_phone ? reservation.guest_phone.replace(/[+\s-]/g, '') : '';
                                            const text = encodeURIComponent(`Hello *${guestName}*,\nHere is your invoice for booking REF: *${reservation.booking_reference}*.\n\nView online at: ${window.location.origin}/hms/invoice/${reservation.id}\n\nThank you!`);
                                            window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition"
                                    >
                                        <FiMessageCircle size={14} /> Send WhatsApp
                                    </button>
                                    {payId && (
                                        <button
                                            onClick={() => window.open(`/hms/receipt/${payId}`, '_blank')}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-[#004e59] text-[#004e59] rounded-lg font-bold text-xs hover:bg-[#004e59]/5 transition"
                                        >
                                            <FiExternalLink size={14} /> View Money Receipt
                                        </button>
                                    )}
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d4d] transition shadow-md"
                                    >
                                        <FiPrinter size={14} /> Print / Save as PDF
                                    </button>
                                </div>
                            </div>

                            {/* Print Preview Component */}
                            <div id="invoice-preview" className="bg-white p-8 sm:p-10 rounded-xl border border-gray-100 shadow-sm text-sm">
                                {/* Header */}
                                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                                    <div>
                                        <img src={settings?.site_logo || '/logo.png'} alt="Logo" className="h-10 mb-3 object-contain" />
                                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                                            {payId
                                                ? 'Payment Receipt'
                                                : selectedInvoice.invoice_type === 'due'
                                                ? 'Due Invoice'
                                                : selectedInvoice.invoice_type === 'proforma'
                                                ? 'Pro-Forma Invoice'
                                                : 'Invoice'}
                                        </h1>
                                        <p className="text-gray-500 font-mono text-xs mt-1"># {selectedInvoice.invoice_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-lg font-black text-[#004e59] uppercase">
                                            {reservation.property_type === 'hotels' ? (reservation.company_name || reservation.property_title) : reservation.property_title}
                                        </h2>
                                        {reservation.property_type === 'hotels' && (
                                            <p className="text-xs text-gray-500 mt-1">{reservation.property_title}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{reservation.property_address || reservation.property_city}</p>
                                    </div>
                                </div>

                                {/* Bill-to & Details */}
                                <div className="grid grid-cols-2 gap-12 mb-10">
                                    <div>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bill To</h3>
                                        <p className="font-bold text-gray-900 text-base">{guestName}</p>
                                        <p className="text-gray-500 text-xs mt-1">{reservation.guest_email || reservation.guest_user_email || '—'}</p>
                                        <p className="text-gray-500 text-xs">{reservation.guest_phone || reservation.guest_user_phone || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Details</h3>
                                        <div className="space-y-1">
                                            {[
                                                ['Date', fmtDate(selectedInvoice.created_at)],
                                                ['Booking Ref', reservation.booking_reference],
                                                ['Check-in', fmtDate(reservation.check_in_date)],
                                                ['Check-out', fmtDate(reservation.check_out_date)],
                                            ].map(([k, v]) => (
                                                <div key={k} className="flex justify-end gap-6 text-xs">
                                                    <span className="text-gray-500">{k}:</span>
                                                    <span className="font-bold text-gray-900 w-32 text-right">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <table className="w-full mb-10 text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-gray-900">
                                            {['Description', 'Qty', 'Rate', 'Amount'].map(h => (
                                                <th key={h} className={`py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(() => {
                                            try {
                                                const items = selectedInvoice.items_json ? JSON.parse(selectedInvoice.items_json) : null;
                                                if (Array.isArray(items) && items.length > 0) {
                                                    return items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-5">
                                                                <p className="font-bold text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                                                            </td>
                                                            <td className="py-5 text-right font-bold text-gray-700">1</td>
                                                            <td className="py-5 text-right font-bold text-gray-700">৳{fmt(item.amount)}</td>
                                                            <td className="py-5 text-right font-black text-gray-900">৳{fmt(item.amount)}</td>
                                                        </tr>
                                                    ));
                                                }
                                            } catch (e) {
                                                console.error('Failed to parse items_json', e);
                                            }
                                            // Fallback to old behavior for legacy fallback invoices
                                            const securityDeposit = parseFloat(reservation.security_deposit || 0);
                                            const totalAmount = parseFloat(reservation.total_amount || 0);
                                            const roomRent = parseFloat(reservation.base_price || (totalAmount - securityDeposit));

                                            return (
                                                <>
                                                    {roomRent > 0 && (
                                                        <tr>
                                                            <td className="py-5">
                                                                <p className="font-bold text-gray-900">Accommodation: Room {reservation.room_number || 'N/A'}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{reservation.room_type} · {reservation.property_title}</p>
                                                            </td>
                                                            <td className="py-5 text-right font-bold text-gray-700">{reservation.nights} Nights</td>
                                                            <td className="py-5 text-right font-bold text-gray-700">৳{fmt(roomRent / Math.max(reservation.nights, 1))}</td>
                                                            <td className="py-5 text-right font-black text-gray-900">৳{fmt(roomRent)}</td>
                                                        </tr>
                                                    )}
                                                    {securityDeposit > 0 && (
                                                        <tr>
                                                            <td className="py-5">
                                                                <p className="font-bold text-gray-900">Security Deposit (Refundable)</p>
                                                                <p className="text-xs text-gray-400 mt-1">Security Guarantee Deposit</p>
                                                            </td>
                                                            <td className="py-5 text-right font-bold text-gray-700">1</td>
                                                            <td className="py-5 text-right font-bold text-gray-700">৳{fmt(securityDeposit)}</td>
                                                            <td className="py-5 text-right font-black text-gray-900">৳{fmt(securityDeposit)}</td>
                                                        </tr>
                                                    )}
                                                    {extraBills.map(b => (
                                                        <tr key={b.id}>
                                                            <td className="py-4">
                                                                <p className="font-bold text-gray-800">{b.service_name}</p>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Extra Service</p>
                                                            </td>
                                                            <td className="py-4 text-right text-gray-700">1</td>
                                                            <td className="py-4 text-right text-gray-700">৳{fmt(b.amount)}</td>
                                                            <td className="py-4 text-right font-bold text-gray-900">৳{fmt(b.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    {foodOrders.filter(f => f.payment_status !== 'cancelled').map(f => (
                                                        <tr key={f.id}>
                                                            <td className="py-4">
                                                                <p className="font-bold text-gray-800">Food & Beverage</p>
                                                                <p className="text-[10px] text-gray-400 font-mono">Order #{f.id}</p>
                                                            </td>
                                                            <td className="py-4 text-right text-gray-700">1</td>
                                                            <td className="py-4 text-right text-gray-700">৳{fmt(f.total_amount)}</td>
                                                            <td className="py-4 text-right font-bold text-gray-900">৳{fmt(f.total_amount)}</td>
                                                        </tr>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-72 space-y-2">
                                        {selectedInvoice.items_json ? (
                                            <div className="pt-3 border-t-2 border-gray-900 flex justify-between">
                                                <span className="font-black text-gray-900 uppercase text-xs">
                                                    {payId
                                                        ? 'Payment Received'
                                                        : 'Invoice Total'}
                                                </span>
                                                <span className="font-black text-[#004e59] text-base">৳{fmt(selectedInvoice.amount)}</span>
                                            </div>
                                        ) : (
                                            <>
                                                {[
                                                    ['Grand Total', summary.grand_total],
                                                    ['Total Paid', -summary.paid_amount],
                                                ].map(([label, val]) => (
                                                    <div key={label} className="flex justify-between text-sm text-gray-600">
                                                        <span>{label}</span>
                                                        <span className={`font-bold ${label === 'Total Paid' ? 'text-emerald-700' : 'text-gray-900'}`}>
                                                            {label === 'Total Paid' ? `(৳${fmt(summary.paid_amount)})` : `৳${fmt(val)}`}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="pt-3 border-t-2 border-gray-900 flex justify-between">
                                                    <span className="font-black text-gray-900 uppercase text-xs">
                                                        {payId ? 'Payment Received' : 'Invoice Value'}
                                                    </span>
                                                    <span className="font-black text-[#004e59] text-base">৳{fmt(selectedInvoice.amount)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {selectedInvoice.notes && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-8 text-xs text-gray-600">
                                        <strong>Notes: </strong>{selectedInvoice.notes}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="border-t border-gray-100 pt-8 flex justify-between items-end">
                                    <p className="text-xs text-gray-400">Generated on {fmtDateTime(selectedInvoice.created_at)}</p>
                                    <div className="text-center">
                                        <div className="border-b border-gray-400 w-40 mb-1.5"></div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                        </>
                        );
                    })() : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
                            Select an invoice from the list to preview and print.
                        </div>
                    )}
                </div>
            </div>

            {/* Print-only CSS layout */}
            <style>{`
                @media print {
                    body > *:not(#root) {
                        display: none !important;
                    }
                    aside, header, button, .print-hidden, .bg-black.bg-opacity-50, [class*="bg-opacity-"] {
                        display: none !important;
                    }
                    /* Reset parent wrappers to static and block layout so print container takes full page width */
                    html, body, #root, #root > div, main, .print-hidden-controls, .grid, [class*="col-span-"] {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #invoice-preview {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 40px !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
};

// ─── Tab: Confirmation Letter ────────────────────────────────────
const ConfirmationLetterTab = ({ data }) => {
    const { reservation, summary, extraGuests } = data;
    const { settings } = useSettingsStore();
    const guestName = reservation.guest_name ||
        (reservation.guest_first_name ? `${reservation.guest_first_name} ${reservation.guest_last_name}` : 'Guest');
    const guestPhone = reservation.guest_phone || reservation.guest_user_phone || '';
    const handlePrint = () => window.print();

    // Format: "07-Jun-2026, 02:00 PM"
    const fmtCheckInOut = (d) => { try { return format(new Date(d), 'dd-MMM-yyyy, hh:mm aa'); } catch { return d || '—'; } };

    const rows = [
        ['Number of Rooms', '1'],
        ['Room category', reservation.room_type || '—'],
        ['Rack Rate', reservation.total_amount ? parseFloat(reservation.total_amount / Math.max(reservation.nights, 1)).toFixed(0) : '—'],
        ['Special Room Rate', reservation.base_price ? parseFloat(reservation.base_price / Math.max(reservation.nights, 1)).toFixed(0) : '—'],
        ['Complimentary', reservation.special_requests || ''],
        ['Check in Date & Time', fmtCheckInOut(reservation.check_in_date)],
        ['Check out Date & Time', fmtCheckInOut(reservation.check_out_date)],
        ['Number of Nights', String(reservation.nights || 0)],
        ['Number of Occupants', `${reservation.number_of_guests || 1} Adult${(reservation.number_of_guests || 1) > 1 ? 's' : ''}${extraGuests?.length ? ` + ${extraGuests.length} Extra Guest${extraGuests.length > 1 ? 's' : ''}` : ''}`],
        ['Reservation Number', reservation.booking_reference],
        ['Mode Payment', reservation.payment_method || ''],
        ['Note', reservation.payment_notes || ''],
    ];

    return (
        <div className="space-y-4">
            {/* Print & share buttons — hidden when printing */}
            <div className="print-hidden flex flex-wrap gap-2">
                <button
                    onClick={() => {
                        const subject = encodeURIComponent(`Booking Confirmation - Ref: ${reservation.booking_reference}`);
                        const body = encodeURIComponent(`Dear ${guestName},\n\nPlease find your booking confirmation details below:\n- Reservation Number: ${reservation.booking_reference}\n- Room Category: ${reservation.room_type || 'N/A'}\n- Check-in: ${fmtCheckInOut(reservation.check_in_date)}\n- Check-out: ${fmtCheckInOut(reservation.check_out_date)}\n\nThank you,\n${reservation.property_title || settings?.site_name || 'Management'}`);
                        window.open(`mailto:${reservation.guest_email || ''}?subject=${subject}&body=${body}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700 transition shadow"
                >
                    <FiMail size={14} /> Send Email
                </button>
                <button
                    onClick={() => {
                        const phone = guestPhone ? guestPhone.replace(/[+\s-]/g, '') : '';
                        const text = encodeURIComponent(`Hello *${guestName}*,\nHere is your booking confirmation for REF: *${reservation.booking_reference}*.\n- Room: ${reservation.room_type || 'N/A'}\n- Check-in: ${fmtCheckInOut(reservation.check_in_date)}\n- Check-out: ${fmtCheckInOut(reservation.check_out_date)}\n\nThank you!`);
                        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition shadow"
                >
                    <FiMessageCircle size={14} /> Send WhatsApp
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d4d] transition shadow-md"
                >
                    <FiPrinter size={14} /> Print / Save as PDF
                </button>
            </div>

            <style>{`
                @media print {
                    body > *:not(#root) {
                        display: none !important;
                    }
                    aside, header, button, .print-hidden, .bg-black.bg-opacity-50, [class*="bg-opacity-"] {
                        display: none !important;
                    }
                    /* Reset parent wrappers to static and block layout so print container takes full page width */
                    html, body, #root, #root > div, main, .print-hidden-controls, .grid, [class*="col-span-"] {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #conf-letter {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 40px 50px !important;
                        margin: 0 !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }
                }
            `}</style>

            {/* ── Confirmation Letter ─────────────────────────────────── */}
            <div
                id="conf-letter"
                className="bg-white border border-gray-200 shadow-sm mx-auto"
                style={{ maxWidth: 680, fontFamily: 'Georgia, serif', fontSize: 13, color: '#222', padding: '48px 56px' }}
            >
                {/* Logo + Hotel Name + Contact */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <img
                        src={settings?.site_logo || '/logo.png'}
                        alt="Logo"
                        style={{ height: 64, objectFit: 'contain', marginBottom: 8, display: 'inline-block' }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>
                        {reservation.property_title}
                    </div>
                    <div style={{ fontSize: 12, color: '#444', marginTop: 3 }}>
                        {settings?.support_phone && `Phone: ${settings.support_phone}`}
                        {settings?.support_phone && settings?.site_phone && '  '}
                        {settings?.site_phone && `  Mobile: ${settings.site_phone}`}
                        {(!settings?.support_phone && !settings?.site_phone) && (guestPhone ? `Contact: ${guestPhone}` : '')}
                    </div>
                </div>

                {/* Title with underline */}
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'inline-block' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
                            Reservation Confirmation Letter
                        </div>
                        <div style={{ borderBottom: '1.5px solid #222', marginTop: 3 }}></div>
                    </div>
                </div>

                {/* Date / Guest / Contact */}
                <div style={{ marginBottom: 18, lineHeight: 1.9 }}>
                    {[
                        ['Date', fmtDate(new Date())],
                        ['Booking Reference', reservation.booking_reference || '—'],
                        ['Guest Name', guestName],
                        ['Contact No', guestPhone],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', fontSize: 13, alignItems: 'center', margin: label === 'Booking Reference' ? '2px 0' : '0' }}>
                            <span style={{ width: 130, flexShrink: 0 }}>{label}</span>
                            <span style={{ marginRight: 8 }}>:</span>
                            {label === 'Booking Reference' ? (
                                <span style={{ fontWeight: 700, backgroundColor: '#fff3cd', color: '#856404', padding: '1px 8px', borderRadius: '4px', fontFamily: 'monospace', border: '1px solid #ffeeba', display: 'inline-block', lineHeight: '1.4' }}>
                                    {value}
                                </span>
                            ) : (
                                <span style={{ fontWeight: 400 }}>{value}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Greeting */}
                <div style={{ marginBottom: 14, lineHeight: 1.8 }}>
                    <div style={{ marginBottom: 10 }}>Dear Sir/Madam,</div>
                    <div style={{ textAlign: 'justify', lineHeight: 1.75 }}>
                        Please accept greetings from the management of{' '}
                        <strong>{settings?.site_name || 'Key Host Homes'}</strong>. Thank you very much for
                        choosing our hotel for your upcoming tour at{' '}
                        <strong>{reservation.property_city || reservation.property_title}</strong>. Our
                        management is pleased to confirm your booking as specified under.
                    </div>
                </div>

                {/* Booking detail rows */}
                <div style={{ marginBottom: 18, lineHeight: 2 }}>
                    {rows.map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', fontSize: 13 }}>
                            <span style={{ width: 210, flexShrink: 0 }}>{label}</span>
                            <span style={{ marginRight: 8 }}>:</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Extra Guests / Occupants table */}
                {extraGuests && extraGuests.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
                            Additional Room Occupants ({extraGuests.length})
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    {['#', 'Name', 'Gender', 'Phone', 'Email', 'NID', 'Passport'].map(h => (
                                        <th key={h} style={{ padding: '5px 8px', textAlign: 'left', border: '1px solid #ddd', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {extraGuests.map((g, i) => (
                                    <tr key={g.id || i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{i + 1}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd', fontWeight: 600 }}>{`${g.first_name} ${g.last_name || ''}`.trim()}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{g.gender || '—'}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{g.phone || '—'}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{g.email || '—'}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{g.nid_number || '—'}</td>
                                        <td style={{ padding: '5px 8px', border: '1px solid #ddd' }}>{g.passport_number || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Closing paragraph */}
                <div style={{ lineHeight: 1.8, marginBottom: 20, textAlign: 'justify' }}>
                    Have a safe and comfortable journey and enjoy the services of our trained staff. Should you need more
                    information, please do not hesitate to contact us.
                </div>

                {/* Sign-off */}
                <div style={{ lineHeight: 1.9, marginBottom: 28 }}>
                    <div>Thanking you.</div>
                    <div style={{ fontWeight: 600 }}>
                        {reservation.property_type === 'hotels' ? (reservation.company_name || settings?.site_name || 'Management') : (reservation.property_title || settings?.site_name || 'Management')}
                    </div>
                    <div>Front Office</div>
                    <div style={{ fontWeight: 600 }}>{settings?.site_name || 'Key Host Homes'}</div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #bbb', marginBottom: 14 }}></div>

                {/* Special Information */}
                <div style={{ fontSize: 12.5 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Special Information:</div>
                    <div>01. Check in time not earlier than 02:00 PM and check out time not later than 11:55 AM.</div>
                    <div>02. Extra facilities can be arranged on request.</div>
                    {reservation.special_requests && (
                        <div>03. {reservation.special_requests}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Tab: Contract Agreement (Reservation Info) ──────────────────────────────
const ContractAgreementTab = ({ data }) => {
    const { reservation, summary, extraGuests } = data;
    const { settings } = useSettingsStore();
    const guestName = reservation.guest_name ||
        (reservation.guest_first_name ? `${reservation.guest_first_name} ${reservation.guest_last_name}` : '—');
    const guestPhone = reservation.guest_phone || reservation.guest_user_phone || '';
    const guestNid = reservation.guest_nid_number || reservation.guest_passport_number || '—';

    // Parse phone digits into 11 boxes
    const cleanPhone = guestPhone.replace(/\D/g, '').slice(-11);
    const phoneDigits = Array.from({ length: 11 }, (_, i) => cleanPhone[i] || '');
    const blankDigits = Array.from({ length: 11 }, () => '');
    const handlePrint = () => window.print();

    // Fetch all rooms owned by the host dynamically
    const { data: propertyRooms } = useQuery(
        ['hms-rooms-all'],
        async () => {
            const response = await api.get('/property-owner/hms/rooms/all');
            return response.data?.data?.rooms || [];
        }
    );

    const activeRoomNum = String(reservation.room_number || '').trim();

    // Generate room list dynamically based on loaded property rooms
    const roomsList = React.useMemo(() => {
        if (!propertyRooms || propertyRooms.length === 0) {
            return activeRoomNum ? [{ num: activeRoomNum, desc: reservation.room_type || '' }] : [];
        }
        let list = propertyRooms.map(r => ({
            num: String(r.room_number),
            desc: r.room_type || ''
        }));
        const exists = list.some(r => r.num.toLowerCase() === activeRoomNum.toLowerCase());
        if (!exists && activeRoomNum) {
            list.push({ num: activeRoomNum, desc: reservation.room_type || '' });
        }
        return list;
    }, [propertyRooms, activeRoomNum, reservation.room_type]);

    // Format times and dates nicely
    const fmtCheckInOut = (d) => { try { return format(new Date(d), 'dd-MMM-yyyy'); } catch { return d || '—'; } };
    const ratePerNight = reservation.base_price ? parseFloat(reservation.base_price / Math.max(reservation.nights, 1)).toFixed(0) : '—';

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="print-hidden flex flex-wrap gap-2">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d4d] transition shadow-md"
                >
                    <FiPrinter size={14} /> Print Agreement / PDF
                </button>
            </div>

            {/* A4 Printable Document Container */}
            <div
                id="contract-agreement-doc"
                className="bg-white border border-gray-200 shadow-sm mx-auto p-12 text-slate-800"
                style={{ maxWidth: 800, fontFamily: '"Georgia", serif', fontSize: '13px', lineHeight: '1.6' }}
            >
                {/* ── PAGE 1: Contract Details ── */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-base font-bold uppercase tracking-wider m-0">{reservation.property_title || settings?.site_name || 'KeyHost Homes'}</h2>
                        <h3 className="text-sm font-bold uppercase tracking-wide underline mt-1">Contract Agreement</h3>
                    </div>

                    {/* Meta Fields */}
                    <div className="space-y-1.5 pt-2">
                        <div><strong>Booking Reference:</strong> <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md ml-1 inline-block text-xs">{reservation.booking_reference || '—'}</span></div>
                        <div><strong>Property Address:</strong> {reservation.property_address || reservation.property_title || '—'}</div>
                        <div><strong>Owner/Manager:</strong> {settings?.site_name || 'KeyHost Homes'}</div>
                    </div>

                    {/* Guest Section */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-baseline">
                            <span className="shrink-0"><strong>Guest Name:</strong></span>
                            <span className="flex-1 border-b border-dashed border-slate-400 pl-2 font-bold text-slate-900">{guestName}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-baseline gap-y-2 text-xs pt-1">
                            <span className="shrink-0 mr-2"><strong>Guest National ID/Passport No(s):</strong></span>
                            
                            <div className="flex items-center gap-1.5 mr-6">
                                <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[10px] font-bold rounded-sm ${
                                    !!reservation.guest_nid_number ? 'border-slate-800 bg-slate-100 text-slate-800' : 'border-slate-300'
                                }`}>
                                    {!!reservation.guest_nid_number ? '✓' : ''}
                                </span>
                                <span className="font-bold">NID:</span>
                                <span className={`font-mono ${!!reservation.guest_nid_number ? 'font-bold text-slate-900 border-b border-dashed border-slate-400 px-1' : 'text-slate-400'}`}>
                                    {reservation.guest_nid_number || '____________________'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[10px] font-bold rounded-sm ${
                                    !!reservation.guest_passport_number ? 'border-slate-800 bg-slate-100 text-slate-800' : 'border-slate-300'
                                }`}>
                                    {!!reservation.guest_passport_number ? '✓' : ''}
                                </span>
                                <span className="font-bold">Passport:</span>
                                <span className={`font-mono ${!!reservation.guest_passport_number ? 'font-bold text-slate-900 border-b border-dashed border-slate-400 px-1' : 'text-slate-400'}`}>
                                    {reservation.guest_passport_number || '____________________'}
                                </span>
                            </div>
                        </div>

                        {/* Phone Boxes */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold shrink-0 w-32">Mobile Number:</span>
                                <div className="flex gap-1">
                                    {phoneDigits.map((digit, idx) => (
                                        <span key={idx} className="w-5 h-6 border border-slate-400 bg-slate-50 flex items-center justify-center font-mono font-bold text-xs rounded-sm shadow-sm">{digit}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold shrink-0 w-32">Emergency Contact:</span>
                                <div className="flex gap-1">
                                    {blankDigits.map((_, idx) => (
                                        <span key={idx} className="w-5 h-6 border border-slate-300 bg-white rounded-sm"></span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Name & Relation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-baseline">
                                <span className="shrink-0 text-xs">Name:</span>
                                <span className="flex-1 border-b border-dashed border-slate-300 ml-1"></span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="shrink-0 text-xs">Relation:</span>
                                <span className="flex-1 border-b border-dashed border-slate-300 ml-1"></span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details Room Grid */}
                    <div className="space-y-3 pt-3">
                        <h4 className="text-xs font-bold uppercase underline tracking-wider">Booking Details</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 pl-2">
                            {roomsList.map((room, idx) => {
                                const isChecked = activeRoomNum === room.num;
                                return (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        <span className={`w-4 h-4 border flex items-center justify-center font-bold rounded-sm ${
                                            isChecked ? 'border-slate-800 bg-slate-100 text-slate-800' : 'border-slate-300'
                                        }`}>
                                            {isChecked ? '✓' : ''}
                                        </span>
                                        <span>Room {room.num} {room.desc && `- ${room.desc}`}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Guest Limit details */}
                        <div className="text-xs pt-1.5 space-y-1">
                            <div>
                                <strong>Number of Guests:</strong>{' '}
                                <span className="underline font-bold px-1">
                                    {reservation.number_of_guests || '______'}
                                </span>{' '}
                                {reservation.number_of_children > 0 && (
                                    <>
                                        +{' '}
                                        <span className="underline font-bold px-1">
                                            {reservation.number_of_children}
                                        </span>{' '}
                                        Child{reservation.number_of_children !== 1 ? 'ren' : ''}{' '}
                                    </>
                                )}
                                {reservation.number_of_infants > 0 && (
                                    <>
                                        +{' '}
                                        <span className="underline font-bold px-1">
                                            {reservation.number_of_infants}
                                        </span>{' '}
                                        Infant{reservation.number_of_infants !== 1 ? 's' : ''}{' '}
                                    </>
                                )}
                                (Maximum 2 per room)
                            </div>
                            <div className="font-bold">Extra Guest if applicable:</div>
                            {extraGuests && extraGuests.length > 0 ? (
                                <div className="mt-1 space-y-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><strong>Number of Extra Guests:</strong>{' '}
                                            <span className="underline font-bold px-1">{extraGuests.length}</span>
                                        </div>
                                        <div><strong>Total Extra Guest Fee: BDT</strong>{' '}
                                            <span className="underline font-bold px-1">
                                                {data.extraBills
                                                    ? data.extraBills.filter(b => b.service_name?.startsWith('Extra Guest')).reduce((s, b) => s + parseFloat(b.amount || 0), 0).toLocaleString()
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                    <table className="w-full mt-2 text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                {['#', 'Name', 'Gender', 'Phone', 'NID Number', 'Passport Number'].map(h => (
                                                    <th key={h} className="px-2 py-1.5 text-left border border-slate-300 font-bold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {extraGuests.map((g, i) => (
                                                <tr key={g.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                    <td className="px-2 py-1 border border-slate-300">{i + 1}</td>
                                                    <td className="px-2 py-1 border border-slate-300 font-semibold">{`${g.first_name} ${g.last_name || ''}`.trim()}</td>
                                                    <td className="px-2 py-1 border border-slate-300">{g.gender || '—'}</td>
                                                    <td className="px-2 py-1 border border-slate-300 font-mono">{g.phone || '—'}</td>
                                                    <td className="px-2 py-1 border border-slate-300 font-mono">{g.nid_number || '—'}</td>
                                                    <td className="px-2 py-1 border border-slate-300 font-mono">{g.passport_number || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <ul className="list-disc pl-5 space-y-0.5">
                                    <li>1 Extra Guest (Queen Size Mattress): BDT 1000 /night</li>
                                    <li>Each Additional Guest: BDT 500/night</li>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Stay & Payment Parameters */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <div>
                                <span className="font-bold">Check-In:</span>
                                <div className="pl-2 space-y-1 mt-1 text-xs">
                                    <div>Date: <span className="underline font-bold">{fmtCheckInOut(reservation.check_in_date)}</span></div>
                                    <div>Time: <span className="underline">02:00 PM</span> <span className="text-slate-500">(Flexibility 2:00 PM - 10:00 PM)</span></div>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold">Check-Out:</span>
                                <div className="pl-2 space-y-1 mt-1 text-xs">
                                    <div>Date: <span className="underline font-bold">{fmtCheckInOut(reservation.check_out_date)}</span></div>
                                    <div>Time: <span className="underline">12:00 PM</span> <span className="text-slate-500">(By 12:00 PM strictly)</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs pt-2">
                            <div><strong>Total Nights:</strong> <span className="underline font-bold">{reservation.nights}</span></div>
                            <div><strong>Extension:</strong> _________________ (If Any)</div>
                            <div><strong>Rate per Night: BDT</strong> <span className="underline font-bold">{ratePerNight}</span></div>
                            <div><strong>Total Rent: BDT</strong> <span className="underline font-bold">{fmt(reservation.total_amount)}</span></div>
                            <div><strong>Security Deposit (Refundable): BDT</strong> _________________ <span className="text-[10px] text-slate-500">(30% of total rent for long stay)</span></div>
                            <div><strong>Total Amount Paid: BDT</strong> <span className="underline font-bold">{fmt(summary.paid_amount)}</span></div>
                        </div>

                        <div className="text-xs flex items-center gap-3 pt-1">
                            <strong>Payment Method:</strong>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border border-slate-800 flex items-center justify-center text-[10px] font-bold">✓</span>
                                <span>KeyHost24</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Signature Blocks for Page 1 */}
                    <div className="grid grid-cols-2 gap-16 pt-12 text-xs">
                        <div className="text-center space-y-8">
                            <div><strong>KeyHost Representative:</strong></div>
                            <div className="border-t border-slate-400 pt-1.5 w-44 mx-auto">Authorized Signature</div>
                        </div>
                        <div className="text-center space-y-8">
                            <div><strong>Guest Signature:</strong></div>
                            <div className="border-t border-slate-400 pt-1.5 w-44 mx-auto">Signature</div>
                        </div>
                    </div>
                </div>

                {/* ── PAGE 2: Rules & Agreements (With Page Break) ── */}
                <div className="page-break mt-16 pt-16 border-t border-dashed border-slate-300">
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="text-center">
                            <h3 className="text-sm font-bold uppercase underline tracking-wider">House Rules &amp; Fees</h3>
                        </div>

                        {/* Content list matching second image */}
                        <div className="space-y-4 text-xs">
                            <div>
                                <h4 className="font-bold underline mb-1">House Rules &amp; Fees</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    <li><strong>Quiet Hours:</strong> 10:00 PM - 7:00 AM. Please respect neighbors and the community.</li>
                                    <li><strong>Smoking:</strong> Smoking is strictly prohibited indoor/common areas.
                                        <ul className="list-circle pl-5 mt-0.5">
                                            <li>Violation incurs fine: <strong>BDT 2,500</strong> (Must be paid on spot)</li>
                                        </ul>
                                    </li>
                                    <li><strong>Unregistered Guests:</strong> Only registered guests allowed.
                                        <ul className="list-circle pl-5 mt-0.5">
                                            <li>Violation will lead to a fine of <strong>BDT 5,000</strong>.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Cleanliness &amp; Care:</strong> Guests must maintain property in good condition. Cleaning fees range from <strong>BDT 700-1,500</strong> at check-out if extra cleaning is required.</li>
                                    <li><strong>Damage &amp; Loss:</strong> Any damages or missing items will be charged.</li>
                                    <li><strong>Noise/Parties:</strong> No loud music, parties, or events. Violation will lead to eviction without refund.</li>
                                    <li><strong>Pets:</strong> Not allowed unless pre-approved (extra cleaning charges will be applied).
                                        <div className="italic text-[10px] mt-0.5">*T&amp;C: Upon discussion.</div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold underline mb-1">Payment Terms &amp; Cancellations</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    <li><strong>Pre-booking Fee/Advance:</strong> 50% Advance is non-refundable.</li>
                                    <li><strong>Remaining Balance:</strong> Payable before check-in.</li>
                                    <li><strong>Security Deposit:</strong> Refundable upon inspection at check-out if no damages or rule violations.</li>
                                    <li><strong>Cancellation/Reschedule:</strong> Before 48 hours free cancellation.
                                        <ul className="list-circle pl-5 mt-0.5">
                                            <li>*Less than 12 hours before check-in or no-show: <strong>No refund</strong>.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Force Majeure:</strong> We will reschedule or Refund via discussion.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold underline mb-1">Liability &amp; Safety</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    <li>Guests are responsible for their own safety and belongings. KeyHost Homes is not liable for loss, theft or accidents.</li>
                                    <li>Travel insurance is strongly recommended.</li>
                                    <li>CCTV monitoring and on-site security will be provided for guest safety.</li>
                                    <li>Only registered guests are allowed for security reasons.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold underline mb-1">Check-In / Check-Out Process</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    <li>After completing check-in form a KeyHost personal will greet you, hand over keys and give a quick tour.</li>
                                    <li>Keys must be returned at check-out time.</li>
                                    <li>Client must inform at least 1 Hour before check-out for carrying out checkout procedure.</li>
                                    <li>Early check-in/late check-out may be available upon request.</li>
                                    <li>Late check-out after 1:00 PM will incur extra charges as per KeyHost policy.
                                        <div className="italic text-[10px] mt-0.5">*(25% charge on room rent for every 30 minute).</div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold underline mb-1">Termination Clause</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    <li>Violation of rules, non-payment, misconduct, or illegal activity gives KeyHost Homes the right to cancel booking and evict guests without refund.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Signatures for Page 2 */}
                        <div className="grid grid-cols-2 gap-16 pt-16 text-xs">
                            <div className="text-center space-y-6">
                                <div><strong>KeyHost Representative:</strong></div>
                                <div className="border-t border-slate-400 pt-1.5 w-44 mx-auto">Signature</div>
                                <div className="pt-2">Date: __________________</div>
                            </div>
                            <div className="text-center space-y-6">
                                <div><strong>Guest Signature:</strong></div>
                                <div className="border-t border-slate-400 pt-1.5 w-44 mx-auto">Signature</div>
                                <div className="pt-2">Date: __________________</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print style block wrapper */}
            <style>{`
                @media print {
                    body > *:not(#root) {
                        display: none !important;
                    }
                    aside, header, button, .print-hidden, .bg-black.bg-opacity-50 {
                        display: none !important;
                    }
                    html, body, #root, #root > div, main, .print-hidden-controls, .grid, [class*="col-span-"] {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #contract-agreement-doc {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 30px 40px !important;
                        margin: 0 !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }
                    .page-break {
                        page-break-before: always !important;
                        break-before: page !important;
                        margin-top: 50px !important;
                        border-top: none !important;
                        padding-top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'details', label: 'Reservation Details', icon: FiInfo },
    { id: 'invoices', label: 'Invoices', icon: FiFileText },
    { id: 'confirmation-letter', label: 'Confirmation Letter', icon: FiFile },
    { id: 'contract-agreement', label: 'Reservation Info', icon: FiFileText },
];

const HMSReservationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    const [selectGuestPhone, setSelectGuestPhone] = useState(null);

    const { data, isLoading, error } = useQuery(
        ['hms-res-detail', id],
        () => api.get(`/property-owner/hms/reservations/${id}/detail`),
        {
            select: r => r.data?.data || null,
            retry: 1
        }
    );

    if (isLoading) return (
        <div className="p-8 flex justify-center">
            <LoadingSpinner />
        </div>
    );

    if (error || !data) return (
        <div className="p-8 text-center">
            <p className="text-red-500 font-bold">Reservation not found or access denied.</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-[#004e59] font-bold hover:underline flex items-center gap-1 mx-auto">
                <FiArrowLeft /> Back
            </button>
        </div>
    );

    const { reservation, summary } = data;
    const guestName = reservation.guest_name ||
        (reservation.guest_first_name ? `${reservation.guest_first_name} ${reservation.guest_last_name}` : 'Guest');

    return (
        <div className="max-w-[1400px] mx-auto bg-[#f0f4f8] min-h-screen">

            {/* ── HERO HEADER ─────────────────────────────────────── */}
            <div className="print-hidden relative overflow-hidden bg-gradient-to-br from-[#002f36] via-[#004e59] to-[#006b78]">
                <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(ellipse at 70% -20%, rgba(0,200,180,0.15) 0%, transparent 55%), radial-gradient(circle at 10% 110%, rgba(0,80,100,0.4) 0%, transparent 50%)'}} />
                <div className="relative px-4 md:px-8 pt-6 pb-0">
                    {/* Breadcrumb row */}
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={() => navigate('/property-owner/hms/reservations')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                        >
                            <FiArrowLeft size={13} /> Back to Reservations
                        </button>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={reservation.status} large />
                            {summary.due_amount > 0 && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-400/30 text-red-200 text-[10px] font-black rounded-full uppercase">
                                    <FiAlertTriangle size={10} /> Due ৳{fmt(summary.due_amount)}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Guest + property info */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
                        <div>
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Reservation Details</p>
                            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{guestName}</h1>
                            <p className="text-white/60 text-sm mt-1 font-mono">{reservation.booking_reference}</p>
                        </div>
                        <div className="sm:ml-auto flex flex-wrap gap-2 pb-1">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-white/80 text-xs font-semibold border border-white/10">
                                <FiHome size={12} /> {reservation.room_number ? `Room ${reservation.room_number}` : 'Room N/A'}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-white/80 text-xs font-semibold border border-white/10">
                                <FiCalendar size={12} /> {fmtDate(reservation.check_in_date)} → {fmtDate(reservation.check_out_date)}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-white/80 text-xs font-semibold border border-white/10">
                                <FiClock size={12} /> {reservation.nights} Night{reservation.nights !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    {/* Tab Bar — flush at bottom of hero */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const hasBadge = tab.id === 'invoices' && summary.due_amount > 0;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-all rounded-t-xl border-t border-l border-r ${
                                        isActive
                                            ? 'bg-[#f0f4f8] text-[#004e59] border-[#f0f4f8] shadow-sm'
                                            : 'text-white/60 hover:text-white border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                    {hasBadge && (
                                        <span className="w-2 h-2 bg-red-400 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── TAB CONTENT ─────────────────────────────────────── */}
            <div className="print-hidden-controls p-4 md:p-6">
                {activeTab === 'details' && <DetailsTab data={data} onViewGuestProfile={setSelectGuestPhone} />}
                {activeTab === 'invoices' && (
                    <InvoicesTab
                        data={data}
                        reservationId={id}
                    />
                )}
                {activeTab === 'confirmation-letter' && <ConfirmationLetterTab data={data} />}
                {activeTab === 'contract-agreement' && <ContractAgreementTab data={data} />}
            </div>

            {selectGuestPhone && (
                <GuestProfileModal 
                    phone={selectGuestPhone} 
                    onClose={() => setSelectGuestPhone(null)} 
                />
            )}
        </div>
    );
};

export default HMSReservationDetail;
