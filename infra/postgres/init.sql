-- Exécuté automatiquement au premier démarrage du conteneur Postgres.
-- La base `touribook` (auth) est créée via la variable POSTGRES_DB.
-- Une base par service = isolation des données (database-per-service).

CREATE DATABASE touribook_catalog;
CREATE DATABASE touribook_booking;
CREATE DATABASE touribook_payment;
CREATE DATABASE touribook_review;
