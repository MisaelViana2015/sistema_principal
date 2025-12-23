CREATE TABLE IF NOT EXISTS "cost_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Variável' NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" varchar PRIMARY KEY NOT NULL,
	"driver_id" varchar,
	"shift_id" varchar,
	"cost_type_id" varchar NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fixed_costs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"frequency" text DEFAULT 'Mensal' NOT NULL,
	"due_day" integer DEFAULT 5
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rides" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shift_id" varchar NOT NULL,
	"tipo" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"hora" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shifts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"driver_id" varchar NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"inicio" timestamp NOT NULL,
	"fim" timestamp,
	"km_inicial" real NOT NULL,
	"km_final" real,
	"status" text DEFAULT 'em_andamento' NOT NULL,
	"total_app" real DEFAULT 0,
	"total_particular" real DEFAULT 0,
	"total_bruto" real DEFAULT 0,
	"total_custos" real DEFAULT 0,
	"liquido" real DEFAULT 0,
	"repasse_empresa" real DEFAULT 0,
	"repasse_motorista" real DEFAULT 0,
	"total_corridas_app" integer DEFAULT 0,
	"total_corridas_particular" integer DEFAULT 0,
	"total_corridas" integer DEFAULT 0,
	"duracao_min" integer DEFAULT 0,
	"valor_km" real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" varchar PRIMARY KEY NOT NULL,
	"plate" text NOT NULL,
	"modelo" text NOT NULL,
	"motorista_padrao_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_shift_id" varchar,
	"km_inicial" real NOT NULL,
	"km_final" real,
	CONSTRAINT "vehicles_plate_key" UNIQUE("plate")
);
--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT IF EXISTS "drivers_email_unique";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_token_unique";
--> statement-breakpoint
ALTER TABLE "drivers"
ALTER COLUMN "id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "sessions"
ALTER COLUMN "id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN IF EXISTS "created_at";
--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN IF EXISTS "updated_at";
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_cost_type_id_cost_types_id_fk" FOREIGN KEY ("cost_type_id") REFERENCES "cost_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "drivers"
ADD CONSTRAINT "drivers_email_key" UNIQUE("email");
EXCEPTION
WHEN duplicate_object THEN null;
WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_token_key" UNIQUE("token");
EXCEPTION
WHEN duplicate_object THEN null;
WHEN duplicate_table THEN null;
END $$;