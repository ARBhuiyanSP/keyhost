import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    FiCoffee, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter,
    FiShoppingBag, FiCheck, FiX, FiClock, FiDollarSign, FiList,
    FiImage, FiCamera, FiUser, FiInfo, FiHome, FiGrid, FiChevronLeft, FiChevronRight,
    FiChevronDown, FiArrowRight
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from 'react-select';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Snacks', 'Dessert', 'Other'];

const HMSFoodBeverage = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
    const scrollRef = useRef(null);

    const scrollCategories = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 150 : scrollLeft + 150;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };
    const [showItemModal, setShowItemModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [itemFormData, setItemFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Breakfast',
        is_available: true,
        image_url: null
    });

    const [orderFormData, setOrderFormData] = useState({
        booking_id: '',
        guest_name: '',
        room_number: '',
        items: [], // [{item_id, quantity, price}]
        payment_status: 'unpaid',
        notes: ''
    });

    // Fetch properties
    const { data: properties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    useEffect(() => {
        if (properties?.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(properties[0].id);
        }
    }, [properties, selectedPropertyId]);

    // Fetch food items
    const { data: foodItems, isLoading: loadingItems } = useQuery(
        ['hms-food-items', selectedPropertyId],
        () => api.get(`/property-owner/hms-mgmt/food-items/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.items || []
        }
    );

    // Fetch food orders
    const { data: foodOrders, isLoading: loadingOrders } = useQuery(
        ['hms-food-orders', selectedPropertyId],
        () => api.get(`/property-owner/hms-mgmt/food-orders/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.orders || []
        }
    );

    // Fetch active bookings for order dropdown
    const { data: activeBookings } = useQuery(
        ['active-bookings', selectedPropertyId],
        () => api.get(`/property-owner/bookings?property_id=${selectedPropertyId}&status=confirmed,checked_in`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.bookings || []
        }
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setItemFormData({ ...itemFormData, image_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const itemMutation = useMutation(
        (data) => editingItem
            ? api.put(`/property-owner/hms-mgmt/food-items/${editingItem.id}`, data)
            : api.post('/property-owner/hms-mgmt/food-items', { ...data, property_id: selectedPropertyId }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-food-items', selectedPropertyId]);
                showSuccess(`Item ${editingItem ? 'updated' : 'added'}`);
                setShowItemModal(false);
            },
            onError: () => showError('Operation failed')
        }
    );

    const orderMutation = useMutation(
        (data) => api.post('/property-owner/hms-mgmt/food-orders', { ...data, property_id: selectedPropertyId }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-food-orders', selectedPropertyId]);
                showSuccess('Order placed successfully');
                setShowOrderModal(false);
            },
            onError: () => showError('Failed to place order')
        }
    );

    const updateOrderStatusMutation = useMutation(
        ({ id, status, payment_status }) => api.put(`/property-owner/hms-mgmt/food-orders/${id}`, { status, payment_status }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-food-orders', selectedPropertyId]);
                showSuccess('Order updated');
            }
        }
    );

    const handleAddItemToOrder = (item) => {
        const itemId = item.id || item._id;
        if (!itemId) return;

        setOrderFormData(prev => {
            const existing = prev.items.find(i => i.item_id === itemId);
            if (existing) {
                return {
                    ...prev,
                    items: prev.items.map(i => i.item_id === itemId ? { ...i, quantity: i.quantity + 1 } : i)
                };
            } else {
                return {
                    ...prev,
                    items: [...prev.items, { 
                        item_id: itemId, 
                        name: item.name, 
                        quantity: 1, 
                        price: parseFloat(item.price) || 0 
                    }]
                };
            }
        });
    };

    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [menuSearch, setMenuSearch] = useState('');
    const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
    const [mobileView, setMobileView] = useState('menu'); // 'menu' or 'cart'

    // Calculate Stats
    const stats = {
        totalOrders: foodOrders?.length || 0,
        pending: foodOrders?.filter(o => o.status === 'pending').length || 0,
        preparing: foodOrders?.filter(o => o.status === 'preparing').length || 0,
        served: foodOrders?.filter(o => o.status === 'served').length || 0,
        todayRevenue: foodOrders?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
            .reduce((acc, o) => acc + parseFloat(o.total_amount), 0) || 0
    };

    const calculateTotal = () => orderFormData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const getStatusConfig = (status) => {
        const configs = {
            pending: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: <FiClock />, label: 'Pending' },
            preparing: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <FiCoffee />, label: 'Preparing' },
            served: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <FiCheck />, label: 'Served' },
            cancelled: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: <FiX />, label: 'Cancelled' }
        };
        return configs[status] || configs.pending;
    };

    const filteredOrders = foodOrders?.filter(o => {
        const matchesSearch = o.guest_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
            o.room_number?.toString().includes(orderSearch) ||
            o.id.toString().includes(orderSearch);
        const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredMenu = foodItems?.filter(i => {
        const matchesSearch = i.name?.toLowerCase().includes(menuSearch.toLowerCase());
        const matchesCategory = menuCategoryFilter === 'All' || i.category === menuCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-[1600px] mx-auto">
                {/* Header Area */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[#E41D57]">
                            <FiCoffee className="text-3xl md:text-4xl" />
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Food & <span className="text-[#E41D57]">Beverage</span></h1>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl">Elevate the dining experience for every guest with premium culinary management.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <button 
                                onClick={() => setViewMode('card')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'card' ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Grid View"
                            >
                                <FiGrid size={20} />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Table View"
                            >
                                <FiList size={20} />
                            </button>
                        </div>

                        <div className="relative group w-full md:w-auto">
                            <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#E41D57] transition-colors" />
                            <select
                                value={selectedPropertyId || ''}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-xl pl-12 pr-10 py-3 text-xs md:text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-sm appearance-none cursor-pointer md:min-w-[200px] tracking-widest text-slate-700 uppercase"
                            >
                                {properties?.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        
                        {activeTab === 'menu' ? (
                            <button
                                onClick={() => { setEditingItem(null); setItemFormData({ name: '', description: '', price: '', category: 'Breakfast', is_available: true }); setShowItemModal(true); }}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#E41D57] hover:bg-[#c21849] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-rose-100 active:scale-95 group"
                            >
                                <FiPlus className="text-xl group-hover:rotate-90 transition-transform" />
                                Add Delicacy
                            </button>
                        ) : (
                            <button
                                onClick={() => { setOrderFormData({ booking_id: '', guest_name: '', room_number: '', items: [], payment_status: 'unpaid', notes: '' }); setShowOrderModal(true); }}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#E41D57] hover:bg-[#c21849] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-rose-100 active:scale-95 group"
                            >
                                <FiShoppingBag className="text-xl" />
                                Initiate Order
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag size={18} />, color: 'rose' },
                        { label: 'Pending', value: stats.pending, icon: <FiClock size={18} />, color: 'amber' },
                        { label: 'In Kitchen', value: stats.preparing, icon: <FiCoffee size={18} />, color: 'blue' },
                        { label: 'Served', value: stats.served, icon: <FiCheck size={18} />, color: 'emerald' },
                        { label: "Today's Yield", value: `৳${stats.todayRevenue.toLocaleString()}`, icon: <FiDollarSign size={18} />, color: 'slate' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 group hover:shadow-md transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-${stat.color === 'rose' ? '[#E41D57]/10 text-[#E41D57]' : stat.color + '-100 text-' + stat.color + '-600'}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Navigation & Filters */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex p-1 bg-slate-50 rounded-xl gap-1">
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'text-slate-500 hover:bg-white'}`}
                        >
                            <FiShoppingBag size={14} />
                            Order Stream
                        </button>
                        <button 
                            onClick={() => setActiveTab('menu')}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'menu' ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'text-slate-500 hover:bg-white'}`}
                        >
                            <FiList size={14} />
                            Gourmet Menu
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-fit justify-center">
                        <div className="relative w-full sm:w-64">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder={activeTab === 'menu' ? "Search dishes..." : "Search orders..."}
                                value={activeTab === 'menu' ? menuSearch : orderSearch}
                                onChange={(e) => activeTab === 'menu' ? setMenuSearch(e.target.value) : setOrderSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:bg-white focus:border-[#E41D57] outline-none transition-all shadow-inner"
                            />
                        </div>
                        {activeTab === 'orders' ? (
                            <div className="flex gap-2">
                                {['all', 'pending', 'preparing', 'served'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setOrderStatusFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${orderStatusFilter === f ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative flex items-center group/nav max-w-[400px]">
                                <button 
                                    onClick={() => scrollCategories('left')}
                                    className="absolute left-0 z-20 w-8 h-8 bg-white/90 backdrop-blur shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-[#E41D57] hover:scale-110 transition-all opacity-0 group-hover/nav:opacity-100 -translate-x-2"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                <div 
                                    ref={scrollRef}
                                    className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {['All', ...CATEGORIES].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setMenuCategoryFilter(c)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${menuCategoryFilter === c ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => scrollCategories('right')}
                                    className="absolute right-0 z-20 w-8 h-8 bg-white/90 backdrop-blur shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-[#E41D57] hover:scale-110 transition-all opacity-0 group-hover/nav:opacity-100 translate-x-2"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                                <style>{`
                                    .no-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === 'menu' ? (
                        filteredMenu?.length > 0 ? (
                            viewMode === 'card' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {loadingItems ? (
                                        <div className="col-span-full py-20"><LoadingSpinner /></div>
                                    ) : filteredMenu.map(item => (
                                        <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300 flex flex-col">
                                            <div className="h-48 rounded-2xl bg-slate-50 relative overflow-hidden group/img shrink-0">
                                                {item.image_url ? (
                                                    <img 
                                                        src={item.image_url.startsWith('data:') ? item.image_url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image_url}`} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <FiCoffee size={48} className="group-hover/img:rotate-12 transition-transform duration-500" />
                                                    </div>
                                                )}
                                                
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => { setEditingItem(item); setItemFormData(item); setShowItemModal(true); }}
                                                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 hover:text-[#E41D57] transition-all shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300 delay-75">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#E41D57] rounded-lg shadow-sm border border-white">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#E41D57] transition-colors line-clamp-1">{item.name}</h3>
                                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.is_available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}></div>
                                                </div>
                                                <p className="text-slate-500 text-xs font-medium line-clamp-2 h-8 mb-4 leading-relaxed">
                                                    {item.description || "Freshly prepared selection from our gourmet kitchen."}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</div>
                                                        <div className="text-xl font-black text-slate-900">৳{item.price}</div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${item.is_available ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {item.is_available ? 'Available' : 'Sold Out'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-900 text-white">
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Delicacy</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Category</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Price</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Inventory</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-gray-50">
                                                {filteredMenu.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                                    {item.image_url ? (
                                                                        <img src={item.image_url.startsWith('data:') ? item.image_url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image_url}`} alt="" className="w-full h-full object-cover" />
                                                                    ) : <FiCoffee className="w-full h-full p-3 text-gray-200" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">{item.name}</div>
                                                                    <div className="text-[10px] font-bold text-gray-400 line-clamp-1 max-w-[200px]">{item.description}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="px-4 py-1.5 bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500">{item.category}</span>
                                                        </td>
                                                        <td className="px-8 py-5 font-black text-gray-900 text-lg">৳{item.price}</td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.is_available ? 'text-emerald-500' : 'text-rose-500'}`}>{item.is_available ? 'In Stock' : 'Out of Stock'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => { setEditingItem(item); setItemFormData(item); setShowItemModal(true); }} className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all">
                                                                    <FiEdit2 size={16} />
                                                                </button>
                                                                <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all">
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="py-40 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="w-32 h-32 bg-gray-100 rounded-[48px] flex items-center justify-center text-gray-300 mb-8 animate-bounce duration-[2000ms]">
                                    <FiSearch size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">No delicacies found</h3>
                                <p className="text-gray-500 font-medium">We couldn't find any menu items matching your criteria. Try adjusting your search or filters.</p>
                                <button onClick={() => { setMenuSearch(''); setMenuCategoryFilter('All'); }} className="mt-8 text-primary-600 font-black text-xs uppercase tracking-[0.2em] border-b-2 border-primary-600 pb-1 hover:text-primary-700 hover:border-primary-700 transition-all">Reset Navigation</button>
                            </div>
                        )
                    ) : (
                        filteredOrders?.length > 0 ? (
                            viewMode === 'card' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {loadingOrders ? (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50">
                                            <LoadingSpinner />
                                            <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Fetching Order Stream...</p>
                                        </div>
                                    ) : filteredOrders.map(order => {
                                        const config = getStatusConfig(order.status);
                                        return (
                                            <div key={order.id} className="bg-white rounded-[40px] p-2 shadow-lg shadow-slate-200/40 border border-slate-100 group hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500">
                                                <div className="bg-slate-50/50 rounded-[34px] p-5 border border-white h-full flex flex-col">
                                                    {/* Compact Header */}
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-rose-500/5`}>
                                                                {config.icon}
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">#{order.id}</div>
                                                                <div className={`text-[9px] px-2 py-0.5 rounded-lg ${config.bg} ${config.color} border border-white/20 uppercase font-black tracking-wider`}>
                                                                    {config.label}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => { setSelectedOrder(order); setShowOrderDetailModal(true); }}
                                                            className="w-10 h-10 bg-white text-[#E41D57] rounded-xl flex items-center justify-center hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                                                        >
                                                            <FiInfo size={18} />
                                                        </button>
                                                    </div>

                                                    {/* Compact Info Grid */}
                                                    <div className="space-y-4 mb-6 flex-1">
                                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Guest / Room</div>
                                                            <div className="font-bold text-slate-900 text-sm truncate">{order.guest_name || 'Walk-in'}</div>
                                                            {order.room_number && <div className="text-[9px] font-bold text-[#E41D57] mt-1">Room {order.room_number}</div>}
                                                        </div>

                                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Settlement</div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-lg font-black text-slate-900 tracking-tighter">৳{parseFloat(order.total_amount).toLocaleString()}</div>
                                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-[#E41D57]'}`}>
                                                                    {order.payment_status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Compact Consumption Log */}
                                                        <div className="p-4 bg-[#0f172a] rounded-2xl text-white">
                                                            <div className="text-[8px] font-bold text-[#E41D57] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <FiList size={10} /> Log
                                                            </div>
                                                            <div className="space-y-2 max-h-[80px] overflow-y-auto custom-scrollbar-mini pr-1">
                                                                {order.items?.slice(0, 3).map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between text-[11px] font-medium text-slate-300">
                                                                        <span>{item.item_name} <span className="text-[#E41D57]">x{item.quantity}</span></span>
                                                                    </div>
                                                                ))}
                                                                {order.items?.length > 3 && (
                                                                    <div className="text-[9px] text-slate-500 italic mt-1">+ {order.items.length - 3} more items</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Workflow Actions */}
                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <div className="flex-1 flex gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                            {['pending', 'preparing', 'served'].map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: s, payment_status: order.payment_status })}
                                                                    className={`flex-1 h-9 rounded-xl transition-all flex items-center justify-center ${order.status === s ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' : 'text-slate-300 hover:text-slate-500'}`}
                                                                >
                                                                    {s === 'pending' ? <FiClock size={14} /> : s === 'preparing' ? <FiCoffee size={14} /> : <FiCheck size={14} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            {order.payment_status !== 'paid' && (
                                                                <button 
                                                                    onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: order.status, payment_status: 'paid' })}
                                                                    className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                    title="Collect Payment"
                                                                >
                                                                    <FiDollarSign size={16} />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => { setSelectedOrder(order); setShowOrderDetailModal(true); }}
                                                                className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#E41D57] hover:border-rose-200 transition-all shadow-sm"
                                                            >
                                                                <FiInfo size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border-2 border-white overflow-hidden">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-900 text-white">
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Order Info</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Guest / Room</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Consumption</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Settlement</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Workflow</th>
                                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-gray-50">
                                                {filteredOrders.map(order => {
                                                    const config = getStatusConfig(order.status);
                                                    return (
                                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-12 h-12 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center text-xl`}>
                                                                        {config.icon}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">#{order.id}</div>
                                                                        <div className="text-[10px] font-bold text-slate-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="font-bold text-slate-900">{order.guest_name || 'Walk-in'}</div>
                                                                {order.room_number && (
                                                                    <div className="text-[10px] font-bold text-[#E41D57] uppercase tracking-wider">Room {order.room_number}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                    {order.items?.map((item, idx) => (
                                                                        <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-bold text-slate-100">{item.item_name} x{item.quantity}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="font-bold text-slate-900">৳{parseFloat(order.total_amount).toLocaleString()}</div>
                                                                <div className={`text-[9px] font-bold uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{order.payment_status}</div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    {['pending', 'preparing', 'served'].map(s => (
                                                                        <button 
                                                                            key={s}
                                                                            onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: s, payment_status: order.payment_status })}
                                                                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${order.status === s ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-100 scale-110' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                                                                        >
                                                                            {s === 'pending' ? <FiClock size={16} /> : s === 'preparing' ? <FiCoffee size={16} /> : <FiCheck size={16} />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    {order.payment_status !== 'paid' && (
                                                                        <button 
                                                                            onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: order.status, payment_status: 'paid' })}
                                                                            className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                            title="Collect Payment"
                                                                        >
                                                                            <FiDollarSign size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => { setSelectedOrder(order); setShowOrderDetailModal(true); }}
                                                                        className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#E41D57] hover:border-rose-200 hover:bg-rose-50 transition-all"
                                                                        title="View Details"
                                                                    >
                                                                        <FiInfo size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="py-40 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="w-36 h-36 bg-gray-100 rounded-[50px] flex items-center justify-center text-gray-300 mb-10 animate-pulse">
                                    <FiShoppingBag size={56} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Zero Activity</h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">No orders are currently flowing through the system matching your filters.</p>
                                <div className="flex gap-4 mt-10">
                                    <button onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); }} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:scale-105 transition-all">Clear Filters</button>
                                    <button onClick={() => { setOrderFormData({ booking_id: '', guest_name: '', room_number: '', items: [], payment_status: 'unpaid', notes: '' }); setShowOrderModal(true); }} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:scale-105 transition-all">New Order</button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Premium Item Modal (Master Registry) */}
            {showItemModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-slate-900/70 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] md:rounded-[60px] shadow-2xl w-full max-w-xl overflow-hidden border-4 border-white scale-in-center">
                        <div className="px-6 py-5 md:px-12 md:py-10 bg-slate-900 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">{editingItem ? 'Edit Specialty' : 'New Gastronomy'}</h2>
                                <p className="text-[#E41D57] text-[8px] md:text-[10px] font-black uppercase mt-1 md:mt-2 tracking-widest">Master Selection Registry</p>
                            </div>
                            <button onClick={() => setShowItemModal(false)} className="w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-[22px] flex items-center justify-center transition-all relative z-10 group">
                                <FiX className="w-5 h-5 md:w-7 md:h-7 group-hover:rotate-90 transition-transform" />
                            </button>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E41D57]/10 blur-[100px]"></div>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-50/50">
                            <form onSubmit={(e) => { e.preventDefault(); itemMutation.mutate(itemFormData); }} className="space-y-8">
                                <div className="flex items-center gap-6 md:gap-8 p-6 md:p-8 bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border-2 border-white group">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center relative group/avatar">
                                        {itemFormData.image_url ? (
                                            <img src={itemFormData.image_url.startsWith('data:') ? itemFormData.image_url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${itemFormData.image_url}`} alt="Preview" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <FiCamera className="w-12 h-12 text-slate-200" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/70 text-white opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-500 font-black text-[10px] uppercase tracking-widest text-center px-4">
                                            Update Master Visual
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-2 text-[#E41D57]">Visual Standards</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Present this delicacy with a high-fidelity image to entice guest orders.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Delicacy Identity</label>
                                        <input required type="text" placeholder="e.g. Signature Truffle Risotto" value={itemFormData.name} onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })} className="w-full px-8 py-4 bg-white border-2 border-slate-100 rounded-[24px] focus:border-[#E41D57] outline-none transition-all font-black text-slate-900 text-lg shadow-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Market Price</label>
                                            <div className="relative group">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E41D57] font-black text-xl">৳</div>
                                                <input required type="number" placeholder="0.00" value={itemFormData.price} onChange={e => setItemFormData({ ...itemFormData, price: e.target.value })} className="w-full pl-12 pr-8 py-4 bg-white border-2 border-slate-100 rounded-[24px] focus:border-[#E41D57] outline-none transition-all font-black text-slate-900 text-xl shadow-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Category</label>
                                            <select value={itemFormData.category} onChange={e => setItemFormData({ ...itemFormData, category: e.target.value })} className="w-full px-8 py-4 bg-white border-2 border-slate-100 rounded-[24px] focus:border-[#E41D57] outline-none transition-all font-black text-slate-600 appearance-none shadow-sm cursor-pointer">
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Gastronomic Profile</label>
                                        <textarea placeholder="Ingredients and soul..." value={itemFormData.description} onChange={e => setItemFormData({ ...itemFormData, description: e.target.value })} className="w-full px-8 py-4 bg-white border-2 border-slate-100 rounded-[28px] focus:border-[#E41D57] outline-none transition-all h-32 resize-none font-bold text-slate-500 leading-relaxed shadow-sm" />
                                    </div>

                                    <div className="flex items-center gap-6 p-6 bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-100/50">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${itemFormData.is_available ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'}`}>
                                            {itemFormData.is_available ? <FiCheck size={24} /> : <FiX size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-slate-900 text-lg tracking-tight">Active for Selection</div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Visible in Guest Ordering Hub</p>
                                        </div>
                                        <div className="relative inline-block w-14 h-8 transition duration-200 ease-in">
                                            <input type="checkbox" id="toggle-available" checked={itemFormData.is_available} onChange={e => setItemFormData({ ...itemFormData, is_available: e.target.checked })} className="hidden" />
                                            <label htmlFor="toggle-available" className={`block overflow-hidden h-8 rounded-full cursor-pointer transition-colors ${itemFormData.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <span className={`block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 m-1 ${itemFormData.is_available ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors border-2 border-transparent hover:border-slate-100 rounded-[24px]">Dismiss</button>
                                    <button type="submit" className="flex-[2] bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/30 active:scale-95 transition-all">
                                        {editingItem ? 'Publish Updates' : 'Commit to Menu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Kitchen Registry Modal (New Order) */}
            {showOrderModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-slate-900/80 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] md:rounded-[60px] shadow-2xl w-full max-w-full md:max-w-[95vw] xl:max-w-7xl h-[92vh] overflow-hidden flex flex-col scale-in-center border-4 border-white/20">
                        <div className="px-6 py-4 md:px-10 md:py-6 bg-[#E41D57] text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <FiShoppingBag className="text-white/40" size={20} />
                                    Kitchen Folio
                                </h2>
                                <p className="text-white/60 text-[7px] md:text-[9px] font-black uppercase mt-0.5 tracking-widest ml-1">Precision Guest Service Interface</p>
                            </div>
                            <button onClick={() => setShowOrderModal(false)} className="w-8 h-8 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-2xl flex items-center justify-center transition-all relative z-10 group">
                                <FiX className="w-4 h-4 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>

                        {/* Mobile Tab Switcher */}
                        <div className="lg:hidden flex border-b border-slate-100 bg-white shrink-0">
                            <button
                                onClick={() => setMobileView('menu')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === 'menu' ? 'text-[#E41D57] border-b-2 border-[#E41D57] bg-rose-50/30' : 'text-slate-400'}`}
                            >
                                Select Items
                            </button>
                            <button
                                onClick={() => setMobileView('cart')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mobileView === 'cart' ? 'text-[#E41D57] border-b-2 border-[#E41D57] bg-rose-50/30' : 'text-slate-400'}`}
                            >
                                Order Summary
                                {orderFormData.items.length > 0 && (
                                    <span className="bg-[#E41D57] text-white px-1.5 py-0.5 rounded-md text-[8px]">{orderFormData.items.length}</span>
                                )}
                            </button>
                        </div>

                        {/* Main Content Area: Ironclad Flex-Containment */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50 min-h-0">
                            {/* Left: Product Selection Area */}
                            <div className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30 ${mobileView !== 'menu' ? 'hidden lg:flex' : 'flex'}`}>
                                {/* Fixed Header: Search & Categories */}
                                <div className="shrink-0 bg-white border-b border-slate-100 p-4 md:p-6 space-y-4 relative z-20 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Quick Search */}
                                        <div className="relative flex-1 max-w-md">
                                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search dishes..."
                                                value={menuSearch}
                                                onChange={e => setMenuSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57] transition-all font-bold text-slate-700 placeholder:text-slate-400 text-xs"
                                            />
                                        </div>

                                        {/* Categories with Always-Visible Arrows */}
                                        <div className="relative flex items-center group/nav max-w-full md:max-w-[400px]">
                                            <button 
                                                onClick={() => scrollCategories('left')}
                                                className="absolute left-0 z-20 w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-[#E41D57] border border-slate-100 -translate-x-3 hover:scale-110 transition-transform active:scale-95"
                                            >
                                                <FiChevronLeft size={14} />
                                            </button>
                                            <div 
                                                ref={scrollRef}
                                                className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2"
                                                style={{ scrollbarWidth: 'none' }}
                                            >
                                                {['All', ...CATEGORIES].map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setMenuCategoryFilter(f)}
                                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${menuCategoryFilter === f ? 'bg-[#E41D57] text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => scrollCategories('right')}
                                                className="absolute right-0 z-20 w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-[#E41D57] border border-slate-100 translate-x-3 hover:scale-110 transition-transform active:scale-95"
                                            >
                                                <FiChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content: Item Grid */}
                                <div className="flex-1 overflow-y-auto px-3 py-4 md:px-8 custom-scrollbar min-h-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-8">
                                        {foodItems?.filter(i => i.is_available && (menuCategoryFilter === 'All' || i.category === menuCategoryFilter) && i.name.toLowerCase().includes(menuSearch.toLowerCase())).map(item => (
                                            <div
                                                key={item.id || item._id}
                                                onClick={() => handleAddItemToOrder(item)}
                                                className="group bg-white rounded-xl p-2 border border-slate-100 hover:border-[#E41D57] transition-all cursor-pointer flex flex-row lg:flex-col h-auto lg:h-full gap-3 shadow-sm hover:shadow-md"
                                            >
                                                <div className="relative w-20 h-20 lg:w-full lg:aspect-square overflow-hidden rounded-lg bg-slate-50 shrink-0">
                                                    <img
                                                        src={item.image_url ? (item.image_url.startsWith('data:') ? item.image_url : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image_url}`) : 'https://via.placeholder.com/300x300?text=Food'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-[#E41D57]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FiPlus className="text-white" size={20} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-[11px] lg:text-[12px] uppercase truncate leading-tight group-hover:text-[#E41D57] transition-colors">{item.name}</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.category}</p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-xs lg:text-sm font-black text-slate-900">৳{item.price}</span>
                                                        <div className="px-2 py-1 rounded-md bg-slate-50 text-[8px] font-black uppercase text-slate-400 lg:hidden">Add +</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: POS Terminal Sidebar (Ironclad Grid-Lock) */}
                            <div className={`w-full lg:w-[400px] bg-white shadow-2xl relative z-30 border-l border-slate-100 flex flex-col min-h-0 overflow-hidden ${mobileView !== 'cart' ? 'hidden lg:flex' : 'flex'}`}>
                                <div className="grid grid-rows-[auto,1fr,auto] h-full overflow-hidden">
                                    
                                    {/* 1. Header: Fixed */}
                                    <div className="bg-white border-b border-slate-100 shrink-0">
                                        <div className="px-6 py-4 bg-slate-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#E41D57] rounded-xl flex items-center justify-center text-white shadow-sm">
                                                    <FiShoppingBag size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Order Details</h3>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">POS Terminal</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowOrderModal(false)} className="text-slate-300 hover:text-[#E41D57] lg:hidden">
                                                <FiX size={18} />
                                            </button>
                                        </div>
                                        <div className="px-6 py-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Assign Folio</label>
                                            <Select
                                                options={[
                                                    { value: '', label: '🏨 Walk-in Guest (General)' },
                                                    ...(activeBookings?.map(b => ({
                                                        value: b.id,
                                                        label: `👤 ${b.guest_name} — RM ${b.hms_room_number || 'NA'}`
                                                    })) || [])
                                                ]}
                                                value={orderFormData.booking_id ? { 
                                                    value: orderFormData.booking_id, 
                                                    label: `👤 ${orderFormData.guest_name} — RM ${orderFormData.room_number || 'NA'}` 
                                                } : { value: '', label: '🏨 Walk-in Guest (General)' }}
                                                onChange={(option) => {
                                                    const b = activeBookings?.find(x => x.id == option.value);
                                                    setOrderFormData({ 
                                                        ...orderFormData, 
                                                        booking_id: option.value, 
                                                        guest_name: b ? b.guest_name : '', 
                                                        room_number: b ? b.hms_room_number : '' 
                                                    });
                                                }}
                                                placeholder="Search Guest or Room..."
                                                isSearchable
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        borderRadius: '12px',
                                                        border: '1px solid #f1f5f9',
                                                        backgroundColor: '#f8fafc',
                                                        padding: '2px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        boxShadow: 'none',
                                                        '&:hover': { borderColor: '#E41D57' }
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        fontSize: '11px',
                                                        fontWeight: state.isSelected ? '900' : '700',
                                                        backgroundColor: state.isSelected ? '#E41D57' : state.isFocused ? '#fff1f2' : 'white',
                                                        color: state.isSelected ? 'white' : '#1e293b',
                                                        '&:active': { backgroundColor: '#E41D57' }
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                        border: '1px solid #f1f5f9',
                                                        zIndex: 50
                                                    })
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Middle: Scrollable Area */}
                                    <div className="overflow-y-auto px-4 py-4 custom-scrollbar bg-slate-50/10 min-h-0" style={{ scrollbarWidth: 'thin' }}>
                                        {orderFormData.items.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                                                <FiShoppingBag size={32} className="mb-2 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No Items Selected</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 pb-10">
                                                {orderFormData.items.map(item => (
                                                    <div key={item.item_id} className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h4 className="font-black text-slate-900 text-[11px] uppercase truncate leading-tight mb-1">{item.name}</h4>
                                                            <div className="text-[10px] font-black text-[#E41D57]">৳{item.price} <span className="text-slate-400 font-bold ml-1">× {item.quantity}</span></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                                                                <button onClick={() => setOrderFormData(prev => ({ ...prev, items: prev.items.map(i => i.item_id === item.item_id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i) }))} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#E41D57] transition-colors"><FiChevronLeft size={16} /></button>
                                                                <span className="w-6 text-center font-black text-slate-900 text-[10px]">{item.quantity}</span>
                                                                <button onClick={() => handleAddItemToOrder({ id: item.item_id, name: item.name, price: item.price })} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#E41D57] transition-colors"><FiChevronRight size={16} /></button>
                                                            </div>
                                                            <button onClick={() => setOrderFormData(prev => ({ ...prev, items: prev.items.filter(i => i.item_id !== item.item_id) }))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"><FiX size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Footer: Strictly Fixed at Bottom */}
                                    <div className="bg-white border-t border-slate-100 p-6 pb-10 space-y-5 shadow-[0_-20px_40px_rgba(0,0,0,0.06)] z-50 shrink-0">
                                        <div className="flex justify-between items-center px-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none mb-1.5">Total Amount</span>
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">৳{calculateTotal().toLocaleString()}</div>
                                            </div>
                                            <div className="flex gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                {['unpaid', 'paid', 'billed_to_room'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setOrderFormData({ ...orderFormData, payment_status: status })}
                                                        disabled={status === 'billed_to_room' && !orderFormData.booking_id}
                                                        className={`px-3.5 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${orderFormData.payment_status === status ? 'bg-[#E41D57] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {status === 'billed_to_room' ? 'Room' : status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => orderMutation.mutate({ ...orderFormData, total_amount: calculateTotal() })}
                                            disabled={orderFormData.items.length === 0}
                                            className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${orderFormData.items.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#E41D57] text-white hover:bg-[#c21849] hover:shadow-rose-500/40 hover:-translate-y-1'}`}
                                        >
                                            <FiShoppingBag size={18} /> Confirm & Place Order <FiArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal (Receipt/Invoice) */}
            {showOrderDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-slate-900/90 backdrop-blur-3xl animate-in fade-in duration-300 no-print-overlay">
                    <div className="bg-white rounded-[32px] md:rounded-[60px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center border-4 border-white">
                        <div className="px-6 py-5 md:px-10 md:py-8 bg-slate-900 text-white flex justify-between items-center shrink-0 no-print">
                            <div>
                                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Order Summary</h2>
                                <p className="text-[#E41D57] text-[8px] md:text-[10px] font-black uppercase mt-1 tracking-widest">Transaction Ref: #{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setShowOrderDetailModal(false)} className="w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-[22px] flex items-center justify-center transition-all group">
                                <FiX className="w-5 h-5 md:w-7 md:h-7 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div id="printable-receipt" className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-white">
                            <style>
                                {`
                                    @media print {
                                        @page { size: auto; margin: 0; }
                                        body * { visibility: hidden !important; }
                                        #printable-receipt, #printable-receipt * { visibility: visible !important; }
                                        #printable-receipt { 
                                            position: fixed !important; 
                                            left: 0 !important; 
                                            top: 0 !important; 
                                            width: 100vw !important;
                                            height: 100vh !important;
                                            overflow: visible !important;
                                            background: white !important;
                                            padding: 50px !important;
                                            margin: 0 !important;
                                            z-index: 9999 !important;
                                        }
                                        .no-print { display: none !important; }
                                        #printable-receipt .bg-slate-900 { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; }
                                        #printable-receipt .text-[#E41D57] { color: #E41D57 !important; -webkit-print-color-adjust: exact; }
                                        #printable-receipt .bg-[#E41D57] { background: #E41D57 !important; color: #fff !important; -webkit-print-color-adjust: exact; }
                                        #printable-receipt .border-slate-100 { border-color: #eee !important; }
                                        #printable-receipt .bg-slate-50 { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
                                    }
                                `}
                            </style>
                            
                            {/* Professional Invoice Header */}
                            <div className="flex justify-between items-start pb-8 border-b-2 border-slate-100">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#E41D57] rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <FiCoffee size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">KeyHost HMS</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Food & Beverage Division</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FiInfo size={10} /> Contact Info
                                        </div>
                                        <p className="text-xs font-medium text-slate-600">contact@keyhost.com | +880 1234 567890</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Invoice</h1>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
                                        <p className="text-sm font-black text-[#E41D57]">INV-{new Date(selectedOrder.created_at).getFullYear()}-{selectedOrder.id.toString().padStart(5, '0')}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Date Issued</p>
                                        <p className="text-sm font-black text-slate-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To Section */}
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Bill To</div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-black text-slate-900">{selectedOrder.guest_name || 'Walk-in Guest'}</div>
                                        {selectedOrder.room_number && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 mt-2">
                                                Room Reference: {selectedOrder.room_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Payment Details</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Status</span>
                                            <span className={`font-black uppercase tracking-widest ${selectedOrder.payment_status === 'paid' ? 'text-emerald-600' : 'text-[#E41D57]'}`}>{selectedOrder.payment_status}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Method</span>
                                            <span className="text-slate-900 font-bold uppercase tracking-widest">HMS Folio</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                            <th className="px-6 py-4">Item Description</th>
                                            <th className="px-6 py-4 text-center">Qty</th>
                                            <th className="px-6 py-4 text-right">Unit Price</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                                                <td className="px-6 py-4 font-bold text-slate-900">{item.item_name}</td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">৳{parseFloat(item.price_at_time).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-black">৳{(item.price_at_time * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end pt-6">
                                <div className="w-full max-w-[280px] space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-slate-900 font-bold">৳{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
                                        <span className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                                        <span className="text-2xl font-black text-slate-900">৳{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-[#E41D57] rounded-xl text-white text-center">
                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-80 mb-1">Payable Amount</div>
                                        <div className="text-xl font-black">৳{parseFloat(selectedOrder.total_amount).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-slate-100 mt-12 text-center">
                                <p className="text-xs text-slate-400 italic">"Thank you for dining with us. We hope you enjoyed your meal!"</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 shrink-0 no-print">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 min-w-[150px] py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <FiList size={14} /> Print Invoice
                            </button>
                            {selectedOrder.payment_status !== 'paid' && (
                                <button
                                    onClick={() => {
                                        updateOrderStatusMutation.mutate(
                                            { id: selectedOrder.id, status: selectedOrder.status, payment_status: 'paid' },
                                            { onSuccess: () => setShowOrderDetailModal(false) }
                                        );
                                    }}
                                    className="flex-[2] min-w-[200px] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} /> Mark as Paid / Receive Payment
                                </button>
                            )}
                            <button
                                onClick={() => setShowOrderDetailModal(false)}
                                className="flex-1 min-w-[150px] py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl"
                            >
                                Close Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSFoodBeverage;
