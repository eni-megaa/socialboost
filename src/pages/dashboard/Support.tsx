import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Plus, Clock, CheckCircle2, History, Send, ArrowLeft, X } from 'lucide-react';

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
    subject: string;
    message: string;
    status: string;
    created_at: string;
};

export const Support = () => {
    const { profile } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Form
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) fetchTickets();
    }, [profile]);

    const fetchTickets = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', profile.id)
            .neq('status', 'closed')
            .order('created_at', { ascending: false });
        if (data) setTickets(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.from('tickets').insert({
            user_id: profile.id,
            subject,
            message,
            status: 'pending'
        }).select().single();

        if (!error && data) {
            // Push Notification
            await supabase.from('admin_notifications').insert({
                title: 'New Support Ticket',
                message: `User ${profile.email || 'Unknown'} created a new ticket: ${subject}`,
                type: 'ticket'
            });

            setTickets([data, ...tickets]);
            setIsCreating(false);
            setSubject('');
            setMessage('');
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
        if (!selectedTicket || !newMessage.trim() || !profile) return;

        const { data, error } = await supabase.from('ticket_messages').insert({
            ticket_id: selectedTicket.id,
            user_id: profile.id,
            message: newMessage
        }).select('*, profiles:user_id(email, role)').single();

        if (data) {
            // Push Notification
            await supabase.from('admin_notifications').insert({
                title: 'New Ticket Reply',
                message: `User responded to ticket #${selectedTicket.id.slice(0, 8)}`,
                type: 'ticket'
            });

            setMessages([...messages, data as any]);
            setNewMessage('');
        } else if (error) {
            alert("Error sending message");
        }
    };

    // The selected ticket rendering will be moved inside the main return statement as a modal

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 leading-tight">Support Center</h1>
                    <p className="text-gray-500">How can we help you today?</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-brand text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-lg shadow-brand/30"
                    >
                        <Plus className="w-5 h-5" /> Open Ticket
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-10">
                    <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="e.g. Order #12345 issue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Please provide details about your request..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-light transition-all shadow-lg shadow-brand/30">Submit Ticket</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-medium">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-500 font-medium shadow-sm">
                        You have no open support tickets.
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => handleSelectTicket(ticket)}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${ticket.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'}`}>
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-brand transition-colors">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Ref: #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${ticket.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ticket.status === 'closed' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="mt-4 text-sm text-gray-600 line-clamp-2">
                                {ticket.message}
                            </div>
                            <div className="text-brand font-bold text-sm mt-4">
                                Click to view conversation
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Modal */}
            {selectedTicket && (() => {
                const hasAdminReply = messages.some(msg => msg.user_id !== profile?.id);

                let consecutiveUserMessages = 0;
                if (hasAdminReply) {
                    for (let i = messages.length - 1; i >= 0; i--) {
                        if (messages[i].user_id !== profile?.id) break;
                        consecutiveUserMessages++;
                    }
                }

                const reachedLimit = hasAdminReply ? consecutiveUserMessages >= 5 : true;
                const canReply = selectedTicket.status !== 'closed' && !reachedLimit;

                return (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedTicket(null)}>
                        <div className="bg-white w-full max-w-2xl h-[85vh] sm:h-[650px] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                            <div className="bg-white p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Ticket #{selectedTicket.id.slice(0, 8)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs uppercase font-bold border ${selectedTicket.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : selectedTicket.status === 'closed' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                        {selectedTicket.status}
                                    </span>
                                    <button onClick={() => setSelectedTicket(null)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors flex-shrink-0">
                                        <ArrowLeft className="w-5 h-5 sm:hidden" />
                                        <X className="w-5 h-5 hidden sm:block" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-50/50 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
                                {/* Original Ticket Message */}
                                <div className="flex gap-3 sm:gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                                        {profile?.email?.[0].toUpperCase() || 'U'}
                                    </div>
                                    <div className="bg-brand text-white p-3 sm:p-4 rounded-2xl rounded-tr-none border border-brand shadow-sm max-w-[85%] sm:max-w-[80%]">
                                        <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedTicket.message}</p>
                                        <span className="text-[10px] text-brand-100 font-medium mt-2 block">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {loadingMessages ? (
                                    <div className="text-center text-gray-400 py-4 text-sm font-medium">Loading messages...</div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = msg.user_id === profile?.id;
                                        return (
                                            <div key={msg.id} className={`flex gap-3 sm:gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base ${isMe ? 'bg-brand text-white' : 'bg-blue-100 text-blue-600'}`}>
                                                    {isMe ? (profile?.email?.[0].toUpperCase() || 'U') : 'A'}
                                                </div>
                                                <div className={`p-3 sm:p-4 rounded-2xl border shadow-sm max-w-[85%] sm:max-w-[80%] ${isMe ? 'bg-brand text-white border-brand rounded-tr-none' : 'bg-white border-gray-100 rounded-tl-none'}`}>
                                                    <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.message}</p>
                                                    <span className={`text-[10px] font-medium mt-2 block ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="bg-white p-4 border-t border-gray-100 flex-shrink-0">
                                {!hasAdminReply && selectedTicket.status !== 'closed' && (
                                    <div className="text-center text-xs sm:text-sm text-yellow-600 bg-yellow-50 p-3 rounded-xl mb-4 font-medium">
                                        Please wait for a support agent to reply before sending another message.
                                    </div>
                                )}
                                {hasAdminReply && reachedLimit && selectedTicket.status !== 'closed' && (
                                    <div className="text-center text-xs sm:text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4 font-medium">
                                        You have reached the limit of 5 consecutive messages. Please wait for an admin to reply.
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex gap-3 sm:gap-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={selectedTicket.status === 'closed' ? 'Ticket is closed' : (!hasAdminReply || reachedLimit) ? 'Waiting for admin reply...' : 'Type your reply...'}
                                        disabled={!canReply}
                                        className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:bg-gray-50 text-sm sm:text-base"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!canReply || !newMessage.trim()}
                                        className="bg-brand text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-all disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Send</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
