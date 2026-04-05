import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, CheckCircle2, Clock, Send, X, ArrowLeft } from 'lucide-react';

type TicketMessage = {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    created_at: string;
    profiles?: { email: string, role: string };
};

type Ticket = {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
    profiles?: {
        email: string;
    };
};

export const SupportTickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'closed'>('active');

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tickets')
            .select('*, profiles:user_id(email)')
            .neq('status', 'deleted') // In case we ever use deleted, but for now we just want them all
            .order('created_at', { ascending: false });

        if (data) setTickets(data as any);
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (selectedTicket?.status === 'closed') {
            alert("This ticket is closed and cannot be modified.");
            return;
        }
        const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
            if (selectedTicket?.id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } else {
            alert("Error updating status.");
        }
    };

    const handleCloseTicket = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to permanently close this ticket? It will be hidden from the user and cannot be reopened.')) return;

        const { error } = await supabase.from('tickets').update({ status: 'closed' }).eq('id', id);

        if (!error) {
            setTickets(tickets.map(t => t.id === id ? { ...t, status: 'closed' } : t));
            if (selectedTicket?.id === id) {
                setSelectedTicket({ ...selectedTicket, status: 'closed' });
            }
        } else {
            alert("Error closing ticket.");
        }
    };

    const handleSelectTicket = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setLoadingMessages(true);
        const { data } = await supabase
            .from('ticket_messages')
            .select('*, profiles:user_id(email, role)')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });

        if (data) setMessages(data as any);
        setLoadingMessages(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newMessage.trim() || selectedTicket.status === 'closed') return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase.from('ticket_messages').insert({
            ticket_id: selectedTicket.id,
            user_id: session.user.id,
            message: newMessage
        }).select('*, profiles:user_id(email, role)').single();

        if (data) {
            setMessages([...messages, data as any]);
            setNewMessage('');
            // If the ticket is pending or closed, potentially reopen or mark it active
            if (selectedTicket.status !== 'active') {
                handleUpdateStatus(selectedTicket.id, 'active');
            }
        } else if (error) {
            alert("Error sending message");
        }
    };

    // The selected ticket rendering will be moved inside the main return statement as a modal

    const filteredTickets = tickets.filter(t => {
        if (activeTab === 'active') return t.status === 'active' || t.status === 'resolved';
        return t.status === activeTab;
    });

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold font-display text-gray-900 mb-2 leading-tight">Support Tickets</h1>
            <p className="text-gray-500 mb-8">Manage user requests and address their concerns.</p>

            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
                {(['active', 'pending', 'closed'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl font-bold capitalize whitespace-nowrap transition-all ${
                            activeTab === tab 
                            ? 'bg-brand text-white shadow-md' 
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                        }`}
                    >
                        {tab} Tickets
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-medium">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-500 font-medium shadow-sm">
                        No {activeTab} support tickets found.
                    </div>
                ) : (
                    filteredTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-all cursor-pointer" onClick={() => handleSelectTicket(ticket)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${ticket.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'}`}>
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">
                                            From {ticket.profiles?.email || 'Unknown User'} • Ref: #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${ticket.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ticket.status === 'closed' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 line-clamp-2">
                                {ticket.message}
                            </div>
                            <div className="text-brand font-bold text-sm mt-auto flex items-center justify-between">
                                <span>Click to view conversation</span>
                                <div className="flex gap-2 items-center">
                                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket.id, 'resolved'); }}
                                            className="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-100 transition-colors"
                                        >
                                            Quick Resolve
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleCloseTicket(ticket.id, e)}
                                        className="text-sm bg-gray-100 text-gray-700 p-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                        title="Close Ticket Permanently"
                                        disabled={ticket.status === 'closed'}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-white w-full max-w-2xl h-[85vh] sm:h-[650px] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <div className="bg-white p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Ticket #{selectedTicket.id.slice(0, 8)} • {selectedTicket.profiles?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedTicket.status !== 'closed' && (
                                    <button
                                        onClick={(e) => handleCloseTicket(selectedTicket.id, e)}
                                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                                        title="Close Ticket"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => setSelectedTicket(null)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors flex-shrink-0">
                                    <ArrowLeft className="w-5 h-5 hidden sm:block" />
                                    <X className="w-5 h-5 sm:hidden" />
                                    <span className="hidden sm:inline">Back</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 sm:px-6 flex gap-2 overflow-x-auto flex-shrink-0 border-b border-gray-100">
                            {['pending', 'active', 'resolved', 'closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all ${selectedTicket.status === status
                                        ? 'bg-white text-brand shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-900 border border-transparent'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 bg-gray-50/50 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
                            {/* Original Ticket Message as first message */}
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                                    {selectedTicket.profiles?.email[0].toUpperCase() || 'U'}
                                </div>
                                <div className="bg-white p-3 sm:p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm max-w-[85%] sm:max-w-[80%]">
                                    <p className="whitespace-pre-wrap text-sm sm:text-base text-gray-700">{selectedTicket.message}</p>
                                    <span className="text-[10px] text-gray-400 font-medium mt-2 block">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {loadingMessages ? (
                                <div className="text-center text-gray-400 py-4 text-sm font-medium">Loading messages...</div>
                            ) : (
                                messages.map(msg => {
                                    const isAdmin = msg.profiles?.role === 'admin';
                                    return (
                                        <div key={msg.id} className={`flex gap-3 sm:gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base ${isAdmin ? 'bg-brand text-white' : 'bg-blue-100 text-blue-600'}`}>
                                                {isAdmin ? 'A' : (msg.profiles?.email?.[0].toUpperCase() || 'U')}
                                            </div>
                                            <div className={`p-3 sm:p-4 rounded-2xl border shadow-sm max-w-[85%] sm:max-w-[80%] ${isAdmin ? 'bg-brand text-white border-brand rounded-tr-none' : 'bg-white border-gray-100 rounded-tl-none'}`}>
                                                <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.message}</p>
                                                <span className={`text-[10px] font-medium mt-2 block ${isAdmin ? 'text-brand-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="bg-white p-4 border-t border-gray-100 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex gap-3 sm:gap-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={selectedTicket.status === 'closed' ? 'Ticket is closed' : 'Type your reply...'}
                                    disabled={selectedTicket.status === 'closed'}
                                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:bg-gray-50 text-sm sm:text-base"
                                />
                                <button
                                    type="submit"
                                    disabled={selectedTicket.status === 'closed' || !newMessage.trim()}
                                    className="bg-brand text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-all disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
