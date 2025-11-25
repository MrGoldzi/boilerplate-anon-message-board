'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server.js'); // Make sure this points to your Express app
const { suite, test } = require('mocha');
const runner = require('../test-runner');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000); // Increase timeout for slower environments like Replit

  let testThreadId;
  let testReplyId;
  const board = 'testboard';

  // ---- THREAD TESTS ----
  test('POST /api/threads/{board} => create thread', function(done) {
    chai.request(server)
      .post('/api/threads/' + board)
      .send({ text: 'Test thread', delete_password: 'pass' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test('GET /api/threads/{board} => array of threads', function(done) {
    chai.request(server)
      .get('/api/threads/' + board)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'bumped_on');
        assert.property(res.body[0], 'replies');
        testThreadId = res.body[0]._id;
        done();
      });
  });

  test('DELETE /api/threads/{board} => incorrect password', function(done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: testThreadId, delete_password: 'wrong' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('DELETE /api/threads/{board} => correct password', function(done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: testThreadId, delete_password: 'pass' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('PUT /api/threads/{board} => report thread', function(done) {
    // create a thread again to report
    chai.request(server)
      .post('/api/threads/' + board)
      .send({ text: 'Report me', delete_password: 'pw' })
      .end(function(err, res) {
        // then report it
        chai.request(server)
          .get('/api/threads/' + board)
          .end(function(err, res) {
            testThreadId = res.body[0]._id;
            chai.request(server)
              .put('/api/threads/' + board)
              .send({ thread_id: testThreadId })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
  });

  // ---- REPLY TESTS ----
  test('POST /api/replies/{board} => create reply', function(done) {
    chai.request(server)
      .post('/api/replies/' + board)
      .send({ thread_id: testThreadId, text: 'This is a reply', delete_password: 'replypw' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  test('GET /api/replies/{board} => thread with replies', function(done) {
    chai.request(server)
      .get('/api/replies/' + board)
      .query({ thread_id: testThreadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies);
        assert.property(res.body.replies[0], '_id');
        assert.property(res.body.replies[0], 'text');
        testReplyId = res.body.replies[0]._id;
        done();
      });
  });

  test('DELETE /api/replies/{board} => incorrect password', function(done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'wrongpw' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('DELETE /api/replies/{board} => correct password', function(done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'replypw' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('PUT /api/replies/{board} => report reply', function(done) {
    chai.request(server)
      .put('/api/replies/' + board)
      .send({ thread_id: testThreadId, reply_id: testReplyId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  // ---- KEEP SERVER ALIVE AFTER TESTS ----
  after(function() {
    // Prevent FCC tests from hanging
    chai.request(server).get('/api');
  });

  // Only run runner if in test environment
  if (process.env.NODE_ENV === 'test') {
    runner.run();
  }

});
