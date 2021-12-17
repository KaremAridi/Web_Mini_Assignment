//WHERE THERE ARE hashes like this ##### you should insert your code
//Please read requirement document of the mini-assignment
const express = require("express");
const app = express(); //create an express app

//Use the ejs template engine
app.set("view engine", "ejs");

//Statics files are fetched from the public folder
app.use(express.static("public"));

//Make Express parses and understands URL encoded data sent in forms or otherwise
app.use(express.urlencoded({ extended: true }));

//Make Express parses and understands JSON strings
app.use(express.json());

//Mongoose PART
const mongoose = require("mongoose");
//The database name will be StudentsDB
const DATABASE_NAME = "StudentsDB";
const MONGO_CONNECTION_URL = `mongodb://localhost:27017/${DATABASE_NAME}`;

//*******WRITE YOUR CODE BELOW to connect to MongoDB database */
//Connect to your mongodb community server either via mongoose
//Use the MONGO_CONNECTION_URL connection string.
//Task 1
//#####

mongoose
  .connect(MONGO_CONNECTION_URL)
  .then(() => {
    console.log("connected to the db.");
  })
  .catch((err) => {
    console.log("error in connecting. ERR: " + err);
  });

//****WRITE YOU SCHEMA BELOW of the students collection */
/*
DB schema rules:
1) First field is an auto generated mongodb _id
2) firstName field should be a string & should be required
3) lastName field should be a string & should be required
4) exam1Grade field should be a Number with a maximum of 100 and minimum of 0 
(this field can be optional as a student can miss this exam)
5) exam2Grade field should be a Number with a maximum of 100 and minimum of 0 
(this field can be optional as a student can miss this exam)
6) exam3Grade field should be a Number with a maximum of 100 and minimum of 0 
(this field is required; it defaults to 0 if no grade is provided).
*/
//Task 2
//#####

const { Schema } = mongoose;

//Schema of the exhibtion collection
const StudentsSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  exam1Grade: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  exam2Grade: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  exam3Grade: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
});

/****WRITE YOUR CODE BELOW for creating your model that represents the collection "students" in MongoDB 
I need the collection to be named exactly name "students" in the database itself.
 Your model variable should be named exactly as "StudentModel"
*/
//Task 3
//#####

const StudentModel = mongoose.model("students", StudentsSchema);

module.exports = StudentModel;

app.get("/", (req, res) => {
  res.redirect("/students");
});

//****ROUTES you should write code in */
//The following route should display all the students in our MongoDB database
// NB: you should write a MongoDB query to display all the documents in the collection "students"
// If there are no students yet in the collection, send a "message" when you render saying:
//"Sorry no students in the collection yet"
//Please see the requirements document of the mini-assignment for further details
app.get("/students", (req, res) => {
  //Write your CODE below the hashes
  //Task 4
  //#####
  
    StudentModel.countDocuments({}, (_, count) => {
      if (count > 0) {
        StudentModel.find({}, (error, result) => {
          if (error) throw error;
          if (!result) {
            console.log("nothing to find");
            return;
          }
          res.render("index", { results: result });
        });
      } else {
        res.render("index", {
          message: "Sorry no students in the collection yet",
          results: [],
        });
      }
    });
   
});

app.get("/insertAStudent", (req, res) => {
  res.render("insertAStudentForm");
});

//The following route should insert a student info in our MongoDB database
//NB: you should write a MongoDB query to insert a complete document in the collection "students"
//Of course you should parse what was sent from the form in insertAStudentForm.ejs
//and use all form fields as fields in a document saved to the collection students
//You should at the end redirect the user to the route "/students"
//Please see the requirements document of the mini-assignment for further details
app.post("/insertAStudent", (req, res) => {
  //Write your CODE below the hashes
  //Task 5
  //#####

    //get the data from the body
    const extractedData = req.body;
    //fill the object with the necassary fields
    const studentToInsert = new StudentModel({
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      exam1Grade: extractedData.exam1Grade,
      exam2Grade: extractedData.exam2Grade,
      exam3Grade: extractedData.exam3Grade,
    });

    //add to the database
    studentToInsert
      .save()
      .then(() => {
        console.log("successful");
        res.redirect("/students");
      })
      .catch((err) => {
        console.log(err);
      });
  });

app.delete("/deleteAStudent", (req, res) => {
  StudentModel.deleteOne({ _id: req.body.ID }, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(
      "Removing one document with a specific id sent by the client..."
    );
    console.log("1 document deleted");
    res.send(`success`);
  });
});

app.get("/updateAStudent", (req, res) => {
  StudentModel.findById({ _id: req.query.id }, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(result);
    res.render("updateAStudentForm", { ID: req.query.id, result: result });
  });
});

//The following route should update the student info & grades in our MongoDB database
//NB: you should write a MongoDB query to update a complete document in the collection "students"
//Of course you should parse what was sent from the form in updateAStudentForm.ejs
//and use all form fields as fields in the new updated data
//You should at the end redirect to the route "/students"
//Please see the requirements document of the mini-assignment for further details
app.post("/updateAStudent", (req, res) => {
  //Write your CODE below the hashes
  //Task 6
  //#####
  const extractedData = req.body;

  StudentModel.findByIdAndUpdate(
    { _id: extractedData.ID },
    {
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      exam1Grade: extractedData.exam1Grade,
      exam2Grade: extractedData.exam2Grade,
      exam3Grade: extractedData.exam3Grade,
    },
    (err, res) => {
      if (err) {
        throw err;
      } else {
        console.log("updated");
        console.log(res);
      }
    }
  );
  res.redirect("/students");
});

app.get("/filterExam3Grades", (req, res) => {
  res.render("displayFilteredResultsForm");
});

//The following route should filter student info & grades in our MongoDB database
//Use the adequate mongoose query that filters the field you take from displayFilteredResultsForm.ejs
//sent via POST to the below route. Render the results in index.ejs (no need to change anything in index.ejs)
// Please render a message in a similar manner you did in task 4 but the message should say:
//"Sorry no students in the collection that match your exam 3 filter" in case no results match.
//Please see the requirements document of the mini-assignment for further details
app.post("/filterExam3Grades", (req, res) => {
  //Write your CODE below the hashes
  //Task 7
  //#####
  const extractedData = req.body;

  StudentModel.find(
    { exam3Grade: { $gte: extractedData.exam3GradeFilter } },
    (error, results) => {
      if (error) throw error;
      if (!results) {
        console.log("Nothing to find");
        return;
      }
      if (results.length == 0) {
        res.render("index", {
          message:
            "Sorry no students in the collection that match your exam 3 filter",
          results: [],
        });
      } else {
        res.render("index", {results: results});
      }
    }
  );


});

//Task 8
//Write you CODE below the hashes - You need to write a complete HTTP POST route that handles
//the task 8 requirements. Remember you need to create a new ejs file in the views folder for this task.
//Please see the requirements document of the mini-assignment for further details
//####

app.get("/displayFilteredResultsForm2", (_, res) => {
  res.render("displayFilteredResultsForm2");
});

app.post("/filterExam3Grades2", (req, res) => {
  const extractedData = req.body;
  if (extractedData.operations === ">=") {
    StudentModel.find(
      { exam3Grade: { $gte: extractedData.exam3GradeFilter } },
      (error, results) => {
        if (error) throw error;
        if (!results) {
          console.log("Nothing to find");
          return;
        }
        if (results.length == 0) {
          res.render("index", {
            message:
              "Sorry no students in the collection that match your exam 3 filter",
            results: [],
          });
        } else {
          res.render("index", { results: results });
        }
      }
    );
  } else if (extractedData.operations === "<=") {
    StudentModel.find(
      { exam3Grade: { $lte: extractedData.exam3GradeFilter } },
      (error, results) => {
        if (error) throw error;
        if (!results) {
          console.log("Nothing to find");
          return;
        }
        if (results.length == 0) {
          res.render("index", {
            message:
              "Sorry no students in the collection that match your exam 3 filter",
            results: [],
          });
        } else {
          res.render("index", { results: results });
        }
      }
    );
  } else {
    StudentModel.find(
      { exam3Grade: { $eq: extractedData.exam3GradeFilter } },
      (error, results) => {
        if (error) throw error;
        if (!results) {
          console.log("Nothing to find");
          return;
        }
        if (results.length == 0) {
          res.render("index", {
            message:
              "Sorry no students in the collection that match your exam 3 filter",
            results: [],
          });
        } else {
          res.render("index", { results: results });
        }
      }
    );
  }
});

//Launching the server and listening on port 8081
const server = app.listen(8081, function () {
  const port = server.address().port;
  console.log(`The server is listening at  ${port}`);
});
