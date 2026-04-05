export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    sort_order: number | null
                    status: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    sort_order?: number | null
                    status?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    sort_order?: number | null
                    status?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    charge: number
                    created_at: string
                    id: string
                    link: string
                    provider_order_id: string | null
                    quantity: number
                    remains: number | null
                    service_id: string
                    start_count: number | null
                    status: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    charge: number
                    created_at?: string
                    id?: string
                    link: string
                    provider_order_id?: string | null
                    quantity: number
                    remains?: number | null
                    service_id: string
                    start_count?: number | null
                    status?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    charge?: number
                    created_at?: string
                    id?: string
                    link?: string
                    provider_order_id?: string | null
                    quantity?: number
                    remains?: number | null
                    service_id?: string
                    start_count?: number | null
                    status?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_service_id_fkey"
                        columns: ["service_id"]
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    balance: number
                    created_at: string
                    email: string | null
                    id: string
                    role: string
                    updated_at: string
                }
                Insert: {
                    balance?: number
                    created_at?: string
                    email?: string | null
                    id: string
                    role?: string
                    updated_at?: string
                }
                Update: {
                    balance?: number
                    created_at?: string
                    email?: string | null
                    id?: string
                    role?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            providers: {
                Row: {
                    api_key: string
                    api_type: string
                    api_url: string
                    balance: number | null
                    created_at: string
                    id: string
                    name: string
                    status: string
                }
                Insert: {
                    api_key: string
                    api_type?: string
                    api_url: string
                    balance?: number | null
                    created_at?: string
                    id?: string
                    name: string
                    status?: string
                }
                Update: {
                    api_key?: string
                    api_type?: string
                    api_url?: string
                    balance?: number | null
                    created_at?: string
                    id?: string
                    name?: string
                    status?: string
                }
                Relationships: []
            }
            services: {
                Row: {
                    category_id: string
                    created_at: string
                    description: string | null
                    id: string
                    max_quantity: number
                    min_quantity: number
                    name: string
                    provider_id: string | null
                    provider_rate: number | null
                    provider_service_id: string | null
                    rate: number
                    status: string
                    type: string
                }
                Insert: {
                    category_id: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    max_quantity?: number
                    min_quantity?: number
                    name: string
                    provider_id?: string | null
                    provider_rate?: number | null
                    provider_service_id?: string | null
                    rate: number
                    status?: string
                    type?: string
                }
                Update: {
                    category_id?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    max_quantity?: number
                    min_quantity?: number
                    name?: string
                    provider_id?: string | null
                    provider_rate?: number | null
                    provider_service_id?: string | null
                    rate?: number
                    status?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "services_category_id_fkey"
                        columns: ["category_id"]
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "services_provider_id_fkey"
                        columns: ["provider_id"]
                        referencedRelation: "providers"
                        referencedColumns: ["id"]
                    }
                ]
            }
            settings: {
                Row: {
                    description: string | null
                    id: string
                    updated_at: string
                    value: string
                }
                Insert: {
                    description?: string | null
                    id: string
                    updated_at?: string
                    value: string
                }
                Update: {
                    description?: string | null
                    id?: string
                    updated_at?: string
                    value?: string
                }
                Relationships: []
            }
            transactions: {
                Row: {
                    amount: number
                    balance_after: number
                    created_at: string
                    description: string | null
                    id: string
                    order_id: string | null
                    type: string
                    user_id: string
                }
                Insert: {
                    amount: number
                    balance_after: number
                    created_at?: string
                    description?: string | null
                    id?: string
                    order_id?: string | null
                    type: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    balance_after?: number
                    created_at?: string
                    description?: string | null
                    id?: string
                    order_id?: string | null
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_order_id_fkey"
                        columns: ["order_id"]
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tickets: {
                Row: {
                    created_at: string
                    id: string
                    message: string
                    status: string
                    subject: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    message: string
                    status?: string
                    subject: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    message?: string
                    status?: string
                    subject?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tickets_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            ticket_messages: {
                Row: {
                    created_at: string
                    id: string
                    message: string
                    ticket_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    message: string
                    ticket_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    message?: string
                    ticket_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ticket_messages_ticket_id_fkey"
                        columns: ["ticket_id"]
                        referencedRelation: "tickets"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ticket_messages_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            announcements: {
                Row: {
                    content: string
                    created_at: string
                    id: string
                    is_active: boolean | null
                    title: string
                    type: string
                }
                Insert: {
                    content: string
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    title: string
                    type?: string
                }
                Update: {
                    content?: string
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    title?: string
                    type?: string
                }
                Relationships: []
            }
            admin_notifications: {
                Row: {
                    created_at: string
                    id: string
                    is_read: boolean | null
                    message: string
                    title: string
                    type: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    is_read?: boolean | null
                    message: string
                    title: string
                    type: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    is_read?: boolean | null
                    message?: string
                    title?: string
                    type?: string
                }
                Relationships: []
            }
            payment_methods: {
                Row: {
                    id: string
                    name: string
                    public_key: string | null
                    secret_key: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    public_key?: string | null
                    secret_key?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    public_key?: string | null
                    secret_key?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
