'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState<{[key: string]: string}>({});
    
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{id: string, providerId: string, isApproved: boolean} | null>(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/vehicles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setVehicles(data.data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, providerId: string, isApproved: boolean) => {
        if (!isApproved && !rejectionReason[id]) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setPendingAction({ id, providerId, isApproved });
        setConfirmOpen(true);
    };

    const executeAction = async () => {
        if (!pendingAction) return;
        const { id, providerId, isApproved } = pendingAction;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/vehicles', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    id, 
                    provider_id: providerId, 
                    is_approved: isApproved, 
                    rejection_reason: rejectionReason[id] 
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Vehicle ${isApproved ? 'approved' : 'rejected'} successfully`);
                fetchVehicles();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Failed to update vehicle", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setPendingAction(null);
        }
    };

    if (loading) return <div>Loading vehicles...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Vehicle Approval</h1>
            <div className="grid gap-6">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                        <div className="flex flex-col md:flex-row gap-6">
                            {vehicle.images && vehicle.images.length > 0 && vehicle.images[0] && vehicle.images[0].trim() !== '' && (
                                <img src={vehicle.images[0]} alt={vehicle.model} className="w-full md:w-48 h-32 object-cover rounded-lg" />
                            )}
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                                        <p className="text-sm text-gray-500">Reg No: {vehicle.registration_number}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        vehicle.is_approved ? 'bg-green-100 text-green-800' : 
                                        vehicle.rejection_reason ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {vehicle.is_approved ? 'APPROVED' : 
                                         vehicle.rejection_reason ? 'REJECTED' : 'PENDING APPROVAL'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Provider: {vehicle.provider_name} ({vehicle.provider_email})</p>
                                <p className="text-sm font-semibold">Price: Rs. {vehicle.price_per_day} / day</p>
                                {vehicle.rejection_reason && !vehicle.is_approved && (
                                    <p className="text-sm text-red-600 font-medium">Rejection Reason: {vehicle.rejection_reason}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{vehicle.description}</p>
                            </div>

                            {!vehicle.is_approved && !vehicle.rejection_reason && (
                                <div className="flex flex-col gap-3 min-w-[250px]">
                                    <Input 
                                        placeholder="Rejection reason"
                                        value={rejectionReason[vehicle.id] || ''}
                                        onChange={(e) => setRejectionReason({...rejectionReason, [vehicle.id]: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(vehicle.id, vehicle.provider_id, true)}
                                        >
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => handleAction(vehicle.id, vehicle.provider_id, false)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!vehicle.is_approved && vehicle.rejection_reason && (
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                     <Button 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(vehicle.id, vehicle.provider_id, true)}
                                    >
                                        Approve Anyway
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {vehicles.length === 0 && <div className="text-center text-gray-500 py-10">No vehicles found.</div>}
            </div>

            <ConfirmDialog 
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeAction}
                title={pendingAction?.isApproved ? "Approve Vehicle" : "Reject Vehicle"}
                description={`Are you sure you want to ${pendingAction?.isApproved ? 'approve' : 'reject'} this vehicle?`}
                confirmText={pendingAction?.isApproved ? "Approve" : "Reject"}
                variant={pendingAction?.isApproved ? "default" : "destructive"}
            />
        </div>
    );
}
