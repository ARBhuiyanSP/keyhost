import React, { useState, useRef } from 'react';
import { FiX, FiCopy, FiMail, FiMessageCircle, FiHeart, FiCode, FiMoreHorizontal, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import { getImageUrl } from '../../utils/imageUrl';

const ShareModal = ({ property, isOpen, onClose }) => {
  const [view, setView] = useState('main'); // 'main' or 'qr'
  const qrRef = useRef();

  if (!isOpen || !property) return null;

  const url = window.location.href;
  const title = property.title;
  const description = property.description?.substring(0, 100) + '...';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleShare = (type) => {
    switch (type) {
      case 'email':
        window.open(`mailto:?subject=Check out this place: ${title}&body=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?&body=${encodeURIComponent('Check out this place: ' + url)}`, '_self');
        break;
      case 'qr':
        setView('qr');
        break;
      case 'more':
        if (navigator.share) {
          navigator.share({
            title: title,
            text: description,
            url: url
          }).catch(console.error);
        } else {
          toast.info('Native sharing is not supported on this browser.');
        }
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {view === 'qr' && (
              <button 
                onClick={() => setView('main')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'qr' ? 'QR Code' : 'Share this place'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === 'main' ? (
            <>
              {/* Property Info Block */}
              <div className="flex items-center gap-4 mb-8">
                <img 
                  src={getImageUrl(property.images?.[0]?.image_url) || '/placeholder.jpg'} 
                  alt={title} 
                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {property.city ? `${property.city} · ` : ''}
                    {property.bedrooms > 0 ? `${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''} · ` : ''}
                    {property.beds > 0 ? `${property.beds} bed${property.beds > 1 ? 's' : ''} · ` : ''}
                    {property.bathrooms > 0 ? `${property.bathrooms} bath${property.bathrooms > 1 ? 's' : ''}` : ''}
                  </div>
                </div>
              </div>

              {/* Share Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <FiCopy className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900 text-sm">Copy Link</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <FiMail className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900 text-sm">Email</span>
                </button>
                <button
                  onClick={() => handleShare('sms')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <FiMessageCircle className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900 text-sm">Messages</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 0C5.385 0 .002 5.385.002 12.035c0 2.124.553 4.195 1.604 6.012L.092 23.953l6.059-1.587c1.748.961 3.729 1.468 5.877 1.468 6.646 0 12.03-5.385 12.03-12.035C24.058 5.386 18.677 0 12.031 0zm0 21.84c-1.782 0-3.522-.477-5.056-1.385l-.36-.215-3.754.983.998-3.664-.236-.376A9.972 9.972 0 011.996 12.03c0-5.542 4.512-10.05 10.035-10.05 5.541 0 10.048 4.508 10.048 10.05s-4.507 10.05-10.048 10.05zm5.502-7.531c-.302-.15-1.788-.882-2.064-.984-.277-.101-.478-.152-.678.151-.202.302-.78 1.002-.956 1.205-.176.202-.353.226-.655.076-.301-.151-1.275-.471-2.428-1.502-.898-.802-1.505-1.794-1.682-2.096-.176-.302-.018-.466.132-.616.136-.134.301-.352.452-.527.151-.176.201-.303.302-.505.101-.202.05-.38-.025-.53-.075-.152-.678-1.636-.928-2.241-.244-.59-.494-.511-.678-.519-.175-.008-.376-.011-.577-.011-.201 0-.527.076-.803.378-.276.302-1.054 1.031-1.054 2.512s1.079 2.915 1.23 3.118c.15.202 2.128 3.25 5.152 4.551.72.309 1.282.493 1.72.632.723.23 1.38.197 1.9.119.585-.088 1.787-.732 2.037-1.439.25-.708.25-1.315.176-1.44-.075-.125-.276-.201-.578-.352z"/>
                  </svg>
                  <span className="font-semibold text-gray-900 text-sm">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-semibold text-gray-900 text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('qr')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <FiCode className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900 text-sm">QR Code</span>
                </button>
                <button
                  onClick={() => handleShare('more')}
                  className="flex items-center w-full px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors gap-4"
                >
                  <FiMoreHorizontal className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900 text-sm">More options</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div ref={qrRef} className="p-4 bg-white border border-gray-200 rounded-2xl mb-8 shadow-sm">
                <QRCodeCanvas 
                  value={url} 
                  size={200}
                  level={"H"}
                  includeMargin={true}
                />
              </div>
              <p className="text-gray-500 text-sm text-center mb-8 px-4">
                Scan this code with your phone's camera to view this property instantly.
              </p>
              <button
                onClick={downloadQRCode}
                className="flex items-center justify-center w-full max-w-xs px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors gap-3 font-bold"
              >
                <FiDownload className="w-5 h-5" />
                Download QR Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
