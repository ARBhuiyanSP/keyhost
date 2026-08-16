import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiPlus, FiFilter, FiSearch, FiCalendar, FiFileText, 
  FiTrash2, FiEdit2, FiEye, FiDownload, FiUpload, FiX, FiCheckCircle,
  FiSpeaker, FiHome, FiZap, FiServer, FiUsers, FiFolder
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CATEGORY_ICONS = {
  marketing: FiSpeaker,
  office_rent: FiHome,
  utilities: FiZap,
  tech_server: FiServer,
  salaries: FiUsers,
  legal: FiFileText,
  miscellaneous: FiFolder
};

const AdminCorporateExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summaryByCategory, setSummaryByCategory] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters — default to current month
  const _today = new Date();
  const _monthStart = new Date(_today.getFullYear(), _today.getMonth(), 1).toISOString().split('T')[0];
  const _monthEnd   = new Date(_today.getFullYear(), _today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(_monthStart);
  const [endDate, setEndDate] = useState(_monthEnd);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState('this_month'); // 'all' | 'today' | 'this_week' | 'this_month' | 'custom'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewVoucherUrl, setViewVoucherUrl] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // { id, name, description, icon, is_active }

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    voucher_no: '',
    payment_method: 'bank_transfer',
    receipt_url: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: 'FiFolder' });
  const [savingCategory, setSavingCategory] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/accounting/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedCategory !== 'all') params.category_id = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/admin/accounting/expenses', { params });
      if (res.data.success) {
        setExpenses(res.data.data.expenses || []);
        setSummaryByCategory(res.data.data.summary_by_category || []);
        setTotalExpense(res.data.data.total_expense || 0);
      }
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category_id: expense.category_id,
        title: expense.title,
        amount: expense.amount,
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : '',
        voucher_no: expense.voucher_no || '',
        payment_method: expense.payment_method || 'bank_transfer',
        receipt_url: expense.receipt_url || '',
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category_id: categories[0]?.id || '',
        title: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        voucher_no: `EXP-${Date.now().toString().slice(-6)}`,
        payment_method: 'bank_transfer',
        receipt_url: '',
        notes: ''
      });
    }
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category_id || !formData.expense_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingExpense) {
        await api.put(`/admin/accounting/expenses/${editingExpense.id}`, formData);
        toast.success('Expense updated successfully!');
      } else {
        await api.post('/admin/accounting/expenses', formData);
        toast.success('Expense recorded successfully!');
      }
      setShowAddModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    if (preset === 'today') {
      setStartDate(fmt(today));
      setEndDate(fmt(today));
    } else if (preset === 'this_week') {
      const day = today.getDay(); // 0=Sun
      const mon = new Date(today); mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      setStartDate(fmt(mon));
      setEndDate(fmt(sun));
    } else if (preset === 'this_month') {
      setStartDate(fmt(new Date(today.getFullYear(), today.getMonth(), 1)));
      setEndDate(fmt(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    } else if (preset === 'custom') {
      // keep existing dates, user will set manually
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/admin/accounting/expenses/${id}`);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setSavingCategory(true);
      const res = await api.post('/admin/accounting/categories', categoryForm);
      if (res.data.success) {
        toast.success('Category added successfully!');
        setShowCategoryModal(false);
        setCategoryForm({ name: '', description: '', icon: 'FiFolder' });
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setUpdatingCategory(true);
      const res = await api.put(`/admin/accounting/categories/${editingCategory.id}`, editingCategory);
      if (res.data.success) {
        toast.success('Category updated!');
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  return (
    <div className="exp-page" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
    <style>{`
      .exp-page { box-sizing: border-box; }
      .exp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
      .exp-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
      .exp-filter-bar {
        background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
        border: 1.5px solid #e0e7ff;
        border-radius: 18px;
        padding: 14px 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 24px -4px rgba(99,102,241,0.08);
      }
      .exp-filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; }
      .exp-filter-row::-webkit-scrollbar { height: 0; }
      .exp-filter-divider { width: 1px; height: 28px; background: #e0e7ff; flex-shrink: 0; }
      .exp-filter-search { position: relative; flex: 1 1 180px; min-width: 140px; }
      .exp-filter-search input { width: 100%; padding: 9px 10px 9px 34px; border-radius: 10px; border: 1.5px solid #e0e7ff; font-size: 13px; background: #fff; outline: none; color: #1e293b; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
      .exp-filter-search input:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
      .exp-filter-search .srch-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #a5b4fc; pointer-events: none; }
      .exp-filter-cat { position: relative; flex: 0 1 180px; min-width: 130px; }
      .exp-filter-cat select { width: 100%; padding: 9px 10px 9px 30px; border-radius: 10px; border: 1.5px solid #e0e7ff; font-size: 13px; background: #fff; outline: none; color: #1e293b; appearance: none; cursor: pointer; box-sizing: border-box; }
      .exp-filter-cat .cat-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: #a5b4fc; pointer-events: none; }
      .exp-date-pills { display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0; }
      .exp-pill { padding: 7px 13px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.18s; white-space: nowrap; border: 1.5px solid #e0e7ff; background: #fff; color: #475569; }
      .exp-pill.active { border: 2px solid #6366f1; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
      .exp-custom-dates { display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap; padding-top: 10px; border-top: 1px dashed #e0e7ff; }
      .exp-custom-dates input { padding: 8px 10px 8px 28px; border-radius: 9px; border: 1.5px solid #c7d2fe; font-size: 12.5px; background: #fafafe; outline: none; color: #1e293b; }
      .exp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e0e7ff; align-items: center; }
      .exp-chip { display: inline-flex; align-items: center; gap: 5px; background: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
      .exp-chip button { background: none; border: none; cursor: pointer; color: #818cf8; padding: 0 0 0 2px; line-height: 1; }
      .exp-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }
      .exp-table-wrap { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      .exp-table-wrap table { width: 100%; border-collapse: collapse; text-align: left; min-width: 700px; }
      .exp-clear-btn { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 10px; border: 1.5px solid #fca5a5; background: #fef2f2; color: #dc2626; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
      @media (max-width: 768px) {
        .exp-page { padding: 12px !important; }
        .exp-header { flex-direction: column; align-items: flex-start; }
        .exp-header-actions { width: 100%; }
        .exp-header-actions button { flex: 1; justify-content: center; }
        .exp-filter-row { flex-wrap: wrap; overflow-x: hidden; }
        .exp-filter-search { flex: 1 1 100%; min-width: 0; }
        .exp-filter-cat { flex: 1 1 100%; min-width: 0; }
        .exp-filter-divider { display: none; }
        .exp-date-pills { flex-wrap: wrap; }
        .exp-kpi-grid { grid-template-columns: 1fr !important; }
        .exp-table-wrap { border-radius: 12px; }
      }
    `}</style>
      {/* Header */}
      <div className="exp-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiDollarSign style={{ color: '#6366f1' }} /> Platform Expense Management
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>
            Track marketing, office rent, utilities, server costs, and corporate staff salaries.
          </p>
        </div>
        <div className="exp-header-actions">
          <button
            onClick={() => setShowManageCategoriesModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', color: '#6366f1', border: '2px solid #6366f1', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <FiFolder fontSize="15px" /> Manage Categories
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)', transition: 'all 0.2s' }}
          >
            <FiPlus fontSize="16px" /> Add Expense
          </button>
        </div>
      </div>

      {/* ── Compact Single-Line Filter Bar ── */}
      <div className="exp-filter-bar">
        <div className="exp-filter-row">

          {/* Search */}
          <div className="exp-filter-search">
            <FiSearch className="srch-icon" size={14} />
            <input
              type="text"
              placeholder="Search title or voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="exp-filter-divider" />

          {/* Category */}
          <div className="exp-filter-cat">
            <FiFilter className="cat-icon" size={13} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="exp-filter-divider" />

          {/* Date Preset Pills */}
          <div className="exp-date-pills">
            {[
              { key: 'all',        label: 'All Time' },
              { key: 'today',      label: 'Today' },
              { key: 'this_week',  label: 'This Week' },
              { key: 'this_month', label: 'This Month' },
              { key: 'custom',     label: '📅 Custom' },
            ].map(p => (
              <button
                key={p.key}
                className={`exp-pill${datePreset === p.key ? ' active' : ''}`}
                type="button"
                onClick={() => applyDatePreset(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Clear All */}
          {(datePreset !== 'all' || selectedCategory !== 'all' || searchQuery) && (
            <>
              <div className="exp-filter-divider" />
              <button
                className="exp-clear-btn"
                onClick={() => { setStartDate(''); setEndDate(''); setSelectedCategory('all'); setSearchQuery(''); setDatePreset('all'); }}
              >
                <FiX size={12} /> Clear
              </button>
            </>
          )}
        </div>

        {/* Custom date row — appears when Custom is selected */}
        {datePreset === 'custom' && (
          <div className="exp-custom-dates">
            <FiCalendar size={13} style={{ color: '#a5b4fc' }} />
            <div style={{ position: 'relative' }}>
              <FiCalendar style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', fontSize: '12px', pointerEvents: 'none' }} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <span style={{ color: '#94a3b8', fontWeight: '600' }}>→</span>
            <div style={{ position: 'relative' }}>
              <FiCalendar style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', fontSize: '12px', pointerEvents: 'none' }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {startDate && endDate && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{startDate} → {endDate}</span>
            )}
          </div>
        )}

        {/* Active chips */}
        {(datePreset !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <div className="exp-chips">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Active:</span>
            {searchQuery && (
              <span className="exp-chip"><FiSearch size={11} /> "{searchQuery}" <button onClick={() => setSearchQuery('')}><FiX size={10} /></button></span>
            )}
            {selectedCategory !== 'all' && (
              <span className="exp-chip"><FiFilter size={11} /> {categories.find(c => String(c.id) === String(selectedCategory))?.name} <button onClick={() => setSelectedCategory('all')}><FiX size={10} /></button></span>
            )}
            {datePreset !== 'all' && (
              <span className="exp-chip">
                <FiCalendar size={11} />
                {datePreset === 'today' && 'Today'}
                {datePreset === 'this_week' && 'This Week'}
                {datePreset === 'this_month' && 'This Month'}
                {datePreset === 'custom' ? (startDate || endDate ? `${startDate || '...'} → ${endDate || '...'}` : 'Custom Range') : ''}
                <button onClick={() => { setDatePreset('all'); setStartDate(''); setEndDate(''); }}><FiX size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="exp-kpi-grid">
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.2)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(56,189,248,0.15)', borderRadius: '10px', padding: '8px', flexShrink: 0 }}>
            <FiDollarSign size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', lineHeight: 1.2 }}>
              ৳{totalExpense.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{expenses.length} entries</div>
          </div>
        </div>

        {summaryByCategory.slice(0, 3).map((cat, i) => {
          const IconComp = CATEGORY_ICONS[cat.category_slug] || FiDollarSign;
          return (
            <div key={i} style={{ background: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', flexShrink: 0 }}>
                <IconComp size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.category_name}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', lineHeight: 1.2 }}>
                  ৳{parseFloat(cat.total_amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Expenses Table */}
      <div className="exp-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Expense Details</th>
              <th style={{ padding: '16px 20px' }}>Category</th>
              <th style={{ padding: '16px 20px' }}>Date</th>
              <th style={{ padding: '16px 20px' }}>Voucher / Method</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Voucher</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Loading platform expenses...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No expense records found matching your query.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{exp.title}</div>
                    {exp.notes && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{exp.notes}</div>}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {exp.category_name}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', color: '#475569', fontSize: '14px' }}>
                    {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{exp.voucher_no || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{exp.payment_method?.replace('_', ' ')}</div>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#ef4444', fontSize: '16px' }}>
                    ৳{parseFloat(exp.amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {exp.receipt_url ? (
                      <button
                        onClick={() => setViewVoucherUrl(exp.receipt_url)}
                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiEye /> View
                      </button>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>None</span>
                    )}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenAddModal(exp)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer' }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {editingExpense ? 'Edit Platform Expense' : 'Add New Platform Expense'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Expense Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Expense Date *</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Expense Title / Purpose *</label>
                <input
                  type="text"
                  placeholder="e.g. Facebook Ads Campaign for July"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Amount (BDT ৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="bkash">bKash Merchant</option>
                    <option value="nagad">Nagad</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Voucher / Ref Number</label>
                  <input
                    type="text"
                    placeholder="VOUCHER-00123"
                    value={formData.voucher_no}
                    onChange={(e) => setFormData({ ...formData, voucher_no: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Receipt / Document URL</label>
                  <input
                    type="text"
                    placeholder="https://... receipt image link"
                    value={formData.receipt_url}
                    onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Notes / Remarks</label>
                <textarea
                  rows="3"
                  placeholder="Additional invoice notes or reference context..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Voucher Modal */}
      {viewVoucherUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Voucher Receipt Preview</h3>
              <button onClick={() => setViewVoucherUrl(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}><FiX /></button>
            </div>
            <img src={viewVoucherUrl} alt="Receipt Voucher" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Add Expense Category</h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>Create a new category to organise your expenses</p>
              </div>
              <button onClick={() => setShowCategoryModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}><FiX /></button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Transport & Logistics"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Description <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
                <textarea
                  rows="2"
                  placeholder="Short description of what this category covers..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[
                    { value: 'FiFolder', label: '📁 General' },
                    { value: 'FiSpeaker', label: '📣 Marketing' },
                    { value: 'FiHome', label: '🏠 Office' },
                    { value: 'FiZap', label: '⚡ Utilities' },
                    { value: 'FiServer', label: '🖥 Tech' },
                    { value: 'FiUsers', label: '👥 Staff' },
                    { value: 'FiFileText', label: '📄 Legal' },
                    { value: 'FiDollarSign', label: '💰 Finance' },
                    { value: 'FiDownload', label: '📦 Supplies' },
                    { value: 'FiUpload', label: '🚀 Delivery' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: opt.value })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: categoryForm.icon === opt.value ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                        background: categoryForm.icon === opt.value ? '#eef2ff' : '#fff',
                        cursor: 'pointer',
                        fontSize: '10px',
                        color: categoryForm.icon === opt.value ? '#4f46e5' : '#475569',
                        fontWeight: '600',
                        textAlign: 'center',
                        lineHeight: '1.4'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCategoryModal(false); setCategoryForm({ name: '', description: '', icon: 'FiFolder' }); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: savingCategory ? 0.7 : 1 }}
                >
                  {savingCategory ? 'Creating...' : '+ Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================
          MANAGE CATEGORIES MODAL
      ====================================== */}
      {showManageCategoriesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '22px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.35)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiFolder style={{ color: '#6366f1' }} /> Manage Expense Categories
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>View, edit, and add expense categories</p>
              </div>
              <button onClick={() => { setShowManageCategoriesModal(false); setEditingCategory(null); }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}><FiX /></button>
            </div>

            {/* Category List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No categories found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categories.map(cat => {
                    const isEditing = editingCategory?.id === cat.id;
                    return (
                      <div key={cat.id} style={{ border: isEditing ? '2px solid #6366f1' : '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: isEditing ? '#fafafe' : '#fff', transition: 'all 0.2s' }}>
                        {isEditing ? (
                          /* ---- Inline Edit Form ---- */
                          <form onSubmit={handleUpdateCategory}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Name *</label>
                                <input
                                  autoFocus
                                  value={editingCategory.name}
                                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #c7d2fe', fontSize: '13px', boxSizing: 'border-box' }}
                                  required
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Status</label>
                                <select
                                  value={editingCategory.is_active}
                                  onChange={e => setEditingCategory({ ...editingCategory, is_active: parseInt(e.target.value) })}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #c7d2fe', fontSize: '13px' }}
                                >
                                  <option value={1}>✅ Active</option>
                                  <option value={0}>⛔ Inactive</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Description</label>
                              <input
                                value={editingCategory.description || ''}
                                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                placeholder="Short description..."
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #c7d2fe', fontSize: '13px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Icon</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {[
                                  { value: 'FiFolder', label: '📁' }, { value: 'FiSpeaker', label: '📣' },
                                  { value: 'FiHome', label: '🏠' }, { value: 'FiZap', label: '⚡' },
                                  { value: 'FiServer', label: '🖥' }, { value: 'FiUsers', label: '👥' },
                                  { value: 'FiFileText', label: '📄' }, { value: 'FiDollarSign', label: '💰' },
                                  { value: 'FiDownload', label: '📦' }, { value: 'FiUpload', label: '🚀' },
                                ].map(opt => (
                                  <button key={opt.value} type="button"
                                    onClick={() => setEditingCategory({ ...editingCategory, icon: opt.value })}
                                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: editingCategory.icon === opt.value ? '2px solid #6366f1' : '1px solid #e2e8f0', background: editingCategory.icon === opt.value ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: '18px' }}
                                  >{opt.label}</button>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button type="button" onClick={() => setEditingCategory(null)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                              <button type="submit" disabled={updatingCategory} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', opacity: updatingCategory ? 0.7 : 1 }}>
                                {updatingCategory ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* ---- View Row ---- */
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                              {cat.icon === 'FiFolder' ? '📁' : cat.icon === 'FiSpeaker' ? '📣' : cat.icon === 'FiHome' ? '🏠' : cat.icon === 'FiZap' ? '⚡' : cat.icon === 'FiServer' ? '🖥' : cat.icon === 'FiUsers' ? '👥' : cat.icon === 'FiFileText' ? '📄' : cat.icon === 'FiDollarSign' ? '💰' : cat.icon === 'FiDownload' ? '📦' : cat.icon === 'FiUpload' ? '🚀' : '📁'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{cat.name}</span>
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: cat.is_active ? '#dcfce7' : '#fee2e2', color: cat.is_active ? '#16a34a' : '#dc2626' }}>
                                  {cat.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', marginRight: '8px' }}>{cat.slug}</span>
                                {cat.description && <span>{cat.description}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingCategory({ id: cat.id, name: cat.name, description: cat.description || '', icon: cat.icon || 'FiFolder', is_active: cat.is_active })}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
                            >
                              <FiEdit2 size={13} /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add New Category Section */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
              <div style={{ marginBottom: '10px', fontWeight: '700', fontSize: '13px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>+ Add New Category</div>
              <form onSubmit={handleAddCategory}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Transport & Logistics"
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Description</label>
                    <input
                      type="text"
                      placeholder="Optional short description"
                      value={categoryForm.description}
                      onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingCategory || !categoryForm.name.trim()}
                    style={{ padding: '10px 18px', borderRadius: '9px', border: 'none', background: savingCategory || !categoryForm.name.trim() ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiPlus /> {savingCategory ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCorporateExpenses;
