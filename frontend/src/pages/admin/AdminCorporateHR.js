import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserPlus, FiDollarSign, FiKey, FiCheckCircle, FiClock, 
  FiPrinter, FiSearch, FiEdit2, FiTrash2, FiFileText, FiShield, FiX, FiPlus, FiBriefcase
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminCorporateHR = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'payroll'
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total_staff: 0, active_staff: 0, total_monthly_payroll: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Employee Modal
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'General',
    base_salary: '',
    joining_date: new Date().toISOString().split('T')[0],
    blood_group: '',
    nid_number: '',
    address: ''
  });

  // Permissions Modal
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedEmpForPerm, setSelectedEmpForPerm] = useState(null);
  const [permissionsObj, setPermissionsObj] = useState({
    dashboard: true,
    manage_bookings: true,
    manage_properties: false,
    manage_hosts: false,
    financials: false,
    hr: false,
    settings: false
  });

  // Payroll Sheet
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollSheet, setPayrollSheet] = useState([]);
  const [payModalItem, setPayModalItem] = useState(null);
  const [payForm, setPayForm] = useState({ bonus_allowance: 0, deduction: 0, payment_method: 'bank_transfer', notes: '' });
  const [payslipModalItem, setPayslipModalItem] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, selectedDept]);

  useEffect(() => {
    if (activeTab === 'payroll') {
      fetchPayrollSheet();
    }
  }, [activeTab, payrollMonth, payrollYear]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDept !== 'all') params.department = selectedDept;

      const res = await api.get('/admin/hr/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.data.employees || []);
        setStats(res.data.data.stats || { total_staff: 0, active_staff: 0, total_monthly_payroll: 0 });
      }
    } catch (err) {
      toast.error('Failed to load corporate staff directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollSheet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/hr/payrolls', {
        params: { month: payrollMonth, year: payrollYear }
      });
      if (res.data.success) {
        setPayrollSheet(res.data.data.payrolls || []);
      }
    } catch (err) {
      toast.error('Failed to load payroll sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmpModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setEmpForm({
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        designation: emp.designation,
        department: emp.department || 'General',
        base_salary: emp.base_salary,
        joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
        blood_group: emp.blood_group || '',
        nid_number: emp.nid_number || '',
        address: emp.address || ''
      });
    } else {
      setEditingEmp(null);
      setEmpForm({
        name: '',
        email: '',
        phone: '',
        designation: '',
        department: 'General',
        base_salary: '',
        joining_date: new Date().toISOString().split('T')[0],
        blood_group: '',
        nid_number: '',
        address: ''
      });
    }
    setShowEmpModal(true);
  };

  const handleSaveEmp = async (e) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await api.put(`/admin/hr/employees/${editingEmp.id}`, empForm);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/admin/hr/employees', empForm);
        toast.success('Corporate employee registered');
      }
      setShowEmpModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleOpenPermModal = (emp) => {
    setSelectedEmpForPerm(emp);
    let pObj = {
      dashboard: true,
      manage_bookings: true,
      manage_properties: false,
      manage_hosts: false,
      financials: false,
      hr: false,
      settings: false
    };
    if (emp.permissions) {
      try {
        pObj = typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions;
      } catch (e) { /* default */ }
    }
    setPermissionsObj(pObj);
    setShowPermModal(true);
  };

  const handleSavePermissions = async () => {
    try {
      await api.put(`/admin/hr/employees/${selectedEmpForPerm.id}/permissions`, { permissions: permissionsObj });
      toast.success('Staff permission matrix updated');
      setShowPermModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to update staff permissions');
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      await api.post('/admin/hr/payrolls/generate', { month: payrollMonth, year: payrollYear });
      toast.success(`Payroll sheet generated for ${payrollMonth}/${payrollYear}`);
      fetchPayrollSheet();
    } catch (err) {
      toast.error('Failed to generate payroll sheet');
    }
  };

  const handleOpenPayModal = (item) => {
    setPayModalItem(item);
    setPayForm({
      bonus_allowance: item.bonus_allowance || 0,
      deduction: item.deduction || 0,
      payment_method: 'bank_transfer',
      notes: `Monthly salary for ${item.month}/${item.year}`
    });
  };

  const handleProcessPaySalary = async () => {
    try {
      await api.post(`/admin/hr/payrolls/${payModalItem.id}/pay`, payForm);
      toast.success('Salary Paid! Direct debit entry created in Platform Accounts.');
      setPayModalItem(null);
      fetchPayrollSheet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process salary payment');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers style={{ color: '#6366f1' }} /> Corporate HR & Payroll Management
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Manage Keyhost24 corporate employees, staff permissions, and automated payroll accounts hit.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleOpenEmpModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            <FiUserPlus fontSize="18px" /> Add Corporate Employee
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Total Corporate Staff</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '6px' }}>{stats.total_staff}</div>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Active Employees</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>{stats.active_staff}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Total Monthly Base Payroll</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>
            ৳{parseFloat(stats.total_monthly_payroll || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: '700',
            color: activeTab === 'directory' ? '#6366f1' : '#64748b',
            borderBottom: activeTab === 'directory' ? '3px solid #6366f1' : '3px solid transparent',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          👥 Employee Directory & Permissions
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: '700',
            color: activeTab === 'payroll' ? '#6366f1' : '#64748b',
            borderBottom: activeTab === 'payroll' ? '3px solid #6366f1' : '3px solid transparent',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          💰 Monthly Payroll & Accounts Hit
        </button>
      </div>

      {/* TAB 1: EMPLOYEE DIRECTORY */}
      {activeTab === 'directory' && (
        <div>
          {/* Search and Filters */}
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search staff by name, designation, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            >
              <option value="all">All Departments</option>
              <option value="Accounts">Accounts & Finance</option>
              <option value="Sales">Sales & Marketing</option>
              <option value="Tech">Tech Support & IT</option>
              <option value="Operations">Operations</option>
              <option value="General">General Admin</option>
            </select>
          </div>

          {/* Directory Table */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 20px' }}>Employee</th>
                  <th style={{ padding: '16px 20px' }}>Designation / Dept</th>
                  <th style={{ padding: '16px 20px' }}>Contact Info</th>
                  <th style={{ padding: '16px 20px' }}>Base Salary</th>
                  <th style={{ padding: '16px 20px' }}>Joining Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center' }}>Loading employees...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No corporate employees registered yet.</td></tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{emp.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>NID: {emp.nid_number || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{emp.designation}</div>
                        <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          {emp.department}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13px', color: '#1e293b' }}>{emp.email}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.phone || 'No Phone'}</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#10b981', fontSize: '15px' }}>
                        ৳{parseFloat(emp.base_salary).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                        {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenPermModal(emp)}
                            title="Staff Permissions"
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #c7d2fe', background: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FiShield /> Permissions
                          </button>

                          <button
                            onClick={() => handleOpenEmpModal(emp)}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                          >
                            <FiEdit2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY PAYROLL & ACCOUNTS HIT */}
      {activeTab === 'payroll' && (
        <div>
          {/* Month/Year selector & Generate button */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: '600', color: '#334155' }}>Payroll Period:</label>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(parseInt(e.target.value))}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={payrollYear}
                onChange={(e) => setPayrollYear(parseInt(e.target.value))}
                style={{ width: '100px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <button
              onClick={handleGeneratePayroll}
              style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
            >
              🔄 Generate Monthly Sheet
            </button>
          </div>

          {/* Payroll Sheet Table */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 20px' }}>Employee</th>
                  <th style={{ padding: '16px 20px' }}>Base Salary</th>
                  <th style={{ padding: '16px 20px' }}>Bonus / Allowance</th>
                  <th style={{ padding: '16px 20px' }}>Deductions</th>
                  <th style={{ padding: '16px 20px' }}>Net Payable</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollSheet.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Click "Generate Monthly Sheet" to calculate payroll for this month.</td></tr>
                ) : (
                  payrollSheet.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.employee_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.designation} ({item.department})</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '600', color: '#334155' }}>
                        ৳{parseFloat(item.base_salary).toLocaleString()}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: '600' }}>
                        +৳{parseFloat(item.bonus_allowance || 0).toLocaleString()}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: '600' }}>
                        -৳{parseFloat(item.deduction || 0).toLocaleString()}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#4f46e5', fontSize: '16px' }}>
                        ৳{parseFloat(item.net_salary).toLocaleString()}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        {item.payment_status === 'paid' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FiCheckCircle /> Paid
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock /> Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {item.payment_status === 'paid' ? (
                          <button
                            onClick={() => setPayslipModalItem(item)}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FiPrinter /> Payslip
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(item)}
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                          >
                            💳 Pay Salary
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {showEmpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{editingEmp ? 'Edit Corporate Employee' : 'Register Corporate Employee'}</h2>
              <button onClick={() => setShowEmpModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSaveEmp}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email Address *</label>
                  <input type="email" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Designation *</label>
                  <input type="text" placeholder="e.g. Accounts Executive" value={empForm.designation} onChange={e => setEmpForm({ ...empForm, designation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Department</label>
                  <select value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="Accounts">Accounts & Finance</option>
                    <option value="Sales">Sales & Marketing</option>
                    <option value="Tech">Tech Support & IT</option>
                    <option value="Operations">Operations</option>
                    <option value="General">General Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Base Monthly Salary (BDT) *</label>
                  <input type="number" value={empForm.base_salary} onChange={e => setEmpForm({ ...empForm, base_salary: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Joining Date</label>
                  <input type="date" value={empForm.joining_date} onChange={e => setEmpForm({ ...empForm, joining_date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>NID Number</label>
                  <input type="text" value={empForm.nid_number} onChange={e => setEmpForm({ ...empForm, nid_number: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Phone Number</label>
                  <input type="text" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowEmpModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: '600' }}>Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Permissions Modal */}
      {showPermModal && selectedEmpForPerm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Granular Access Control: {selectedEmpForPerm.name}</h3>
              <button onClick={() => setShowPermModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}><FiX /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {Object.keys(permissionsObj).map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#334155' }}>{key.replace('_', ' ')}</span>
                  <input
                    type="checkbox"
                    checked={!!permissionsObj[key]}
                    onChange={e => setPermissionsObj({ ...permissionsObj, [key]: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                </label>
              ))}
            </div>

            <button onClick={handleSavePermissions} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              Save Staff Permissions
            </button>
          </div>
        </div>
      )}

      {/* Pay Salary Modal */}
      {payModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '450px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Pay Salary: {payModalItem.employee_name}</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>Bonus / Allowance (BDT)</label>
              <input type="number" value={payForm.bonus_allowance} onChange={e => setPayForm({ ...payForm, bonus_allowance: parseFloat(e.target.value || 0) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>Deductions (BDT)</label>
              <input type="number" value={payForm.deduction} onChange={e => setPayForm({ ...payForm, deduction: parseFloat(e.target.value || 0) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>Net Payable Salary</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d' }}>
                ৳{(parseFloat(payModalItem.base_salary || 0) + payForm.bonus_allowance - payForm.deduction).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPayModalItem(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button onClick={handleProcessPaySalary} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: '700' }}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {payslipModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '600px', width: '100%' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', pb: '16px', mb: '20px' }}>
              <h2 style={{ margin: 0, color: '#4f46e5', fontWeight: '800' }}>KEYHOST24 CORPORATE</h2>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Official Employee Payslip</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><strong>Employee Name:</strong> {payslipModalItem.employee_name}</div>
              <div><strong>Designation:</strong> {payslipModalItem.designation}</div>
              <div><strong>Department:</strong> {payslipModalItem.department}</div>
              <div><strong>Payment Date:</strong> {new Date(payslipModalItem.payment_date).toLocaleDateString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', mb: '8px' }}><span>Base Salary:</span> <strong>৳{parseFloat(payslipModalItem.base_salary).toLocaleString()}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', mb: '8px', color: '#10b981' }}><span>Allowances:</span> <strong>+৳{parseFloat(payslipModalItem.bonus_allowance || 0).toLocaleString()}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', mb: '8px', color: '#ef4444' }}><span>Deductions:</span> <strong>-৳{parseFloat(payslipModalItem.deduction || 0).toLocaleString()}</strong></div>
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}><span>Net Salary Paid:</span> <span>৳{parseFloat(payslipModalItem.net_salary).toLocaleString()}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => window.print()} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}><FiPrinter /> Print Payslip</button>
              <button onClick={() => setPayslipModalItem(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCorporateHR;
