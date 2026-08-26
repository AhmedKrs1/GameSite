--
-- PostgreSQL database dump
--

\restrict QVRTwDEBJhkTJf3E0rMGNMLe9aSCKqir8ZT1zWmn9MEjFn3wMo1hm7hT0sSbJur

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: game_stats; Type: TABLE; Schema: public; Owner: ahmedkorso
--

CREATE TABLE public.game_stats (
    id integer NOT NULL,
    user_id integer NOT NULL,
    game_name character varying(50) NOT NULL,
    games_played integer DEFAULT 0 NOT NULL,
    total_moves integer DEFAULT 0 NOT NULL,
    max_score integer DEFAULT 0
);


ALTER TABLE public.game_stats OWNER TO ahmedkorso;

--
-- Name: game_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: ahmedkorso
--

CREATE SEQUENCE public.game_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_stats_id_seq OWNER TO ahmedkorso;

--
-- Name: game_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ahmedkorso
--

ALTER SEQUENCE public.game_stats_id_seq OWNED BY public.game_stats.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ahmedkorso
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    email character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO ahmedkorso;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ahmedkorso
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ahmedkorso;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ahmedkorso
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: game_stats id; Type: DEFAULT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.game_stats ALTER COLUMN id SET DEFAULT nextval('public.game_stats_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: game_stats game_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT game_stats_pkey PRIMARY KEY (id);


--
-- Name: game_stats game_stats_user_id_game_name_key; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT game_stats_user_id_game_name_key UNIQUE (user_id, game_name);


--
-- Name: game_stats unique_user_game; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT unique_user_game UNIQUE (user_id, game_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: game_stats game_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ahmedkorso
--

ALTER TABLE ONLY public.game_stats
    ADD CONSTRAINT game_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict QVRTwDEBJhkTJf3E0rMGNMLe9aSCKqir8ZT1zWmn9MEjFn3wMo1hm7hT0sSbJur

