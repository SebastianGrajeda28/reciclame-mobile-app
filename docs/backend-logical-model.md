# Backend Logical Model

This is the operational mental model for developers.

```mermaid
flowchart LR
  Mobile[apps/mobile]
  AdminWeb[apps/admin-web]

  subgraph ClientServices[Client service layer]
    AuthService[AuthService]
    RecyclingService[RecyclingService]
    ProfileService[ProfileService]
    AdminMetricsService[AdminMetricsService]
    AdminContentService[AdminContentService]
  end

  subgraph SupabaseBackend[Supabase backend]
    Auth[Supabase Auth]
    subgraph PublicContracts[Public contracts consumed by clients]
      PublicRPC[public RPC wrappers]
      Edge[Edge Functions]
      Storage[Storage]
    end
    subgraph DomainSchemas[Internal implementation schemas]
      AppAuth[app_auth]
      AppAdmin[app_admin]
      AppAnalytics[app_analytics]
      AppEducation[app_education]
      AppProfile[app_profile]
      AppGamification[app_gamification]
      AppSocial[app_social]
    end
    DB[(PostgreSQL)]
    RLS[RLS policies]
    Triggers[Triggers]
  end

  Mobile --> AuthService
  Mobile --> RecyclingService
  Mobile --> ProfileService
  AdminWeb --> AdminMetricsService
  AdminWeb --> AdminContentService

  AuthService --> Auth
  RecyclingService --> PublicRPC
  ProfileService --> PublicRPC
  AdminMetricsService --> PublicRPC
  AdminContentService --> PublicRPC
  AdminContentService --> Edge
  AdminContentService --> Storage

  PublicRPC --> AppAuth
  PublicRPC --> AppAdmin
  PublicRPC --> AppAnalytics
  PublicRPC --> AppEducation
  PublicRPC --> AppProfile
  PublicRPC --> AppGamification
  PublicRPC --> AppSocial

  AppAuth --> DB
  AppAdmin --> DB
  AppAnalytics --> DB
  AppEducation --> DB
  AppProfile --> DB
  AppGamification --> DB
  AppSocial --> DB
  DB --> RLS
  DB --> Triggers
```

## Rule

- clients call `public.*` RPC names or Edge Functions
- implementation moves into domain schemas
- triggers and policies must point to the owning domain when possible
- new migrations should preserve public compatibility unless a breaking change is deliberate

## Migration map

| Domain schema | Purpose | Introduced by |
| --- | --- | --- |
| `app_auth` | account lookup, auth trigger implementation | `20260613010000_domain_function_schemas.sql`, `20260613020000_expand_domain_function_schemas.sql` |
| `app_admin` | admin authorization helpers | `20260613020000_expand_domain_function_schemas.sql` |
| `app_analytics` | dashboard/reporting implementations | `20260613010000_domain_function_schemas.sql` |
| `app_education` | educational content implementations | `20260613010000_domain_function_schemas.sql` |
| `app_profile` | avatar/profile mutation implementations | `20260613020000_expand_domain_function_schemas.sql` |
| `app_gamification` | medals/progression mutation implementations | `20260613020000_expand_domain_function_schemas.sql` |
| `app_social` | friends/social aggregate implementations | `20260613010000_domain_function_schemas.sql` |