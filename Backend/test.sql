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
    movie_id INT NOT NULL,
    CONSTRAINT unique_favorite_per_user UNIQUE (account_id, movie_id)
);

CREATE TABLE public."Group" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    owner_id INT NOT NULL REFERENCES public."Account"(id) ON DELETE CASCADE
    CONSTRAINT group_name_unique UNIQUE (name)
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

CREATE TABLE public."Group_requests" (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES "Group"(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES "Account"(id) ON DELETE CASCADE,
    requested_by INT REFERENCES "Account"(id),
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('join_request', 'invitation')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending','accepted','rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
