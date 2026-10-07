import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ranker"."_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__entries_entries_order" varchar,
  	"version_list_id" integer NOT NULL,
  	"version_item_id" integer NOT NULL,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ranker"."_entries_v_locales" (
  	"version_blurb" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "ranker"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "ranker"."lists" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "ranker"."_lists_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "ranker"."_lists_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "ranker"."items" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "ranker"."_items_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "ranker"."_items_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "ranker"."_entries_v" ADD CONSTRAINT "_entries_v_parent_id_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "ranker"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_entries_v" ADD CONSTRAINT "_entries_v_version_list_id_lists_id_fk" FOREIGN KEY ("version_list_id") REFERENCES "ranker"."lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_entries_v" ADD CONSTRAINT "_entries_v_version_item_id_items_id_fk" FOREIGN KEY ("version_item_id") REFERENCES "ranker"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_entries_v" ADD CONSTRAINT "_entries_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_entries_v" ADD CONSTRAINT "_entries_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "ranker"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ranker"."_entries_v_locales" ADD CONSTRAINT "_entries_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "ranker"."_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_entries_v_parent_idx" ON "ranker"."_entries_v" USING btree ("parent_id");
  CREATE INDEX "_entries_v_version_version__entries_entries_order_idx" ON "ranker"."_entries_v" USING btree ("version__entries_entries_order");
  CREATE INDEX "_entries_v_version_version_list_idx" ON "ranker"."_entries_v" USING btree ("version_list_id");
  CREATE INDEX "_entries_v_version_version_item_idx" ON "ranker"."_entries_v" USING btree ("version_item_id");
  CREATE INDEX "_entries_v_version_version_created_by_idx" ON "ranker"."_entries_v" USING btree ("version_created_by_id");
  CREATE INDEX "_entries_v_version_version_updated_by_idx" ON "ranker"."_entries_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_entries_v_version_version_updated_at_idx" ON "ranker"."_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_entries_v_version_version_created_at_idx" ON "ranker"."_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_entries_v_created_at_idx" ON "ranker"."_entries_v" USING btree ("created_at");
  CREATE INDEX "_entries_v_updated_at_idx" ON "ranker"."_entries_v" USING btree ("updated_at");
  CREATE INDEX "version_list_version_item_idx" ON "ranker"."_entries_v" USING btree ("version_list_id","version_item_id");
  CREATE UNIQUE INDEX "_entries_v_locales_locale_parent_id_unique" ON "ranker"."_entries_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "lists_published_at_idx" ON "ranker"."lists" USING btree ("published_at");
  CREATE INDEX "_lists_v_version_version_published_at_idx" ON "ranker"."_lists_v" USING btree ("version_published_at");
  CREATE INDEX "_lists_v_autosave_idx" ON "ranker"."_lists_v" USING btree ("autosave");
  CREATE INDEX "items_published_at_idx" ON "ranker"."items" USING btree ("published_at");
  CREATE INDEX "_items_v_version_version_published_at_idx" ON "ranker"."_items_v" USING btree ("version_published_at");
  CREATE INDEX "_items_v_autosave_idx" ON "ranker"."_items_v" USING btree ("autosave");`)

  // Nội dung đã đăng từ trước: ngày đăng đầu tiên = phiên bản đã đăng sớm nhất.
  for (const table of ['lists', 'items'] as const) {
    await db.execute(
      sql.raw(`
        UPDATE "ranker"."${table}" AS d
        SET "published_at" = (
          SELECT min(v."created_at") FROM "ranker"."_${table}_v" AS v
          WHERE v."parent_id" = d."id" AND v."version__status" = 'published'
        )
        WHERE d."_status" = 'published' AND d."published_at" IS NULL;
        UPDATE "ranker"."_${table}_v" AS v
        SET "version_published_at" = d."published_at"
        FROM "ranker"."${table}" AS d
        WHERE v."parent_id" = d."id" AND v."version_published_at" IS NULL
          AND v."created_at" >= d."published_at";
      `),
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ranker"."_entries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ranker"."_entries_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ranker"."_entries_v" CASCADE;
  DROP TABLE "ranker"."_entries_v_locales" CASCADE;
  DROP INDEX "ranker"."lists_published_at_idx";
  DROP INDEX "ranker"."_lists_v_version_version_published_at_idx";
  DROP INDEX "ranker"."_lists_v_autosave_idx";
  DROP INDEX "ranker"."items_published_at_idx";
  DROP INDEX "ranker"."_items_v_version_version_published_at_idx";
  DROP INDEX "ranker"."_items_v_autosave_idx";
  ALTER TABLE "ranker"."lists" DROP COLUMN "published_at";
  ALTER TABLE "ranker"."_lists_v" DROP COLUMN "version_published_at";
  ALTER TABLE "ranker"."_lists_v" DROP COLUMN "autosave";
  ALTER TABLE "ranker"."items" DROP COLUMN "published_at";
  ALTER TABLE "ranker"."_items_v" DROP COLUMN "version_published_at";
  ALTER TABLE "ranker"."_items_v" DROP COLUMN "autosave";`)
}
