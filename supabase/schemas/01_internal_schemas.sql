-- Internal implementation schemas.
create schema if not exists app_auth;
create schema if not exists app_admin;
create schema if not exists app_analytics;
create schema if not exists app_education;
create schema if not exists app_gamification;
create schema if not exists app_profile;
create schema if not exists app_social;

comment on schema app_auth is 'Domain implementation functions for authentication/account contracts.';

comment on schema app_analytics is 'Domain implementation functions for analytics and admin reporting.';

comment on schema app_education is 'Domain implementation functions for educational content contracts.';

comment on schema app_social is 'Domain implementation functions for social/friends contracts.';

comment on schema app_admin is 'Domain implementation functions for administrative authorization and operations.';

comment on schema app_profile is 'Domain implementation functions for profile and avatar operations.';

comment on schema app_gamification is 'Domain implementation functions for medals, rewards and progression-facing contracts.';
