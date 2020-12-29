CREATE DATABASE jwttutorial;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_f_name VARCHAR(255) NOT NULL,
    user_l_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_p_num CHAR(10),
    CONSTRAINT check_p_num CHECK (user_p_num NOT LIKE '%[^0-9]%'),
    user_pwd VARCHAR(255) NOT NULL
);


-- Inserting a test user:

INSERT INTO users (user_f_name, user_l_name, user_email, user_p_num, user_pwd)
VALUES ('test', 'user', 'tuser@gmail.com', '2065552951', 'testing123');
