"use strict";

const { uniqueID } = require("mocha/lib/utils");
let projectDB = {};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let querys = req.query
      let response = projectDB[project];
      if(!querys){
        return res.json(response);
      }
      if(querys.open){
        response = response.filter(issue => issue.open == querys.open )
      }
      if(querys.created_by){
          response = response.filter(issue => issue.created_by == querys.created_by )
      }
      if(querys.assigned_to){
          response = response.filter(issue => issue.assigned_to == querys.assigned_to )
      }
      if(querys.status_text){
          response = response.filter(issue => issue.status_text == querys.status_text )
      }
      if(querys._id){
          response = response.filter(issue => issue._id == querys._id )
      }
      return res.json(response) 
    })

    .post(function (req, res) {
      let project = req.params.project;
      if (!projectDB[project]) {
        projectDB[project] = [];
      }
      if (
        !req.body.created_by ||
        !req.body.issue_title ||
        !req.body.issue_text
      ) {
        return res.status(400).json({ error: "required field(s) missing" });
      }

      let date = new Date();
      let _id = uniqueID();
      let {issue_title, issue_text, created_by} = req.body
      let newIssue = {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: date,
        updated_on: date,
        open: true,
      };
      projectDB[project] = [...projectDB[project], newIssue];
      return res.json(newIssue);
    })

    .put(function (req, res) {
      let project = req.params.project;
      let {_id, ...fields} = req.body

      if(!_id) return res.status(400).json({ error: 'missing _id' })
      if(Object.keys(fields).length === 0) return res.status(400).json({ error: 'no update field(s) sent', _id })
      
      let updatedIssue = projectDB[project].filter(issue => issue._id == _id )
      if(updatedIssue.length === 0) return res.status(400).json({ error: 'could not update', '_id': _id })
      
      Object.keys(fields).forEach(key => {
        updatedIssue[0][key] = fields[key]
        updatedIssue[0].updated_on = new Date()
      })
      
      return res.json({  result: 'successfully updated', _id })
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let {_id} = req.body
      if(!_id) return res.status(400).json({ error: 'missing _id' })

      let delIssue = projectDB[project].filter(issue => issue._id == _id )
      const index = projectDB[project].indexOf(delIssue[0]);
      if(delIssue.length === 0) return res.status(400).json({ error: 'could not delete', '_id': _id })
      projectDB[project].splice(index, 1)
      return res.json({ result: 'successfully deleted', '_id': _id })
    });
};
