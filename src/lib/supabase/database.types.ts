export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          frequency: Database["public"]["Enums"]["activity_frequency"];
          house_id: string;
          id: string;
          name: string;
          requires_approval: boolean;
          reward_amount: number;
          reward_type: Database["public"]["Enums"]["reward_type"];
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          frequency: Database["public"]["Enums"]["activity_frequency"];
          house_id: string;
          id?: string;
          name: string;
          requires_approval?: boolean;
          reward_amount: number;
          reward_type: Database["public"]["Enums"]["reward_type"];
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      activity_assignees: {
        Row: {
          activity_id: string;
          member_id: string;
        };
        Insert: {
          activity_id: string;
          member_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_assignees"]["Insert"]>;
        Relationships: [];
      };
      completions: {
        Row: {
          activity_id: string;
          completed_on: string;
          id: string;
          member_id: string;
          reviewed_at: string | null;
          reviewer_member_id: string | null;
          status: Database["public"]["Enums"]["completion_status"];
          submitted_at: string | null;
        };
        Insert: {
          activity_id: string;
          completed_on: string;
          id?: string;
          member_id: string;
          reviewed_at?: string | null;
          reviewer_member_id?: string | null;
          status?: Database["public"]["Enums"]["completion_status"];
          submitted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["completions"]["Insert"]>;
        Relationships: [];
      };
      house_members: {
        Row: {
          avatar_color: string;
          created_at: string;
          display_name: string;
          house_id: string;
          id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          avatar_color?: string;
          created_at?: string;
          display_name: string;
          house_id: string;
          id?: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["house_members"]["Insert"]>;
        Relationships: [];
      };
      houses: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          invite_code: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          invite_code?: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["houses"]["Insert"]>;
        Relationships: [];
      };
      ledger_entries: {
        Row: {
          activity_id: string | null;
          amount: number;
          created_at: string;
          created_by_member_id: string;
          house_id: string;
          id: string;
          member_id: string;
          note: string | null;
          type: Database["public"]["Enums"]["reward_type"];
        };
        Insert: {
          activity_id?: string | null;
          amount: number;
          created_at?: string;
          created_by_member_id: string;
          house_id: string;
          id?: string;
          member_id: string;
          note?: string | null;
          type: Database["public"]["Enums"]["reward_type"];
        };
        Update: Partial<Database["public"]["Tables"]["ledger_entries"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          active_house_id: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          active_house_id?: string | null;
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_house: {
        Args: {
          house_name: string;
          display_name: string;
        };
        Returns: Database["public"]["Tables"]["houses"]["Row"];
      };
      join_house: {
        Args: {
          house_ref: string;
          display_name: string;
          role: Database["public"]["Enums"]["member_role"];
        };
        Returns: Database["public"]["Tables"]["houses"]["Row"];
      };
    };
    Enums: {
      activity_frequency: "as-needed" | "weekdays" | "daily" | "weekly" | "monthly";
      completion_status: "pending" | "submitted" | "approved" | "rejected";
      member_role: "admin" | "parent" | "kid";
      reward_type: "points" | "money";
    };
    CompositeTypes: Record<string, never>;
  };
};
