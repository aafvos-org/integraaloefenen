-- =============================================================================
-- Basis van het publieke schema, zoals de echte database er op 12 oktober 2026
-- uitzag. Dit vervangt de oude keten 0001 t/m 0033.
--
-- Die keten hoort bij de geschiedenis van afgeleideoefenen. Dit project is
-- daaruit gekopieerd en daarna opgeschoond; die bestanden zijn hier nooit als
-- migratie gedraaid. Ze staan in supabase/archief/migraties-voor-de-basis en
-- horen niet meer in `supabase db reset` of `supabase db push`.
--
-- Wat hier bewust niet in zit:
--   • geen rijen (geen oefenstof, geen leerlingen)
--   • de webhook-functies en hun triggers — die zet 0043 neer, met het adres
--     uit de Vault. Op de echte database stond nog een oudere functie met het
--     adres vast in de code; die hoort niet in een lokale database.
--
-- De rol `analist` bestaat op de echte database en heeft daar alleen-lezen-
-- beleid. Lokaal maken we die rol aan zonder inlog, alleen zodat dat beleid
-- kan bestaan. Dit bestand draait niet op de echte database: het schema staat
-- er al. Daar wordt alleen bijgehouden dat deze basis gedaan is.
-- =============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- De rol moet bestaan vóór het alleen-lezen-beleid. Op de echte database
-- bestaat hij al; dit blok is voor een lege lokale database.
do $$
begin
  if not exists (select 1 from pg_catalog.pg_roles where rolname = 'analist') then
    create role analist nologin;
  end if;
end
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    book_part smallint NOT NULL,
    order_index smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    site text DEFAULT 'afgeleiden'::text NOT NULL,
    CONSTRAINT chapters_site_check CHECK ((site = ANY (ARRAY['afgeleiden'::text, 'integralen'::text])))
);


--
-- Name: custom_test_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_test_questions (
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    order_index integer NOT NULL
);


--
-- Name: known_wrong_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.known_wrong_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    wrong_answer text NOT NULL,
    error_explanation text NOT NULL,
    root_cause_slug text NOT NULL,
    seen_count integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: known_wrong_answers_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.known_wrong_answers_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    wrong_answer text NOT NULL,
    error_explanation text NOT NULL,
    category text,
    seen_count integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text,
    role text DEFAULT 'student'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    grade text,
    display_name text,
    learning_mode text,
    onboarded_at timestamp with time zone,
    tour_seen_at timestamp with time zone,
    CONSTRAINT profiles_grade_check CHECK (((grade IS NULL) OR (grade = ANY (ARRAY['vwo_4'::text, 'vwo_5'::text, 'vwo_6'::text, 'examen_training'::text, 'anders'::text])))),
    CONSTRAINT profiles_learning_mode_check CHECK (((learning_mode IS NULL) OR (learning_mode = ANY (ARRAY['guided'::text, 'topic_select'::text, 'diagnostic'::text, 'free'::text])))),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['student'::text, 'admin'::text])))
);


--
-- Name: question_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reason text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    CONSTRAINT question_flags_status_check CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: question_flags_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_flags_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reason text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    CONSTRAINT question_flags_new_status_check CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: question_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    step_order integer NOT NULL,
    step_description text NOT NULL,
    root_cause_id uuid
);


--
-- Name: question_steps_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_steps_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    step_order integer NOT NULL,
    step_description text NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    cluster_id uuid NOT NULL,
    latex_body text,
    answer text NOT NULL,
    latex_answer text,
    difficulty integer NOT NULL,
    root_cause_tags text[] DEFAULT '{}'::text[] NOT NULL,
    is_ai_generated boolean DEFAULT false NOT NULL,
    order_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    answer_alternatives text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT questions_difficulty_check CHECK ((difficulty = ANY (ARRAY[1, 2, 3])))
);


--
-- Name: questions_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    cluster_id uuid NOT NULL,
    latex_body text,
    answer text NOT NULL,
    latex_answer text,
    difficulty integer NOT NULL,
    is_ai_generated boolean DEFAULT false NOT NULL,
    order_index integer,
    answer_alternatives text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    site text DEFAULT 'afgeleiden'::text NOT NULL,
    CONSTRAINT questions_new_difficulty_check CHECK ((difficulty = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT questions_new_site_check CHECK ((site = ANY (ARRAY['afgeleiden'::text, 'integralen'::text])))
);


--
-- Name: root_causes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.root_causes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    slug text NOT NULL,
    description text NOT NULL
);


--
-- Name: session_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    user_answer text,
    is_correct boolean,
    hints_used integer DEFAULT 0 NOT NULL,
    is_careless boolean DEFAULT false NOT NULL,
    time_spent_sec integer,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_answers_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_answers_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    user_answer text,
    is_correct boolean,
    hints_used integer DEFAULT 0 NOT NULL,
    is_careless boolean DEFAULT false NOT NULL,
    time_spent_sec integer,
    answered_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: step_mistakes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.step_mistakes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    answer_id uuid NOT NULL,
    step_id uuid NOT NULL,
    is_careless boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: step_mistakes_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.step_mistakes_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    answer_id uuid NOT NULL,
    step_id uuid NOT NULL,
    is_careless boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stoomcursus_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stoomcursus_progress (
    user_id uuid NOT NULL,
    site text DEFAULT 'afgeleiden'::text NOT NULL,
    step text DEFAULT 'welkom'::text NOT NULL,
    placed integer DEFAULT 0 NOT NULL,
    part integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stoomcursus_progress_part_check CHECK (((part >= 0) AND (part <= 2))),
    CONSTRAINT stoomcursus_progress_placed_check CHECK (((placed >= 0) AND (placed <= 3))),
    CONSTRAINT stoomcursus_progress_site_check CHECK ((site = ANY (ARRAY['afgeleiden'::text, 'integralen'::text]))),
    CONSTRAINT stoomcursus_progress_step_check CHECK ((step = ANY (ARRAY['welkom'::text, 'onderdelen'::text, 'uitleg'::text, 'vervolg'::text, 'oefenen'::text])))
);


--
-- Name: topic_clusters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_clusters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    order_index integer NOT NULL
);


--
-- Name: topic_clusters_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_clusters_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    order_index smallint NOT NULL,
    source_cluster_id uuid,
    site text DEFAULT 'afgeleiden'::text NOT NULL,
    CONSTRAINT topic_clusters_new_site_check CHECK ((site = ANY (ARRAY['afgeleiden'::text, 'integralen'::text])))
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    order_index integer NOT NULL,
    is_unlocked_by_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: topics_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    chapter_id uuid NOT NULL,
    order_index smallint NOT NULL,
    is_unlocked_by_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    site text DEFAULT 'afgeleiden'::text NOT NULL,
    category text,
    CONSTRAINT topics_new_category_check CHECK ((category = ANY (ARRAY['primitiveren'::text, 'integralen'::text, 'vergelijkingen'::text, 'toepassingen'::text]))),
    CONSTRAINT topics_new_site_check CHECK ((site = ANY (ARRAY['afgeleiden'::text, 'integralen'::text])))
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    cluster_id uuid NOT NULL,
    status text NOT NULL,
    correct_streak integer DEFAULT 0 NOT NULL,
    total_answered integer DEFAULT 0 NOT NULL,
    total_correct integer DEFAULT 0 NOT NULL,
    mastered_at timestamp with time zone,
    is_skipped boolean DEFAULT false NOT NULL,
    CONSTRAINT user_progress_status_check CHECK ((status = ANY (ARRAY['locked'::text, 'in_progress'::text, 'mastered'::text])))
);


--
-- Name: user_progress_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    cluster_id uuid NOT NULL,
    status text NOT NULL,
    correct_streak integer DEFAULT 0 NOT NULL,
    total_answered integer DEFAULT 0 NOT NULL,
    total_correct integer DEFAULT 0 NOT NULL,
    mastered_at timestamp with time zone,
    is_skipped boolean DEFAULT false NOT NULL,
    CONSTRAINT user_progress_new_status_check CHECK ((status = ANY (ARRAY['locked'::text, 'in_progress'::text, 'mastered'::text])))
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid NOT NULL,
    cluster_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone
);


--
-- Name: user_sessions_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions_new (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid,
    cluster_id uuid,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    kind text DEFAULT 'practice'::text NOT NULL,
    name text,
    show_answers text DEFAULT 'immediate'::text NOT NULL,
    session_type text DEFAULT 'practice'::text NOT NULL,
    CONSTRAINT user_sessions_new_kind_check CHECK ((kind = ANY (ARRAY['practice'::text, 'custom_test'::text]))),
    CONSTRAINT user_sessions_new_session_type_check CHECK ((session_type = ANY (ARRAY['practice'::text, 'custom_test'::text]))),
    CONSTRAINT user_sessions_new_show_answers_check CHECK ((show_answers = ANY (ARRAY['immediate'::text, 'end'::text])))
);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_slug_key UNIQUE (slug);


--
-- Name: custom_test_questions custom_test_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_test_questions
    ADD CONSTRAINT custom_test_questions_pkey PRIMARY KEY (session_id, order_index);


--
-- Name: custom_test_questions custom_test_questions_session_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_test_questions
    ADD CONSTRAINT custom_test_questions_session_id_question_id_key UNIQUE (session_id, question_id);


--
-- Name: known_wrong_answers_new known_wrong_answers_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers_new
    ADD CONSTRAINT known_wrong_answers_new_pkey PRIMARY KEY (id);


--
-- Name: known_wrong_answers_new known_wrong_answers_new_question_id_wrong_answer_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers_new
    ADD CONSTRAINT known_wrong_answers_new_question_id_wrong_answer_key UNIQUE (question_id, wrong_answer);


--
-- Name: known_wrong_answers known_wrong_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers
    ADD CONSTRAINT known_wrong_answers_pkey PRIMARY KEY (id);


--
-- Name: known_wrong_answers known_wrong_answers_question_id_wrong_answer_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers
    ADD CONSTRAINT known_wrong_answers_question_id_wrong_answer_key UNIQUE (question_id, wrong_answer);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: question_flags_new question_flags_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags_new
    ADD CONSTRAINT question_flags_new_pkey PRIMARY KEY (id);


--
-- Name: question_flags_new question_flags_new_question_id_user_id_status_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags_new
    ADD CONSTRAINT question_flags_new_question_id_user_id_status_key UNIQUE (question_id, user_id, status);


--
-- Name: question_flags question_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags
    ADD CONSTRAINT question_flags_pkey PRIMARY KEY (id);


--
-- Name: question_flags question_flags_question_id_user_id_status_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags
    ADD CONSTRAINT question_flags_question_id_user_id_status_key UNIQUE (question_id, user_id, status);


--
-- Name: question_steps_new question_steps_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps_new
    ADD CONSTRAINT question_steps_new_pkey PRIMARY KEY (id);


--
-- Name: question_steps_new question_steps_new_question_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps_new
    ADD CONSTRAINT question_steps_new_question_id_step_order_key UNIQUE (question_id, step_order);


--
-- Name: question_steps question_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps
    ADD CONSTRAINT question_steps_pkey PRIMARY KEY (id);


--
-- Name: question_steps question_steps_question_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps
    ADD CONSTRAINT question_steps_question_id_step_order_key UNIQUE (question_id, step_order);


--
-- Name: questions_new questions_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions_new
    ADD CONSTRAINT questions_new_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: root_causes root_causes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.root_causes
    ADD CONSTRAINT root_causes_pkey PRIMARY KEY (id);


--
-- Name: root_causes root_causes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.root_causes
    ADD CONSTRAINT root_causes_slug_key UNIQUE (slug);


--
-- Name: session_answers_new session_answers_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers_new
    ADD CONSTRAINT session_answers_new_pkey PRIMARY KEY (id);


--
-- Name: session_answers session_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers
    ADD CONSTRAINT session_answers_pkey PRIMARY KEY (id);


--
-- Name: step_mistakes_new step_mistakes_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes_new
    ADD CONSTRAINT step_mistakes_new_pkey PRIMARY KEY (id);


--
-- Name: step_mistakes step_mistakes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes
    ADD CONSTRAINT step_mistakes_pkey PRIMARY KEY (id);


--
-- Name: stoomcursus_progress stoomcursus_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stoomcursus_progress
    ADD CONSTRAINT stoomcursus_progress_pkey PRIMARY KEY (user_id, site);


--
-- Name: topic_clusters_new topic_clusters_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters_new
    ADD CONSTRAINT topic_clusters_new_pkey PRIMARY KEY (id);


--
-- Name: topic_clusters_new topic_clusters_new_topic_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters_new
    ADD CONSTRAINT topic_clusters_new_topic_id_slug_key UNIQUE (topic_id, slug);


--
-- Name: topic_clusters topic_clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters
    ADD CONSTRAINT topic_clusters_pkey PRIMARY KEY (id);


--
-- Name: topic_clusters topic_clusters_topic_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters
    ADD CONSTRAINT topic_clusters_topic_id_slug_key UNIQUE (topic_id, slug);


--
-- Name: topics_new topics_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics_new
    ADD CONSTRAINT topics_new_pkey PRIMARY KEY (id);


--
-- Name: topics_new topics_new_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics_new
    ADD CONSTRAINT topics_new_slug_key UNIQUE (slug);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: topics topics_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_slug_key UNIQUE (slug);


--
-- Name: user_progress_new user_progress_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress_new
    ADD CONSTRAINT user_progress_new_pkey PRIMARY KEY (id);


--
-- Name: user_progress_new user_progress_new_user_id_cluster_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress_new
    ADD CONSTRAINT user_progress_new_user_id_cluster_id_key UNIQUE (user_id, cluster_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_cluster_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_cluster_id_key UNIQUE (user_id, cluster_id);


--
-- Name: user_sessions_new user_sessions_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions_new
    ADD CONSTRAINT user_sessions_new_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: chapters_site_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chapters_site_order_idx ON public.chapters USING btree (site, order_index);


--
-- Name: clusters_new_site_topic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clusters_new_site_topic_idx ON public.topic_clusters_new USING btree (site, topic_id, order_index);


--
-- Name: custom_test_questions_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX custom_test_questions_session_idx ON public.custom_test_questions USING btree (session_id, order_index);


--
-- Name: known_wrong_answers_new_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX known_wrong_answers_new_question_id_idx ON public.known_wrong_answers_new USING btree (question_id);


--
-- Name: known_wrong_answers_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX known_wrong_answers_question_id_idx ON public.known_wrong_answers USING btree (question_id);


--
-- Name: profiles_onboarded_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_onboarded_at_idx ON public.profiles USING btree (onboarded_at);


--
-- Name: question_flags_new_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_flags_new_question_id_idx ON public.question_flags_new USING btree (question_id);


--
-- Name: question_flags_new_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_flags_new_status_idx ON public.question_flags_new USING btree (status);


--
-- Name: question_flags_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_flags_question_id_idx ON public.question_flags USING btree (question_id);


--
-- Name: question_flags_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_flags_status_idx ON public.question_flags USING btree (status);


--
-- Name: question_steps_new_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_steps_new_question_id_idx ON public.question_steps_new USING btree (question_id);


--
-- Name: question_steps_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_steps_question_id_idx ON public.question_steps USING btree (question_id);


--
-- Name: questions_cluster_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_cluster_id_idx ON public.questions USING btree (cluster_id);


--
-- Name: questions_new_cluster_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_new_cluster_id_idx ON public.questions_new USING btree (cluster_id);


--
-- Name: questions_new_site_cluster_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_new_site_cluster_idx ON public.questions_new USING btree (site, cluster_id, order_index);


--
-- Name: questions_new_topic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_new_topic_id_idx ON public.questions_new USING btree (topic_id);


--
-- Name: questions_topic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_topic_id_idx ON public.questions USING btree (topic_id);


--
-- Name: root_causes_topic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX root_causes_topic_id_idx ON public.root_causes USING btree (topic_id);


--
-- Name: session_answers_new_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_answers_new_question_id_idx ON public.session_answers_new USING btree (question_id);


--
-- Name: session_answers_new_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_answers_new_session_id_idx ON public.session_answers_new USING btree (session_id);


--
-- Name: session_answers_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_answers_question_id_idx ON public.session_answers USING btree (question_id);


--
-- Name: session_answers_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_answers_session_id_idx ON public.session_answers USING btree (session_id);


--
-- Name: step_mistakes_answer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX step_mistakes_answer_id_idx ON public.step_mistakes USING btree (answer_id);


--
-- Name: step_mistakes_new_answer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX step_mistakes_new_answer_id_idx ON public.step_mistakes_new USING btree (answer_id);


--
-- Name: topic_clusters_new_source_cluster_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topic_clusters_new_source_cluster_idx ON public.topic_clusters_new USING btree (source_cluster_id);


--
-- Name: topic_clusters_new_topic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topic_clusters_new_topic_id_idx ON public.topic_clusters_new USING btree (topic_id);


--
-- Name: topic_clusters_topic_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topic_clusters_topic_id_idx ON public.topic_clusters USING btree (topic_id);


--
-- Name: topics_new_chapter_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_new_chapter_id_idx ON public.topics_new USING btree (chapter_id);


--
-- Name: topics_new_site_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_new_site_category_idx ON public.topics_new USING btree (site, category);


--
-- Name: topics_new_site_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_new_site_order_idx ON public.topics_new USING btree (site, order_index);


--
-- Name: user_progress_new_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_progress_new_user_id_idx ON public.user_progress_new USING btree (user_id);


--
-- Name: user_progress_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_progress_user_id_idx ON public.user_progress USING btree (user_id);


--
-- Name: user_progress_user_skipped_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_progress_user_skipped_idx ON public.user_progress USING btree (user_id, is_skipped);


--
-- Name: user_sessions_new_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_sessions_new_user_id_idx ON public.user_sessions_new USING btree (user_id);


--
-- Name: user_sessions_new_user_kind_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_sessions_new_user_kind_idx ON public.user_sessions_new USING btree (user_id, kind);


--
-- Name: user_sessions_new_user_session_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_sessions_new_user_session_type_idx ON public.user_sessions_new USING btree (user_id, session_type);


--
-- Name: user_sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_sessions_user_id_idx ON public.user_sessions USING btree (user_id);


--
-- Name: custom_test_questions custom_test_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_test_questions
    ADD CONSTRAINT custom_test_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_new(id) ON DELETE CASCADE;


--
-- Name: custom_test_questions custom_test_questions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_test_questions
    ADD CONSTRAINT custom_test_questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions_new(id) ON DELETE CASCADE;


--
-- Name: known_wrong_answers_new known_wrong_answers_new_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers_new
    ADD CONSTRAINT known_wrong_answers_new_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_new(id) ON DELETE CASCADE;


--
-- Name: known_wrong_answers known_wrong_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.known_wrong_answers
    ADD CONSTRAINT known_wrong_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_flags_new question_flags_new_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags_new
    ADD CONSTRAINT question_flags_new_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_new(id) ON DELETE CASCADE;


--
-- Name: question_flags_new question_flags_new_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags_new
    ADD CONSTRAINT question_flags_new_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: question_flags_new question_flags_new_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags_new
    ADD CONSTRAINT question_flags_new_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_flags question_flags_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags
    ADD CONSTRAINT question_flags_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_flags question_flags_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags
    ADD CONSTRAINT question_flags_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: question_flags question_flags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_flags
    ADD CONSTRAINT question_flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: question_steps_new question_steps_new_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps_new
    ADD CONSTRAINT question_steps_new_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_new(id) ON DELETE CASCADE;


--
-- Name: question_steps question_steps_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps
    ADD CONSTRAINT question_steps_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_steps question_steps_root_cause_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_steps
    ADD CONSTRAINT question_steps_root_cause_id_fkey FOREIGN KEY (root_cause_id) REFERENCES public.root_causes(id) ON DELETE SET NULL;


--
-- Name: questions questions_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters(id) ON DELETE CASCADE;


--
-- Name: questions_new questions_new_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions_new
    ADD CONSTRAINT questions_new_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters_new(id) ON DELETE CASCADE;


--
-- Name: questions_new questions_new_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions_new
    ADD CONSTRAINT questions_new_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics_new(id) ON DELETE CASCADE;


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: root_causes root_causes_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.root_causes
    ADD CONSTRAINT root_causes_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: session_answers_new session_answers_new_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers_new
    ADD CONSTRAINT session_answers_new_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions_new(id) ON DELETE CASCADE;


--
-- Name: session_answers_new session_answers_new_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers_new
    ADD CONSTRAINT session_answers_new_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions_new(id) ON DELETE CASCADE;


--
-- Name: session_answers session_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers
    ADD CONSTRAINT session_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: session_answers session_answers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_answers
    ADD CONSTRAINT session_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions(id) ON DELETE CASCADE;


--
-- Name: step_mistakes step_mistakes_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes
    ADD CONSTRAINT step_mistakes_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.session_answers(id) ON DELETE CASCADE;


--
-- Name: step_mistakes_new step_mistakes_new_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes_new
    ADD CONSTRAINT step_mistakes_new_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.session_answers_new(id) ON DELETE CASCADE;


--
-- Name: step_mistakes_new step_mistakes_new_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes_new
    ADD CONSTRAINT step_mistakes_new_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.question_steps_new(id) ON DELETE CASCADE;


--
-- Name: step_mistakes step_mistakes_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_mistakes
    ADD CONSTRAINT step_mistakes_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.question_steps(id) ON DELETE CASCADE;


--
-- Name: stoomcursus_progress stoomcursus_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stoomcursus_progress
    ADD CONSTRAINT stoomcursus_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: topic_clusters_new topic_clusters_new_source_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters_new
    ADD CONSTRAINT topic_clusters_new_source_cluster_id_fkey FOREIGN KEY (source_cluster_id) REFERENCES public.topic_clusters(id) ON DELETE SET NULL;


--
-- Name: topic_clusters_new topic_clusters_new_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters_new
    ADD CONSTRAINT topic_clusters_new_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics_new(id) ON DELETE CASCADE;


--
-- Name: topic_clusters topic_clusters_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_clusters
    ADD CONSTRAINT topic_clusters_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: topics_new topics_new_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics_new
    ADD CONSTRAINT topics_new_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters(id) ON DELETE CASCADE;


--
-- Name: user_progress_new user_progress_new_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress_new
    ADD CONSTRAINT user_progress_new_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters_new(id) ON DELETE CASCADE;


--
-- Name: user_progress_new user_progress_new_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress_new
    ADD CONSTRAINT user_progress_new_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics_new(id) ON DELETE CASCADE;


--
-- Name: user_progress_new user_progress_new_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress_new
    ADD CONSTRAINT user_progress_new_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters(id) ON DELETE CASCADE;


--
-- Name: user_sessions_new user_sessions_new_cluster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions_new
    ADD CONSTRAINT user_sessions_new_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.topic_clusters_new(id) ON DELETE CASCADE;


--
-- Name: user_sessions_new user_sessions_new_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions_new
    ADD CONSTRAINT user_sessions_new_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics_new(id) ON DELETE CASCADE;


--
-- Name: user_sessions_new user_sessions_new_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions_new
    ADD CONSTRAINT user_sessions_new_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: chapters analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.chapters FOR SELECT TO analist USING (true);


--
-- Name: custom_test_questions analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.custom_test_questions FOR SELECT TO analist USING (true);


--
-- Name: known_wrong_answers analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.known_wrong_answers FOR SELECT TO analist USING (true);


--
-- Name: known_wrong_answers_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.known_wrong_answers_new FOR SELECT TO analist USING (true);


--
-- Name: profiles analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.profiles FOR SELECT TO analist USING (true);


--
-- Name: question_flags analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.question_flags FOR SELECT TO analist USING (true);


--
-- Name: question_flags_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.question_flags_new FOR SELECT TO analist USING (true);


--
-- Name: question_steps analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.question_steps FOR SELECT TO analist USING (true);


--
-- Name: question_steps_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.question_steps_new FOR SELECT TO analist USING (true);


--
-- Name: questions analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.questions FOR SELECT TO analist USING (true);


--
-- Name: questions_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.questions_new FOR SELECT TO analist USING (true);


--
-- Name: root_causes analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.root_causes FOR SELECT TO analist USING (true);


--
-- Name: session_answers analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.session_answers FOR SELECT TO analist USING (true);


--
-- Name: session_answers_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.session_answers_new FOR SELECT TO analist USING (true);


--
-- Name: step_mistakes analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.step_mistakes FOR SELECT TO analist USING (true);


--
-- Name: step_mistakes_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.step_mistakes_new FOR SELECT TO analist USING (true);


--
-- Name: stoomcursus_progress analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.stoomcursus_progress FOR SELECT TO analist USING (true);


--
-- Name: topic_clusters analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.topic_clusters FOR SELECT TO analist USING (true);


--
-- Name: topic_clusters_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.topic_clusters_new FOR SELECT TO analist USING (true);


--
-- Name: topics analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.topics FOR SELECT TO analist USING (true);


--
-- Name: topics_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.topics_new FOR SELECT TO analist USING (true);


--
-- Name: user_progress analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.user_progress FOR SELECT TO analist USING (true);


--
-- Name: user_progress_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.user_progress_new FOR SELECT TO analist USING (true);


--
-- Name: user_sessions analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.user_sessions FOR SELECT TO analist USING (true);


--
-- Name: user_sessions_new analist_lezen; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY analist_lezen ON public.user_sessions_new FOR SELECT TO analist USING (true);


--
-- Name: chapters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_test_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_test_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_test_questions custom_test_questions_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY custom_test_questions_owner ON public.custom_test_questions USING ((EXISTS ( SELECT 1
   FROM public.user_sessions_new us
  WHERE ((us.id = custom_test_questions.session_id) AND ((us.user_id = auth.uid()) OR public.is_admin()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_sessions_new us
  WHERE ((us.id = custom_test_questions.session_id) AND (us.user_id = auth.uid())))));


--
-- Name: known_wrong_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.known_wrong_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: known_wrong_answers_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.known_wrong_answers_new ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_admin_all ON public.profiles USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: profiles profiles_self_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_self_select ON public.profiles FOR SELECT USING (((auth.uid() = id) OR public.is_admin()));


--
-- Name: profiles profiles_self_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((auth.uid() = id) AND (role = 'student'::text)));


--
-- Name: question_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: question_flags question_flags_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_admin_all ON public.question_flags USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: question_flags question_flags_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_insert_own ON public.question_flags FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_flags_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_flags_new ENABLE ROW LEVEL SECURITY;

--
-- Name: question_flags_new question_flags_new_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_new_admin_all ON public.question_flags_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: question_flags_new question_flags_new_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_new_insert_own ON public.question_flags_new FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: question_flags_new question_flags_new_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_new_select ON public.question_flags_new FOR SELECT USING (((auth.uid() = user_id) OR public.is_admin()));


--
-- Name: question_flags question_flags_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_flags_select ON public.question_flags FOR SELECT USING (((auth.uid() = user_id) OR public.is_admin()));


--
-- Name: question_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: question_steps_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_steps_new ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: questions_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions_new ENABLE ROW LEVEL SECURITY;

--
-- Name: chapters read_chapters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_chapters ON public.chapters FOR SELECT USING (true);


--
-- Name: known_wrong_answers read_known_wrong_answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_known_wrong_answers ON public.known_wrong_answers FOR SELECT USING (true);


--
-- Name: known_wrong_answers_new read_known_wrong_answers_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_known_wrong_answers_new ON public.known_wrong_answers_new FOR SELECT USING (true);


--
-- Name: question_steps read_question_steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_question_steps ON public.question_steps FOR SELECT USING (true);


--
-- Name: question_steps_new read_question_steps_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_question_steps_new ON public.question_steps_new FOR SELECT USING (true);


--
-- Name: questions read_questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_questions ON public.questions FOR SELECT USING (true);


--
-- Name: questions_new read_questions_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_questions_new ON public.questions_new FOR SELECT USING (true);


--
-- Name: root_causes read_root_causes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_root_causes ON public.root_causes FOR SELECT USING (true);


--
-- Name: topic_clusters read_topic_clusters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_topic_clusters ON public.topic_clusters FOR SELECT USING (true);


--
-- Name: topic_clusters_new read_topic_clusters_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_topic_clusters_new ON public.topic_clusters_new FOR SELECT USING (true);


--
-- Name: topics read_topics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_topics ON public.topics FOR SELECT USING (true);


--
-- Name: topics_new read_topics_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_topics_new ON public.topics_new FOR SELECT USING (true);


--
-- Name: root_causes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.root_causes ENABLE ROW LEVEL SECURITY;

--
-- Name: session_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: session_answers_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_answers_new ENABLE ROW LEVEL SECURITY;

--
-- Name: session_answers_new session_answers_new_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_answers_new_owner ON public.session_answers_new USING ((EXISTS ( SELECT 1
   FROM public.user_sessions_new us
  WHERE ((us.id = session_answers_new.session_id) AND ((us.user_id = auth.uid()) OR public.is_admin()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_sessions_new us
  WHERE ((us.id = session_answers_new.session_id) AND (us.user_id = auth.uid())))));


--
-- Name: session_answers session_answers_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_answers_owner ON public.session_answers USING ((EXISTS ( SELECT 1
   FROM public.user_sessions us
  WHERE ((us.id = session_answers.session_id) AND ((us.user_id = auth.uid()) OR public.is_admin()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_sessions us
  WHERE ((us.id = session_answers.session_id) AND (us.user_id = auth.uid())))));


--
-- Name: step_mistakes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.step_mistakes ENABLE ROW LEVEL SECURITY;

--
-- Name: step_mistakes_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.step_mistakes_new ENABLE ROW LEVEL SECURITY;

--
-- Name: step_mistakes_new step_mistakes_new_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY step_mistakes_new_owner ON public.step_mistakes_new USING ((EXISTS ( SELECT 1
   FROM (public.session_answers_new sa
     JOIN public.user_sessions_new us ON ((us.id = sa.session_id)))
  WHERE ((sa.id = step_mistakes_new.answer_id) AND ((us.user_id = auth.uid()) OR public.is_admin()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.session_answers_new sa
     JOIN public.user_sessions_new us ON ((us.id = sa.session_id)))
  WHERE ((sa.id = step_mistakes_new.answer_id) AND (us.user_id = auth.uid())))));


--
-- Name: step_mistakes step_mistakes_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY step_mistakes_owner ON public.step_mistakes USING ((EXISTS ( SELECT 1
   FROM (public.session_answers sa
     JOIN public.user_sessions us ON ((us.id = sa.session_id)))
  WHERE ((sa.id = step_mistakes.answer_id) AND ((us.user_id = auth.uid()) OR public.is_admin()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.session_answers sa
     JOIN public.user_sessions us ON ((us.id = sa.session_id)))
  WHERE ((sa.id = step_mistakes.answer_id) AND (us.user_id = auth.uid())))));


--
-- Name: stoomcursus_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stoomcursus_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: stoomcursus_progress stoomcursus_progress_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stoomcursus_progress_owner ON public.stoomcursus_progress USING (((auth.uid() = user_id) OR public.is_admin())) WITH CHECK ((auth.uid() = user_id));


--
-- Name: topic_clusters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;

--
-- Name: topic_clusters_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic_clusters_new ENABLE ROW LEVEL SECURITY;

--
-- Name: topics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

--
-- Name: topics_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topics_new ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress_new ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress_new user_progress_new_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_progress_new_owner ON public.user_progress_new USING (((auth.uid() = user_id) OR public.is_admin())) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_progress user_progress_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_progress_owner ON public.user_progress USING (((auth.uid() = user_id) OR public.is_admin())) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions_new; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions_new ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions_new user_sessions_new_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_sessions_new_owner ON public.user_sessions_new USING (((auth.uid() = user_id) OR public.is_admin())) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_sessions user_sessions_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_sessions_owner ON public.user_sessions USING (((auth.uid() = user_id) OR public.is_admin())) WITH CHECK ((auth.uid() = user_id));


--
-- Name: chapters write_chapters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_chapters ON public.chapters USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: known_wrong_answers write_known_wrong_answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_known_wrong_answers ON public.known_wrong_answers USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: known_wrong_answers_new write_known_wrong_answers_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_known_wrong_answers_new ON public.known_wrong_answers_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: question_steps write_question_steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_question_steps ON public.question_steps USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: question_steps_new write_question_steps_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_question_steps_new ON public.question_steps_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: questions write_questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_questions ON public.questions USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: questions_new write_questions_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_questions_new ON public.questions_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: root_causes write_root_causes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_root_causes ON public.root_causes USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: topic_clusters write_topic_clusters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_topic_clusters ON public.topic_clusters USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: topic_clusters_new write_topic_clusters_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_topic_clusters_new ON public.topic_clusters_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: topics write_topics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_topics ON public.topics USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: topics_new write_topics_new; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY write_topics_new ON public.topics_new USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO analist;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: TABLE chapters; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.chapters TO anon;
GRANT ALL ON TABLE public.chapters TO authenticated;
GRANT ALL ON TABLE public.chapters TO service_role;
GRANT SELECT ON TABLE public.chapters TO analist;


--
-- Name: TABLE custom_test_questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.custom_test_questions TO anon;
GRANT ALL ON TABLE public.custom_test_questions TO authenticated;
GRANT ALL ON TABLE public.custom_test_questions TO service_role;
GRANT SELECT ON TABLE public.custom_test_questions TO analist;


--
-- Name: TABLE known_wrong_answers; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.known_wrong_answers TO anon;
GRANT ALL ON TABLE public.known_wrong_answers TO authenticated;
GRANT ALL ON TABLE public.known_wrong_answers TO service_role;
GRANT SELECT ON TABLE public.known_wrong_answers TO analist;


--
-- Name: TABLE known_wrong_answers_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.known_wrong_answers_new TO anon;
GRANT ALL ON TABLE public.known_wrong_answers_new TO authenticated;
GRANT ALL ON TABLE public.known_wrong_answers_new TO service_role;
GRANT SELECT ON TABLE public.known_wrong_answers_new TO analist;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: COLUMN profiles.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.role; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(role) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.grade; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(grade) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.learning_mode; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(learning_mode) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.onboarded_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(onboarded_at) ON TABLE public.profiles TO analist;


--
-- Name: COLUMN profiles.tour_seen_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(tour_seen_at) ON TABLE public.profiles TO analist;


--
-- Name: TABLE question_flags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_flags TO anon;
GRANT ALL ON TABLE public.question_flags TO authenticated;
GRANT ALL ON TABLE public.question_flags TO service_role;
GRANT SELECT ON TABLE public.question_flags TO analist;


--
-- Name: TABLE question_flags_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_flags_new TO anon;
GRANT ALL ON TABLE public.question_flags_new TO authenticated;
GRANT ALL ON TABLE public.question_flags_new TO service_role;
GRANT SELECT ON TABLE public.question_flags_new TO analist;


--
-- Name: TABLE question_steps; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_steps TO anon;
GRANT ALL ON TABLE public.question_steps TO authenticated;
GRANT ALL ON TABLE public.question_steps TO service_role;
GRANT SELECT ON TABLE public.question_steps TO analist;


--
-- Name: TABLE question_steps_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_steps_new TO anon;
GRANT ALL ON TABLE public.question_steps_new TO authenticated;
GRANT ALL ON TABLE public.question_steps_new TO service_role;
GRANT SELECT ON TABLE public.question_steps_new TO analist;


--
-- Name: TABLE questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.questions TO anon;
GRANT ALL ON TABLE public.questions TO authenticated;
GRANT ALL ON TABLE public.questions TO service_role;
GRANT SELECT ON TABLE public.questions TO analist;


--
-- Name: TABLE questions_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.questions_new TO anon;
GRANT ALL ON TABLE public.questions_new TO authenticated;
GRANT ALL ON TABLE public.questions_new TO service_role;
GRANT SELECT ON TABLE public.questions_new TO analist;


--
-- Name: TABLE root_causes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.root_causes TO anon;
GRANT ALL ON TABLE public.root_causes TO authenticated;
GRANT ALL ON TABLE public.root_causes TO service_role;
GRANT SELECT ON TABLE public.root_causes TO analist;


--
-- Name: TABLE session_answers; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.session_answers TO anon;
GRANT ALL ON TABLE public.session_answers TO authenticated;
GRANT ALL ON TABLE public.session_answers TO service_role;
GRANT SELECT ON TABLE public.session_answers TO analist;


--
-- Name: TABLE session_answers_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.session_answers_new TO anon;
GRANT ALL ON TABLE public.session_answers_new TO authenticated;
GRANT ALL ON TABLE public.session_answers_new TO service_role;
GRANT SELECT ON TABLE public.session_answers_new TO analist;


--
-- Name: TABLE step_mistakes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.step_mistakes TO anon;
GRANT ALL ON TABLE public.step_mistakes TO authenticated;
GRANT ALL ON TABLE public.step_mistakes TO service_role;
GRANT SELECT ON TABLE public.step_mistakes TO analist;


--
-- Name: TABLE step_mistakes_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.step_mistakes_new TO anon;
GRANT ALL ON TABLE public.step_mistakes_new TO authenticated;
GRANT ALL ON TABLE public.step_mistakes_new TO service_role;
GRANT SELECT ON TABLE public.step_mistakes_new TO analist;


--
-- Name: TABLE stoomcursus_progress; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.stoomcursus_progress TO anon;
GRANT ALL ON TABLE public.stoomcursus_progress TO authenticated;
GRANT ALL ON TABLE public.stoomcursus_progress TO service_role;
GRANT SELECT ON TABLE public.stoomcursus_progress TO analist;


--
-- Name: TABLE topic_clusters; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.topic_clusters TO anon;
GRANT ALL ON TABLE public.topic_clusters TO authenticated;
GRANT ALL ON TABLE public.topic_clusters TO service_role;
GRANT SELECT ON TABLE public.topic_clusters TO analist;


--
-- Name: TABLE topic_clusters_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.topic_clusters_new TO anon;
GRANT ALL ON TABLE public.topic_clusters_new TO authenticated;
GRANT ALL ON TABLE public.topic_clusters_new TO service_role;
GRANT SELECT ON TABLE public.topic_clusters_new TO analist;


--
-- Name: TABLE topics; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.topics TO anon;
GRANT ALL ON TABLE public.topics TO authenticated;
GRANT ALL ON TABLE public.topics TO service_role;
GRANT SELECT ON TABLE public.topics TO analist;


--
-- Name: TABLE topics_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.topics_new TO anon;
GRANT ALL ON TABLE public.topics_new TO authenticated;
GRANT ALL ON TABLE public.topics_new TO service_role;
GRANT SELECT ON TABLE public.topics_new TO analist;


--
-- Name: TABLE user_progress; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_progress TO anon;
GRANT ALL ON TABLE public.user_progress TO authenticated;
GRANT ALL ON TABLE public.user_progress TO service_role;
GRANT SELECT ON TABLE public.user_progress TO analist;


--
-- Name: TABLE user_progress_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_progress_new TO anon;
GRANT ALL ON TABLE public.user_progress_new TO authenticated;
GRANT ALL ON TABLE public.user_progress_new TO service_role;
GRANT SELECT ON TABLE public.user_progress_new TO analist;


--
-- Name: TABLE user_sessions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_sessions TO anon;
GRANT ALL ON TABLE public.user_sessions TO authenticated;
GRANT ALL ON TABLE public.user_sessions TO service_role;
GRANT SELECT ON TABLE public.user_sessions TO analist;


--
-- Name: TABLE user_sessions_new; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_sessions_new TO anon;
GRANT ALL ON TABLE public.user_sessions_new TO authenticated;
GRANT ALL ON TABLE public.user_sessions_new TO service_role;
GRANT SELECT ON TABLE public.user_sessions_new TO analist;

-- Hoort bij handle_new_user hierboven. De trigger staat op auth.users en komt
-- daardoor niet mee in een dump van alleen het publieke schema. Zonder hem
-- krijgt een nieuwe leerling geen profiel.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- De dump zet het zoekpad leeg. Zet het terug, zodat de migraties hierna
-- (de oefenstof) hun tabellen vinden.
select pg_catalog.set_config('search_path', 'public', false);
