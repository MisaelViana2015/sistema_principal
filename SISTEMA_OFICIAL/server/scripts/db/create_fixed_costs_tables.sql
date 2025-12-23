-- Direct SQL to create fixed_costs tables
CREATE TABLE IF NOT EXISTS "fixed_costs" (
    "id" varchar PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "valor" numeric(12, 2) NOT NULL,
    "frequency" text DEFAULT 'Mensal' NOT NULL,
    "due_day" integer DEFAULT 5,
    "cost_type_id" varchar,
    "vehicle_id" uuid,
    "vendor" text,
    "total_installments" integer,
    "start_date" timestamp,
    "description" text,
    "is_active" boolean DEFAULT true
);
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
-- Add foreign key constraints
ALTER TABLE "fixed_costs"
ADD CONSTRAINT "fixed_costs_cost_type_id_cost_types_id_fk" FOREIGN KEY ("cost_type_id") REFERENCES "cost_types"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "fixed_costs"
ADD CONSTRAINT "fixed_costs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "fixed_cost_installments"
ADD CONSTRAINT "fixed_cost_installments_fixed_cost_id_fixed_costs_id_fk" FOREIGN KEY ("fixed_cost_id") REFERENCES "fixed_costs"("id") ON DELETE no action ON UPDATE no action;