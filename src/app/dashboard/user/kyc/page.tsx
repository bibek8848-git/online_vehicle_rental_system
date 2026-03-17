'use client';

import { useEffect, useState } from 'react';

export default function KYCPage() {
  const [kycData, setKycData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [docType, setDocType] = useState('Citizenship');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchKYC = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/kyc', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setKycData(data.data);
      }
    } catch (error) {
      console.error("Fetch KYC error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('file', file);

      const res = await fetch('/api/user/kyc', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Document uploaded successfully!');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('kyc-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchKYC();
      } else {
        setMessage(data.message || 'Failed to upload document');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading KYC details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">KYC Verification Status</h2>
        <div className="flex items-center space-x-4">
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${
            kycData?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            kycData?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {kycData?.status}
          </span>
          {kycData?.rejection_reason && (
            <p className="text-red-500 text-sm">Reason: {kycData.rejection_reason}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Upload New Document</h3>
          {message && <div className={`p-3 rounded mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
              <select 
                className="w-full border rounded p-2 bg-transparent text-sm"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="Citizenship">Citizenship</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document File</label>
              <input 
                id="kyc-file"
                type="file" 
                accept="image/*"
                className="w-full border rounded p-2 bg-transparent text-sm"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <button 
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Uploaded Documents */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">My Documents</h3>
          <div className="space-y-4">
            {kycData?.documents?.length > 0 ? kycData.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded dark:border-gray-800">
                <div>
                  <p className="text-sm font-bold">{doc.document_type}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                  <a href={doc.document_url} target="_blank" className="text-blue-500 text-xs hover:underline">View</a>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
