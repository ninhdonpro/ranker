import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Payload không tự tạo schema riêng (schemaName: 'ranker'): tạo trước khi tạo bảng.
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "ranker";`)
  await db.execute(sql`
   CREATE TYPE "ranker"."_locales" AS ENUM('vi', 'en');
  CREATE TYPE "ranker"."enum_lists_list_type" AS ENUM('permanent', 'event');
  CREATE TYPE "ranker"."enum_lists_ranking_mode" AS ENUM('manual', 'votes');
  CREATE TYPE "ranker"."enum_lists_status" AS ENUM('draft', 'published');
  CREATE TYPE "ranker"."enum__lists_v_version_list_type" AS ENUM('permanent', 'event');
  CREATE TYPE "ranker"."enum__lists_v_version_ranking_mode" AS ENUM('manual', 'votes');
  CREATE TYPE "ranker"."enum__lists_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "ranker"."enum__lists_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "ranker"."enum_items_blocks_place_price_range" AS ENUM('budget', 'moderate', 'upscale', 'luxury');
  CREATE TYPE "ranker"."enum_items_blocks_creative_work_work_type" AS ENUM('movie', 'series', 'book', 'song', 'album', 'game', 'show');
  CREATE TYPE "ranker"."enum_items_gallery_kind" AS ENUM('image', 'video');
  CREATE TYPE "ranker"."enum_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "ranker"."enum__items_v_blocks_place_price_range" AS ENUM('budget', 'moderate', 'upscale', 'luxury');
  CREATE TYPE "ranker"."enum__items_v_blocks_creative_work_work_type" AS ENUM('movie', 'series', 'book', 'song', 'album', 'game', 'show');
  CREATE TYPE "ranker"."enum__items_v_version_gallery_kind" AS ENUM('image', 'video');
  CREATE TYPE "ranker"."enum__items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "ranker"."enum__items_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "ranker"."enum_categories_item_route" AS ENUM('review', 'wiki');
  CREATE TYPE "ranker"."enum_categories_color" AS ENUM('tech', 'food', 'beauty', 'finance', 'travel', 'film', 'music', 'education');
  CREATE TYPE "ranker"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "ranker"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TABLE "ranker"."lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_image_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"url" varchar,
  	"category_id" integer,
  	"list_type" "ranker"."enum_lists_list_type" DEFAULT 'permanent',
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"ranking_mode" "ranker"."enum_lists_ranking_mode" DEFAULT 'manual',
  	"author_id" integer,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "ranker"."enum_lists_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "ranker"."lists_locales" (
  	"title" varchar,
  	"intro" jsonb,
  	"rules" varchar,
  	"item_noun" varchar DEFAULT 'mục',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."_lists_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_image_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_url" varchar,
  	"version_category_id" integer,
  	"version_list_type" "ranker"."enum__lists_v_version_list_type" DEFAULT 'permanent',
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_ranking_mode" "ranker"."enum__lists_v_version_ranking_mode" DEFAULT 'manual',
  	"version_author_id" integer,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "ranker"."enum__lists_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "ranker"."enum__lists_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "ranker"."_lists_v_locales" (
  	"version_title" varchar,
  	"version_intro" jsonb,
  	"version_rules" varchar,
  	"version_item_noun" varchar DEFAULT 'mục',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."items_blocks_product" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"brand" varchar,
  	"model" varchar,
  	"price" numeric,
  	"release_date" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."items_blocks_place" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"address" varchar,
  	"district" varchar,
  	"city" varchar,
  	"price_range" "ranker"."enum_items_blocks_place_price_range",
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."items_blocks_creative_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"work_type" "ranker"."enum_items_blocks_creative_work_work_type",
  	"year" numeric,
  	"creators" varchar,
  	"cast" varchar,
  	"genres" varchar,
  	"duration_minutes" numeric,
  	"release_date" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."items_blocks_person" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"birth_year" numeric,
  	"profession" varchar,
  	"hometown" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."items_blocks_organization" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"founded_year" numeric,
  	"headquarters" varchar,
  	"website" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."items_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "ranker"."items_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "ranker"."enum_items_gallery_kind" DEFAULT 'image',
  	"image_id" integer,
  	"video_url" varchar
  );
  
  CREATE TABLE "ranker"."items_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ranker"."items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"category_id" integer,
  	"url" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "ranker"."enum_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "ranker"."items_locales" (
  	"name" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."_items_v_blocks_product" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand" varchar,
  	"model" varchar,
  	"price" numeric,
  	"release_date" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_blocks_place" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"address" varchar,
  	"district" varchar,
  	"city" varchar,
  	"price_range" "ranker"."enum__items_v_blocks_place_price_range",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_blocks_creative_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"work_type" "ranker"."enum__items_v_blocks_creative_work_work_type",
  	"year" numeric,
  	"creators" varchar,
  	"cast" varchar,
  	"genres" varchar,
  	"duration_minutes" numeric,
  	"release_date" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_blocks_person" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"birth_year" numeric,
  	"profession" varchar,
  	"hometown" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_blocks_organization" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"founded_year" numeric,
  	"headquarters" varchar,
  	"website" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "ranker"."enum__items_v_version_gallery_kind" DEFAULT 'image',
  	"image_id" integer,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "ranker"."_items_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_url" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "ranker"."enum__items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "ranker"."enum__items_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "ranker"."_items_v_locales" (
  	"version_name" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."categories_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "ranker"."categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "ranker"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"item_route" "ranker"."enum_categories_item_route",
  	"path" varchar,
  	"level" numeric,
  	"group_id" integer,
  	"icon" varchar,
  	"color" "ranker"."enum_categories_color",
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."categories_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"about" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "ranker"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"avatar_id" integer,
  	"role" "ranker"."enum_users_role" DEFAULT 'editor',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "ranker"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"prefix" varchar DEFAULT 'dev',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "ranker"."media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_entries_entries_order" varchar,
  	"list_id" integer NOT NULL,
  	"item_id" integer NOT NULL,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."entries_locales" (
  	"blurb" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ranker"."redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "ranker"."enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lists_id" integer,
  	"items_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "ranker"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "ranker"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lists_id" integer,
  	"items_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"media_id" integer,
  	"entries_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "ranker"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "ranker"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "ranker"."lists" ADD CONSTRAINT "lists_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists" ADD CONSTRAINT "lists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists" ADD CONSTRAINT "lists_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists" ADD CONSTRAINT "lists_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists" ADD CONSTRAINT "lists_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists_locales" ADD CONSTRAINT "lists_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."lists_locales" ADD CONSTRAINT "lists_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_parent_id_lists_id_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v" ADD CONSTRAINT "_lists_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v_locales" ADD CONSTRAINT "_lists_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_lists_v_locales" ADD CONSTRAINT "_lists_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_lists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_blocks_product" ADD CONSTRAINT "items_blocks_product_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_blocks_place" ADD CONSTRAINT "items_blocks_place_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_blocks_creative_work" ADD CONSTRAINT "items_blocks_creative_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_blocks_person" ADD CONSTRAINT "items_blocks_person_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_blocks_organization" ADD CONSTRAINT "items_blocks_organization_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_facts" ADD CONSTRAINT "items_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_gallery" ADD CONSTRAINT "items_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items_gallery" ADD CONSTRAINT "items_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items_gallery_locales" ADD CONSTRAINT "items_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."items" ADD CONSTRAINT "items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items" ADD CONSTRAINT "items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items" ADD CONSTRAINT "items_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items_locales" ADD CONSTRAINT "items_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."items_locales" ADD CONSTRAINT "items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_blocks_product" ADD CONSTRAINT "_items_v_blocks_product_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_blocks_place" ADD CONSTRAINT "_items_v_blocks_place_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_blocks_creative_work" ADD CONSTRAINT "_items_v_blocks_creative_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_blocks_person" ADD CONSTRAINT "_items_v_blocks_person_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_blocks_organization" ADD CONSTRAINT "_items_v_blocks_organization_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_version_facts" ADD CONSTRAINT "_items_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_version_gallery" ADD CONSTRAINT "_items_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_version_gallery" ADD CONSTRAINT "_items_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_version_gallery_locales" ADD CONSTRAINT "_items_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v" ADD CONSTRAINT "_items_v_parent_id_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v" ADD CONSTRAINT "_items_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v" ADD CONSTRAINT "_items_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v" ADD CONSTRAINT "_items_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v" ADD CONSTRAINT "_items_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_locales" ADD CONSTRAINT "_items_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_items_v_locales" ADD CONSTRAINT "_items_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."categories_faq" ADD CONSTRAINT "categories_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."categories" ADD CONSTRAINT "categories_group_id_categories_id_fk" FOREIGN KEY ("group_id") REFERENCES "ranker"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."categories" ADD CONSTRAINT "categories_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."categories" ADD CONSTRAINT "categories_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "ranker"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."media" ADD CONSTRAINT "media_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."entries" ADD CONSTRAINT "entries_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "ranker"."lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."entries" ADD CONSTRAINT "entries_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "ranker"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."entries" ADD CONSTRAINT "entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."entries" ADD CONSTRAINT "entries_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."entries_locales" ADD CONSTRAINT "entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."redirects_rels" ADD CONSTRAINT "redirects_rels_lists_fk" FOREIGN KEY ("lists_id") REFERENCES "ranker"."lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."redirects_rels" ADD CONSTRAINT "redirects_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."redirects_rels" ADD CONSTRAINT "redirects_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "ranker"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lists_fk" FOREIGN KEY ("lists_id") REFERENCES "ranker"."lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "ranker"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "ranker"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "ranker"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "ranker"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entries_fk" FOREIGN KEY ("entries_id") REFERENCES "ranker"."entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "ranker"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ranker"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "ranker"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lists_cover_image_idx" ON "ranker"."lists" USING btree ("cover_image_id");
  CREATE UNIQUE INDEX "lists_slug_idx" ON "ranker"."lists" USING btree ("slug");
  CREATE INDEX "lists_url_idx" ON "ranker"."lists" USING btree ("url");
  CREATE INDEX "lists_category_idx" ON "ranker"."lists" USING btree ("category_id");
  CREATE INDEX "lists_author_idx" ON "ranker"."lists" USING btree ("author_id");
  CREATE INDEX "lists_created_by_idx" ON "ranker"."lists" USING btree ("created_by_id");
  CREATE INDEX "lists_updated_by_idx" ON "ranker"."lists" USING btree ("updated_by_id");
  CREATE INDEX "lists_updated_at_idx" ON "ranker"."lists" USING btree ("updated_at");
  CREATE INDEX "lists_created_at_idx" ON "ranker"."lists" USING btree ("created_at");
  CREATE INDEX "lists__status_idx" ON "ranker"."lists" USING btree ("_status");
  CREATE INDEX "lists_meta_meta_image_idx" ON "ranker"."lists_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "lists_locales_locale_parent_id_unique" ON "ranker"."lists_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_lists_v_parent_idx" ON "ranker"."_lists_v" USING btree ("parent_id");
  CREATE INDEX "_lists_v_version_version_cover_image_idx" ON "ranker"."_lists_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_lists_v_version_version_slug_idx" ON "ranker"."_lists_v" USING btree ("version_slug");
  CREATE INDEX "_lists_v_version_version_url_idx" ON "ranker"."_lists_v" USING btree ("version_url");
  CREATE INDEX "_lists_v_version_version_category_idx" ON "ranker"."_lists_v" USING btree ("version_category_id");
  CREATE INDEX "_lists_v_version_version_author_idx" ON "ranker"."_lists_v" USING btree ("version_author_id");
  CREATE INDEX "_lists_v_version_version_created_by_idx" ON "ranker"."_lists_v" USING btree ("version_created_by_id");
  CREATE INDEX "_lists_v_version_version_updated_by_idx" ON "ranker"."_lists_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_lists_v_version_version_updated_at_idx" ON "ranker"."_lists_v" USING btree ("version_updated_at");
  CREATE INDEX "_lists_v_version_version_created_at_idx" ON "ranker"."_lists_v" USING btree ("version_created_at");
  CREATE INDEX "_lists_v_version_version__status_idx" ON "ranker"."_lists_v" USING btree ("version__status");
  CREATE INDEX "_lists_v_created_at_idx" ON "ranker"."_lists_v" USING btree ("created_at");
  CREATE INDEX "_lists_v_updated_at_idx" ON "ranker"."_lists_v" USING btree ("updated_at");
  CREATE INDEX "_lists_v_snapshot_idx" ON "ranker"."_lists_v" USING btree ("snapshot");
  CREATE INDEX "_lists_v_published_locale_idx" ON "ranker"."_lists_v" USING btree ("published_locale");
  CREATE INDEX "_lists_v_latest_idx" ON "ranker"."_lists_v" USING btree ("latest");
  CREATE INDEX "_lists_v_version_meta_version_meta_image_idx" ON "ranker"."_lists_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_lists_v_locales_locale_parent_id_unique" ON "ranker"."_lists_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "items_blocks_product_order_idx" ON "ranker"."items_blocks_product" USING btree ("_order");
  CREATE INDEX "items_blocks_product_parent_id_idx" ON "ranker"."items_blocks_product" USING btree ("_parent_id");
  CREATE INDEX "items_blocks_product_path_idx" ON "ranker"."items_blocks_product" USING btree ("_path");
  CREATE INDEX "items_blocks_place_order_idx" ON "ranker"."items_blocks_place" USING btree ("_order");
  CREATE INDEX "items_blocks_place_parent_id_idx" ON "ranker"."items_blocks_place" USING btree ("_parent_id");
  CREATE INDEX "items_blocks_place_path_idx" ON "ranker"."items_blocks_place" USING btree ("_path");
  CREATE INDEX "items_blocks_creative_work_order_idx" ON "ranker"."items_blocks_creative_work" USING btree ("_order");
  CREATE INDEX "items_blocks_creative_work_parent_id_idx" ON "ranker"."items_blocks_creative_work" USING btree ("_parent_id");
  CREATE INDEX "items_blocks_creative_work_path_idx" ON "ranker"."items_blocks_creative_work" USING btree ("_path");
  CREATE INDEX "items_blocks_person_order_idx" ON "ranker"."items_blocks_person" USING btree ("_order");
  CREATE INDEX "items_blocks_person_parent_id_idx" ON "ranker"."items_blocks_person" USING btree ("_parent_id");
  CREATE INDEX "items_blocks_person_path_idx" ON "ranker"."items_blocks_person" USING btree ("_path");
  CREATE INDEX "items_blocks_organization_order_idx" ON "ranker"."items_blocks_organization" USING btree ("_order");
  CREATE INDEX "items_blocks_organization_parent_id_idx" ON "ranker"."items_blocks_organization" USING btree ("_parent_id");
  CREATE INDEX "items_blocks_organization_path_idx" ON "ranker"."items_blocks_organization" USING btree ("_path");
  CREATE INDEX "items_facts_order_idx" ON "ranker"."items_facts" USING btree ("_order");
  CREATE INDEX "items_facts_parent_id_idx" ON "ranker"."items_facts" USING btree ("_parent_id");
  CREATE INDEX "items_facts_locale_idx" ON "ranker"."items_facts" USING btree ("_locale");
  CREATE INDEX "items_gallery_order_idx" ON "ranker"."items_gallery" USING btree ("_order");
  CREATE INDEX "items_gallery_parent_id_idx" ON "ranker"."items_gallery" USING btree ("_parent_id");
  CREATE INDEX "items_gallery_image_idx" ON "ranker"."items_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "items_gallery_locales_locale_parent_id_unique" ON "ranker"."items_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "items_image_idx" ON "ranker"."items" USING btree ("image_id");
  CREATE UNIQUE INDEX "items_slug_idx" ON "ranker"."items" USING btree ("slug");
  CREATE INDEX "items_category_idx" ON "ranker"."items" USING btree ("category_id");
  CREATE INDEX "items_url_idx" ON "ranker"."items" USING btree ("url");
  CREATE INDEX "items_created_by_idx" ON "ranker"."items" USING btree ("created_by_id");
  CREATE INDEX "items_updated_by_idx" ON "ranker"."items" USING btree ("updated_by_id");
  CREATE INDEX "items_updated_at_idx" ON "ranker"."items" USING btree ("updated_at");
  CREATE INDEX "items_created_at_idx" ON "ranker"."items" USING btree ("created_at");
  CREATE INDEX "items__status_idx" ON "ranker"."items" USING btree ("_status");
  CREATE INDEX "items_meta_meta_image_idx" ON "ranker"."items_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "items_locales_locale_parent_id_unique" ON "ranker"."items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_items_v_blocks_product_order_idx" ON "ranker"."_items_v_blocks_product" USING btree ("_order");
  CREATE INDEX "_items_v_blocks_product_parent_id_idx" ON "ranker"."_items_v_blocks_product" USING btree ("_parent_id");
  CREATE INDEX "_items_v_blocks_product_path_idx" ON "ranker"."_items_v_blocks_product" USING btree ("_path");
  CREATE INDEX "_items_v_blocks_place_order_idx" ON "ranker"."_items_v_blocks_place" USING btree ("_order");
  CREATE INDEX "_items_v_blocks_place_parent_id_idx" ON "ranker"."_items_v_blocks_place" USING btree ("_parent_id");
  CREATE INDEX "_items_v_blocks_place_path_idx" ON "ranker"."_items_v_blocks_place" USING btree ("_path");
  CREATE INDEX "_items_v_blocks_creative_work_order_idx" ON "ranker"."_items_v_blocks_creative_work" USING btree ("_order");
  CREATE INDEX "_items_v_blocks_creative_work_parent_id_idx" ON "ranker"."_items_v_blocks_creative_work" USING btree ("_parent_id");
  CREATE INDEX "_items_v_blocks_creative_work_path_idx" ON "ranker"."_items_v_blocks_creative_work" USING btree ("_path");
  CREATE INDEX "_items_v_blocks_person_order_idx" ON "ranker"."_items_v_blocks_person" USING btree ("_order");
  CREATE INDEX "_items_v_blocks_person_parent_id_idx" ON "ranker"."_items_v_blocks_person" USING btree ("_parent_id");
  CREATE INDEX "_items_v_blocks_person_path_idx" ON "ranker"."_items_v_blocks_person" USING btree ("_path");
  CREATE INDEX "_items_v_blocks_organization_order_idx" ON "ranker"."_items_v_blocks_organization" USING btree ("_order");
  CREATE INDEX "_items_v_blocks_organization_parent_id_idx" ON "ranker"."_items_v_blocks_organization" USING btree ("_parent_id");
  CREATE INDEX "_items_v_blocks_organization_path_idx" ON "ranker"."_items_v_blocks_organization" USING btree ("_path");
  CREATE INDEX "_items_v_version_facts_order_idx" ON "ranker"."_items_v_version_facts" USING btree ("_order");
  CREATE INDEX "_items_v_version_facts_parent_id_idx" ON "ranker"."_items_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_items_v_version_facts_locale_idx" ON "ranker"."_items_v_version_facts" USING btree ("_locale");
  CREATE INDEX "_items_v_version_gallery_order_idx" ON "ranker"."_items_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_items_v_version_gallery_parent_id_idx" ON "ranker"."_items_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_items_v_version_gallery_image_idx" ON "ranker"."_items_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_items_v_version_gallery_locales_locale_parent_id_unique" ON "ranker"."_items_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_items_v_parent_idx" ON "ranker"."_items_v" USING btree ("parent_id");
  CREATE INDEX "_items_v_version_version_image_idx" ON "ranker"."_items_v" USING btree ("version_image_id");
  CREATE INDEX "_items_v_version_version_slug_idx" ON "ranker"."_items_v" USING btree ("version_slug");
  CREATE INDEX "_items_v_version_version_category_idx" ON "ranker"."_items_v" USING btree ("version_category_id");
  CREATE INDEX "_items_v_version_version_url_idx" ON "ranker"."_items_v" USING btree ("version_url");
  CREATE INDEX "_items_v_version_version_created_by_idx" ON "ranker"."_items_v" USING btree ("version_created_by_id");
  CREATE INDEX "_items_v_version_version_updated_by_idx" ON "ranker"."_items_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_items_v_version_version_updated_at_idx" ON "ranker"."_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_items_v_version_version_created_at_idx" ON "ranker"."_items_v" USING btree ("version_created_at");
  CREATE INDEX "_items_v_version_version__status_idx" ON "ranker"."_items_v" USING btree ("version__status");
  CREATE INDEX "_items_v_created_at_idx" ON "ranker"."_items_v" USING btree ("created_at");
  CREATE INDEX "_items_v_updated_at_idx" ON "ranker"."_items_v" USING btree ("updated_at");
  CREATE INDEX "_items_v_snapshot_idx" ON "ranker"."_items_v" USING btree ("snapshot");
  CREATE INDEX "_items_v_published_locale_idx" ON "ranker"."_items_v" USING btree ("published_locale");
  CREATE INDEX "_items_v_latest_idx" ON "ranker"."_items_v" USING btree ("latest");
  CREATE INDEX "_items_v_version_meta_version_meta_image_idx" ON "ranker"."_items_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_items_v_locales_locale_parent_id_unique" ON "ranker"."_items_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_faq_order_idx" ON "ranker"."categories_faq" USING btree ("_order");
  CREATE INDEX "categories_faq_parent_id_idx" ON "ranker"."categories_faq" USING btree ("_parent_id");
  CREATE INDEX "categories_faq_locale_idx" ON "ranker"."categories_faq" USING btree ("_locale");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "ranker"."categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "ranker"."categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "ranker"."categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories__order_idx" ON "ranker"."categories" USING btree ("_order");
  CREATE INDEX "categories_slug_idx" ON "ranker"."categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "ranker"."categories" USING btree ("parent_id");
  CREATE UNIQUE INDEX "categories_path_idx" ON "ranker"."categories" USING btree ("path");
  CREATE INDEX "categories_level_idx" ON "ranker"."categories" USING btree ("level");
  CREATE INDEX "categories_group_idx" ON "ranker"."categories" USING btree ("group_id");
  CREATE INDEX "categories_created_by_idx" ON "ranker"."categories" USING btree ("created_by_id");
  CREATE INDEX "categories_updated_by_idx" ON "ranker"."categories" USING btree ("updated_by_id");
  CREATE INDEX "categories_updated_at_idx" ON "ranker"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "ranker"."categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "ranker"."categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "ranker"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "ranker"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "ranker"."users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "ranker"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "ranker"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "ranker"."users" USING btree ("email");
  CREATE INDEX "media_created_by_idx" ON "ranker"."media" USING btree ("created_by_id");
  CREATE INDEX "media_updated_by_idx" ON "ranker"."media" USING btree ("updated_by_id");
  CREATE INDEX "media_updated_at_idx" ON "ranker"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "ranker"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "ranker"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "ranker"."media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "ranker"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "ranker"."media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "ranker"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "entries__entries_entries_order_idx" ON "ranker"."entries" USING btree ("_entries_entries_order");
  CREATE INDEX "entries_list_idx" ON "ranker"."entries" USING btree ("list_id");
  CREATE INDEX "entries_item_idx" ON "ranker"."entries" USING btree ("item_id");
  CREATE INDEX "entries_created_by_idx" ON "ranker"."entries" USING btree ("created_by_id");
  CREATE INDEX "entries_updated_by_idx" ON "ranker"."entries" USING btree ("updated_by_id");
  CREATE INDEX "entries_updated_at_idx" ON "ranker"."entries" USING btree ("updated_at");
  CREATE INDEX "entries_created_at_idx" ON "ranker"."entries" USING btree ("created_at");
  CREATE UNIQUE INDEX "list_item_idx" ON "ranker"."entries" USING btree ("list_id","item_id");
  CREATE UNIQUE INDEX "entries_locales_locale_parent_id_unique" ON "ranker"."entries_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "ranker"."redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "ranker"."redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "ranker"."redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "ranker"."redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "ranker"."redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "ranker"."redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_lists_id_idx" ON "ranker"."redirects_rels" USING btree ("lists_id");
  CREATE INDEX "redirects_rels_items_id_idx" ON "ranker"."redirects_rels" USING btree ("items_id");
  CREATE INDEX "redirects_rels_categories_id_idx" ON "ranker"."redirects_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "ranker"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "ranker"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "ranker"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "ranker"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_lists_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("lists_id");
  CREATE INDEX "payload_locked_documents_rels_items_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("items_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_entries_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("entries_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "ranker"."payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "ranker"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "ranker"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "ranker"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "ranker"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "ranker"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "ranker"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "ranker"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "ranker"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "ranker"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ranker"."lists" CASCADE;
  DROP TABLE "ranker"."lists_locales" CASCADE;
  DROP TABLE "ranker"."_lists_v" CASCADE;
  DROP TABLE "ranker"."_lists_v_locales" CASCADE;
  DROP TABLE "ranker"."items_blocks_product" CASCADE;
  DROP TABLE "ranker"."items_blocks_place" CASCADE;
  DROP TABLE "ranker"."items_blocks_creative_work" CASCADE;
  DROP TABLE "ranker"."items_blocks_person" CASCADE;
  DROP TABLE "ranker"."items_blocks_organization" CASCADE;
  DROP TABLE "ranker"."items_facts" CASCADE;
  DROP TABLE "ranker"."items_gallery" CASCADE;
  DROP TABLE "ranker"."items_gallery_locales" CASCADE;
  DROP TABLE "ranker"."items" CASCADE;
  DROP TABLE "ranker"."items_locales" CASCADE;
  DROP TABLE "ranker"."_items_v_blocks_product" CASCADE;
  DROP TABLE "ranker"."_items_v_blocks_place" CASCADE;
  DROP TABLE "ranker"."_items_v_blocks_creative_work" CASCADE;
  DROP TABLE "ranker"."_items_v_blocks_person" CASCADE;
  DROP TABLE "ranker"."_items_v_blocks_organization" CASCADE;
  DROP TABLE "ranker"."_items_v_version_facts" CASCADE;
  DROP TABLE "ranker"."_items_v_version_gallery" CASCADE;
  DROP TABLE "ranker"."_items_v_version_gallery_locales" CASCADE;
  DROP TABLE "ranker"."_items_v" CASCADE;
  DROP TABLE "ranker"."_items_v_locales" CASCADE;
  DROP TABLE "ranker"."categories_faq" CASCADE;
  DROP TABLE "ranker"."categories_breadcrumbs" CASCADE;
  DROP TABLE "ranker"."categories" CASCADE;
  DROP TABLE "ranker"."categories_locales" CASCADE;
  DROP TABLE "ranker"."users_sessions" CASCADE;
  DROP TABLE "ranker"."users" CASCADE;
  DROP TABLE "ranker"."media" CASCADE;
  DROP TABLE "ranker"."media_locales" CASCADE;
  DROP TABLE "ranker"."entries" CASCADE;
  DROP TABLE "ranker"."entries_locales" CASCADE;
  DROP TABLE "ranker"."redirects" CASCADE;
  DROP TABLE "ranker"."redirects_rels" CASCADE;
  DROP TABLE "ranker"."payload_kv" CASCADE;
  DROP TABLE "ranker"."payload_locked_documents" CASCADE;
  DROP TABLE "ranker"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "ranker"."payload_preferences" CASCADE;
  DROP TABLE "ranker"."payload_preferences_rels" CASCADE;
  DROP TABLE "ranker"."payload_migrations" CASCADE;
  DROP TYPE "ranker"."_locales";
  DROP TYPE "ranker"."enum_lists_list_type";
  DROP TYPE "ranker"."enum_lists_ranking_mode";
  DROP TYPE "ranker"."enum_lists_status";
  DROP TYPE "ranker"."enum__lists_v_version_list_type";
  DROP TYPE "ranker"."enum__lists_v_version_ranking_mode";
  DROP TYPE "ranker"."enum__lists_v_version_status";
  DROP TYPE "ranker"."enum__lists_v_published_locale";
  DROP TYPE "ranker"."enum_items_blocks_place_price_range";
  DROP TYPE "ranker"."enum_items_blocks_creative_work_work_type";
  DROP TYPE "ranker"."enum_items_gallery_kind";
  DROP TYPE "ranker"."enum_items_status";
  DROP TYPE "ranker"."enum__items_v_blocks_place_price_range";
  DROP TYPE "ranker"."enum__items_v_blocks_creative_work_work_type";
  DROP TYPE "ranker"."enum__items_v_version_gallery_kind";
  DROP TYPE "ranker"."enum__items_v_version_status";
  DROP TYPE "ranker"."enum__items_v_published_locale";
  DROP TYPE "ranker"."enum_categories_item_route";
  DROP TYPE "ranker"."enum_categories_color";
  DROP TYPE "ranker"."enum_users_role";
  DROP TYPE "ranker"."enum_redirects_to_type";`)
}
