import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class AddStationPoints1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create station_points table
    await queryRunner.createTable(
      new Table({
        name: 'station_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'station_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            default: "'both'",
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key to stations
    await queryRunner.createForeignKey(
      'station_points',
      new TableForeignKey({
        columnNames: ['station_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stations',
        onDelete: 'CASCADE',
      }),
    );

    // Update bookings table to use station_point_id instead of string
    const bookingsTable = await queryRunner.getTable('bookings');
    if (bookingsTable) {
      // Drop old columns if they exist
      if (bookingsTable.findColumnByName('pickupPoint')) {
        await queryRunner.dropColumn('bookings', 'pickupPoint');
      }
      if (bookingsTable.findColumnByName('dropoffPoint')) {
        await queryRunner.dropColumn('bookings', 'dropoffPoint');
      }

      // Add new columns
      await queryRunner.addColumn(
        'bookings',
        new TableColumn({
          name: 'pickup_point_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      await queryRunner.addColumn(
        'bookings',
        new TableColumn({
          name: 'dropoff_point_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      // Add foreign keys
      await queryRunner.createForeignKey(
        'bookings',
        new TableForeignKey({
          columnNames: ['pickup_point_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'station_points',
          onDelete: 'SET NULL',
        }),
      );

      await queryRunner.createForeignKey(
        'bookings',
        new TableForeignKey({
          columnNames: ['dropoff_point_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'station_points',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const bookingsTable = await queryRunner.getTable('bookings');
    if (bookingsTable) {
      // Drop foreign keys
      const foreignKeys = bookingsTable.foreignKeys.filter(
        (fk) => fk.columnNames.includes('pickup_point_id') || fk.columnNames.includes('dropoff_point_id'),
      );
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('bookings', fk);
      }

      // Drop columns
      if (bookingsTable.findColumnByName('pickup_point_id')) {
        await queryRunner.dropColumn('bookings', 'pickup_point_id');
      }
      if (bookingsTable.findColumnByName('dropoff_point_id')) {
        await queryRunner.dropColumn('bookings', 'dropoff_point_id');
      }

      // Add back old string columns
      await queryRunner.addColumn(
        'bookings',
        new TableColumn({
          name: 'pickupPoint',
          type: 'varchar',
          isNullable: true,
        }),
      );

      await queryRunner.addColumn(
        'bookings',
        new TableColumn({
          name: 'dropoffPoint',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // Drop station_points table
    await queryRunner.dropTable('station_points');
  }
}

