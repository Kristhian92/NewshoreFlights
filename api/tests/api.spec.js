const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');


describe('GET /viajes', () => {
    it('should return a journey', (done) => {
      request(app)
        .get('/viajes?origin=MZL&destination=MDE')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.have.property('Journey');
          expect(res.body.Journey.Origin).to.equal('MZL');
          expect(res.body.Journey.Destination).to.equal('MDE');
          expect(res.body.Journey.Price).to.equal(200);
        })
        .end(done);
    });
  
    it('should return a 404 if the journey is not found', (done) => {
      request(app)
        .get('/viajes?origin=MZL&destination=XXX')
        .expect(404)
        .end(done);
    });
  });
  ``