import React from "react";

const FareSummaryTab = ({ flight }) => {
    if (!flight) {
        return <div className="p-4 text-gray-500 italic">No fare data available.</div>;
    }

    const summary = flight.passengerFareSummary || {};
    const list = Object.keys(summary)
        .filter(key => key !== "totalPassenger")
        .map(key => summary[key]);

    const totalPassenger = summary.totalPassenger || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">Passenger Type</th>
                            <th className="px-4 py-3 text-right">Base Fare</th>
                            <th className="px-4 py-3 text-right">Tax</th>
                            <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {list.map((pax, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-4">
                                    <div className="font-bold text-gray-800">{pax.passengerType}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">Quantity: {pax.passengerNumberByType}</div>
                                </td>
                                <td className="px-4 py-4 text-right text-gray-600">
                                    {Number(pax.passengerBaseFare || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right text-gray-600">
                                    {Number(pax.passengerTax || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-gray-800">
                                    {Number(pax.passengerTotalFare || 0).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#E41D57]/5">
                        <tr className="border-t border-[#E41D57]/20">
                            <td className="px-4 py-4 font-bold text-[#1e2049]">Total Fare ({totalPassenger} Travelers)</td>
                            <td className="px-4 py-4 text-right font-bold text-[#1e2049]" colSpan="3">
                                <span className="text-[10px] mr-1 uppercase">BDT</span>
                                {Number(flight.fare?.totalPrice || 0).toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-[11px] text-yellow-800 leading-relaxed">
                <strong>Note:</strong> Promotional fares might have different baggage and refund policies. Please review the specific brand details before booking.
            </div>
        </div>
    );
};

export default FareSummaryTab;
