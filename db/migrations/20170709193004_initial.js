
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('regions', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.decimal('ne_lat');
      table.decimal('ne_long');
      table.decimal('sw_lat');
      table.decimal('sw_long');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('earthquakes', (table) => {
      table.string('id').primary();
      table.decimal('magnitude');
      table.string('description');
      table.decimal('lat');
      table.decimal('long');
      table.decimal('depth');
      table.integer('region_id').unsigned();
      table.foreign('region_id').references('regions.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('earthquakes'),
    knex.schema.dropTable('regions')
  ]);

};
