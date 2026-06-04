import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiHome, FiMapPin, 
  FiLayers, FiDollarSign, FiClock, FiSettings, FiCheckCircle,
  FiXCircle, FiInfo, FiGrid, FiList, FiFilter, FiRotateCw, FiEdit, FiImage
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';

const HMSRooms = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'occupied'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusModalRoom, setStatusModalRoom] = useState(null); // room object or null

    const getRoomImage = (images) => {
        if (!images) return null;
        let imageList = images;
        if (typeof images === 'string') {
            try {
                imageList = JSON.parse(images);
                if (typeof imageList === 'string') imageList = JSON.parse(imageList);
            } catch (e) {
                return null;
            }
        }
        
        if (!Array.isArray(imageList) || imageList.length === 0) return null;
        
        const firstImage = imageList[0];
        if (!firstImage) return null;
        
        if (firstImage.startsWith('http') || firstImage.startsWith('data:')) {
            return firstImage;
        }
        
        const backendUrl = 'http://localhost:5000';
        return `${backendUrl}${firstImage}`;
    };
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        room_number: '',
        room_type: 'Standard',
        floor: '',
        price: '',
        status: 'available',
        features: [],
        images: []
    });

    const [bulkFormData, setBulkFormData] = useState({
        start_number: '',
        end_number: '',
        room_type: 'Standard',
        floor: '',
        price: '',
        status: 'available'
    });

    // Fetch properties that have HMS enabled
    const { data: properties, isLoading: isLoadingProperties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    // Sync selectedPropertyId when properties are loaded
    useEffect(() => {
        if (properties?.length > 0) {
            const savedId = localStorage.getItem('hms_selected_property_id');
            const parsedSavedId = savedId ? parseInt(savedId) : null;
            const exists = properties.some(p => p.id === parsedSavedId);
            
            if (exists && parsedSavedId) {
                setSelectedPropertyId(parsedSavedId);
            } else {
                setSelectedPropertyId(properties[0].id);
                localStorage.setItem('hms_selected_property_id', properties[0].id);
                localStorage.setItem('hms_selected_property_type', properties[0].property_type || 'hotel');
            }
        }
    }, [properties]);

    useEffect(() => {
        const handlePropertyChange = () => {
            const savedId = localStorage.getItem('hms_selected_property_id');
            if (savedId) {
                setSelectedPropertyId(parseInt(savedId));
            }
        };
        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        return () => window.removeEventListener('hmsPropertyChange', handlePropertyChange);
    }, []);

    const handlePropertyChange = (val) => {
        const newId = parseInt(val);
        setSelectedPropertyId(newId);
        localStorage.setItem('hms_selected_property_id', newId);
        const prop = properties?.find(p => p.id === newId);
        if (prop) {
            localStorage.setItem('hms_selected_property_type', prop.property_type || 'hotel');
            window.dispatchEvent(new Event('hmsPropertyChange'));
        }
    };

    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
    const propertyType = selectedProperty?.property_type || 'hotel';

    const getTerminology = (propType) => {
        const type = (propType || '').toLowerCase();
        if (type.includes('apartment') || type.includes('flat') || type.includes('building')) {
            return {
                room: 'Flat',
                rooms: 'Flats',
                roomNo: 'Flat No.',
                roomType: 'Flat Type',
                floor: 'Floor No.',
                inventory: 'Flat Inventory',
                roomPlural: 'flats',
                roomSingular: 'flat'
            };
        } else if (type.includes('villa') || type.includes('house') || type.includes('resort')) {
            return {
                room: 'Unit',
                rooms: 'Units',
                roomNo: 'Unit No.',
                roomType: 'Unit Type',
                floor: 'Floor',
                inventory: 'Unit Inventory',
                roomPlural: 'units',
                roomSingular: 'unit'
            };
        }
        return {
            room: 'Room',
            rooms: 'Rooms',
            roomNo: 'Room No.',
            roomType: 'Room Type',
            floor: 'Floor No.',
            inventory: 'Room Inventory',
            roomPlural: 'rooms',
            roomSingular: 'room'
        };
    };
    
    const terms = getTerminology(propertyType);

    // Fetch rooms for the selected property
    const { data: roomsData, isLoading: isLoadingRooms, refetch: refetchRooms } = useQuery(
        ['hms-rooms', selectedPropertyId],
        () => api.get(`/property-owner/hms/rooms/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (response) => response.data?.data?.rooms || []
        }
    );

    const roomMutation = useMutation(
        (roomData) => {
            if (editingRoom) {
                return api.put(`/property-owner/hms/rooms/${editingRoom.id}`, roomData);
            }
            return api.post('/property-owner/hms/rooms', { ...roomData, property_id: selectedPropertyId });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess(`${terms.room} ${editingRoom ? 'updated' : 'added'} successfully`);
                handleCloseModal();
            },
            onError: (error) => {
                showError(error.response?.data?.message || 'Operation failed');
            }
        }
    );

    const bulkRoomMutation = useMutation(
        (rooms) => api.post('/property-owner/hms/rooms/bulk', { 
            property_id: selectedPropertyId, 
            rooms 
        }),
        {
            onSuccess: (res) => {
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess(res.data?.message || `${terms.rooms} added successfully`);
                setIsBulkModalOpen(false);
                setBulkFormData({
                    start_number: '',
                    end_number: '',
                    room_type: 'Standard',
                    floor: '',
                    price: '',
                    status: 'available'
                });
            },
            onError: (error) => {
                showError(error.response?.data?.message || 'Bulk addition failed');
            }
        }
    );

    const deleteMutation = useMutation(
        (id) => api.delete(`/property-owner/hms/rooms/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess(`${terms.room} deleted successfully`);
            },
            onError: (error) => {
                showError(`Failed to delete ${terms.roomSingular}`);
            }
        }
    );

    const statusUpdateMutation = useMutation(
        ({ id, status }) => api.patch(`/property-owner/hms/rooms/${id}/status`, { status }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess('Status updated successfully');
                setStatusModalRoom(null);
            },
            onError: (error) => {
                showError(error.response?.data?.message || 'Failed to update status');
            }
        }
    );

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                room_number: room.room_number,
                room_type: room.room_type || 'Standard',
                floor: room.floor || '',
                price: room.price,
                status: room.status,
                features: room.features || [],
                images: room.images || []
            });
        } else {
            setEditingRoom(null);
            setFormData({
                room_number: '',
                room_type: 'Standard',
                floor: '',
                price: '',
                status: 'available',
                features: [],
                images: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        roomMutation.mutate(formData);
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        const start = parseInt(bulkFormData.start_number);
        const end = parseInt(bulkFormData.end_number);

        if (isNaN(start) || isNaN(end) || start > end) {
            showError('Invalid room range');
            return;
        }

        if (end - start > 50) {
            showError('Max 50 rooms at a time');
            return;
        }

        const rooms = [];
        for (let i = start; i <= end; i++) {
            rooms.push({
                room_number: i.toString(),
                room_type: bulkFormData.room_type,
                floor: bulkFormData.floor,
                price: bulkFormData.price,
                status: bulkFormData.status
            });
        }

        bulkRoomMutation.mutate(rooms);
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete this ${terms.roomSingular}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredRooms = (roomsData || []).filter(room => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || room.status === statusFilter;
        const matchesType = !typeFilter || room.room_type === typeFilter;
        const matchesTab = activeTab === 'list' || (activeTab === 'occupied' && room.status === 'occupied');
        return matchesSearch && matchesStatus && matchesType && matchesTab;
    });

    const getStatusBadge = (room) => {
        const status = room.status;
        const styles = {
            available: 'bg-green-100 text-green-700 border-green-200',
            occupied: 'bg-blue-100 text-blue-700 border-blue-200',
            dirty: 'bg-[#4a6375] text-white border-[#4a6375]',
            maintenance: 'bg-red-100 text-red-700 border-red-200'
        };
        const text = status === 'dirty' ? 'VACANT DIRTY' : status.toUpperCase();
        
        return (
            <div className="flex items-center gap-1">
                <span className={`px-2 py-1 rounded text-[9px] font-bold border whitespace-nowrap ${styles[status]}`}>
                    {text}
                </span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setStatusModalRoom(room);
                    }}
                    className="p-1 bg-[#004e59] text-white rounded text-xs hover:bg-[#003d4d] transition-colors"
                >
                    <FiEdit size={10} />
                </button>
            </div>
        );
    };

    if (isLoadingProperties) return <LoadingSpinner />;

    if (!properties || properties.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">No HMS Properties Found</h2>
                <p className="text-gray-600 mt-2">First, enable HMS for one of your properties in the property settings.</p>
                <button 
                  onClick={() => window.location.href = '/property-owner/properties'}
                  className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                >
                    Manage Properties
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
            {/* Property Selector Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{terms.room} Management</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiHome />
                        <span>Select Property:</span>
                        <select 
                            value={selectedPropertyId || ''} 
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="bg-transparent font-bold text-primary-600 border-none p-0 focus:ring-0 cursor-pointer"
                        >
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {selectedProperty?.is_single_unit !== 1 && selectedProperty?.is_single_unit !== true && (
                        <>
                            <button 
                                onClick={() => setIsBulkModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#003d4d] text-white rounded font-bold text-sm shadow-sm"
                            >
                                <FiPlus />
                                Add Multiple {terms.rooms}
                            </button>
                            <button 
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#004e59] text-white rounded font-bold text-sm shadow-sm"
                            >
                                <FiPlus />
                                Add {terms.room}
                            </button>
                        </>
                    )}
                    <button className="p-2 bg-white border border-gray-200 text-[#004e59] rounded shadow-sm">
                        <FiFilter />
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Search and Filters Bar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder={`Search with ${terms.roomSingular} no...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59]"
                        />
                    </div>

                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded px-4 py-1.5 text-sm text-gray-500 min-w-[160px]"
                    >
                        <option value="">Filter by {terms.room} Status</option>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="dirty">Dirty</option>
                        <option value="maintenance">Maintenance</option>
                    </select>

                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-gray-200 rounded px-4 py-1.5 text-sm text-gray-500 min-w-[160px]"
                    >
                        <option value="">Filter by {terms.room} Type</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Family Room">Family Room</option>
                    </select>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'list' ? 'border-[#004e59] text-[#004e59]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <FiList />
                        {terms.room} List
                    </button>
                    <button 
                        onClick={() => setActiveTab('occupied')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'occupied' ? 'border-[#004e59] text-[#004e59]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <FiHome />
                        Occupied {terms.rooms}
                    </button>
                </div>

                {/* Summary Info Bar */}
                <div className="px-6 py-3 bg-[#fcfdfe] border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-sm font-bold text-gray-500">Total - {filteredRooms.length}</span>
                    </div>
                    <button 
                        onClick={() => refetchRooms()}
                        className="text-blue-400 hover:text-blue-600 transition"
                    >
                        <FiRotateCw />
                    </button>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#b4c6cc] text-[#4a6375]">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">SL</th>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">Photo</th>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">{terms.roomNo}</th>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">{terms.floor}</th>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">{terms.roomType}</th>
                                <th className="px-4 py-3 text-sm font-medium border-r border-white/20">Status</th>
                                <th className="px-4 py-3 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingRooms ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : filteredRooms.length > 0 ? (
                                filteredRooms.map((room, index) => (
                                    <tr key={room.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-50">{index + 1}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-50">
                                            {getRoomImage(room.images) ? (
                                                <img 
                                                    src={getRoomImage(room.images)} 
                                                    alt={terms.room} 
                                                    className="w-10 h-10 object-cover rounded border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                    <FiImage size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-800 border-r border-gray-50">{room.room_number}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-50">{room.floor || 'N/A'}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-blue-500 border-r border-gray-50">{room.room_type}</td>
                                        <td className="px-4 py-4 text-sm border-r border-gray-50">
                                            {getStatusBadge(room)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(room)}
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#76bc21] text-white rounded text-xs font-bold"
                                                >
                                                    <FiEdit size={12} />
                                                    Edit
                                                </button>
                                                {selectedProperty?.is_single_unit !== 1 && selectedProperty?.is_single_unit !== true && (
                                                    <button 
                                                        onClick={() => handleDelete(room.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-[#e91e63] text-white rounded text-xs font-bold"
                                                    >
                                                        <FiTrash2 size={12} />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FiLayers className="w-12 h-12 text-gray-200" />
                                            <p className="text-gray-500 font-medium">No {terms.roomPlural} found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing {filteredRooms.length > 0 ? `1-${filteredRooms.length}` : '0'} of {filteredRooms.length} entries
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600 cursor-not-allowed">{'<'}</button>
                            <span className="w-8 h-8 flex items-center justify-center bg-[#f0f9fa] border border-[#004e59] text-[#004e59] font-bold rounded text-sm">1</span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 cursor-not-allowed">{'>'}</button>
                        </div>
                        <select className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-500">
                            <option>50 / page</option>
                            <option>100 / page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Room Modal (Kept from original but styled better) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#004e59] text-white flex-shrink-0">
                            <h2 className="text-lg font-bold">{editingRoom ? `Edit ${terms.room}` : `Add New ${terms.room}`}</h2>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-white/20 rounded transition">
                                <FiXCircle size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{terms.room} No *</label>
                                    <input 
                                        type="text" 
                                        required
                                        disabled={selectedProperty?.is_single_unit === 1 || selectedProperty?.is_single_unit === true}
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        placeholder="e.g. 101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Floor</label>
                                    <input 
                                        type="text" 
                                        value={formData.floor}
                                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                        placeholder="e.g. 1st"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{terms.roomType}</label>
                                <select 
                                    value={formData.room_type}
                                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Deluxe">Deluxe</option>
                                    <option value="Executive Suite">Executive Suite</option>
                                    <option value="Family Room">Family Room</option>
                                    <option value="Penthouse">Penthouse</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Price per Night (BDT) *</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="number" 
                                        required
                                        disabled={selectedProperty?.is_single_unit === 1 || selectedProperty?.is_single_unit === true}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        placeholder="5000"
                                    />
                                </div>
                                {(selectedProperty?.is_single_unit === 1 || selectedProperty?.is_single_unit === true) && (
                                    <p className="text-[10px] text-amber-600 mt-1 ml-1 font-semibold">
                                        Pricing is managed from the property edit settings.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{terms.room} Photos</label>
                                <ImageUpload 
                                    images={(formData.images || []).map((url, idx) => ({ 
                                        id: idx, 
                                        preview: url.startsWith('http') || url.startsWith('data:') ? url : `http://localhost:5000${url}` 
                                     }))}
                                    onImagesChange={(imgs) => setFormData({ ...formData, images: imgs.map(i => i.preview) })}
                                    maxImages={10}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">The first photo will be used as the Cover Photo.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Initial Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['available', 'dirty', 'maintenance'].map(st => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: st })}
                                            className={`px-3 py-2 rounded text-xs font-bold transition capitalize border ${formData.status === st ? 'bg-[#004e59] text-white border-[#004e59]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#004e59]'}`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded font-bold hover:bg-gray-200 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={roomMutation.isLoading}
                                    className="flex-1 px-4 py-2.5 bg-[#004e59] text-white rounded font-bold hover:bg-[#003d4d] disabled:opacity-50 transition text-sm shadow-md shadow-gray-200"
                                >
                                    {roomMutation.isLoading ? 'Saving...' : editingRoom ? `Update ${terms.room}` : `Add ${terms.room}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Room Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#004e59] text-white flex-shrink-0">
                            <h2 className="text-lg font-bold">Add Multiple {terms.rooms}</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="p-1 hover:bg-white/20 rounded transition">
                                <FiXCircle size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleBulkSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Start No. *</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={bulkFormData.start_number}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, start_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                        placeholder="e.g. 101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">End No. *</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={bulkFormData.end_number}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, end_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                        placeholder="e.g. 110"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Floor</label>
                                    <input 
                                        type="text" 
                                        value={bulkFormData.floor}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, floor: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                        placeholder="e.g. 1st"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{terms.roomType}</label>
                                <select 
                                    value={bulkFormData.room_type}
                                    onChange={(e) => setBulkFormData({ ...bulkFormData, room_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Deluxe">Deluxe</option>
                                    <option value="Executive Suite">Executive Suite</option>
                                    <option value="Family Room">Family Room</option>
                                    <option value="Penthouse">Penthouse</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Price per Night (BDT) *</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="number" 
                                        required
                                        value={bulkFormData.price}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, price: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] text-sm"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Initial Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['available', 'dirty', 'maintenance'].map(st => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setBulkFormData({ ...bulkFormData, status: st })}
                                            className={`px-3 py-2 rounded text-xs font-bold transition capitalize border ${bulkFormData.status === st ? 'bg-[#004e59] text-white border-[#004e59]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#004e59]'}`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded font-bold hover:bg-gray-200 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={bulkRoomMutation.isLoading}
                                    className="flex-1 px-4 py-2.5 bg-[#004e59] text-white rounded font-bold hover:bg-[#003d4d] disabled:opacity-50 transition text-sm shadow-md shadow-gray-200"
                                >
                                    {bulkRoomMutation.isLoading ? 'Adding...' : `Add ${terms.rooms}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Status Update Modal */}
            {statusModalRoom && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#004e59] text-white flex items-center justify-between">
                            <h2 className="text-lg font-bold">{terms.room} {statusModalRoom.room_number} Status</h2>
                            <button onClick={() => setStatusModalRoom(null)} className="p-1 hover:bg-white/20 rounded">
                                <FiXCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'available', label: 'AVAILABLE', color: 'bg-green-500', desc: 'Ready for new guests' },
                                    { id: 'dirty', label: 'VACANT DIRTY', color: 'bg-[#4a6375]', desc: 'Needs cleaning' },
                                    { id: 'maintenance', label: 'MAINTENANCE', color: 'bg-red-500', desc: 'Under repair' },
                                    { id: 'occupied', label: 'OCCUPIED', color: 'bg-blue-500', desc: 'Guest is in room' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => statusUpdateMutation.mutate({ id: statusModalRoom.id, status: opt.id })}
                                        disabled={statusUpdateMutation.isLoading}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                            statusModalRoom.status === opt.id 
                                                ? 'border-[#004e59] bg-blue-50 shadow-sm' 
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${opt.color}`}></div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                                            <div className="text-[10px] text-gray-500">{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setStatusModalRoom(null)}
                                className="w-full mt-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSRooms;
