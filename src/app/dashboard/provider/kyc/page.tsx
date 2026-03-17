'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProviderKYC() {
    const [kycDocs, setKycDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        documentType: 'Business Registration'
    });
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchKYC();
    }, []);

    const fetchKYC = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/provider/kyc', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setKycDocs(data.data);
            }
        } catch (error) {
            console.error('Error fetching KYC:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        setIsUploading(true);

        try {
            const token = localStorage.getItem('token');
            const dataForm = new FormData();
            dataForm.append('documentType', formData.documentType);
            dataForm.append('file', file);

            const res = await fetch('/api/provider/kyc', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: dataForm
            });
            const data = await res.json();
            if (data.success) {
                alert('Document uploaded successfully.');
                setFile(null);
                const fileInput = document.getElementById('documentFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchKYC();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error uploading KYC:', error);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Business KYC Verification</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="documentType">Document Type</Label>
                                    <select 
                                        id="documentType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.documentType}
                                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                    >
                                        <option value="Business Registration">Business Registration</option>
                                        <option value="Citizenship">Citizenship</option>
                                        <option value="Vehicle Blue Book">Vehicle Blue Book</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="documentFile">Document File (Image)</Label>
                                    <Input 
                                        id="documentFile" 
                                        type="file"
                                        accept="image/*"
                                        required 
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </form>
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-bold mb-1">Required Documents:</p>
                                <ul className="list-disc ml-4 space-y-1">
                                    <li>Valid Business Registration certificate</li>
                                    <li>Provider's Citizenship (Front & Back)</li>
                                    <li>Blue Book of at least one vehicle</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Verification Status</h2>
                        {kycDocs.length === 0 ? (
                            <p className="text-gray-500">No documents uploaded yet.</p>
                        ) : (
                            kycDocs.map((doc: any) => (
                                <Card key={doc.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{doc.document_type}</p>
                                                <p className="text-xs text-gray-500">Uploaded on {new Date(doc.created_at).toLocaleDateString()}</p>
                                                <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline mt-2 inline-block">View Document</a>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {doc.status}
                                            </div>
                                        </div>
                                        {doc.rejection_reason && (
                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                                                <strong>Reason:</strong> {doc.rejection_reason}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500">
                Secure Drives © 2025
            </footer>
        </div>
    );
}
