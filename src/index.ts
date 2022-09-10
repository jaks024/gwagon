/* eslint @typescript-eslint/no-var-requires: "off" */

import express from "express";
import { DataService } from "./DataService";
import { DriveController } from "./DriveController";
import { IEntry } from "./models/IEntry";
import { ISummary } from "./models/ISummary";
require("dotenv").config();

const cors = require("cors");
const app = express();
const driveController = DriveController();
const dataService = DataService();

const port = process.env.PORT || 3000;
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
app.get("/summary/:year-:month", async (req, res) => {
  const entries = await driveController.GetFile(req.header(accessTokenHeaderName), driveController.GetSaveFileName(req.params.month, req.params.year));
  if (typeof entries === "number") {
    const blankSummary: ISummary = {
      incomeTotal: 0,
      expenseTotal: 0,
      incomeAverage: 0,
      expenseAverage: 0,
      numOfEntires: 0,
      incomeTagSums: new Map(),
      expenseTagSums: new Map()
    };
    res.json(blankSummary);
    return;
  }
  const parsedEntries: IEntry[] = JSON.parse(JSON.stringify(entries));
  const summary = dataService.Summarize(parsedEntries);
  res.json(summary);
}); 

// create a empty new file with file name 
app.post("/create/:fileName", async (req, res) => {
  const status = await driveController.CreateFile(req.header(accessTokenHeaderName), req.params.fileName);
  res.json(status);
});

// list all files with matching name 
app.get("/list/:fileName", async (req, res) => {
  const files = await driveController.ListFiles(req.header(accessTokenHeaderName), req.params.fileName);
  res.json(files);
});

// get save file data (all entries for year-month)
app.get("/get/:year-:month", async(req, res) => {
  const content = await driveController.GetFile(req.header(accessTokenHeaderName), driveController.GetSaveFileName(req.params.month, req.params.year));
  res.json(content);
});

// delete all files with matching file name
app.delete("/delete/:fileName", async (req, res) => {
  const status = await driveController.DeleteFile(req.header(accessTokenHeaderName), req.params.fileName);
  res.sendStatus(status);
});

// add new entry
app.post("/add", async (req, res) => {
  const status = await driveController.AddEntry(req.header(accessTokenHeaderName), req.body);
  res.sendStatus(status);
});

// overwrite file data with body content 
app.post("/save", async (req, res) => {
  const status = await driveController.SaveData(req.header(accessTokenHeaderName), req.header("fileId"), req.body);
  res.sendStatus(status);
});

app.post("/userdata/create", async (req, res) => {
  const status = await driveController.CreateUserData(req.header(accessTokenHeaderName));
  res.sendStatus(status);
});

app.get("/userdata",  async (req, res) => {
  const data = await driveController.GetUserData(req.header(accessTokenHeaderName));
  res.json(data);
});

app.patch("/userdata", async (req, res) => {
  const status = await driveController.SaveUserData(req.header(accessTokenHeaderName), req.body);
  res.sendStatus(status);
});

app.delete("/delete/:year-:month/:id", async (req, res) => {
  const status = await driveController.RemoveEntry(req.header(accessTokenHeaderName), req.params.year, req.params.month, req.params.id);
  res.sendStatus(status);
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});