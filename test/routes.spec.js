process.env.NODE_ENV = 'testing';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const knex = require('../db/knex.js');


chai.use(chaiHttp);

describe('Client Routes', () => {

  it('should return the homepage with html elements', (done) => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.html;
      done();
    });
  });

  it('should return a 404 for a route that doesn\'t exist', (done) => {
    chai.request(server)
    .get('/sad')
    .end((err, response) => {
      response.should.have.status(404);
      done();
    });
  });

});

describe('API Routes', () => {

  beforeEach(done => {
    knex.migrate.rollback()
    .then(() => {
      knex.migrate.latest()
      .then(() => {
        return knex.seed.run()
        .then(() => {
          done();
        });
      });
    });
  });

  describe('GET /api/v1/regions', () => {

    it('should return all of the regions', (done) => {
      chai.request(server)
      .get('/api/v1/regions')
      .end((err, response) => {
        const sortedBody = response.body.sort((a, b) => a.id - b.id);

        response.should.have.status(200);
        response.should.be.json;
        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('name');
        sortedBody[0].name.should.equal('North America');
        sortedBody[0].ne_lat.should.equal('70.97');
        sortedBody[0].ne_long.should.equal('-50.26');
        sortedBody[0].sw_lat.should.equal('14.32');
        sortedBody[0].sw_long.should.equal('-170.60');
        sortedBody[0].id.should.equal(1);
        done();
      });
    });

    it('should return a 404 if directed to a non existent endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/notarealendpoint')
      .end((error, response) => {

        response.should.have.status(404);
        done()
      });
    });
  });

  describe('GET /api/v1/earthquakes', () => {

    it('should return all of the earthquakes', (done) => {
      chai.request(server)
      .get('/api/v1/earthquakes')
      .end((err, response) => {
        const sortedBody = response.body.sort((a, b) => a.id - b.id);

        response.should.have.status(200);
        response.should.be.json;
        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('magnitude');
        sortedBody[0].should.have.property('description');
        sortedBody[0].should.have.property('lat');
        sortedBody[0].should.have.property('long');
        sortedBody[0].should.have.property('depth');
        sortedBody[0].should.have.property('region_id');
        sortedBody[0].magnitude.should.equal('4.50');
        sortedBody[0].description.should.equal('Test earthquake in South America 1');
        sortedBody[0].lat.should.equal('-15.12');
        sortedBody[0].long.should.equal('-72.22');
        sortedBody[0].depth.should.equal('2.50');
        sortedBody[0].id.should.equal('1');
        sortedBody[0].region_id.should.equal(2);
        done();
      });
    });

    it('should return a 404 if directed to a non existent endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/boomgoesthedynamite')
      .end((error, response) => {

        response.should.have.status(404);
        done()
      });
    });

  });

  describe('GET /api/v1/regions/:id', () => {

    it('should return a specific region from the database', (done) => {
      chai.request(server)
      .get('/api/v1/regions/1')
      .end((error, response) => {

        response.should.have.status(200);
        response.should.be.json;
        response.body[0].should.have.property('id');
        response.body[0].should.have.property('name');
        response.body[0].should.have.property('ne_lat');
        response.body[0].should.have.property('ne_long');
        response.body[0].should.have.property('sw_lat');
        response.body[0].should.have.property('sw_long');
        response.body[0].name.should.equal('North America');
        response.body[0].ne_lat.should.equal('70.97');
        response.body[0].ne_long.should.equal('-50.26');
        response.body[0].sw_lat.should.equal('14.32');
        response.body[0].sw_long.should.equal('-170.60');
        response.body[0].id.should.equal(1);
        done();
      });
    });

    it('should return a 404 if passed an id that does not exist', (done) => {
      chai.request(server)
      .get('/api/v1/regions/999')
      .end((error, response) => {

        response.should.have.status(404);
        response.should.be.json;
        response.body.error.should.equal('No region was found matching that id.');
        done();
      });
    });

  });

  describe('GET /api/v1/:region_id/earthquakes', () => {

    it('should return all the earthquakes for a given region', (done) => {
      chai.request(server)
      .get('/api/v1/1/earthquakes')
      .end((error, response) => {
        const sortedBody = response.body.sort((a, b) => a.id - b.id);

        response.should.have.status(200);
        response.should.be.json;
        sortedBody.length.should.equal(2);
        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('magnitude');
        sortedBody[0].should.have.property('description');
        sortedBody[0].should.have.property('lat');
        sortedBody[0].should.have.property('long');
        sortedBody[0].should.have.property('depth');
        sortedBody[0].should.have.property('region_id');
        sortedBody[0].magnitude.should.equal('6.50');
        sortedBody[0].description.should.equal('Test earthquake in North America 1');
        sortedBody[0].lat.should.equal('42.03');
        sortedBody[0].long.should.equal('-121.13');
        sortedBody[0].depth.should.equal('7.30');
        sortedBody[0].id.should.equal('4');
        sortedBody[0].region_id.should.equal(1);
        done();
      });
    });

    it('should return a 404 if passed a region with no earthquakes to it', (done) => {
      chai.request(server)
      .get('/api/v1/5/earthquakes')
      .end((error, response) => {

        response.should.have.status(404);
        response.should.be.json;
        response.body.error.should.equal('No earthquakes were found for that region.');
        done();
      });
    });

  });

  describe('GET /api/v1/earthquakes/filterMag', () => {

    it('should return all earthquakes within a given magnitude level range', (done) => {
      chai.request(server)
      .get('/api/v1/earthquakes/filterMag?magLow=4.5&magHi=8.0')
      .end((error, response) => {
        const sortedBody = response.body.sort((a, b) => a.id - b.id);

        response.should.have.status(200);
        response.should.be.json;
        sortedBody.length.should.equal(2);
        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('magnitude');
        sortedBody[0].should.have.property('description');
        sortedBody[0].should.have.property('lat');
        sortedBody[0].should.have.property('long');
        sortedBody[0].should.have.property('depth');
        sortedBody[0].should.have.property('region_id');
        sortedBody[0].magnitude.should.equal('4.50');
        sortedBody[1].magnitude.should.equal('6.50');
        done();
      });
    });

    it('should return a 404 if passed a region with no earthquakes to it', (done) => {
      chai.request(server)
      .get('/api/v1/earthquakes/filterMag?magLo=10&magHi=100')
      .end((error, response) => {

        response.should.have.status(404);
        response.should.be.json;
        response.body.error.should.equal('No earthquakes were found for that magnitude range.');
        done();
      });
    });

  });

  describe('POST /api/v1/regions', () => {

    it('should insert a new region', (done) => {
      const regionBody = {
        id: 3,
        name: 'Central America',
        ne_lat: 18.4959419,
        ne_long: -77.1584879,
        sw_lat: 7.041,
        sw_long: -92.2714
      };

      chai.request(server)
      .post('/api/v1/regions')
      .send(regionBody)
      .end((error, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.have.property('id');
        response.body.id.should.equal(3);
        done();
      });
    });

    it('should not add a new region if missing a parameter', (done) => {
      const invalidRegion = { name: 'Mexico',
        lat: 45.99,
        long: 33.44
      };

      chai.request(server)
      .post('/api/v1/regions')
      .send(invalidRegion)
      .end((error, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { name: <String>, ne_lat: <Decimal>, ne_long: <Decimal>, sw_lat: <Decimal>, sw_long: <Decimal>.}. You are missing a ne_lat property.');
        done();
      });
    });

  });

  describe('POST /api/v1/earthquakes', () => {

    it('should insert a new earthquake', (done) => {
      const quakeBody = {
        id: 'us100095vj',
        magnitude: 6.8,
        description: 'Test quake',
        lat: 7.0241,
        long: -92.88,
        depth: 20.34,
        region_id: 2
      };

      chai.request(server)
      .post('/api/v1/earthquakes')
      .send(quakeBody)
      .end((error, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.have.property('id');
        response.body.id.should.equal('us100095vj');
        done();
      });
    });

    it('should not add a new region if missing a parameter', (done) => {
      const invalidRegion = { magnitude: 5.0,
        description: 'invalid quake',
        lat: 45.99,
        long: 33.44,
        depth: 23.33,
        region_id: 1
      };

      chai.request(server)
      .post('/api/v1/earthquakes')
      .send(invalidRegion)
      .end((error, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { id: <String>, magnitude: <Decimal>, description: <String>, lat: <Decimal>, long: <Decimal>, depth: <Decimal>, region_id: <Integer>}. You are missing a id property.');
        done();
      });
    });

  });

  describe('PATCH /api/v1/:id/newDepth', () => {

    it('should update an earthquake\'s depth', (done) => {
      const newDepth = { id: 1, newDepth: 3.1459 };

      chai.request(server)
      .patch('/api/v1/earthquakes/1/updateDepth')
      .send(newDepth)
      .end((error, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.have.property('message')
        response.body.message.should.equal('Earthquake depth successfully updated.');
        done();
      });
    });

    it('should not update depth if given an invalid parameter', (done) => {
      const badDepth = { id: 'this should be a number' };

      chai.request(server)
      .patch('/api/v1/earthquakes/thisshouldfail/updateDepth')
      .send(badDepth)
      .end((error, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { id: <String>, newDepth: <Decimal>}. You are missing a newDepth property.')
        done();
      });
    });

  });

  describe('PATCH /api/v1/:id/newMag', () => {

    it('should update an earthquake\'s depth', (done) => {
      const newDepth = { id: 1, newMag: 1000.999 };

      chai.request(server)
      .patch('/api/v1/earthquakes/1/updateMag')
      .send(newDepth)
      .end((error, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.have.property('message')
        response.body.message.should.equal('Earthquake magnitude successfully updated.');
        done();
      });
    });

    it('should not update depth if given an invalid parameter', (done) => {
      const badDepth = { id: 'this should be a number' };

      chai.request(server)
      .patch('/api/v1/earthquakes/thisshouldfail/updateMag')
      .send(badDepth)
      .end((error, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { id: <String>, newMag: <Decimal>}. You are missing a newMag property.')
        done();
      });
    });

  });

  describe('DELETE /api/v1/:id/earthquakes', () => {

    it('should remove a specific row from the earthquakes table', (done) => {

      chai.request(server)
      .delete('/api/v1/2/earthquakes')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.message.should.equal('Earthquake with id of 2 successfully deleted.');
        done()
      });
    });

    it('should return error for an earthquake delete request does not exist', (done) => {

      chai.request(server)
      .delete('/api/v1/500/earthquakes')
      .end((error, response) => {
        response.should.have.status(404);
        response.should.be.json;
        response.body.error.should.equal('Earthquake with id of 500 was not found.');
        done()
      });
    });

  });

  describe('DELETE /api/v1/:id/regions', () => {

    it('should delete a region and associated data from all tables', (done) => {

      chai.request(server)
      .delete('/api/v1/1/regions')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.message.should.equal('All earthquakes with region_id of 1 have been deleted successfully.');
        chai.request(server)
        .get('/api/v1/regions/1')
        .end((error, response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.error.should.equal('No region was found matching that id.');
          done()
        })
      });
    });

    it('should not delete a region is given a non existent id', (done) => {

      chai.request(server)
      .delete('/api/v1/400/regions')
      .end((error, response) => {
        response.should.have.status(404);
        response.should.be.json;
        response.body.error.should.equal('No earthquakes with a region_id of 400 were found.');
        done()
      });
    });

  });
});
