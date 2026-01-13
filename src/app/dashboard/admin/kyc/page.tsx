'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminKycPage() {
    const [kycDocs, setKycDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState<{[key: string]: string}>({});

    useEffect(() => {
        fetchKycDocs();
    }, []);

    const fetchKycDocs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/kyc', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setKycDocs(data.data);
        } catch (error) {
            console.error("Failed to fetch KYC docs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, userId: string, status: 'APPROVED' | 'REJECTED') => {
        if (status === 'REJECTED' && !rejectionReason[id]) {
            alert("Please provide a rejection reason");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/kyc', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    id, 
                    user_id: userId, 
                    status, 
                    rejection_reason: rejectionReason[id] 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`KYC ${status.toLowerCase()} successfully`);
                fetchKycDocs();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Failed to update KYC", error);
        }
    };

    if (loading) return <div>Loading KYC documents...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">KYC Verification</h1>
            <div className="grid gap-6">
                {kycDocs.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{doc.user_name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{doc.user_role}</span>
                                </div>
                                <p className="text-sm text-gray-500">{doc.user_email}</p>
                                <p className="text-sm font-medium">Document: <span className="text-blue-600">{doc.document_type}</span></p>
                                <p className="text-sm">Status: 
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {doc.status}
                                    </span>
                                </p>
                                <div className="mt-4">
                                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">View Document ↗</a>
                                </div>
                            </div>

                            {doc.status === 'PENDING' && (
                                <div className="flex flex-col gap-3 min-w-[250px]">
                                    <Input 
                                        placeholder="Rejection reason (if rejecting)"
                                        value={rejectionReason[doc.id] || ''}
                                        onChange={(e) => setRejectionReason({...rejectionReason, [doc.id]: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                            onClick={() => handleAction(doc.id, doc.user_id, 'APPROVED')}
                                        >
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                            onClick={() => handleAction(doc.id, doc.user_id, 'REJECTED')}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {doc.status === 'REJECTED' && doc.rejection_reason && (
                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase mb-1">Rejection Reason</p>
                                    <p className="text-sm text-red-800 dark:text-red-300">{doc.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {kycDocs.length === 0 && <div className="text-center text-gray-500 py-10">No KYC documents found.</div>}
            </div>
        </div>
    );
}
