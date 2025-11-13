import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763008738269 implements MigrationInterface {
    name = 'Migration1763008738269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1"`);
        await queryRunner.query(`ALTER TABLE "booking_seats" DROP CONSTRAINT "FK_ce3eaf629a9df599803acd0d936"`);
        await queryRunner.query(`ALTER TABLE "seats" DROP CONSTRAINT "FK_e0d878b12aef79193570b5df57b"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_63bae66ff54636efd8f8fe04f3f"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_8e21d48806591a8f1ab0874fcc1"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_customer_email"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "bookingDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "seats" DROP COLUMN "holdUntil"`);
        await queryRunner.query(`ALTER TABLE "seats" ADD "holdUntil" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_seats" ADD CONSTRAINT "FK_ce3eaf629a9df599803acd0d936" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seats" ADD CONSTRAINT "FK_e0d878b12aef79193570b5df57b" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_63bae66ff54636efd8f8fe04f3f" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_8e21d48806591a8f1ab0874fcc1" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_8e21d48806591a8f1ab0874fcc1"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_63bae66ff54636efd8f8fe04f3f"`);
        await queryRunner.query(`ALTER TABLE "seats" DROP CONSTRAINT "FK_e0d878b12aef79193570b5df57b"`);
        await queryRunner.query(`ALTER TABLE "booking_seats" DROP CONSTRAINT "FK_ce3eaf629a9df599803acd0d936"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "seats" DROP COLUMN "holdUntil"`);
        await queryRunner.query(`ALTER TABLE "seats" ADD "holdUntil" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "bookingDate" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_customer_email" ON "bookings" ("customerEmail") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bookings_user_id" ON "bookings" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_8e21d48806591a8f1ab0874fcc1" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_63bae66ff54636efd8f8fe04f3f" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seats" ADD CONSTRAINT "FK_e0d878b12aef79193570b5df57b" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_seats" ADD CONSTRAINT "FK_ce3eaf629a9df599803acd0d936" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_45fa98a28a6944e39d8a5754bd1" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
