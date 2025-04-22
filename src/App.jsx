import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import FileUpload from "./components/FileUpload";
import MessageForm from "./components/MessageForm";
import StatusIndicator from "./components/StatusIndicator";

const API_BASE_URL = "https://whatsappbackend-production.up.railway.app";

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [country, setCountry] = useState("SA");
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCountryChange = (dialCode) => {
    setCountry(dialCode);
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);

      setStatus(response.data.status);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${API_BASE_URL}/disconnect`);
      toast.success("تم قطع الاتصال بنجاح");
      setResults(null);
      setPhoneNumbers([]);
      setMessage("");
      setMediaFiles([]);
      setHasMedia(false);
      setCountry("");
    } catch (error) {
      toast.error("حدث خطأ أثناء قطع الاتصال");
    }
  };

  const handleExcelUpload = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const numbers = jsonData
          .map((row) => {
            return (
              row["Phone Number"] ||
              row["رقم الهاتف"] ||
              row["phone"] ||
              row["Phone"] ||
              row["الموبايل"] ||
              row["رقم الموبايل"] ||
              row["رقم"] ||
              row["phone number"] ||
              row["أرقام الهاتف"] ||
              row["ارقام الهاتف"] ||
              row["ارقام الهواتف"] ||
              row["أرقام الهواتف"]
            );
          })
          .filter(Boolean);

        toast.success(`تم تحميل ${numbers.length} رقم`);
        callback(numbers);
      } catch (error) {
        toast.error("حدث خطأ في قراءة الملف");
        callback([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePhoneNumbersChange = (numbers) => {
    setPhoneNumbers(numbers);
  };

  const handleMediaUpload = async (files) => {
    const uploadedFiles = [];
    setIsLoading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("media", files[i]);

        const response = await axios.post(
          `${API_BASE_URL}/upload-media`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedFiles.push({
          name: files[i].name,
          path: response.data.filePath,
          type: files[i].type,
        });
      }

      setMediaFiles(uploadedFiles);
      setHasMedia(true);
      toast.success("تم رفع الملفات بنجاح");
    } catch (error) {
      toast.error("فشل رفع الملفات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSingle = async (mediaPath, content) => {
    if (!phoneNumbers.length) {
      toast.error("يرجى إدخال الأرقام أولاً");
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (mediaPath) {
        response = await axios.post(`${API_BASE_URL}/send-single-media`, {
          numbers: phoneNumbers,
          mediaPath,
          caption: content,
          country: country,
        });

        console.log("response", response);
      } else {
        response = await axios.post(`${API_BASE_URL}/send-bulk-messages`, {
          numbers: phoneNumbers,
          message: content,
          country: country,
        });
        console.log("response", response);
      }

      setResults(response.data.results);
      const successCount = response.data.results.success.length;
      const failedCount = response.data.results.failed.length;

      toast.success(
        `تم الإرسال بنجاح إلى ${successCount} رقم، وفشل الإرسال إلى ${failedCount} رقم`
      );
    } catch (error) {
      toast.error("حدث خطأ في عملية الإرسال");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessages = async (captions) => {
    if (!phoneNumbers.length) {
      toast.error("يرجى إدخال الأرقام أولاً");
      return;
    }

    if (!message && !hasMedia) {
      toast.error("يرجى إدخال رسالة أو اختيار ملف وسائط");
      return;
    }

    setIsLoading(true);
    try {
      const mediaFilesWithCaptions = mediaFiles.map((file) => ({
        path: file.path,
        caption: captions.unified || captions[file.path] || "",
      }));

      const payload = {
        numbers: phoneNumbers,
        message: message || undefined,
        mediaFiles: mediaFilesWithCaptions,
        country: country,
      };

      const response = await axios.post(
        `${API_BASE_URL}/send-bulk-messages`,
        payload
      );

      setResults(response.data.results);
      const successCount = response.data.results.success.length;
      const failedCount = response.data.results.failed.length;

      toast.success(
        `تم الإرسال بنجاح إلى ${successCount} رقم، وفشل الإرسال إلى ${failedCount} رقم`
      );
    } catch (error) {
      toast.error("حدث خطأ في عملية الإرسال");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              direction: "rtl",
            },
          }}
        />

        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          برنامج إرسال رسائل واتساب
        </h1>
        <p className="text-center text-gray-600 text-lg">
          أرسل رسائلك بسهولة وأمان إلى جميع جهات الاتصال
        </p>

        <StatusIndicator
          status={status}
          numbers={phoneNumbers}
          results={results}
          qrCode={qrCode}
          onDisconnect={handleDisconnect}
        />

        <FileUpload
          onExcelUpload={handleExcelUpload}
          onMediaUpload={handleMediaUpload}
          onPhoneNumbersChange={handlePhoneNumbersChange}
          onCountryChange={handleCountryChange}
        />

        <MessageForm
          message={message}
          setMessage={setMessage}
          mediaFiles={mediaFiles}
          onSend={sendMessages}
          onSendSingle={handleSendSingle}
          isLoading={isLoading}
          hasMedia={hasMedia}
        />
      </div>
    </div>
  );
}

export default App;
