import express from "express";
import { DriveController } from "./DriveController";
const cors = require('cors');
const app = express();
const driveController = DriveController();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("test!!!!!");
});

app.get("/auth/google", async (req, res) => {
  const tokens = await driveController.GetRefreshToken(req.header("code"));

  res.json(tokens);
});

app.get("/auth/access", async (req, res) => {
  const tokens = await driveController.GetAccessToken(req.header("refreshToken"));

  res.json(tokens);
});

app.get("/list", (req, res) => {
  res.json(driveController.ListFiles(req.header("AccessToken")));
});

app.get("/summary/:auth-:year-:month", (req, res) => {
  res.send(`${req.params.month} - ${req.params.year} | user auth ${req.params.auth}`);
}); 

app.post("/summary", (req, res) => {
  res.json({ requestBody: req.body });
}); 


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});