import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import useSettingsStore from '../store/settingsStore';
import { useFbPixel } from '../hooks/useFbPixel';

const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: ['#E41D57', '#FFD700', '#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 7)],
      speed: Math.random() * 3 + 1,
      swing: Math.random() * 3 - 1.5,
      angle: Math.random() * 360,
      angleSpeed: Math.random() * 4 - 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.y += p.speed;
        p.x += p.swing;
        p.angle += p.angleSpeed;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.65 }}
    />
  );
};

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  const hasTrackedPurchase = useRef(false);
  const { trackPurchase } = useFbPixel();
  const { settings } = useSettingsStore();

  // Track Meta Pixel Purchase event
  useEffect(() => {
    if (booking && !hasTrackedPurchase.current) {
      hasTrackedPurchase.current = true;
      const purchaseValue = parseFloat(booking.total_price) || 0;
      const currency = settings?.currency || 'BDT';
      
      const contents = [
        {
          id: booking.property_id || booking.id,
          quantity: 1,
          item_price: purchaseValue
        }
      ];

      trackPurchase(
        purchaseValue,
        currency,
        'accommodation',
        contents,
        booking.id || bookingId
      );
    }
  }, [booking, settings, bookingId, trackPurchase]);

  const isExtension = searchParams.get('type') === 'extension';

  useEffect(() => {
    if (bookingId) fetchBooking();
    // Stop confetti after 6 seconds
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/guest/bookings/${bookingId}`);
      setBooking(response.data.data?.booking || response.data.booking);
    } catch (err) {
      console.error('Failed to fetch booking', err);
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  const nights = (() => {
    if (!booking?.check_in_date || !booking?.check_out_date) return 0;
    return Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / 86400000);
  })();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#fff7f9] via-white to-[#f0f4ff]">
      {showConfetti && <Confetti />}

      {/* Animated background circles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E41D57]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white">

          {/* Top gradient banner */}
          <div className="relative bg-gradient-to-r from-[#E41D57] via-[#ff5c8a] to-[#ff8f4a] px-8 pt-10 pb-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() }} />
              ))}
            </div>

            {/* Animated checkmark */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce-slow shadow-xl">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-9 h-9 text-[#E41D57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 text-yellow-300 text-2xl animate-spin-slow">✦</div>
              <div className="absolute -bottom-1 -left-3 text-yellow-200 text-xl animate-ping" style={{ animationDuration: '2s' }}>✦</div>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow">
              🎉 {isExtension ? 'Stay Extended!' : 'Booking Confirmed!'}
            </h1>
            <p className="text-white/85 mt-2 text-base font-medium">
              {isExtension
                ? 'Your stay has been successfully extended. Enjoy more time!'
                : 'Your reservation is all set. Get ready for an amazing stay!'}
            </p>
          </div>

          {/* Curved divider overlap card */}
          <div className="relative -mt-8 mx-6">
            <div className="bg-white rounded-2xl shadow-lg px-6 py-5 border border-gray-100">

              {loading ? (
                <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading booking details…</div>
              ) : booking ? (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Booking Reference</p>
                    <p className="text-lg font-mono font-bold text-gray-900 mt-1">
                      {booking.booking_reference || `#${booking.id}`}
                    </p>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="text-sm font-semibold text-gray-900 truncate">
                    🏠 {booking.property_title}
                  </div>
                  {booking.property_address && (
                    <div className="text-xs text-gray-400 -mt-2">📍 {booking.property_address}</div>
                  )}

                  <div className="h-px bg-gray-100" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Check-in</p>
                      <p className="text-sm font-bold text-gray-900">{fmtDate(booking.check_in_date)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Check-out</p>
                      <p className="text-sm font-bold text-gray-900">{fmtDate(booking.check_out_date)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-bold text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                    <span className="text-sm text-gray-600 font-medium">Total Paid</span>
                    <span className="text-base font-black text-green-700">BDT {Number(booking.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-400 text-sm">Could not load booking details</div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-8 pt-5 space-y-3">
            <button
              onClick={() => navigate(`/guest/bookings/${bookingId}`)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              View Booking Details →
            </button>
            <button
              onClick={() => navigate('/guest/bookings')}
              className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all duration-150"
            >
              View All My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors underline underline-offset-2"
            >
              Back to Home
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          A confirmation has been recorded. Thank you for choosing <span className="font-semibold text-[#E41D57]">Keyhost Homes</span> 🏡
        </p>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;
