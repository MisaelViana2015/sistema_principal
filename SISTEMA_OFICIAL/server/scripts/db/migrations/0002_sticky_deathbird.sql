CREATE TABLE IF NOT EXISTS "costs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shift_id" varchar,
	"tipo" text,
	"valor" numeric,
	"observacao" text,
	"hora" timestamp,
	"type_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fixed_cost_installments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"fixed_cost_id" varchar NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'Pendente' NOT NULL,
	"paid_amount" numeric(12, 2),
	"paid_date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fraud_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shift_id" varchar,
	"reason" text,
	"details" text,
	"severity" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintenances" (
	"id" varchar PRIMARY KEY NOT NULL,
	"vehicle_id" varchar,
	"descricao" text,
	"observacao" text,
	"tipo" text,
	"valor" numeric,
	"data" timestamp,
	"km_atual" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shift_cost_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text,
	"icon" text,
	"color_token" text,
	"is_default" boolean,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"level" text,
	"message" text,
	"meta" jsonb,
	"timestamp" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preventive_maintenances" (
	"id" varchar PRIMARY KEY NOT NULL,
	"vehicle_id" varchar,
	"maintenance_type" text,
	"last_km" real,
	"next_km" real,
	"last_date" timestamp,
	"next_date" timestamp,
	"status" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json,
	"expire" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid,
	"position" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"status" text NOT NULL,
	"install_date" timestamp NOT NULL,
	"install_km" integer NOT NULL,
	"cost" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_costs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"vehicle_id" varchar,
	"tipo" text,
	"descricao" text,
	"valor" numeric,
	"mes_referencia" text,
	"data_pagamento" timestamp,
	"status" text,
	"observacao" text,
	"data_referencia" timestamp,
	"valor_pago" numeric,
	"data_vencimento" timestamp
);
--> statement-breakpoint
ALTER TABLE "cost_types" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cost_types" ADD COLUMN "visible_to_driver" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cost_types" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "cost_types" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "is_particular" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "is_split_cost" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "cost_type_id" varchar;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "vehicle_id" varchar;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "vendor" text;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "total_installments" integer;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "fixed_costs" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN "total_custos_particular" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN "discount_company" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN "discount_driver" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "status" text DEFAULT 'ativo';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fixed_costs" ADD CONSTRAINT "fixed_costs_cost_type_id_cost_types_id_fk" FOREIGN KEY ("cost_type_id") REFERENCES "cost_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fixed_costs" ADD CONSTRAINT "fixed_costs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fixed_cost_installments" ADD CONSTRAINT "fixed_cost_installments_fixed_cost_id_fixed_costs_id_fk" FOREIGN KEY ("fixed_cost_id") REFERENCES "fixed_costs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tires" ADD CONSTRAINT "tires_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
