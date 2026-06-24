export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_type: string | null;
          condition_value: number | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          reward_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          condition_type?: string | null;
          condition_value?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          reward_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          condition_type?: string | null;
          condition_value?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          reward_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_reward_id_fkey";
            columns: ["reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
        ];
      };
      avatars: {
        Row: {
          accessory_reward_id: string | null;
          avatar_config: Json | null;
          base_style: string | null;
          created_at: string;
          frame_reward_id: string | null;
          id: string;
          is_active: boolean;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          accessory_reward_id?: string | null;
          avatar_config?: Json | null;
          base_style?: string | null;
          created_at?: string;
          frame_reward_id?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          accessory_reward_id?: string | null;
          avatar_config?: Json | null;
          base_style?: string | null;
          created_at?: string;
          frame_reward_id?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avatars_accessory_reward_id_fkey";
            columns: ["accessory_reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avatars_frame_reward_id_fkey";
            columns: ["frame_reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avatars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      bin_types: {
        Row: {
          color: string | null;
          created_at: string;
          deposit_instruction: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          university_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          deposit_instruction?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          university_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          deposit_instruction?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          university_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bin_types_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      cached_resources: {
        Row: {
          created_at: string;
          is_active: boolean;
          last_synced_at: string | null;
          resource_name: string;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          created_at?: string;
          is_active?: boolean;
          last_synced_at?: string | null;
          resource_name: string;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          created_at?: string;
          is_active?: boolean;
          last_synced_at?: string | null;
          resource_name?: string;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
      campuses: {
        Row: {
          address: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          university_id: string;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          university_id: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          university_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campuses_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      educational_content: {
        Row: {
          body: string;
          category: string;
          content_type: string;
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          image_url: string | null;
          is_active: boolean;
          title: string;
          updated_at: string | null;
          waste_type_id: string | null;
        };
        Insert: {
          body: string;
          category: string;
          content_type: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Update: {
          body?: string;
          category?: string;
          content_type?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title?: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "educational_content_waste_type_id_fkey";
            columns: ["waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
        ];
      };
      friend_codes: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friend_codes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          addressee_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          requester_id: string;
          responded_at: string | null;
          status: string;
          updated_at: string | null;
          user_high: string | null;
          user_low: string | null;
        };
        Insert: {
          addressee_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          requester_id: string;
          responded_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_high?: string | null;
          user_low?: string | null;
        };
        Update: {
          addressee_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          requester_id?: string;
          responded_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_high?: string | null;
          user_low?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      fun_facts: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          text: string;
          updated_at: string | null;
          waste_type_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          text: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          text?: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fun_facts_waste_type_id_fkey";
            columns: ["waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
        ];
      };
      health_check: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      instruction_steps: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          instruction_id: string;
          is_active: boolean;
          text: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          instruction_id: string;
          is_active?: boolean;
          text: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          instruction_id?: string;
          is_active?: boolean;
          text?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "instruction_steps_instruction_id_fkey";
            columns: ["instruction_id"];
            isOneToOne: false;
            referencedRelation: "instructions";
            referencedColumns: ["id"];
          },
        ];
      };
      instructions: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          title: string;
          updated_at: string | null;
          waste_type_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title?: string;
          updated_at?: string | null;
          waste_type_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "instructions_waste_type_id_fkey";
            columns: ["waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
        ];
      };
      map_waste_type_bin_types: {
        Row: {
          bin_type_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          university_id: string;
          updated_at: string | null;
          waste_type_id: string;
        };
        Insert: {
          bin_type_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          university_id: string;
          updated_at?: string | null;
          waste_type_id: string;
        };
        Update: {
          bin_type_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          university_id?: string;
          updated_at?: string | null;
          waste_type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "map_waste_type_bin_types_bin_type_id_fkey";
            columns: ["bin_type_id"];
            isOneToOne: false;
            referencedRelation: "bin_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "map_waste_type_bin_types_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "map_waste_type_bin_types_waste_type_id_fkey";
            columns: ["waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
        ];
      };
      metric_snapshots: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          metric_name: string;
          metric_value: number;
          period_end: string;
          period_start: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metric_name: string;
          metric_value: number;
          period_end: string;
          period_start: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metric_name?: string;
          metric_value?: number;
          period_end?: string;
          period_start?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      pending_operations: {
        Row: {
          created_at: string;
          is_active: boolean;
          last_error: string | null;
          local_id: string;
          operation_type: string;
          payload_json: string | null;
          retry_count: number;
          status: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          is_active?: boolean;
          last_error?: string | null;
          local_id: string;
          operation_type: string;
          payload_json?: string | null;
          retry_count?: number;
          status: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          is_active?: boolean;
          last_error?: string | null;
          local_id?: string;
          operation_type?: string;
          payload_json?: string | null;
          retry_count?: number;
          status?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pending_operations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      recycling_point_bins: {
        Row: {
          bin_type_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          recycling_point_id: string;
          updated_at: string | null;
        };
        Insert: {
          bin_type_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          recycling_point_id: string;
          updated_at?: string | null;
        };
        Update: {
          bin_type_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          recycling_point_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recycling_point_bins_bin_type_id_fkey";
            columns: ["bin_type_id"];
            isOneToOne: false;
            referencedRelation: "bin_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_point_bins_recycling_point_id_fkey";
            columns: ["recycling_point_id"];
            isOneToOne: false;
            referencedRelation: "recycling_points";
            referencedColumns: ["id"];
          },
        ];
      };
      recycling_points: {
        Row: {
          campus_id: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          campus_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          latitude: number;
          longitude: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          campus_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number;
          longitude?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recycling_points_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
        ];
      };
      recycling_records: {
        Row: {
          bin_type_id: string | null;
          confidence_score: number | null;
          created_at: string;
          detection_type: string | null;
          estimated_weight: number | null;
          id: string;
          is_active: boolean;
          recycling_point_id: string | null;
          status: string | null;
          synced_at: string | null;
          updated_at: string | null;
          user_id: string;
          waste_type_id: string | null;
        };
        Insert: {
          bin_type_id?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          detection_type?: string | null;
          estimated_weight?: number | null;
          id?: string;
          is_active?: boolean;
          recycling_point_id?: string | null;
          status?: string | null;
          synced_at?: string | null;
          updated_at?: string | null;
          user_id: string;
          waste_type_id?: string | null;
        };
        Update: {
          bin_type_id?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          detection_type?: string | null;
          estimated_weight?: number | null;
          id?: string;
          is_active?: boolean;
          recycling_point_id?: string | null;
          status?: string | null;
          synced_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
          waste_type_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recycling_records_bin_type_id_fkey";
            columns: ["bin_type_id"];
            isOneToOne: false;
            referencedRelation: "bin_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_records_recycling_point_id_fkey";
            columns: ["recycling_point_id"];
            isOneToOne: false;
            referencedRelation: "recycling_points";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_records_waste_type_id_fkey";
            columns: ["waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
        ];
      };
      recycling_sessions: {
        Row: {
          confidence_score: number | null;
          created_at: string;
          detection_type: string | null;
          ended_at: string | null;
          final_waste_type_id: string | null;
          furthest_step: string;
          id: string;
          low_confidence: boolean | null;
          outcome: string;
          predicted_waste_type_id: string | null;
          recycling_point_id: string | null;
          recycling_record_id: string | null;
          started_at: string;
          user_id: string | null;
          waste_type_overridden: boolean | null;
        };
        Insert: {
          confidence_score?: number | null;
          created_at?: string;
          detection_type?: string | null;
          ended_at?: string | null;
          final_waste_type_id?: string | null;
          furthest_step: string;
          id?: string;
          low_confidence?: boolean | null;
          outcome: string;
          predicted_waste_type_id?: string | null;
          recycling_point_id?: string | null;
          recycling_record_id?: string | null;
          started_at: string;
          user_id?: string | null;
          waste_type_overridden?: boolean | null;
        };
        Update: {
          confidence_score?: number | null;
          created_at?: string;
          detection_type?: string | null;
          ended_at?: string | null;
          final_waste_type_id?: string | null;
          furthest_step?: string;
          id?: string;
          low_confidence?: boolean | null;
          outcome?: string;
          predicted_waste_type_id?: string | null;
          recycling_point_id?: string | null;
          recycling_record_id?: string | null;
          started_at?: string;
          user_id?: string | null;
          waste_type_overridden?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "recycling_sessions_final_waste_type_id_fkey";
            columns: ["final_waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_sessions_predicted_waste_type_id_fkey";
            columns: ["predicted_waste_type_id"];
            isOneToOne: false;
            referencedRelation: "waste_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_sessions_recycling_point_id_fkey";
            columns: ["recycling_point_id"];
            isOneToOne: false;
            referencedRelation: "recycling_points";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_sessions_recycling_record_id_fkey";
            columns: ["recycling_record_id"];
            isOneToOne: false;
            referencedRelation: "recycling_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recycling_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      rewards: {
        Row: {
          asset_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          reward_type: string | null;
          updated_at: string | null;
        };
        Insert: {
          asset_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          reward_type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          asset_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          reward_type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      system_config: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          key: string;
          updated_at: string | null;
          value: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key: string;
          updated_at?: string | null;
          value?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          updated_at?: string | null;
          value?: string | null;
        };
        Relationships: [];
      };
      universities: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          unlocked_at: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          unlocked_at?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          unlocked_at?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_featured_medals: {
        Row: {
          achievement_ids: string[];
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_ids?: string[];
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_ids?: string[];
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_featured_medals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          alias: string | null;
          avatar_id: string | null;
          campus_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          university_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          alias?: string | null;
          avatar_id?: string | null;
          campus_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          university_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          alias?: string | null;
          avatar_id?: string | null;
          campus_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          university_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          created_at: string;
          heat: number | null;
          id: string;
          is_active: boolean;
          last_recycling_date: string | null;
          level: number;
          points: number;
          streak_days: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          heat?: number | null;
          id?: string;
          is_active?: boolean;
          last_recycling_date?: string | null;
          level?: number;
          points?: number;
          streak_days?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          heat?: number | null;
          id?: string;
          is_active?: boolean;
          last_recycling_date?: string | null;
          level?: number;
          points?: number;
          streak_days?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_rewards: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          is_equipped: boolean;
          reward_id: string;
          unlocked_at: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_equipped?: boolean;
          reward_id: string;
          unlocked_at?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_equipped?: boolean;
          reward_id?: string;
          unlocked_at?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey";
            columns: ["reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          assigned_at: string;
          created_at: string;
          id: string;
          is_active: boolean;
          role_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_settings: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          language: string | null;
          notifications_enabled: boolean;
          profile_visibility: string | null;
          skip_recycling_instructions: boolean;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language?: string | null;
          notifications_enabled?: boolean;
          profile_visibility?: string | null;
          skip_recycling_instructions?: boolean;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language?: string | null;
          notifications_enabled?: boolean;
          profile_visibility?: string | null;
          skip_recycling_instructions?: boolean;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          last_login_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      waste_types: {
        Row: {
          created_at: string;
          description: string | null;
          estimated_weight_g: number;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          estimated_weight_g?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          estimated_weight_g?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_daily_heat_decay: { Args: never; Returns: undefined };
      compute_streak_level: {
        Args: { p_streak_days: number };
        Returns: number;
      };
      count_public_tables: {
        Args: never;
        Returns: {
          table_name: string;
        }[];
      };
      get_admin_dashboard: {
        Args: { p_end: string; p_start: string };
        Returns: Json;
      };
      get_current_account: { Args: never; Returns: Json };
      get_educational_categories: {
        Args: never;
        Returns: {
          category: string;
          content_count: number;
        }[];
      };
      get_educational_content_by_category: {
        Args: { p_category: string };
        Returns: {
          body: string;
          category: string;
          content_type: string;
          description: string;
          id: string;
          image_url: string;
          title: string;
          waste_type_id: string;
        }[];
      };
      get_educational_content_for_sync: {
        Args: never;
        Returns: {
          body: string;
          category: string;
          content_type: string;
          description: string;
          id: string;
          image_url: string;
          title: string;
          waste_type_id: string;
        }[];
      };
      get_friends_with_profile: {
        Args: { p_user_id: string };
        Returns: {
          avatar_base_style: string;
          current_streak: number;
          featured_medals: Json;
          friend_id: string;
          last_activity_at: string;
          name: string;
        }[];
      };
      get_progress_with_decay: {
        Args: { p_user_id: string };
        Returns: {
          heat: number;
          last_recycling_date: string;
          level: number;
          streak_days: number;
        }[];
      };
      heat_gain_for_level: { Args: { p_level: number }; Returns: number };
      is_current_user_admin: { Args: never; Returns: boolean };
      streak_level_checkpoint: { Args: { p_level: number }; Returns: number };
      test_educational_content_fetch: {
        Args: never;
        Returns: {
          categories_found: number;
          content_fetched: boolean;
          message: string;
        }[];
      };
      test_get_friends_with_profile_flow: {
        Args: never;
        Returns: {
          friend_found: boolean;
          has_name: boolean;
          has_streak: boolean;
          message: string;
        }[];
      };
      test_handle_new_user_on_insert: {
        Args: never;
        Returns: {
          last_login_filled: boolean;
          profile_exists: boolean;
          user_exists: boolean;
        }[];
      };
      test_handle_new_user_on_login: {
        Args: never;
        Returns: {
          last_login_updated: boolean;
        }[];
      };
      test_handle_new_user_on_non_login_update: {
        Args: never;
        Returns: {
          last_login_unchanged: boolean;
        }[];
      };
      test_no_duplicate_on_subsequent_login: {
        Args: never;
        Returns: {
          first_login_created_profile: boolean;
          first_login_created_user: boolean;
          no_duplication: boolean;
          second_login_profiles_count: number;
          second_login_users_count: number;
        }[];
      };
      test_update_featured_medals_flow: {
        Args: never;
        Returns: {
          created: boolean;
          medals_updated: boolean;
          message: string;
        }[];
      };
      test_update_user_avatar_flow: {
        Args: never;
        Returns: {
          avatar_set: boolean;
          created: boolean;
          message: string;
        }[];
      };
      update_featured_medals: {
        Args: { p_achievement_ids: string[]; p_user_id: string };
        Returns: {
          message: string;
          success: boolean;
        }[];
      };
      update_user_avatar: {
        Args: { p_reward_id: string; p_user_id: string };
        Returns: {
          message: string;
          success: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const;
