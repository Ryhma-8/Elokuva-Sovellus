-- PostgreSQL database dump (data removed)
-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

-- Table definitions
CREATE TABLE public."Account" (
    id integer NOT NULL,
    email character varying(30) NOT NULL,
    password character varying(255) NOT NULL,
    username character varying(30) NOT NULL,
    refreshtoken character varying(255)
);
ALTER TABLE public."Account" OWNER TO postgres;

ALTER TABLE public."Account" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Account_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

CREATE TABLE public."Favorites" (
    id integer NOT NULL,
    account_id integer NOT NULL,
    movie_id integer NOT NULL
);
ALTER TABLE public."Favorites" OWNER TO postgres;

ALTER TABLE public."Favorites" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

CREATE TABLE public."Group" (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    owner_id integer NOT NULL
);
ALTER TABLE public."Group" OWNER TO postgres;

ALTER TABLE public."Group" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

CREATE TABLE public."Group_members" (
    id integer NOT NULL,
    account_id integer NOT NULL,
    group_id integer NOT NULL
);
ALTER TABLE public."Group_members" OWNER TO postgres;

ALTER TABLE public."Group_members" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

CREATE TABLE public."Group_movies" (
    id integer NOT NULL,
    group_id integer NOT NULL,
    movie_id integer NOT NULL
);
ALTER TABLE public."Group_movies" OWNER TO postgres;

ALTER TABLE public."Group_movies" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_movies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

CREATE TABLE public."Group_requests" (
    id integer NOT NULL,
    group_id integer NOT NULL,
    account_id integer NOT NULL,
    requested_by integer,
    request_type character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT group_requests_request_type_check CHECK (((request_type)::text = ANY ((ARRAY['join_request'::character varying, 'invitation'::character varying])::text[]))),
    CONSTRAINT group_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[])))
);
ALTER TABLE public."Group_requests" OWNER TO postgres;

CREATE SEQUENCE public.group_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.group_requests_id_seq OWNER TO postgres;
ALTER SEQUENCE public.group_requests_id_seq OWNED BY public."Group_requests".id;

ALTER TABLE ONLY public."Group_requests" ALTER COLUMN id SET DEFAULT nextval('public.group_requests_id_seq'::regclass);

CREATE TABLE public."Presenting_times" (
    id integer NOT NULL,
    presenting_times_id integer NOT NULL,
    group_id integer NOT NULL,
    start timestamp with time zone,
    title text,
    theatre text,
    auditorium text,
    image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public."Presenting_times" OWNER TO postgres;

ALTER TABLE public."Presenting_times" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Presenting_times_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public."Reviews" (
    id integer NOT NULL,
    movie_id integer NOT NULL,
    account_id integer NOT NULL,
    description character varying NOT NULL,
    title character varying NOT NULL,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
ALTER TABLE public."Reviews" OWNER TO postgres;

ALTER TABLE public."Reviews" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);

-- Primary keys, unique constraints, and foreign keys
ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Favorites"
    ADD CONSTRAINT "Favorites_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Group_movies"
    ADD CONSTRAINT "Group_movies_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Group_members"
    ADD CONSTRAINT "Group_members_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Presenting_times"
    ADD CONSTRAINT "Presenting_times_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Group_requests"
    ADD CONSTRAINT group_requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT constraint_name UNIQUE (email);

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT group_name_unique UNIQUE (name);

-- Foreign keys
ALTER TABLE ONLY public."Favorites"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Group_members"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT owner_id FOREIGN KEY (owner_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Group_members"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Group_movies"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Presenting_times"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public."Group_requests"
    ADD CONSTRAINT group_requests_account_id_fkey FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Group_requests"
    ADD CONSTRAINT group_requests_group_id_fkey FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Group_requests"
    ADD CONSTRAINT group_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public."Account"(id);

-- PostgreSQL database dump complete (no data)
