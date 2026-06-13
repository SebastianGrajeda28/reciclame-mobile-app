-- RLS toggles, publication ownership, grants and default privileges.

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "anon";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."apply_daily_heat_decay"() TO "service_role";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."compute_streak_level"("p_streak_days" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "anon";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_categories"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_content_by_category"("p_category" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_educational_content_for_sync"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_progress_with_decay"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "anon";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."handle_post_segregation_progress"() TO "service_role";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."heat_gain_for_level"("p_level" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."streak_level_checkpoint"("p_level" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_educational_content_fetch"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_get_friends_with_profile_flow"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_insert"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_login"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_handle_new_user_on_non_login_update"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_no_duplicate_on_subsequent_login"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_update_featured_medals_flow"() TO "service_role";

GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "anon";

GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."test_update_user_avatar_flow"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "anon";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_featured_medals"("p_user_id" "uuid", "p_achievement_ids" "uuid"[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_user_avatar"("p_user_id" "uuid", "p_reward_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."achievements" TO "anon";

GRANT ALL ON TABLE "public"."achievements" TO "authenticated";

GRANT ALL ON TABLE "public"."achievements" TO "service_role";

GRANT ALL ON TABLE "public"."avatars" TO "anon";

GRANT ALL ON TABLE "public"."avatars" TO "authenticated";

GRANT ALL ON TABLE "public"."avatars" TO "service_role";

GRANT ALL ON TABLE "public"."bin_types" TO "anon";

GRANT ALL ON TABLE "public"."bin_types" TO "authenticated";

GRANT ALL ON TABLE "public"."bin_types" TO "service_role";

GRANT ALL ON TABLE "public"."cached_resources" TO "anon";

GRANT ALL ON TABLE "public"."cached_resources" TO "authenticated";

GRANT ALL ON TABLE "public"."cached_resources" TO "service_role";

GRANT ALL ON TABLE "public"."campuses" TO "anon";

GRANT ALL ON TABLE "public"."campuses" TO "authenticated";

GRANT ALL ON TABLE "public"."campuses" TO "service_role";

GRANT ALL ON TABLE "public"."educational_content" TO "anon";

GRANT ALL ON TABLE "public"."educational_content" TO "authenticated";

GRANT ALL ON TABLE "public"."educational_content" TO "service_role";

GRANT ALL ON TABLE "public"."friend_codes" TO "anon";

GRANT ALL ON TABLE "public"."friend_codes" TO "authenticated";

GRANT ALL ON TABLE "public"."friend_codes" TO "service_role";

GRANT ALL ON TABLE "public"."friendships" TO "anon";

GRANT ALL ON TABLE "public"."friendships" TO "authenticated";

GRANT ALL ON TABLE "public"."friendships" TO "service_role";

GRANT ALL ON TABLE "public"."fun_facts" TO "anon";

GRANT ALL ON TABLE "public"."fun_facts" TO "authenticated";

GRANT ALL ON TABLE "public"."fun_facts" TO "service_role";

GRANT ALL ON TABLE "public"."health_check" TO "anon";

GRANT ALL ON TABLE "public"."health_check" TO "authenticated";

GRANT ALL ON TABLE "public"."health_check" TO "service_role";

GRANT ALL ON TABLE "public"."instruction_steps" TO "anon";

GRANT ALL ON TABLE "public"."instruction_steps" TO "authenticated";

GRANT ALL ON TABLE "public"."instruction_steps" TO "service_role";

GRANT ALL ON TABLE "public"."instructions" TO "anon";

GRANT ALL ON TABLE "public"."instructions" TO "authenticated";

GRANT ALL ON TABLE "public"."instructions" TO "service_role";

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "anon";

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "authenticated";

GRANT ALL ON TABLE "public"."map_waste_type_bin_types" TO "service_role";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "anon";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "authenticated";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "service_role";

GRANT ALL ON TABLE "public"."pending_operations" TO "anon";

GRANT ALL ON TABLE "public"."pending_operations" TO "authenticated";

GRANT ALL ON TABLE "public"."pending_operations" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "anon";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_point_bins" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_points" TO "anon";

GRANT ALL ON TABLE "public"."recycling_points" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_points" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_records" TO "anon";

GRANT ALL ON TABLE "public"."recycling_records" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_records" TO "service_role";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "anon";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "authenticated";

GRANT ALL ON TABLE "public"."recycling_sessions" TO "service_role";

GRANT ALL ON TABLE "public"."rewards" TO "anon";

GRANT ALL ON TABLE "public"."rewards" TO "authenticated";

GRANT ALL ON TABLE "public"."rewards" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";

GRANT ALL ON TABLE "public"."roles" TO "authenticated";

GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON TABLE "public"."system_config" TO "anon";

GRANT ALL ON TABLE "public"."system_config" TO "authenticated";

GRANT ALL ON TABLE "public"."system_config" TO "service_role";

GRANT ALL ON TABLE "public"."universities" TO "anon";

GRANT ALL ON TABLE "public"."universities" TO "authenticated";

GRANT ALL ON TABLE "public"."universities" TO "service_role";

GRANT ALL ON TABLE "public"."user_achievements" TO "anon";

GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";

GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "anon";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "authenticated";

GRANT ALL ON TABLE "public"."user_featured_medals" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";

GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_progress" TO "anon";

GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";

GRANT ALL ON TABLE "public"."user_progress" TO "service_role";

GRANT ALL ON TABLE "public"."user_rewards" TO "anon";

GRANT ALL ON TABLE "public"."user_rewards" TO "authenticated";

GRANT ALL ON TABLE "public"."user_rewards" TO "service_role";

GRANT ALL ON TABLE "public"."user_roles" TO "anon";

GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_roles" TO "service_role";

GRANT ALL ON TABLE "public"."user_settings" TO "anon";

GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";

GRANT ALL ON TABLE "public"."user_settings" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."waste_types" TO "anon";

GRANT ALL ON TABLE "public"."waste_types" TO "authenticated";

GRANT ALL ON TABLE "public"."waste_types" TO "service_role";

revoke all on function app_auth.get_current_account() from public, anon, authenticated;

grant usage on schema app_auth to postgres, service_role;

grant execute on function app_auth.get_current_account() to postgres, service_role;

grant execute on function public.get_current_account() to authenticated;

grant execute on function public.get_current_account() to service_role;

revoke all on function app_analytics.get_admin_dashboard(timestamptz, timestamptz) from public, anon, authenticated;

grant usage on schema app_analytics to postgres, service_role;

grant execute on function app_analytics.get_admin_dashboard(timestamptz, timestamptz) to postgres, service_role;

grant execute on function public.get_admin_dashboard(timestamptz, timestamptz) to authenticated;

grant execute on function public.get_admin_dashboard(timestamptz, timestamptz) to service_role;

revoke all on function app_education.get_educational_content_for_sync() from public, anon, authenticated;

revoke all on function app_education.get_educational_content_by_category(text) from public, anon, authenticated;

revoke all on function app_education.get_educational_categories() from public, anon, authenticated;

grant usage on schema app_education to postgres, service_role;

grant execute on function app_education.get_educational_content_for_sync() to postgres, service_role;

grant execute on function app_education.get_educational_content_by_category(text) to postgres, service_role;

grant execute on function app_education.get_educational_categories() to postgres, service_role;

revoke all on function app_social.get_friends_with_profile(uuid) from public, anon, authenticated;

grant usage on schema app_social to postgres, service_role;

grant execute on function app_social.get_friends_with_profile(uuid) to postgres, service_role;

revoke all on function app_admin.is_current_user_admin() from public, anon, authenticated;

grant usage on schema app_admin to postgres, service_role;

grant execute on function app_admin.is_current_user_admin() to postgres, service_role;

grant execute on function public.is_current_user_admin() to authenticated;

grant execute on function public.is_current_user_admin() to service_role;

revoke all on function app_profile.update_user_avatar(uuid, uuid) from public, anon, authenticated;

grant usage on schema app_profile to postgres, service_role;

grant execute on function app_profile.update_user_avatar(uuid, uuid) to postgres, service_role;

grant execute on function public.update_user_avatar(uuid, uuid) to authenticated;

grant execute on function public.update_user_avatar(uuid, uuid) to service_role;

revoke all on function app_gamification.update_featured_medals(uuid, uuid[]) from public, anon, authenticated;

grant usage on schema app_gamification to postgres, service_role;

grant execute on function app_gamification.update_featured_medals(uuid, uuid[]) to postgres, service_role;

grant execute on function public.update_featured_medals(uuid, uuid[]) to authenticated;

grant execute on function public.update_featured_medals(uuid, uuid[]) to service_role;
