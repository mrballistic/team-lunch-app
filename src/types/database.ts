// Database types generated from Supabase
export interface DietaryRestrictions {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  halal?: boolean;
  kosher?: boolean;
  [key: string]: boolean | undefined;
}

export interface ExternalRef {
  yelp_id?: string;
  categories?: string[];
  coords?: { lat: number; lng: number };
  price_tier?: number;
  url?: string;
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          default_location_lat: number;
          default_location_lng: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          default_location_lat: number;
          default_location_lng: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          default_location_lat?: number;
          default_location_lng?: number;
          created_at?: string;
        };
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          role: 'owner' | 'member';
          dietary: DietaryRestrictions;
          created_at: string;
        };
        Insert: {
          team_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          dietary?: DietaryRestrictions;
          created_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          role?: 'owner' | 'member';
          dietary?: DietaryRestrictions;
          created_at?: string;
        };
      };
      lunch_sessions: {
        Row: {
          id: string;
          team_id: string;
          status: 'draft' | 'open' | 'closed';
          max_walk_minutes: number | null;
          price_min: number | null;
          price_max: number | null;
          cooldown_days: number | null;
          created_by: string | null;
          created_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          status?: 'draft' | 'open' | 'closed';
          max_walk_minutes?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          cooldown_days?: number | null;
          created_by?: string | null;
          created_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          status?: 'draft' | 'open' | 'closed';
          max_walk_minutes?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          cooldown_days?: number | null;
          created_by?: string | null;
          created_at?: string;
          closed_at?: string | null;
        };
      };
      suggestions: {
        Row: {
          id: string;
          session_id: string;
          type: 'restaurant' | 'style';
          label: string;
          external_ref: ExternalRef | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: 'restaurant' | 'style';
          label: string;
          external_ref?: ExternalRef | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: 'restaurant' | 'style';
          label?: string;
          external_ref?: ExternalRef | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          session_id: string;
          suggestion_id: string;
          user_id: string;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          suggestion_id: string;
          user_id: string;
          weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          suggestion_id?: string;
          user_id?: string;
          weight?: number;
          created_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          team_id: string;
          name: string;
          yelp_id: string | null;
          lat: number | null;
          lng: number | null;
          price_tier: number | null;
          tags: string[] | null;
          supports_dietary: DietaryRestrictions | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          name: string;
          yelp_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          price_tier?: number | null;
          tags?: string[] | null;
          supports_dietary?: DietaryRestrictions | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          name?: string;
          yelp_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          price_tier?: number | null;
          tags?: string[] | null;
          supports_dietary?: DietaryRestrictions | null;
          created_at?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          team_id: string;
          restaurant_id: string | null;
          visited_at: string;
          session_id: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          restaurant_id?: string | null;
          visited_at?: string;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          restaurant_id?: string | null;
          visited_at?: string;
          session_id?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          team_id: string;
          restaurant_id: string | null;
          user_id: string | null;
          rating: number | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          restaurant_id?: string | null;
          user_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          restaurant_id?: string | null;
          user_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
