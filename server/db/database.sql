CREATE DATABASE remind_me;


CREATE TABLE users (
    user_id UUID DEFAULT uuid_generate_v4(),
    user_f_name VARCHAR(255) NOT NULL,
    user_l_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_cp_carrier VARCHAR(255),
    user_cp_carrier_email_extn VARCHAR(255),
    user_p_num CHAR(10),
    CONSTRAINT check_p_num CHECK (user_p_num NOT LIKE '%[^0-9]%'),
    user_pwd VARCHAR(255) NOT NULL,
    user_general_reminder_time INTEGER NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE all_reminders(
    reminder_id SERIAL PRIMARY KEY NOT NULL,
    user_id UUID,
    reminder_completed BOOLEAN,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE active_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);

CREATE TABLE completed_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);

CREATE TABLE overdue_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);





-- Inserting a test user:

INSERT INTO users (user_f_name, user_l_name, user_email, user_p_num, user_pwd)
VALUES ('jonh', 'doe', 'jdoe@gmail.com', '2535558979', 'testing123');

INSERT INTO all_reminders (user_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date) 
VALUES ('99e9a2f7-76d9-4343-ae46-a4759c470c71', FALSE, 'Order rental car', 'make sure to keep the receipt', '2021-01-02', '2021-01-02');

INSERT INTO active_reminders (reminder_id, user_id, reminder_completed, reminder_title, reminder_desc, reminder_due_date, reminder_reminder_date) 
VALUES (1, '99e9a2f7-76d9-4343-ae46-a4759c470c71', FALSE, 'Call Sacramento client', 'Finalize deal', '2021-01-04', '2021-01-04');

SELECT * FROM users INNER JOIN all_reminders ON users.user_id = all_reminders.user_id;

SELECT * FROM users LEFT JOIN all_reminders ON users.user_id = all_reminders.user_id;
