-- Pudotetaan vanhat taulut riippuvuuksineen
DROP TABLE IF EXISTS "Favorites" CASCADE;
DROP TABLE IF EXISTS "Group_members" CASCADE;
DROP TABLE IF EXISTS "Group_movies" CASCADE;
DROP TABLE IF EXISTS "Presenting_times" CASCADE;
DROP TABLE IF EXISTS "Reviews" CASCADE;
DROP TABLE IF EXISTS "Group" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;

-- Luodaan taulut
CREATE TABLE public."Account" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(30) NOT NULL,
    refreshToken VARCHAR(255)
);

CREATE TABLE public."Favorites" (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES public."Account"(id) ON DELETE CASCADE,
    movie_id INT NOT NULL
);

CREATE TABLE public."Group" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    owner_id INT NOT NULL REFERENCES public."Account"(id) ON DELETE CASCADE
);

CREATE TABLE public."Group_members" (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES public."Account"(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES public."Group"(id) ON DELETE CASCADE
);

CREATE TABLE public."Group_movies" (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES public."Group"(id) ON DELETE CASCADE,
    movie_id INT NOT NULL
);

CREATE TABLE public."Presenting_times" (
    id SERIAL PRIMARY KEY,
    presenting_times_id INT NOT NULL,
    group_id INT NOT NULL REFERENCES public."Group"(id) ON DELETE CASCADE
);

CREATE TABLE public."Reviews" (
    id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL,
    account_id INT NOT NULL REFERENCES public."Account"(id) ON DELETE CASCADE,
    description VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5)
);

-- ==============================================
-- TESTIDATA
-- ==============================================

-- Käyttäjät
INSERT INTO public."Account" (email, password, username, refreshToken) VALUES
('alice@example.com', 'hashed_pw1', 'alice', NULL),
('bob@example.com',   'hashed_pw2', 'bob',   NULL),
('carol@example.com', 'hashed_pw3', 'carol', NULL);

-- Suosikit
INSERT INTO public."Favorites" (account_id, movie_id) VALUES
(1, 101),
(1, 102),
(2, 201),
(3, 301);

-- Ryhmät
INSERT INTO public."Group" (name, owner_id) VALUES
('Movie Club', 1),
('Sci-Fi Fans', 2);

-- Ryhmän jäsenet
INSERT INTO public."Group_members" (account_id, group_id) VALUES
(1, 1), -- Alice Movie Club
(2, 1), -- Bob Movie Club
(2, 2), -- Bob Sci-Fi Fans
(3, 2); -- Carol Sci-Fi Fans

-- Ryhmän elokuvat
INSERT INTO public."Group_movies" (group_id, movie_id) VALUES
(1, 1001),
(1, 1002),
(2, 2001),
(2, 2002);

-- Esitysajat
INSERT INTO public."Presenting_times" (presenting_times_id, group_id) VALUES
(5001, 1),
(5002, 2);

-- Arvostelut
INSERT INTO public."Reviews" (movie_id, account_id, description, title, rating) VALUES
(101, 1, 'Hyvä elokuva, suosittelen!', 'Loistava leffa', 5),
(201, 2, 'Ihan ok, mutta ei suosikkini', 'Keskinkertainen', 3),
(2001, 3, 'Paras sci-fi pitkään aikaan!', 'Suosikki', 5),
(102, 1, 'Aika pitkäveteinen', 'Ei jatkoon', 2);