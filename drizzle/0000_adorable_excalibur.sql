CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"line_id" varchar(255),
	"google_id" varchar(255),
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email"),
	CONSTRAINT "admins_line_id_unique" UNIQUE("line_id"),
	CONSTRAINT "admins_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"contact" varchar(255),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"line_message_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'received' NOT NULL,
	"drive_file_id" varchar(255),
	"original_filename" varchar(255),
	"mime_type" varchar(255),
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_line_message_id_unique" UNIQUE("line_message_id")
);
--> statement-breakpoint
CREATE TABLE "group_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"line_group_id" varchar(255) NOT NULL,
	"name" varchar(255),
	"status" varchar(50) DEFAULT 'initializing' NOT NULL,
	"drive_folder_id" varchar(255),
	"color" varchar(50) DEFAULT 'blue' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "groups_line_group_id_unique" UNIQUE("line_group_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp,
	"heartbeat_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_file_id_unique" UNIQUE("file_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"admin_id" integer PRIMARY KEY NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"scopes" text NOT NULL,
	"key_version" varchar(50) DEFAULT 'v1' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_admins" ADD CONSTRAINT "group_admins_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_admins" ADD CONSTRAINT "group_admins_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;