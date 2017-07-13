
const regionsData = require('../../data/03-regions-test.js');
const quakesData = require('../../data/04-quakes-test.js');

exports.seed = function(knex, Promise) {
  return knex('earthquakes').del()
  .then(() => {
    return knex('regions').del();
  })
  .then(() => {
    return knex('regions').insert(regionsData);
  })
  .then(() => {
    let quakesPromise = [];

    quakesData.forEach((quake) => {
      let region = quake.region;

      quakesPromise.push(createQuake(knex, quake, region));
    });

    return Promise.all(quakesPromise)
  });
};

const createQuake = (knex, quake, region) => {

  return knex('regions').where('name', region).first()
  .then((regionRecord) => {
    return knex('earthquakes').insert({
      id: quake.id,
      magnitude: quake.magnitude,
      description: quake.description,
      lat: quake.lat,
      long: quake.long,
      depth: quake.depth,
      region_id: regionRecord.id
    });
  });
};
