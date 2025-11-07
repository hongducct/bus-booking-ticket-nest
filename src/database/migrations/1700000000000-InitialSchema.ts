import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create stations table
    await queryRunner.createTable(
      new Table({
        name: 'stations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'city',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create bus_companies table
    await queryRunner.createTable(
      new Table({
        name: 'bus_companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create trips table
    await queryRunner.createTable(
      new Table({
        name: 'trips',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'from_station_id',
            type: 'uuid',
          },
          {
            name: 'to_station_id',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'departureTime',
            type: 'time',
          },
          {
            name: 'arrivalTime',
            type: 'time',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'busType',
            type: 'varchar',
            default: "'seat'",
          },
          {
            name: 'totalSeats',
            type: 'int',
            default: 0,
          },
          {
            name: 'amenities',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create seats table
    await queryRunner.createTable(
      new Table({
        name: 'seats',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'trip_id',
            type: 'uuid',
          },
          {
            name: 'number',
            type: 'varchar',
          },
          {
            name: 'row',
            type: 'int',
          },
          {
            name: 'floor',
            type: 'int',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'available'",
          },
          {
            name: 'holdUntil',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create bookings table
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'trip_id',
            type: 'uuid',
          },
          {
            name: 'customerName',
            type: 'varchar',
          },
          {
            name: 'customerPhone',
            type: 'varchar',
          },
          {
            name: 'customerEmail',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pickupPoint',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dropoffPoint',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            default: "'cash'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'bookingDate',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create booking_seats table
    await queryRunner.createTable(
      new Table({
        name: 'booking_seats',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'booking_id',
            type: 'uuid',
          },
          {
            name: 'seat_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bus_companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['from_station_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['to_station_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'seats',
      new TableForeignKey({
        columnNames: ['trip_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        columnNames: ['trip_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'booking_seats',
      new TableForeignKey({
        columnNames: ['booking_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bookings',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'booking_seats',
      new TableForeignKey({
        columnNames: ['seat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'seats',
        onDelete: 'CASCADE',
      }),
    );

    // Enable UUID extension for PostgreSQL
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const bookingSeatsTable = await queryRunner.getTable('booking_seats');
    if (bookingSeatsTable) {
      const foreignKeys = bookingSeatsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('booking_seats', fk);
      }
    }

    const bookingsTable = await queryRunner.getTable('bookings');
    if (bookingsTable) {
      const foreignKeys = bookingsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('bookings', fk);
      }
    }

    const seatsTable = await queryRunner.getTable('seats');
    if (seatsTable) {
      const foreignKeys = seatsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('seats', fk);
      }
    }

    const tripsTable = await queryRunner.getTable('trips');
    if (tripsTable) {
      const foreignKeys = tripsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('trips', fk);
      }
    }

    // Drop tables
    await queryRunner.dropTable('booking_seats');
    await queryRunner.dropTable('bookings');
    await queryRunner.dropTable('seats');
    await queryRunner.dropTable('trips');
    await queryRunner.dropTable('bus_companies');
    await queryRunner.dropTable('stations');
  }
}

