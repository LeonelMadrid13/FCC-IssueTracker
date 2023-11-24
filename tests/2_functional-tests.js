const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;

const server = require("../server");
const { createMochaInstanceAlreadyDisposedError } = require("mocha/lib/errors");

chai.use(chaiHttp);

const ENDPOINT = "/api/issues/test";

suite("Functional Tests", function () {
  	let firstInsertedID;
  	suite("POST to /api/issues/{project}", ( ) => {
      	test("Issue with every field", (done) => {
			chai
			.request(server)
			.post(ENDPOINT)
			.send({
				issue_title: "Faux Issue Title",
				issue_text: "Functional Test - Required Fields Only",
				created_by: "fCC",
				assigned_to: "Me",
				status_text: "QA",
			})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, "_id");
				assert.property(res.body, "issue_title")
				assert.equal(res.body.issue_title, "Faux Issue Title");
				assert.property(res.body, "issue_text")
				assert.equal(res.body.issue_text, "Functional Test - Required Fields Only");
				assert.property(res.body, "created_by")
				assert.equal(res.body.created_by, "fCC");
				assert.property(res.body, "assigned_to")
				assert.equal(res.body.assigned_to, "Me");
				assert.property(res.body, "status_text")
				assert.equal(res.body.status_text, "QA");
				assert.property(res.body,"open")
				assert.isBoolean(res.body.open)
				assert.equal(res.body.open, true)

				firstInsertedID = res.body._id;
				done();
			});
		});
		test("Issue with only required fields", (done) =>{
			chai
			.request(server)
			.post(ENDPOINT)
			.send({
				issue_title: "Faux Issue Title",
				issue_text: "Functional Test - Required Fields Only",
				created_by: "Leonel",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.property(res.body, "_id");
				assert.property(res.body, "issue_title")
				assert.equal(res.body.issue_title, "Faux Issue Title");
				assert.property(res.body, "issue_text")
				assert.equal(res.body.issue_text, "Functional Test - Required Fields Only");
				assert.property(res.body, "created_by");
				assert.equal(res.body.created_by, "Leonel")
				assert.property(res.body, "assigned_to");
				assert.property(res.body, "status_text");
				assert.property(res.body,"open")
				assert.isBoolean(res.body.open)
				assert.equal(res.body.open, true)

				firstInsertedID = res.body._id;
				done();
			});
		})
		test("Issue with missing required fields", (done) =>{
			chai
			.request(server)
			.post(ENDPOINT)
			.send({
				issue_title: "Faux Issue Title",
				issue_text: "Functional Test - Required Fields Only",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.property(res.body, 'error');
				assert.equal(res.body.error, 'required field(s) missing')
				done();
			});
		})
    });
	suite("GET from /api/issues/{project}", ( ) => {
		test("Issues on a project", ( done ) => {
			chai
			.request(server)
			.get(ENDPOINT)
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.isArray(res.body);
				assert.property(res.body[0], '_id')
				assert.property( res.body[0] , 'issue_title' );
				assert.property( res.body[0] , 'issue_text'  );
				assert.property( res.body[0] , 'assigned_to' );
				assert.property( res.body[0] , 'status_text' );
				assert.property( res.body[0] , 'created_by'  );
				assert.property( res.body[0] , 'created_on'  );
				assert.property( res.body[0] , 'updated_on'  );
				assert.property( res.body[0] , 'open'        );
				done( );
			})
		})
		test("Issues on a project with one filter", (done) => {
			chai
			.request(server)
			.get(ENDPOINT)
			.query({created_by: 'Leonel'})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.isArray(res.body);
				assert.property(res.body[0], '_id')
				assert.property( res.body[0] , 'issue_title' );
				assert.property( res.body[0] , 'issue_text'  );
				assert.property( res.body[0] , 'assigned_to' );
				assert.property( res.body[0] , 'status_text' );
				assert.property( res.body[0] , 'created_by'  )
				assert.equal(res.body[0].created_by, 'Leonel')
				assert.property( res.body[0] , 'created_on'  );
				assert.property( res.body[0] , 'updated_on'  );
				assert.property( res.body[0] , 'open'        );
				done( );
			})
		})
		test("Issues on a project with multiple filters", (done) => {
			chai
			.request(server)
			.get(ENDPOINT)
			.query({created_by: 'fCC', assigned_to: 'Me'})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.isArray(res.body);
				assert.property(res.body[0], '_id')
				assert.property( res.body[0] , 'issue_title' );
				assert.property( res.body[0] , 'issue_text'  );
				assert.property( res.body[0] , 'assigned_to' );
				assert.equal(res.body[0].assigned_to, 'Me')
				assert.property( res.body[0] , 'status_text' );
				assert.property( res.body[0] , 'created_by'  )
				assert.equal(res.body[0].created_by, 'fCC')
				assert.property( res.body[0] , 'created_on'  );
				assert.property( res.body[0] , 'updated_on'  );
				assert.property( res.body[0] , 'open'        );
				done( );
			})
		})
	})
	suite("PUT to /api/issues/{project}", () => {
		test("Update one field on an issue", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({_id: firstInsertedID, issue_title: "Updated Title"})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, '_id')
				assert.equal(res.body._id, firstInsertedID)
				assert.property(res.body, 'result')
				assert.equal(res.body.result, 'successfully updated')
				done()	
			})
		})
		test("Update multiple fields on an issue", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({_id: firstInsertedID, issue_title: "Updated Title", issue_text:"Updated Text"})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, '_id')
				assert.equal(res.body._id, firstInsertedID)
				assert.property(res.body, 'result')
				assert.equal(res.body.result, 'successfully updated')
				done()
			})
		})
		test("Update an issue with missing _id", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ issue_title: "Updated Title"})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, 'error')
				assert.equal(res.body.error, 'missing _id')
				done()
			})
		})
		test("Update an issue with no fields to update", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ _id: firstInsertedID })
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, '_id')
				assert.equal(res.body._id, firstInsertedID)
				assert.property(res.body, 'error')
				assert.equal(res.body.error, 'no update field(s) sent')
				done()
			})
		})
		test("Update an issue with an invalid _id", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ _id: 'firstInsertedID', issue_title: "Updated Title" })
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, '_id')
				assert.equal(res.body._id, 'firstInsertedID')
				assert.property(res.body, 'error')
				assert.equal(res.body.error, 'could not update')
				done()
			})
		})
	})
	suite(`DELETE from ${ENDPOINT}`, () =>{
		test("Delete an issue", (done)=>{
			chai
			.request(server)
			.delete(ENDPOINT)
			.send({_id: firstInsertedID})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, 'result')
				assert.equal(res.body.result, 'successfully deleted')
				assert.property(res.body, '_id')
				assert.equal(res.body._id, firstInsertedID)
				done()
			})
		})
		test("Delete an issue with an invalid _id", (done) => {
			chai
			.request(server)
			.delete(ENDPOINT)
			.send({_id: 'firstInsertedID'})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, 'error')
				assert.equal(res.body.error, 'could not delete')
				assert.property(res.body, '_id')
				assert.equal(res.body._id, 'firstInsertedID')
				done()
			})
		})
		test("Delete an issue with missing _id", (done) => {
			chai
			.request(server)
			.delete(ENDPOINT)
			.send({})
			.end((err, res) => {
				assert.equal(res.status, 200)
				assert.property(res.body, 'error')
				assert.equal(res.body.error, 'missing _id')
				done()
			})
		})
	})
});
