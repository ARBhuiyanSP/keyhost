import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiPrinter, 
  FiDownload, FiPieChart, FiArrowUpRight, FiArrowDownRight, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminProfitLossReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [presetPeriod, setPresetPeriod] = useState('this_month');

  useEffect(() => {
    applyPresetPeriod('this_month');
  }, []);

  useEffect(() => {
    fetchPLReport();
  }, [startDate, endDate]);

  const applyPresetPeriod = (preset) => {
    setPresetPeriod(preset);
    const now = new Date();
    if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'ytd') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchPLReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get('/admin/accounting/profit-loss', { params });
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to generate Profit & Loss report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Keyhost24 Profit & Loss Statement\n";
    csvContent += `Period,${report.period.start_date} to ${report.period.end_date}\n\n`;
    csvContent += "REVENUE BREAKDOWN,Amount (BDT)\n";
    csvContent += `Booking Commissions (Website),${report.revenue.booking_commission}\n`;
    csvContent += `HMS SaaS Subscriptions,${report.revenue.hms_subscriptions}\n`;
    csvContent += `TOTAL PLATFORM REVENUE,${report.revenue.total_revenue}\n\n`;
    csvContent += "EXPENSE BREAKDOWN,Amount (BDT)\n";
    report.expenses.categories.forEach(cat => {
      csvContent += `${cat.category_name},${cat.total_amount}\n`;
    });
    csvContent += `TOTAL PLATFORM EXPENSES,${report.expenses.total_expense}\n\n`;
    csvContent += `NET RESULT,${report.summary.is_profit ? 'NET PROFIT' : 'NET LOSS'},${report.summary.net_profit_loss}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `keyhost24_PL_statement_${report.period.start_date}_to_${report.period.end_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !report) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Generating Profit & Loss Statement...</div>;
  }

  const { revenue = {}, expenses = {}, summary = {} } = report || {};

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiPieChart style={{ color: '#6366f1' }} /> Profit & Loss (P&L) Statement
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Executive financial summary comparing platform revenues against corporate expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FiDownload /> Export CSV
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FiPrinter /> Print Statement
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['this_month', 'last_month', 'ytd', 'all'].map(p => (
            <button
              key={p}
              onClick={() => applyPresetPeriod(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: presetPeriod === p ? '#6366f1' : '#f1f5f9',
                color: presetPeriod === p ? '#fff' : '#64748b',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar style={{ color: '#64748b' }} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setPresetPeriod('custom'); setStartDate(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setPresetPeriod('custom'); setEndDate(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Total Revenue */}
        <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', color: '#a7f3d0' }}>Total Platform Revenue</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)' }}><FiTrendingUp fontSize="20px" /></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>
            ৳{parseFloat(revenue.total_revenue || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#d1fae5', marginTop: '4px' }}>
            Commissions + HMS SaaS Subscriptions
          </div>
        </div>

        {/* Total Expenses */}
        <div style={{ background: 'linear-gradient(135deg, #9f1239 0%, #be123c 100%)', color: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(190, 18, 60, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', color: '#fecdd3' }}>Total Platform Expenses</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)' }}><FiTrendingDown fontSize="20px" /></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>
            ৳{parseFloat(expenses.total_expense || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#ffe4e6', marginTop: '4px' }}>
            Salaries, Marketing, Tech Server & Office
          </div>
        </div>

        {/* Net Profit / Net Loss */}
        <div style={{ 
          background: summary.is_profit ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)', 
          color: '#fff', 
          padding: '24px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          border: summary.is_profit ? '2px solid #10b981' : '2px solid #ef4444'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: summary.is_profit ? '#34d399' : '#f87171' }}>
              {summary.is_profit ? 'NET PROFIT' : 'NET LOSS'}
            </span>
            <span style={{ background: summary.is_profit ? '#065f46' : '#991b1b', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
              {summary.profit_margin_pct}% Margin
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '12px', color: summary.is_profit ? '#34d399' : '#f87171' }}>
            ৳{parseFloat(summary.net_profit_loss || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {summary.is_profit ? '✅ Platform operating at net profit' : '⚠️ Expenses exceed total revenue'}
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* REVENUE BREAKDOWN */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#065f46', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiArrowUpRight /> Revenue Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f0fdf4', borderRadius: '12px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#166534' }}>Booking Commissions (Website)</div>
                <div style={{ fontSize: '12px', color: '#15803d' }}>10% Commission on online bookings</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#166534' }}>
                ৳{parseFloat(revenue.booking_commission || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f0fdf4', borderRadius: '12px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#166534' }}>HMS SaaS Subscriptions</div>
                <div style={{ fontSize: '12px', color: '#15803d' }}>Hotel Management System package sales</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#166534' }}>
                ৳{parseFloat(revenue.hms_subscriptions || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #cbd5e1', pt: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Total Gross Revenue</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#047857' }}>
                ৳{parseFloat(revenue.total_revenue || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
              Note: Gross guest booking volume processed on site: ৳{parseFloat(revenue.gross_booking_volume || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* EXPENSE BREAKDOWN */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#be123c', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiArrowDownRight /> Categorized Platform Expenses
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(expenses.categories || []).map((cat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff1f2', borderRadius: '12px' }}>
                <span style={{ fontWeight: '600', color: '#9f1239', fontSize: '14px' }}>{cat.category_name}</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#be123c' }}>
                  ৳{parseFloat(cat.total_amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}

            <div style={{ borderTop: '2px dashed #cbd5e1', pt: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Total Platform Expenses</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#be123c' }}>
                ৳{parseFloat(expenses.total_expense || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfitLossReport;
