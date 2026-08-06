import React, { useState } from 'react';
import { FiWifiOff, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import useConnectionStore from '../../store/connectionStore';

const ConnectionErrorScreen = () => {
  const { checkConnection } = useConnectionStore();
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryFailed(false);
    
    // Simulate a minimum 800ms loading effect for premium visual feedback
    const startTime = Date.now();
    const success = await checkConnection();
    const elapsed = Date.now() - startTime;
    if (elapsed < 800) {
      await new Promise(resolve => setTimeout(resolve, 800 - elapsed));
    }
    
    setRetrying(false);
    if (success) {
      // Reload page if connection was successfully restored
      window.location.reload();
    } else {
      setRetryFailed(true);
      // Reset shake animation state after 500ms
      setTimeout(() => setRetryFailed(false), 500);
    }
  };

  return (
    <div 
      id="connection-error-screen" 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-fade-in font-sans"
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-8 text-center transform transition-all duration-300 ${
          retryFailed ? 'animate-shake border-red-200' : 'scale-100'
        }`}
      >
        {/* Pulsing Alert Badge */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-45"></div>
          <div className="absolute inset-2 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
            <FiWifiOff className="text-red-500 w-8 h-8" />
          </div>
        </div>

        {/* Text Details */}
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Internet Connection Lost</h2>
        <p className="text-xs text-gray-500 mt-2.5 leading-relaxed px-4">
          We are unable to connect to the internet. Please check your network connection and try again.
        </p>

        {/* Retry Failure Warning */}
        {retryFailed && (
          <div className="mt-5 bg-red-50 text-red-700 text-[11px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-red-100 animate-slide-up">
            <FiAlertTriangle size={13} />
            <span>Connection check failed. Please verify your internet access.</span>
          </div>
        )}

        {/* Action Button */}
        <button
          id="retry-connection-button"
          onClick={handleRetry}
          disabled={retrying}
          className={`w-full mt-8 py-3.5 px-6 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
            retrying 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#004e59] hover:bg-[#003d46] text-white hover:shadow-lg shadow-indigo-500/10'
          }`}
        >
          <FiRefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Retrying Connection...' : 'Retry Connection'}</span>
        </button>

        {/* Back to Home Link */}
        <div className="mt-5 text-[10px] text-gray-400 font-medium">
          Or check back in a few minutes. Thank you for your patience.
        </div>
      </div>

      {/* Shake & Animation CSS injected instantly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default ConnectionErrorScreen;
