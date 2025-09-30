--
-- PostgreSQL database dump
--

\restrict kfQGNGkOStGBjqVVWgXPUKSVv52RdaldFhCjHh3qfneNE9ADzkmPfyFVW1gWc8G
-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-17 19:39:55

DROP TABLE IF EXISTS public."Reviews" CASCADE;
DROP TABLE IF EXISTS public."Presenting_times" CASCADE;
DROP TABLE IF EXISTS public."Group_movies" CASCADE;
DROP TABLE IF EXISTS public."Group_members" CASCADE;
DROP TABLE IF EXISTS public."Group" CASCADE;
DROP TABLE IF EXISTS public."Favorites" CASCADE;
DROP TABLE IF EXISTS public."Account" CASCADE;
DROP SEQUENCE IF EXISTS public."Account_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Favorites_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Group_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Group_members_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Group_movies_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Presenting_times_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS public."Reviews_id_seq" CASCADE;

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
-- TOC entry 217 (class 1259 OID 33613)
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id integer NOT NULL,
    email character varying(30) NOT NULL,
    password character varying(255) NOT NULL,
    username character varying(30) NOT NULL,
    refreshToken character varying(255)
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33616)
-- Name: Account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Account" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Account_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 33617)
-- Name: Favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Favorites" (
    id integer NOT NULL,
    account_id integer NOT NULL,
    movie_id integer NOT NULL,
    CONSTRAINT unique_favorite_per_user UNIQUE (account_id, movie_id)
);


ALTER TABLE public."Favorites" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33620)
-- Name: Favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Favorites" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 33621)
-- Name: Group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Group" (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    owner_id integer NOT NULL
);


ALTER TABLE public."Group" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33624)
-- Name: Group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Group" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 33625)
-- Name: Group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Group_members" (
    id integer NOT NULL,
    account_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public."Group_members" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33628)
-- Name: Group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Group_members" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 33629)
-- Name: Group_movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Group_movies" (
    id integer NOT NULL,
    group_id integer NOT NULL,
    movie_id integer NOT NULL
);


ALTER TABLE public."Group_movies" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33632)
-- Name: Group_movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Group_movies" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Group_movies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 33633)
-- Name: Presenting_times; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Presenting_times" (
    id integer NOT NULL,
    presenting_times_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public."Presenting_times" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33636)
-- Name: Presenting_times_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Presenting_times" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Presenting_times_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 33637)
-- Name: Reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reviews" (
    id integer NOT NULL,
    movie_id integer NOT NULL,
    account_id integer NOT NULL,
    description character varying NOT NULL,
    title character varying NOT NULL,
    rating integer,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public."Reviews"
  ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);


ALTER TABLE public."Reviews" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33642)
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Reviews" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000
    CACHE 1
);


CREATE TABLE group_requests (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES "Group"(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES "Account"(id) ON DELETE CASCADE,
    requested_by INT REFERENCES "Account"(id),
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('join_request', 'invitation')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending','accepted','rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

--
-- TOC entry 4938 (class 0 OID 33613)
-- Dependencies: 217
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, email, password, username) FROM stdin;
4	test@example.com	$2b$11$vis/VMF9Q9cxLa8YLZYuLeiDZo.rxsiC3UEX8p.ctx9OhwTQ6yPGi	testuser
5	test1@example.com	$2b$11$Rnotrqklj3H6qiqQ0gNRne0mNpxdKHB.esyh41CRSTBRZ9yxeksJG	testuser
6	test2@example.com	$2b$11$alub4pvQr/9XYf.aCln3EeplnvqMBQ/ihwoI77VBKRo2i3vxCvCKu	testuser
8	test3@example.com	$2b$11$Yn9i2UuJxs5G0qBkLxNaL.mwqI5WPYTUT2zW8pr4d6qBwrQGvhFPW	testuser
9	test5@example.com	$2b$11$LoO/5wA5twpHKMkJ/vl6Iuwe851tZ90joJ36XU/2HU4qsbvRQbwA.	testuser
10	test6@example.com	$2b$11$gHDI55tGsdJOETeWTEgBQu9WFtj4ZAwfHEMtl4rKLtRABYquCM9JO	testuser
12	test11@example.com	$2b$11$pcdxg7b3.RSjJqZ1GKb7COoVqRjgmRzPB/TBzWMCex2dff03mcHFW	testuser
13	test0@example.com	$2b$11$QIfzKekyFPK1qlUjoPFAh.VHIYwcACkeqJ1N5.kbivEUfLaTEVt2i	testuser
15	test01@example.com	$2b$11$p6awMonCpgTWPg2POqmuPubjwOfV6j8AMluqFWD0wAu.nJ1YXRtwK	testuser1
\.


--
-- TOC entry 4940 (class 0 OID 33617)
-- Dependencies: 219
-- Data for Name: Favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Favorites" (id, account_id, movie_id) FROM stdin;
\.


--
-- TOC entry 4942 (class 0 OID 33621)
-- Dependencies: 221
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Group" (id, name, owner_id) FROM stdin;
\.


--
-- TOC entry 4944 (class 0 OID 33625)
-- Dependencies: 223
-- Data for Name: Group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Group_members" (id, account_id, group_id) FROM stdin;
\.


--
-- TOC entry 4946 (class 0 OID 33629)
-- Dependencies: 225
-- Data for Name: Group_movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Group_movies" (id, group_id, movie_id) FROM stdin;
\.


--
-- TOC entry 4948 (class 0 OID 33633)
-- Dependencies: 227
-- Data for Name: Presenting_times; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Presenting_times" (id, presenting_times_id, group_id) FROM stdin;
\.


--
-- TOC entry 4950 (class 0 OID 33637)
-- Dependencies: 229
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, movie_id, account_id, description, title) FROM stdin;
\.


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 218
-- Name: Account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Account_id_seq"', 15, true);


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 220
-- Name: Favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Favorites_id_seq"', 1, false);


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 222
-- Name: Group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Group_id_seq"', 1, false);


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 224
-- Name: Group_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Group_members_id_seq"', 1, false);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 226
-- Name: Group_movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Group_movies_id_seq"', 1, false);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 228
-- Name: Presenting_times_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Presenting_times_id_seq"', 1, false);


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 230
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- TOC entry 4773 (class 2606 OID 33644)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 33646)
-- Name: Favorites Favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorites"
    ADD CONSTRAINT "Favorites_pkey" PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 33648)
-- Name: Group_movies Group_movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group_movies"
    ADD CONSTRAINT "Group_movies_pkey" PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 33650)
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 33652)
-- Name: Presenting_times Presenting_times_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Presenting_times"
    ADD CONSTRAINT "Presenting_times_pkey" PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 33654)
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 33691)
-- Name: Account constraint_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT constraint_name UNIQUE (email);


--
-- TOC entry 4788 (class 2606 OID 33655)
-- Name: Group_members account_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group_members"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4786 (class 2606 OID 33660)
-- Name: Favorites account_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorites"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4792 (class 2606 OID 33665)
-- Name: Reviews account_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4789 (class 2606 OID 33670)
-- Name: Group_members group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group_members"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4790 (class 2606 OID 33675)
-- Name: Group_movies group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group_movies"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4791 (class 2606 OID 33680)
-- Name: Presenting_times group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Presenting_times"
    ADD CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- TOC entry 4787 (class 2606 OID 33685)
-- Name: Group owner_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT owner_id FOREIGN KEY (owner_id) REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


-- Completed on 2025-09-17 19:39:55

--
-- PostgreSQL database dump complete
--

\unrestrict kfQGNGkOStGBjqVVWgXPUKSVv52RdaldFhCjHh3qfneNE9ADzkmPfyFVW1gWc8G

