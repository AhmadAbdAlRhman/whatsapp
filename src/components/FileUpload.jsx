import React, { useState } from "react";
import { Upload, File, X, Plus, Trash2 } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../App.css";

function FileUpload({
  onExcelUpload,
  onMediaUpload,
  onPhoneNumbersChange,
  onCountryChange,
}) {
  const [excelFile, setExcelFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([
    { number: "", countryCode: "20" },
  ]);
  const [excelNumbers, setExcelNumbers] = useState([]);

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      onExcelUpload(file, (numbers) => {
        setExcelNumbers(numbers);
        updateAllNumbers(phoneNumbers, numbers);
      });
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const updatedFiles = [...mediaFiles, ...files];
      setMediaFiles(updatedFiles);
      onMediaUpload(updatedFiles);
    }
  };

  const removeExcelFile = () => {
    setExcelFile(null);
    setExcelNumbers([]);
    updateAllNumbers(phoneNumbers, []);
  };

  const removeMediaFile = (index) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    onMediaUpload(newFiles);
  };

  const handleAddPhoneNumber = () => {
    const newPhoneNumbers = [
      ...phoneNumbers,
      { number: "", countryCode: "20" },
    ];
    setPhoneNumbers(newPhoneNumbers);
    updateAllNumbers(newPhoneNumbers, excelNumbers);
  };

  const handleRemovePhoneNumber = (index) => {
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(newPhoneNumbers);
    updateAllNumbers(newPhoneNumbers, excelNumbers);
  };

  const handlePhoneNumberChange = (value, data, index) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = {
      number: value.slice(data.dialCode.length),
      countryCode: data.dialCode,
    };
    setPhoneNumbers(newPhoneNumbers);

    if (typeof onCountryChange === "function") {
      onCountryChange(data.dialCode); // أرسل dialCode بدلًا من data.dialCode
    }

    updateAllNumbers(newPhoneNumbers, excelNumbers);
  };

  const updateAllNumbers = (manualNumbers, excelNums) => {
    const formattedManualNumbers = manualNumbers
      .filter((pn) => pn.number.trim() !== "")
      .map((pn) => `${pn.countryCode}${pn.number}`);

    const allNumbers = [...formattedManualNumbers, ...excelNums];
    onPhoneNumbersChange(allNumbers);
  };

  return (
    <div
      className="space-y-8 p-8 bg-white rounded-2xl shadow-xl max-w-3xl mx-auto"
      dir="rtl"
    >
      <div className="space-y-6">
        {/* Manual Phone Numbers Input */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              إدخال الأرقام يدوياً
            </h3>
            <button
              onClick={handleAddPhoneNumber}
              className="flex items-center px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة رقم جديد
            </button>
          </div>

          <div className="space-y-3">
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-grow">
                  <PhoneInput
                    defaultCountry="eg"
                    value={`${phone.countryCode}${phone.number}`}
                    onChange={(value, data) =>
                      handlePhoneNumberChange(value, data, index)
                    }
                    enableSearch={true}
                    searchPlaceholder="ابحث عن دولة..."
                    searchNotFound="لم يتم العثور على نتائج"
                    inputProps={{
                      dir: "ltr",
                    }}
                    containerClass="!w-full"
                    inputClass="!w-full !h-11 !text-base"
                    buttonClass="!h-11"
                    dropdownClass="!rtl"
                  />
                </div>
                <button
                  onClick={() => handleRemovePhoneNumber(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Excel Upload */}
        <div className="border-3 border-dashed border-blue-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-400 bg-gradient-to-b from-blue-50/50 to-transparent">
          {!excelFile ? (
            <label className="cursor-pointer block text-center group">
              <div className="transform transition-transform group-hover:scale-105">
                <Upload className="mx-auto h-16 w-16 text-blue-400 group-hover:text-blue-500" />
                <span className="mt-4 block text-lg font-semibold text-gray-700">
                  ملف Excel (يحتوي على أرقام الهواتف)
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  اسحب الملف هنا أو اضغط للاختيار
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center gap-4">
                <File className="h-8 w-8 text-blue-500" />
                <span className="text-md font-medium text-gray-700">
                  {excelFile.name}
                </span>
              </div>
              <button
                onClick={removeExcelFile}
                className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Media Upload */}
        <div className="border-3 border-dashed border-purple-200 rounded-xl p-8 transition-all duration-300 hover:border-purple-400 bg-gradient-to-b from-purple-50/50 to-transparent">
          <label className="cursor-pointer block text-center group">
            <div className="transform transition-transform group-hover:scale-105">
              <Upload className="mx-auto h-16 w-16 text-purple-400 group-hover:text-purple-500" />
              <span className="mt-4 block text-lg font-semibold text-gray-700">
                ملف الوسائط (صور، فيديو، صوت)
              </span>
              <p className="text-sm text-gray-500 mt-2">
                يمكنك اختيار عدة ملفات
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="*/*"
              multiple
              onChange={handleMediaUpload}
            />
          </label>

          {/* Media Files List */}
          {mediaFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              {mediaFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <File className="h-8 w-8 text-purple-500" />
                    <span className="text-md font-medium text-gray-700">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMediaFile(index)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
