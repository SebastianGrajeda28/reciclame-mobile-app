-- Cross-table constraints, primary keys, unique keys and foreign keys.

ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."cached_resources"
    ADD CONSTRAINT "cached_resources_pkey" PRIMARY KEY ("resource_name");

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_code_key" UNIQUE ("code");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."health_check"
    ADD CONSTRAINT "health_check_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."instruction_steps"
    ADD CONSTRAINT "instruction_steps_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_waste_type_id_bin_ty_key" UNIQUE ("university_id", "waste_type_id", "bin_type_id");

ALTER TABLE ONLY "public"."metric_snapshots"
    ADD CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_pkey" PRIMARY KEY ("local_id");

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_bin_type_id_key" UNIQUE ("recycling_point_id", "bin_type_id");

ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rewards"
    ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_key_key" UNIQUE ("key");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_reward_id_key" UNIQUE ("user_id", "reward_id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."waste_types"
    ADD CONSTRAINT "waste_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_accessory_reward_id_fkey" FOREIGN KEY ("accessory_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_frame_reward_id_fkey" FOREIGN KEY ("frame_reward_id") REFERENCES "public"."rewards"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."avatars"
    ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bin_types"
    ADD CONSTRAINT "bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."educational_content"
    ADD CONSTRAINT "educational_content_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."friend_codes"
    ADD CONSTRAINT "friend_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."fun_facts"
    ADD CONSTRAINT "fun_facts_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."instruction_steps"
    ADD CONSTRAINT "instruction_steps_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."instructions"
    ADD CONSTRAINT "instructions_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."map_waste_type_bin_types"
    ADD CONSTRAINT "map_waste_type_bin_types_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."pending_operations"
    ADD CONSTRAINT "pending_operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_point_bins"
    ADD CONSTRAINT "recycling_point_bins_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_points"
    ADD CONSTRAINT "recycling_points_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_bin_type_id_fkey" FOREIGN KEY ("bin_type_id") REFERENCES "public"."bin_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recycling_records"
    ADD CONSTRAINT "recycling_records_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_final_waste_type_id_fkey" FOREIGN KEY ("final_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_predicted_waste_type_id_fkey" FOREIGN KEY ("predicted_waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_point_id_fkey" FOREIGN KEY ("recycling_point_id") REFERENCES "public"."recycling_points"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_recycling_record_id_fkey" FOREIGN KEY ("recycling_record_id") REFERENCES "public"."recycling_records"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."recycling_sessions"
    ADD CONSTRAINT "recycling_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_featured_medals"
    ADD CONSTRAINT "user_featured_medals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_rewards"
    ADD CONSTRAINT "user_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
