CREATE DATABASE remind_me;

-- To allow us to utilize the UUID:
create extension if not exists "uuid-ossp";

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
    user_general_reminder_time TIMESTAMPTZ NOT NULL,
    user_time_zone INT NOT NULL,
    user_reset_pwd_url VARCHAR(255),
    user_reset_pwd_time TIMESTAMPTZ,
    user_incor_pwd_count INT NOT NULL,
    user_refresh_token VARCHAR(255),
    user_access_token VARCHAR(1023),
    PRIMARY KEY (user_id)
);

CREATE TABLE all_reminders(
    reminder_id SERIAL PRIMARY KEY NOT NULL,
    user_id UUID,
    reminder_completed BOOLEAN NOT NULL,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_sent BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE active_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN NOT NULL,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_sent BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);

CREATE TABLE completed_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN NOT NULL,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_sent BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);

CREATE TABLE overdue_reminders(
    reminder_local_id SERIAL PRIMARY KEY NOT NULL,
    reminder_id INTEGER NOT NULL UNIQUE,
    user_id UUID,
    reminder_completed BOOLEAN NOT NULL,
    reminder_title VARCHAR(100) NOT NULL,
    reminder_desc VARCHAR(1000),
    reminder_due_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_date TIMESTAMPTZ NOT NULL,
    reminder_reminder_sent BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reminder_id) REFERENCES all_reminders(reminder_id)
);
