// Collegamento al database Supabase (progetto "assistente-locanda", tabelle peso_*).
// La chiave "publishable" è pensata per stare nel browser: i dati sono protetti dalle regole di
// accesso del database (solo il proprietario). Per cambiare database basta cambiare questi due valori
// e rilanciare lo schema in supabase/schema.sql.
export const SUPABASE_URL = "https://btknuzypyvcmjwmrktto.supabase.co";
export const SUPABASE_KEY = "sb_publishable_QHABoJr0jSfoJ8qUDLAHmg_Q4tSjpV5";

// Nome dell'app mostrato nell'intestazione e sul telefono (per cambiarlo: qui e in public/manifest.webmanifest).
export const APP_NAME = "Equilibrio";

// Unico indirizzo autorizzato: l'accesso con password usa sempre questo (vedi peso_claim_owner).
export const OWNER_EMAIL = "antonellobordoni@gmail.com";
