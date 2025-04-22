import React from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function StatusIndicator({ status, numbers, results, qrCode, onDisconnect }) {
  const getStatusDisplay = () => {
    if (status === 'connected') {
      return {
        icon: <CheckCircle className="h-6 w-6 ml-2" />,
        text: 'متصل',
        color: 'text-green-600'
      };
    } else if (status === 'waiting-for-qr') {
      return {
        icon: <Loader className="h-6 w-6 ml-2 animate-spin" />,
        text: 'في انتظار مسح رمز QR',
        color: 'text-yellow-600'
      };
    } else if (status === 'disconnecting') {
      return {
        icon: <Loader className="h-6 w-6 ml-2 animate-spin" />,
        text: 'جاري قطع الاتصال...',
        color: 'text-yellow-600'
      };
    } else if (status === 'initializing') {
      return {
        icon: <Loader className="h-6 w-6 ml-2 animate-spin" />,
        text: 'جاري التهيئة...',
        color: 'text-yellow-600'
      };
    } else if (status === 'authenticating') {
      return {
        icon: <Loader className="h-6 w-6 ml-2 animate-spin" />,
        text: 'جاري المصادقة...',
        color: 'text-yellow-600'
      };
    } else if (status?.startsWith('connecting:')) {
      const percent = status.split(':')[1];
      return {
        icon: <Loader className="h-6 w-6 ml-2 animate-spin" />,
        text: `جاري الاتصال... ${percent}%`,
        color: 'text-yellow-600'
      };
    } else {
      return {
        icon: <XCircle className="h-6 w-6 ml-2" />,
        text: 'غير متصل',
        color: 'text-red-600'
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-semibold ml-3">حالة الاتصال:</span>
          <div className={`flex items-center ${statusDisplay.color} font-medium`}>
            {statusDisplay.icon}
            <span>{statusDisplay.text}</span>
          </div>
        </div>
       
        {status === 'connected' && (
          <button
            onClick={onDisconnect}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            قطع الاتصال
          </button>
        )}
      </div>

      {qrCode && status === 'waiting-for-qr' && (
        <div className="flex justify-center py-6">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
            alt="WhatsApp QR Code"
            className="border-4 border-gray-100 rounded-xl shadow-md"
          />
        </div>
      )}

{numbers.length > 0 && (
  <div className="bg-gray-50 p-6 rounded-xl space-y-4">
    <div className="text-lg font-semibold text-gray-800">
      عدد الأرقام: {numbers.length}
    </div>
    <div className={`${numbers.length > 4 ? 'max-h-[20px]' : ''} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2`}>
      {numbers.map((number, index) => (
        <div key={index} className="bg-white p-3 rounded-lg mb-2 shadow-sm hover:shadow-md transition-shadow">
          {number}
        </div>
      ))}
    </div>
  </div>
)}

      {results && (
        <div className="bg-gray-50 p-6 rounded-xl space-y-3">
          <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5 ml-2" />
            <span className="font-medium">تم الإرسال بنجاح: {results.success.length}</span>
          </div>
          <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
            <XCircle className="h-5 w-5 ml-2" />
            <span className="font-medium">فشل الإرسال: {results.failed.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusIndicator;
