CREATE TABLE cellphone_carriers (
    carrier_name VARCHAR(255) NOT NULL PRIMARY KEY UNIQUE,
    carrier_email_extension VARCHAR(255) NOT NULL
);

COPY cellphone_carriers FROM 'C:\Users\Brook\Desktop\cellphone_carriers.csv' WITH CSV HEADER;