const fs = require('fs');
const path = require('path');

const filePath = 'd:/88i/booking-systme/frontend/src/pages/property-owner/HMSReservations.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `{res.payment_status === 'pending' && (`;
const replacement = `{res.status === 'cancelled' && res.payment_status === 'paid' && (
                                                     <button 
                                                         onClick={() => {
                                                             const suggested = getSuggestedRefund(res);
                                                             setReservationForRefund(res);
                                                             setRefundAmount(suggested);
                                                             setRefundReason(suggested === res.total_amount ? 'Full Refund (Policy Compliant)' : 'Partial/No Refund (Policy Deduction)');
                                                             setIsRefundModalOpen(true);
                                                         }}
                                                         className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                                         title="Process Refund"
                                                     >
                                                         <FiRotateCw size={18} />
                                                     </button>
                                                 )}
                                                 {res.payment_status === 'pending' && (`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated HMSReservations.js');
} else {
    console.log('Target string not found');
}
