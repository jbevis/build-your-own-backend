const regionsData = require('../../data/01-regions.js');
const quakesData = require('../../data/02-quakes.js');
const helper = require('../../helper.js');
const assignRegion = helper.assignRegion;
const dataCleaner = helper.dataCleaner;
const cleanedQuakes = dataCleaner(quakesData.features, assignRegion);

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

    cleanedQuakes.forEach((quake) => {
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
