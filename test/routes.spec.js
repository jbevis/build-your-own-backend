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
        response.body.error.should.equal('No region was found matching that id');
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
        response.body.error.should.equal('No earthquakes were found for that region');
        done();
      });
    });

  });


});
