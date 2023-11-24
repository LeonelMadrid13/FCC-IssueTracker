const chaiHttp = require("chai-http");
const chai = require("chai");
const expect = chai.expect;

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
				expect(res.status).to.equal(200);
				expect(res.body).to.have.property("_id");
				expect(res.body)
				.to.have.property("issue_title")
				.to.equal("Faux Issue Title");
				expect(res.body)
				.to.have.property("issue_text")
				.to.equal("Functional Test - Required Fields Only");
				expect(res.body).to.have.property("created_by").to.equal("fCC");
				expect(res.body).to.have.property("assigned_to").to.equal("Me");
				expect(res.body).to.have.property("status_text").to.equal("QA");
				expect(res.body)
				.to.have.property("open")
				.to.be.a("boolean")
				.and.to.equal(true);

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
				expect(res.status).to.equal(200);
				expect(res.body).to.have.property("_id");
				expect(res.body)
					.to.have.property("issue_title")
					.to.equal("Faux Issue Title");
				expect(res.body)
					.to.have.property("issue_text")
					.to.equal("Functional Test - Required Fields Only");
				expect(res.body).to.have.property("created_by").to.equal("Leonel");
				expect(res.body).to.have.property("assigned_to").to.equal("");
				expect(res.body).to.have.property("status_text").to.equal("");
				expect(res.body)
					.to.have.property("open")
					.to.be.a("boolean")
					.and.to.equal(true);

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
				expect(res.status).to.equal(400);
				expect(res.body).to.have.property('error').to.be.equal('required field(s) missing');
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
				expect(res.status).to.equal(200);
				expect(res.body).is.a('array');
				expect(res.body[0]).to.have.property('_id')
				expect( res.body[0] ).to.have.property( 'issue_title' );
				expect( res.body[0] ).to.have.property( 'issue_text'  );
				expect( res.body[0] ).to.have.property( 'assigned_to' );
				expect( res.body[0] ).to.have.property( 'status_text' );
				expect( res.body[0] ).to.have.property( 'created_by'  );
				expect( res.body[0] ).to.have.property( 'created_on'  );
				expect( res.body[0] ).to.have.property( 'updated_on'  );
				expect( res.body[0] ).to.have.property( 'open'        );
				done( );
			})
		})
		test("Issues on a project with one filter", (done) => {
			chai
			.request(server)
			.get(ENDPOINT)
			.query({created_by: 'Leonel'})
			.end((err, res) => {
				expect(res.status).to.equal(200);
				expect(res.body).is.a('array');
				expect(res.body[0]).to.have.property('_id')
				expect( res.body[0] ).to.have.property( 'issue_title' );
				expect( res.body[0] ).to.have.property( 'issue_text'  );
				expect( res.body[0] ).to.have.property( 'assigned_to' );
				expect( res.body[0] ).to.have.property( 'status_text' );
				expect( res.body[0] ).to.have.property( 'created_by'  ).to.equal('Leonel');
				expect( res.body[0] ).to.have.property( 'created_on'  );
				expect( res.body[0] ).to.have.property( 'updated_on'  );
				expect( res.body[0] ).to.have.property( 'open'        );
				done( );
			})
		})
		test("Issues on a project with multiple filters", (done) => {
			chai
			.request(server)
			.get(ENDPOINT)
			.query({created_by: 'fCC', assigned_to: 'Me'})
			.end((err, res) => {
				expect(res.status).to.equal(200);
				expect(res.body).is.a('array');
				expect(res.body[0]).to.have.property('_id')
				expect( res.body[0] ).to.have.property( 'issue_title' );
				expect( res.body[0] ).to.have.property( 'issue_text'  );
				expect( res.body[0] ).to.have.property( 'assigned_to' ).to.equal('Me');
				expect( res.body[0] ).to.have.property( 'status_text' );
				expect( res.body[0] ).to.have.property( 'created_by'  ).to.equal('fCC');
				expect( res.body[0] ).to.have.property( 'created_on'  );
				expect( res.body[0] ).to.have.property( 'updated_on'  );
				expect( res.body[0] ).to.have.property( 'open'        );
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
				expect(res.status).to.equal(200)
				expect(res.body).to.have.property('_id').to.equal(firstInsertedID)
				expect(res.body).to.have.property('result').to.equal('successfully updated')
				done()	
			})
		})
		test("Update multiple fields on an issue", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({_id: firstInsertedID, issue_title: "Updated Title", issue_text:"Updated Text"})
			.end((err, res) => {
				expect(res.body).to.have.property('_id').to.equal(firstInsertedID)
				expect(res.body).to.have.property('result').to.equal('successfully updated')
				done()
			})
		})
		test("Update an issue with missing _id", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ issue_title: "Updated Title"})
			.end((err, res) => {
				expect(res.status).to.equal(400)
				expect(res.body).to.have.property('error').to.equal('missing _id')
				done()
			})
		})
		test("Update an issue with no fields to update", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ _id: firstInsertedID })
			.end((err, res) => {
				expect(res.status).to.equal(400)
				expect(res.body).to.have.property('error').to.equal('no update field(s) sent')
				expect(res.body).to.have.property('_id').to.equal(firstInsertedID)
				done()
			})
		})
		test("Update an issue with an invalid _id", (done) => {
			chai
			.request(server)
			.put(ENDPOINT)
			.send({ _id: 'firstInsertedID', issue_title: "Updated Title" })
			.end((err, res) => {
				expect(res.status).to.equal(400)
				expect(res.body).to.have.property('error').to.equal('could not update')
				expect(res.body).to.have.property('_id').to.equal('firstInsertedID')
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
				expect(res.status).to.equal(200)
				expect(res.body).to.have.property('result').to.equal('successfully deleted')
				expect(res.body).to.have.property('_id').to.equal(firstInsertedID)
				done()
			})
		})
		test("Delete an issue with an invalid _id", (done) => {
			chai
			.request(server)
			.delete(ENDPOINT)
			.send({_id: 'firstInsertedID'})
			.end((err, res) => {
				expect(res.status).to.equal(400)
				expect(res.body).to.have.property('error').to.equal('could not delete')
				expect(res.body).to.have.property('_id').to.equal('firstInsertedID')
				done()
			})
		})
		test("Delete an issue with missing _id", (done) => {
			chai
			.request(server)
			.delete(ENDPOINT)
			.send({})
			.end((err, res) => {
				expect(res.status).to.equal(400)
				expect(res.body).to.have.property('error').to.equal('missing _id')
				done()
			})
		})
	})
});
