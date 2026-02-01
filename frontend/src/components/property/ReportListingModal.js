import React, { useState } from 'react';
import { FiX, FiChevronLeft } from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';

const ReportListingModal = ({ isOpen, onClose, propertyTitle, propertyId }) => {
    const [step, setStep] = useState(1);
    const [selectedReason, setSelectedReason] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const step1Options = [
        "It's inaccurate or incorrect",
        "It's not a real place to stay",
        "It's a scam",
        "It's offensive",
        "It's something else"
    ];

    const step2Options = [
        "Something on this page is broken",
        "The host is asking for more money",
        "It doesn't look clean or safe",
        "It's a duplicate listing",
        "I don't think it's allowed in my neighborhood",
        "It's disturbing my neighborhood"
    ];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/reports', {
                property_id: propertyId,
                reason: selectedReason,
                detail: selectedDetail
            });
            setStep(3);
        } catch (error) {
            console.error('Error submitting report:', error);
            showToast('Failed to submit report. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedReason) {
            setStep(2);
        } else if (step === 2 && selectedDetail) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedDetail(null);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedReason(null);
        setSelectedDetail(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className="bg-white w-full max-w-[568px] rounded-xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeIn relative max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <button
                        onClick={handleClose}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="w-4 h-4 text-gray-900" />
                    </button>

                    <h3 className="font-bold text-base text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                        Report this listing
                    </h3>

                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-bold text-[#222222] mb-2">
                                Why are you reporting this listing?
                            </h2>
                            <p className="text-gray-500 mb-8 text-sm">
                                This won't be shared with the Host.
                            </p>

                            <div className="space-y-6">
                                {step1Options.map((option, index) => (
                                    <label key={index} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[#222222] text-base font-light">{option}</span>
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="report-reason"
                                                className="peer sr-only"
                                                checked={selectedReason === option}
                                                onChange={() => setSelectedReason(option)}
                                            />
                                            <div className="w-6 h-6 border rounded-full border-gray-300 peer-checked:border-[6px] peer-checked:border-black transition-all"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-bold text-[#222222] mb-2">
                                Why are you reporting this listing?
                            </h2>
                            <p className="text-gray-500 mb-8 text-sm">
                                Select a more specific reason.
                            </p>

                            <div className="space-y-6">
                                {step2Options.map((option, index) => (
                                    <label key={index} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[#222222] text-base font-light">{option}</span>
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="report-detail"
                                                className="peer sr-only"
                                                checked={selectedDetail === option}
                                                onChange={() => setSelectedDetail(option)}
                                            />
                                            <div className="w-6 h-6 border rounded-full border-gray-300 peer-checked:border-[6px] peer-checked:border-black transition-all"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn py-4">
                            <h2 className="text-2xl font-bold text-[#222222] mb-4">
                                Help us improve
                            </h2>
                            <p className="text-[#222222] mb-6 font-light">
                                We want to hear what you think we can do better. We won't be able to respond to every piece of feedback individually.
                            </p>
                            <p className="text-[#222222] mb-8 font-light">
                                If you have a question or need help resolving an issue, search our Help Center.
                            </p>

                            <button className="font-semibold underline text-[#222222] mb-4 block">
                                Provide feedback
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-white">
                    {step === 1 && (
                        <>
                            <button
                                onClick={handleBack}
                                className="text-[#222222] font-semibold underline opacity-0 pointer-events-none"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedReason}
                                className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${selectedReason ? 'bg-[#222222] hover:bg-black' : 'bg-[#DDDDDD] cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button
                                onClick={handleBack}
                                className="text-[#222222] font-semibold underline hover:bg-gray-100 rounded-lg px-4 py-2 -ml-4"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedDetail || isSubmitting}
                                className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${selectedDetail ? 'bg-[#222222] hover:bg-black' : 'bg-[#DDDDDD] cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Next'}
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <div className="w-full flex justify-end">
                            <button
                                onClick={handleClose}
                                className="px-8 py-3 bg-[#222222] hover:bg-black text-white font-semibold rounded-lg transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportListingModal;
