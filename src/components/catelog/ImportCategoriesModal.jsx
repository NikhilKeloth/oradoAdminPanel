import { useRef } from "react";
import { Upload, X, Info, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";

const ImportCategoriesModal = ({
  isOpen,
  onClose,
  handleDownloadTemplate,
  handleImportExcel,
  fileInputRef,
  uploadedFile,
  setUploadedFile,
  importStatus,
  importMessage,
  handleFileSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bgOp bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload size={24} />
              <h3 className="text-xl font-bold">Import Categories</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Follow these steps to import categories:</p>
              </div>
            </div>
          </div>

          {/* Step 1: Download Template */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h4 className="font-semibold text-gray-800">Download the Excel template</h4>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <Download size={18} />
              Download Template
            </button>
          </div>

          {/* Step 2: Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h4 className="font-semibold text-gray-800">Fill in your data</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Required columns:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Category Name</strong> - Name of the category</li>
                <li>• <strong>Description</strong> - Brief description</li>
                <li>• <strong>Status</strong> - Active/Inactive</li>
              </ul>
            </div>
          </div>

          {/* Step 3: Upload File */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h4 className="font-semibold text-gray-800">Upload your completed file</h4>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!uploadedFile ? (
                <div className="space-y-3">
                  <FileText size={48} className="mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600 mb-2">Choose an Excel file to upload</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Supported formats: .xlsx, .xls</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <CheckCircle size={48} className="mx-auto text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-purple-600 hover:text-purple-700 text-sm mt-2 transition-colors"
                    >
                      Choose different file
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {importStatus && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                importStatus === 'success' ? 'bg-green-50 text-green-800' :
                importStatus === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {importStatus === 'success' && <CheckCircle size={16} />}
                {importStatus === 'error' && <AlertCircle size={16} />}
                {importStatus === 'uploading' && <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />}
                {importMessage}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={importStatus === 'uploading'}
            >
              Cancel
            </button>
            <button
              onClick={handleImportExcel}
              disabled={!uploadedFile || importStatus === 'uploading'}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                uploadedFile && importStatus !== 'uploading'
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {importStatus === 'uploading' ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Import Categories
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCategoriesModal;
