import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Wallet, AlertCircle, CheckCircle2, RefreshCw, Smartphone, Building, ShieldCheck } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

interface PaymentMethod {
    id: string;
    name: string;
    public_key: string;
    is_active: boolean;
}

const PaystackButton = ({ amount, email, publicKey, onSuccess }: any) => {
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email || 'user@example.com',
        amount: amount * 100, // Paystack amount is in kobo
        publicKey,
    };
    
    const initializePayment = usePaystackPayment(config);

    return (
        <button
            type="button"
            onClick={() => {
                initializePayment({
                    onSuccess,
                    onClose: () => {}
                });
            }}
            className="w-full bg-[#09A5DB] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0785b3] transition-all"
        >
            Pay ₦{amount} via Paystack
        </button>
    );
};

const FlutterwaveButton = ({ amount, email, name, publicKey, onSuccess }: any) => {
    const config = {
        public_key: publicKey,
        tx_ref: Date.now().toString(),
        amount,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: email || 'user@example.com',
            phone_number: '',
            name: name || 'User',
        },
        customizations: {
            title: 'Add Funds',
            description: 'Wallet Deposit',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterPayment = useFlutterwave(config);

    return (
        <button
            type="button"
            onClick={() => {
                handleFlutterPayment({
                    callback: (response) => {
                        closePaymentModal();
                        if (response.status === 'successful') {
                            onSuccess();
                        }
                    },
                    onClose: () => {},
                });
            }}
            className="w-full bg-[#f5a623] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all"
        >
            Pay ₦{amount} via Flutterwave
        </button>
    );
};

const GenericCheckoutButton = ({ amount, gatewayName, onCheckout }: any) => {
    return (
        <button
            type="button"
            onClick={onCheckout}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
        >
            Pay ₦{amount} via {gatewayName}
        </button>
    );
};

export const AddFunds = () => {
    const { profile } = useAuth();
    const [amount, setAmount] = useState('1000');
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const { data, error } = await supabase
                    .from('payment_methods')
                    .select('id, name, public_key, is_active')
                    .eq('is_active', true);
                
                if (data && data.length > 0) {
                    setMethods(data);
                    setSelectedMethod(data[0].id);
                }
            } catch (err) {
                console.error("Error fetching payment methods:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMethods();
    }, []);

    const numAmount = parseFloat(amount || '0');
    const isValidAmount = !isNaN(numAmount) && numAmount >= 100;
    const currentMethod = methods.find(m => m.id === selectedMethod);

    const handleSuccess = async (reference?: string) => {
        setProcessing(true);
        setSuccess(false);

        try {
            // 1. Log transaction
            await supabase.from('transactions').insert({
                user_id: profile.id,
                amount: numAmount,
                type: 'deposit',
                balance_after: profile.balance + numAmount,
                description: `Deposit via ${currentMethod?.name} ${reference ? '(Ref: ' + reference + ')' : ''}`
            });

            // 2. Update Profile balance
            await supabase.from('profiles').update({
                balance: profile.balance + numAmount
            }).eq('id', profile.id);

            // 3. Send Notification to Admin
            if (profile) {
                await supabase.from('admin_notifications').insert({
                    title: 'New Deposit',
                    message: `User ${profile.email || 'Unknown'} deposited ₦${numAmount} via ${currentMethod?.name}`,
                    type: 'deposit'
                });
            }

            setSuccess(true);
            setAmount('');
        } catch (err) {
            console.error("Failed to process successful payment:", err);
            alert("Payment succeeded but failed to update balance. Please contact support.");
        } finally {
            setProcessing(false);
        }
    };

    const handleSimulatedCheckout = async () => {
        if (!isValidAmount || !currentMethod) return;
        setProcessing(true);
        
        // Simulating the external redirect/API call for OPay/Paga without a backend
        setTimeout(() => {
            const isConfirmed = window.confirm(`Redirecting to ${currentMethod.name} secure checkout...\n\n(Simulation: Click OK to simulate an approved payment for ₦${numAmount})`);
            if (isConfirmed) {
                handleSuccess(`sim_${Date.now()}`);
            } else {
                setProcessing(false);
            }
        }, 800);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Add Funds</h1>
            <p className="text-gray-600 mb-8">Fund your wallet securely using verified Nigerian payment gateways.</p>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Form */}
                <div className="p-8 md:p-10 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                    {methods.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
                            <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-700">No Gateways Available</h3>
                            <p className="text-sm text-gray-500 mt-2">Please contact the administrator to enable deposit methods.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {methods.map(method => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedMethod === method.id ? 'border-brand bg-brand-subtle' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            {method.id === 'paystack' && <Building className={`w-8 h-8 mb-2 ${selectedMethod === method.id ? 'text-brand' : 'text-gray-400'}`} />}
                                            {method.id === 'flutterwave' && <Globe className={`w-8 h-8 mb-2 ${selectedMethod === method.id ? 'text-brand' : 'text-gray-400'}`} />}
                                            {method.id === 'opay' && <Smartphone className={`w-8 h-8 mb-2 ${selectedMethod === method.id ? 'text-brand' : 'text-gray-400'}`} />}
                                            {method.id === 'paga' && <Wallet className={`w-8 h-8 mb-2 ${selectedMethod === method.id ? 'text-brand' : 'text-gray-400'}`} />}
                                            
                                            <span className="font-bold text-sm">{method.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Amount (NGN)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₦</span>
                                    <input
                                        type="number"
                                        min="100"
                                        step="1"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    {[1000, 5000, 10000, 50000].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val.toString())}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-sm font-medium rounded-lg text-gray-600 transition-colors"
                                        >
                                            ₦{val.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!isValidAmount ? (
                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                                >
                                    Enter minimum ₦100
                                </button>
                            ) : processing ? (
                                <button
                                    disabled
                                    className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                                >
                                    <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                                </button>
                            ) : currentMethod?.id === 'paystack' ? (
                                <PaystackButton 
                                    amount={numAmount} 
                                    email={profile?.email} 
                                    publicKey={currentMethod.public_key} 
                                    onSuccess={() => handleSuccess()} 
                                />
                            ) : currentMethod?.id === 'flutterwave' ? (
                                <FlutterwaveButton 
                                    amount={numAmount} 
                                    email={profile?.email} 
                                    name={profile?.full_name} 
                                    publicKey={currentMethod.public_key} 
                                    onSuccess={() => handleSuccess()} 
                                />
                            ) : (
                                <GenericCheckoutButton 
                                    amount={numAmount} 
                                    gatewayName={currentMethod?.name} 
                                    onCheckout={handleSimulatedCheckout} 
                                />
                            )}

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Funds added successfully!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Wallet Summary */}
                <div className="p-8 md:p-10 bg-gray-50 w-full md:w-80 flex flex-col justify-center">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center gap-3 mb-4 text-brand">
                            <Wallet className="w-6 h-6" />
                            <span className="font-bold">Current Balance</span>
                        </div>
                        <div className="text-4xl font-display font-bold mb-2">
                            ₦{profile?.balance?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-sm text-gray-500">Available to spend</p>
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium flex gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>Deposits via Paystack, Flutterwave, OPay, and PAGA are processed and credited instantly to your wallet.</p>
                    </div>
                </div>
            </div >
        </div >
    );
};
