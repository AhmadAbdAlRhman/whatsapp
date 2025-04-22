import React, { useState } from "react";
import { Send, MessageSquare, Image as ImageIcon, Link2, X } from "lucide-react";

function MessageForm({
  message,
  setMessage,
  mediaFiles,
  onSend,
  onSendSingle,
  isLoading,
  hasMedia,
}) {
  const [useUnifiedCaption, setUseUnifiedCaption] = useState(false);
  const [unifiedCaption, setUnifiedCaption] = useState("");
  const [captions, setCaptions] = useState({});

  const handleCaptionChange = (filePath, caption) => {
    if (useUnifiedCaption) return;
    setCaptions(prev => ({
      ...prev,
      [filePath]: caption
    }));
  };

  const handleUnifiedCaptionChange = (caption) => {
    setUnifiedCaption(caption);
    const newCaptions = {};
    mediaFiles.forEach(file => {
      newCaptions[file.path] = caption;
    });
    setCaptions(newCaptions);
  };

  const handleSendSingle = async (mediaPath) => {
    await onSendSingle(mediaPath, useUnifiedCaption ? unifiedCaption : captions[mediaPath] || '');
  };

  const toggleCaptionMode = () => {
    setUseUnifiedCaption(!useUnifiedCaption);
    if (!useUnifiedCaption) {
      const newCaptions = {};
      mediaFiles.forEach(file => {
        newCaptions[file.path] = unifiedCaption;
      });
      setCaptions(newCaptions);
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg space-y-8 max-w-3xl mx-auto" dir="rtl">
      {/* Separate Message Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            الرسالة المنفصلة
          </label>
          {message && (
            <button
              onClick={() => onSendSingle(null, message)}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Send className="h-4 w-4" />
              إرسال الرسالة
            </button>
          )}
        </div>
        <textarea
          rows={4}
          className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-md text-right p-4 transition duration-200 ease-in-out resize-none hover:border-gray-300"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالتك المنفصلة هنا..."
          dir="rtl"
        />
      </div>

      {/* Media Files Section */}
      {hasMedia && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-purple-500" />
              الوسائط المرفقة
            </h3>
            <button
              onClick={toggleCaptionMode}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                useUnifiedCaption 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Link2 className="h-4 w-4" />
              {useUnifiedCaption ? 'وصف موحد' : 'وصف منفصل'}
            </button>
          </div>

          {/* Unified Caption Input */}
          {useUnifiedCaption && (
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
              <textarea
                rows={2}
                className="block w-full rounded-xl border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-md text-right p-4 transition duration-200 ease-in-out resize-none bg-white"
                value={unifiedCaption}
                onChange={(e) => handleUnifiedCaptionChange(e.target.value)}
                placeholder="اكتب وصفاً موحداً لجميع الملفات..."
                dir="rtl"
              />
            </div>
          )}

          {/* Media Files List */}
          <div className="grid gap-6">
            {mediaFiles.map((file, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ImageIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleSendSingle(file.path)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    إرسال الملف
                  </button>
                </div>

                {!useUnifiedCaption && (
                  <textarea
                    rows={2}
                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 sm:text-md text-right p-4 transition duration-200 ease-in-out resize-none bg-white"
                    value={captions[file.path] || ''}
                    onChange={(e) => handleCaptionChange(file.path, e.target.value)}
                    placeholder="اكتب وصفاً لهذا الملف..."
                    dir="rtl"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send All Button */}
      {(message || hasMedia) && (
        <button
          onClick={() => onSend(useUnifiedCaption ? { unified: unifiedCaption } : captions)}
          disabled={isLoading}
          className="w-full mt-8 flex items-center justify-center px-6 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>جاري الإرسال...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Send className="h-6 w-6" />
              <span>إرسال الكل</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}

export default MessageForm;