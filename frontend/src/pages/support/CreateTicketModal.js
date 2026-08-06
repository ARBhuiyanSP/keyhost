import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import { FiX, FiPaperclip, FiHash, FiCheckCircle, FiSearch, FiChevronDown } from 'react-icons/fi';

const CreateTicketModal = ({ onClose, onSuccess }) => {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [file, setFile] = useState(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Other',
    priority: 'Medium',
    property_id: '',
    message: ''
  });

  useEffect(() => {
    fetchMyBookedProperties();
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const fetchMyBookedProperties = async () => {
    try {
      const response = await api.get('/guest/bookings');
      const bookings = response.data.data.bookings || [];
      const props = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((acc, current) => {
          const x = acc.find(item => item.id === current.property_id);
          if (!x) {
            acc.push({ id: current.property_id, title: current.property_title });
          }
          return acc;
        }, []);
      setProperties(props);
      setFilteredProperties(props);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  const handleSearch = (val) => {
    setSearchQuery(val);
    const filtered = properties.filter(p => 
      p.title.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  const selectProperty = (p) => {
    setSelectedProperty(p);
    setFormData({ ...formData, property_id: p ? p.id : '' });
    setSearchQuery(p ? p.title : '');
    setShowDropdown(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      showError('File size must be less than 20MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('property_id', formData.property_id);
      data.append('message', formData.message);
      if (file) {
        data.append('attachment', file);
      }

      await api.post('/support', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess('Ticket opened successfully');
      onSuccess();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to open ticket');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Cleaning', 'WiFi', 'Payment', 'Maintenance', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className={`bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-200/50 overflow-hidden transform transition-all duration-300 ${
          isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'
        } animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500`}
      >
        <div className="px-6 py-5 bg-white border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#E41D57]">
              <FiHash className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">New Ticket</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Request</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-slate-300 hover:text-slate-900 transition-all p-2 bg-slate-50 hover:bg-slate-100 rounded-full"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4 max-h-[60vh] overflow-y-visible px-1 custom-scrollbar">
            {/* Subject */}
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Subject</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#E41D57]/10 focus:border-[#E41D57] transition-all outline-none font-semibold text-slate-700 text-sm"
                placeholder="What's the issue?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                <div className="relative">
                   <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#E41D57]/10 focus:border-[#E41D57] outline-none font-bold text-xs text-slate-600 appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                <div className="relative">
                   <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#E41D57]/10 focus:border-[#E41D57] outline-none font-bold text-xs text-slate-600 appearance-none cursor-pointer"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {priorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Custom Searchable Booking Select */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Related Booking (Searchable)</label>
              <div className="relative group">
                <input
                  type="text"
                  readOnly={selectedProperty ? true : false}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#E41D57]/10 focus:border-[#E41D57] transition-all outline-none font-bold text-[10px] text-slate-500 cursor-pointer pr-10`}
                  placeholder={properties.length > 0 ? "SEARCH BOOKING OR SELECT..." : "NO ACTIVE BOOKINGS FOUND"}
                  value={searchQuery}
                  onFocus={() => properties.length > 0 && setShowDropdown(true)}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {selectedProperty ? (
                    <button 
                      type="button" 
                      onClick={() => selectProperty(null)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <FiX />
                    </button>
                  ) : (
                    <FiSearch className="text-slate-300" />
                  )}
                </div>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-50 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  <div 
                    onClick={() => selectProperty(null)}
                    className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50 cursor-pointer"
                  >
                    General Support (None)
                  </div>
                  {filteredProperties.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => selectProperty(p)}
                      className="px-4 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-rose-50 hover:text-[#E41D57] cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                    >
                      {p.title}
                    </div>
                  ))}
                  {filteredProperties.length === 0 && (
                    <div className="px-4 py-8 text-center text-[10px] font-bold text-slate-300">
                      NO RESULTS MATCHED
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Message</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#E41D57]/10 focus:border-[#E41D57] transition-all outline-none resize-none font-medium text-slate-700 text-sm"
                placeholder="Details of the issue..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* File Upload Small */}
            <div className="relative">
              <input
                type="file"
                id="modal-file-up"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
              <label
                htmlFor="modal-file-up"
                className={`w-full flex items-center justify-between px-4 py-3 border border-dashed rounded-2xl cursor-pointer transition-all ${
                  file ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-[#E41D57] hover:text-[#E41D57]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiPaperclip className={file ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap text-ellipsis max-w-[200px]">
                    {file ? file.name : 'Upload Screenshots or PDF (Max 20MB)'}
                  </span>
                </div>
                {file && <FiCheckCircle className="text-emerald-500" />}
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-[#E41D57] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c21849] transition-all disabled:opacity-50 shadow-xl shadow-rose-100 active:scale-95 outline-none"
            >
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
