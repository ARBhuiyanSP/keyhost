import React, { useState, useEffect, useCallback } from 'react';
import {
  FiDollarSign, FiTrendingUp, FiFilter, FiSearch, FiCalendar,
  FiX, FiPrinter, FiDownload, FiUsers, FiHome, FiSmartphone,
  FiCreditCard, FiGlobe, FiServer, FiCheckCircle, FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const fmt = (num) =>
  '৳' + parseFloat(num || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 });

const AdminRevenueReport = () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(monthEnd);
  const [datePreset, setDatePreset] = useState('this_month');
  const [hostId, setHostId]         = useState('all');
  const [propertyId, setPropertyId] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [bookingSource, setBookingSource] = useState('all');

  const [summary, setSummary]           = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, page: 1, pages: 1 });
  const [hosts, setHosts]               = useState([]);
  const [properties, setProperties]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);

  const applyPreset = (key) => {
    setDatePreset(key);
    const now = new Date();
    if (key === 'today') {
      const d = now.toISOString().split('T')[0];
      setStartDate(d); setEndDate(d);
    } else if (key === 'this_week') {
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      setStartDate(mon.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (key === 'this_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
    } else if (key === 'last_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]);
      setEndDate(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]);
    } else if (key === 'this_year') {
      setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (key === 'all') {
      setStartDate(''); setEndDate('');
    }
    setPage(1);
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;
      if (hostId !== 'all')        params.host_id        = hostId;
      if (propertyId !== 'all')    params.property_id    = propertyId;
      if (paymentMethod !== 'all') params.payment_method = paymentMethod;
      if (bookingSource !== 'all') params.booking_source = bookingSource;

      const res = await api.get('/admin/reports/revenue', { params });
      if (res.data.success) {
        const d = res.data.data;
        setSummary(d.summary);
        setTransactions(d.transactions);
        setPagination(d.pagination);
        if (d.filter_options?.hosts)      setHosts(d.filter_options.hosts);
        if (d.filter_options?.properties) setProperties(d.filter_options.properties);
      }
    } catch (err) {
      toast.error('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, hostId, propertyId, paymentMethod, bookingSource, page]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const clearFilters = () => {
    applyPreset('this_month');
    setHostId('all'); setPropertyId('all');
    setPaymentMethod('all'); setBookingSource('all');
  };

  const hasActiveFilters =
    hostId !== 'all' || propertyId !== 'all' ||
    paymentMethod !== 'all' || bookingSource !== 'all' || datePreset !== 'all';

  const paymentBadge = (method) => {
    const map = {
      bkash:      { bg: '#fce7f3', color: '#db2777', label: 'bKash' },
      sslcommerz: { bg: '#ede9fe', color: '#7c3aed', label: 'SSL' },
      nagad:      { bg: '#fef3c7', color: '#d97706', label: 'Nagad' },
      cash:       { bg: '#dcfce7', color: '#16a34a', label: 'Cash' },
    };
    const m = (method || '').toLowerCase();
    const s = map[m] || { bg: '#f1f5f9', color: '#475569', label: method || '—' };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
        {s.label}
      </span>
    );
  };

  const kpiCards = summary ? [
    {
      label: 'Total Revenue', value: fmt(summary.total_revenue),
      sub: `${summary.total_bookings} bookings`,
      icon: FiDollarSign, dark: true, accent: '#38bdf8',
      bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
    },
    {
      label: 'Platform Commission', value: fmt(summary.total_commission),
      sub: 'Our earnings', icon: FiTrendingUp, color: '#4f46e5', bg2: '#eef2ff',
    },
    {
      label: 'Gateway Fees', value: fmt(summary.total_gateway_fees),
      sub: 'Payment gateway fees', icon: FiCreditCard, color: '#ea580c', bg2: '#fff7ed',
    },
    {
      label: 'Host Earnings', value: fmt(summary.host_earnings),
      sub: 'Paid to hosts', icon: FiHome, color: '#0891b2', bg2: '#e0f2fe',
    },
    {
      label: 'Online Bookings', value: fmt(summary.online_revenue),
      sub: `${summary.online_count} bookings`, icon: FiGlobe, color: '#16a34a', bg2: '#dcfce7',
    },
    {
      label: 'HMS Bookings', value: fmt(summary.hms_revenue),
      sub: `${summary.hms_count} bookings`, icon: FiServer, color: '#7c3aed', bg2: '#ede9fe',
    },
    {
      label: 'Cash', value: fmt(summary.cash_revenue),
      sub: `${summary.cash_count} txns`, icon: FiCreditCard, color: '#16a34a', bg2: '#f0fdf4',
    },
    {
      label: 'bKash', value: fmt(summary.bkash_revenue),
      sub: `${summary.bkash_count} txns`, icon: FiSmartphone, color: '#db2777', bg2: '#fdf2f8',
    },
    {
      label: 'SSLCommerz', value: fmt(summary.ssl_revenue),
      sub: `${summary.ssl_count} txns`, icon: FiCreditCard, color: '#7c3aed', bg2: '#f5f3ff',
    },
    {
      label: 'Nagad', value: fmt(summary.nagad_revenue),
      sub: `${summary.nagad_count} txns`, icon: FiSmartphone, color: '#d97706', bg2: '#fffbeb',
    },
    {
      label: 'Available Payout', value: fmt(summary.available_for_payout),
      sub: 'Host pending balance', icon: FiClock, color: '#059669', bg2: '#ecfdf5',
    },
  ] : [];

  return (
    <div className="rev-page" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .rev-page { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        .rev-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .rev-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .rev-filter-bar { background: linear-gradient(135deg,#fff 0%,#f8faff 100%); border: 1.5px solid #e0e7ff; border-radius: 16px; padding: 12px 18px; margin-bottom: 18px; box-shadow: 0 4px 20px -4px rgba(99,102,241,.08); }
        .rev-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; }
        .rev-filter-row::-webkit-scrollbar { height: 0; }
        .rev-fdiv { width: 1px; height: 24px; background: #e0e7ff; flex-shrink: 0; }
        .rev-fsel { position: relative; }
        .rev-fsel select { padding: 7px 10px 7px 28px; border-radius: 9px; border: 1.5px solid #e0e7ff; font-size: 12px; background: #fff; outline: none; color: #1e293b; cursor: pointer; appearance: none; min-width: 130px; }
        .rev-fsel .fsel-icon { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #a5b4fc; pointer-events: none; }
        .rev-pills { display: flex; gap: 5px; flex-shrink: 0; }
        .rev-pill { padding: 6px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1.5px solid #e0e7ff; background: #fff; color: #64748b; transition: all .15s; white-space: nowrap; }
        .rev-pill.active { border: 2px solid #6366f1; background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; box-shadow: 0 3px 10px rgba(99,102,241,.3); }
        .rev-clear-btn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 9px; border: 1.5px solid #fca5a5; background: #fef2f2; color: #dc2626; font-weight: 700; font-size: 11.5px; cursor: pointer; flex-shrink: 0; }
        .rev-custom-row { display: flex; gap: 8px; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0e7ff; flex-wrap: wrap; }
        .rev-custom-row input[type="date"] { padding: 7px 10px 7px 26px; border-radius: 9px; border: 1.5px solid #c7d2fe; font-size: 12px; background: #fafafe; outline: none; color: #1e293b; }
        .rev-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(175px,1fr)); gap: 10px; margin-bottom: 18px; }
        .rev-kpi { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; }
        .rev-kpi-icon { padding: 7px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .rev-kpi-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
        .rev-kpi-value { font-size: 17px; font-weight: 800; line-height: 1.15; }
        .rev-kpi-sub { font-size: 10.5px; margin-top: 1px; }
        .rev-table-wrap { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 2px 8px -2px rgba(0,0,0,.06); }
        .rev-table-wrap table { width: 100%; border-collapse: collapse; min-width: 900px; }
        .rev-table-wrap thead tr { background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; }
        .rev-table-wrap th { padding: 11px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
        .rev-table-wrap td { padding: 11px 14px; font-size: 12.5px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .rev-table-wrap tbody tr:last-child td { border-bottom: none; }
        .rev-table-wrap tbody tr:hover td { background: #f8faff; }
        .rev-source-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 99px; font-size: 10.5px; font-weight: 700; }
        .rev-amount { font-weight: 700; color: #0f172a; }
        .rev-comm { font-weight: 600; color: #7c3aed; }
        .rev-host-amt { font-weight: 700; color: #059669; }
        .rev-pagination { display: flex; align-items: center; gap: 8px; justify-content: flex-end; padding: 14px 18px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; }
        .rev-pg-btn { padding: 6px 14px; border-radius: 8px; border: 1.5px solid #e0e7ff; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; color: #4f46e5; transition: all .15s; }
        .rev-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
        .rev-pg-btn:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
        .rev-total-footer td { font-weight: 800 !important; background: #f8fafc !important; color: #1e293b !important; font-size: 13px !important; border-top: 2px solid #e2e8f0 !important; border-bottom: none !important; }
        @media (max-width: 768px) {
          .rev-page { padding: 12px !important; }
          .rev-header { flex-direction: column; align-items: flex-start; }
          .rev-header-actions { width: 100%; }
          .rev-header-actions button { flex: 1; justify-content: center; }
          .rev-filter-row { flex-wrap: wrap; overflow-x: hidden; }
          .rev-fsel select { min-width: unset; width: 100%; }
          .rev-fsel { flex: 1 1 calc(50% - 8px); min-width: 0; }
          .rev-fdiv { display: none; }
          .rev-pills { flex-wrap: wrap; }
          .rev-kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media print {
          .rev-header-actions, .rev-filter-bar, .rev-pagination { display: none !important; }
          .rev-page { padding: 0 !important; }
          .rev-table-wrap { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      {/* Header */}
      <div className="rev-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <FiTrendingUp style={{ color: '#6366f1' }} /> Revenue Report
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '12.5px' }}>
            Complete breakdown of platform revenue, commissions &amp; payment methods
          </p>
        </div>
        <div className="rev-header-actions">
          <button
            onClick={() => fetchReport()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#6366f1', border: '1.5px solid #6366f1', padding: '8px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => window.print()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1.5px solid #d1d5db', padding: '8px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            <FiPrinter size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rev-filter-bar">
        <div className="rev-filter-row">
          <div className="rev-fsel">
            <FiServer className="fsel-icon" size={12} />
            <select value={bookingSource} onChange={e => { setBookingSource(e.target.value); setPage(1); }}>
              <option value="all">All Sources</option>
              <option value="online">Online Only</option>
              <option value="hms">HMS Only</option>
            </select>
          </div>
          <div className="rev-fdiv" />
          <div className="rev-fsel">
            <FiCreditCard className="fsel-icon" size={12} />
            <select value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(1); }}>
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bkash">bKash</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
          <div className="rev-fdiv" />
          <div className="rev-fsel">
            <FiUsers className="fsel-icon" size={12} />
            <select value={hostId} onChange={e => { setHostId(e.target.value); setPropertyId('all'); setPage(1); }}>
              <option value="all">All Hosts</option>
              {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="rev-fdiv" />
          <div className="rev-fsel">
            <FiHome className="fsel-icon" size={12} />
            <select value={propertyId} onChange={e => { setPropertyId(e.target.value); setPage(1); }}>
              <option value="all">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="rev-fdiv" />
          <div className="rev-pills">
            {[
              { key: 'all',        label: 'All Time' },
              { key: 'today',      label: 'Today' },
              { key: 'this_week',  label: 'This Week' },
              { key: 'this_month', label: 'This Month' },
              { key: 'last_month', label: 'Last Month' },
              { key: 'this_year',  label: 'This Year' },
              { key: 'custom',     label: '📅 Custom' },
            ].map(p => (
              <button
                key={p.key}
                type="button"
                className={`rev-pill${datePreset === p.key ? ' active' : ''}`}
                onClick={() => applyPreset(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <>
              <div className="rev-fdiv" />
              <button className="rev-clear-btn" onClick={clearFilters}>
                <FiX size={11} /> Clear
              </button>
            </>
          )}
        </div>

        {datePreset === 'custom' && (
          <div className="rev-custom-row">
            <FiCalendar size={13} style={{ color: '#a5b4fc' }} />
            <div style={{ position: 'relative' }}>
              <FiCalendar style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', fontSize: '12px', pointerEvents: 'none' }} />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
            <div style={{ position: 'relative' }}>
              <FiCalendar style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', fontSize: '12px', pointerEvents: 'none' }} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            {startDate && endDate && (
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                {startDate} → {endDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="rev-kpi-grid">
        {loading ? (
          Array(9).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', height: '62px' }} />
          ))
        ) : kpiCards.map((card, i) => {
          const IconComp = card.icon;
          if (card.dark) {
            return (
              <div key={i} className="rev-kpi" style={{ background: card.bg, border: '1px solid #1e293b', boxShadow: '0 4px 14px -4px rgba(15,23,42,.25)' }}>
                <div className="rev-kpi-icon" style={{ background: 'rgba(56,189,248,.15)' }}>
                  <IconComp size={16} style={{ color: card.accent }} />
                </div>
                <div>
                  <div className="rev-kpi-label" style={{ color: '#94a3b8' }}>{card.label}</div>
                  <div className="rev-kpi-value" style={{ color: card.accent }}>{card.value}</div>
                  <div className="rev-kpi-sub" style={{ color: '#64748b' }}>{card.sub}</div>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="rev-kpi" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px -2px rgba(0,0,0,.06)' }}>
              <div className="rev-kpi-icon" style={{ background: card.bg2 }}>
                <IconComp size={15} style={{ color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="rev-kpi-label" style={{ color: '#94a3b8' }}>{card.label}</div>
                <div className="rev-kpi-value" style={{ color: '#1e293b', fontSize: '15px' }}>{card.value}</div>
                <div className="rev-kpi-sub" style={{ color: '#94a3b8' }}>{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Table */}
      <div className="rev-table-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <FiCheckCircle size={15} style={{ color: '#6366f1' }} />
            Transactions
            {!loading && (
              <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                {pagination.total} total
              </span>
            )}
          </div>
          {loading && (
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiClock size={13} /> Loading...
            </span>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Date / Booking Ref</th>
              <th>Guest</th>
              <th>Property / Room</th>
              <th>Host</th>
              <th>Source</th>
              <th>Payment</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'right' }}>Commission</th>
              <th style={{ textAlign: 'right' }}>Gateway Fee</th>
              <th style={{ textAlign: 'right' }}>Host Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                  No transactions found for the selected filters.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>
                    {new Date(t.created_at).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '5px', color: '#4f46e5', fontWeight: 700 }}>
                    {t.booking_reference}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.guest_name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.guest_email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{t.property_title || '—'}</div>
                  {t.room_number && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Room #{t.room_number}</div>
                  )}
                </td>
                <td style={{ color: '#334155', fontWeight: 500 }}>{t.host_name || '—'}</td>
                <td>
                  {(t.booking_source === 'website' || t.booking_source === 'mobile_app') ? (
                    <span className="rev-source-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>
                      <FiGlobe size={10} /> Online
                    </span>
                  ) : (
                    <span className="rev-source-badge" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                      <FiServer size={10} /> HMS
                    </span>
                  )}
                </td>
                <td>{paymentBadge(t.payment_method)}</td>
                <td style={{ textAlign: 'right' }} className="rev-amount">{fmt(t.total_amount)}</td>
                <td style={{ textAlign: 'right' }} className="rev-comm">{fmt(t.commission)}</td>
                <td style={{ textAlign: 'right' }} className="rev-comm" style={{ color: '#ea580c' }}>
                  {t.gateway_fee > 0 ? fmt(t.gateway_fee) : '—'}
                  {t.gateway_fee > 0 && t.gateway_channel && (
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{t.gateway_channel}</div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }} className="rev-host-amt">{fmt(t.host_amount)}</td>
              </tr>
            ))}
            {!loading && transactions.length > 0 && (
              <tr className="rev-total-footer">
              <td colSpan={6} style={{ textAlign: 'right', paddingRight: '14px' }}>
                  Page Subtotal ({transactions.length} rows)
                </td>
                <td style={{ textAlign: 'right' }}>
                  {fmt(transactions.reduce((s, t) => s + parseFloat(t.total_amount || 0), 0))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {fmt(transactions.reduce((s, t) => s + parseFloat(t.commission || 0), 0))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {fmt(transactions.reduce((s, t) => s + parseFloat(t.gateway_fee || 0), 0))}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {fmt(transactions.reduce((s, t) => s + parseFloat(t.host_amount || 0), 0))}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="rev-pagination">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} records)
            </span>
            <button className="rev-pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            <button className="rev-pg-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenueReport;
