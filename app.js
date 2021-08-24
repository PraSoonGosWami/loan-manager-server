const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
//admin routes
const adminRoutes = require("./routes/admin-routes");
//user routes
const userRoutes = require("./routes/user-routes");
//loan routes
const loanRoutes = require("./routes/loan-routes");

const app = express();

const PORT = process.env.PORT || 5000;
const DBName = process.env.dbName;
const MongoUser = process.env.mongoUser;
const MongoPsd = process.env.mongoPsd;

//mongodb url
const MONGO_URL = `mongodb+srv://${MongoUser}:${MongoPsd}@clusterx-tn29p.mongodb.net/${DBName}?retryWrites=true&w=majority`;

//CORS policy protection
const whitelist = [
  "http://localhost:3000",
  "https://loan-manager-323408.web.app",
];
const corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

// admin routes
app.use("/api/admin", adminRoutes);

// user routes
app.use("/api/user", userRoutes);

// loan routes
app.use("/api/loan", loanRoutes);

//error handling
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code);
  res.json({ message: error.message || "Something went wrong, server error" });
});

// connecting to database
connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Connected to database. Server started on PORT ${PORT} ..`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
