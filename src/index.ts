import express from "express";
import { DriveController } from "./DriveController";

const cors = require('cors');
const app = express();
const driveController = DriveController();

const port = 3000;
const accessTokenHeaderName = "accessToken";
const refreshTokenHeaderName = "refreshToken";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend for ExpV2");
});

// get refresh token
app.get("/auth/google", async (req, res) => {
  const tokens = await driveController.GetRefreshToken(req.header("code"));
  res.json(tokens);
});

// get access token
app.get("/auth/access", async (req, res) => {
  const tokens = await driveController.GetAccessToken(req.header(refreshTokenHeaderName));
  res.json(tokens);
});

// get computed summary data for <year> <month> 
app.get("/summary/:year-:month", (req, res) => {
  
  res.send(`${req.params.month} - ${req.params.year}`);
  res.json();
}); 

// get all entires for <year> <month> 
app.get("/history/:year-:month", (req, res) => {

});

// add new entry
app.post("/add", async (req, res) => {
  await driveController.SaveFile(req.header(accessTokenHeaderName), req.body);
});


app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});