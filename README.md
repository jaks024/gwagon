# gwagon
A containerized, serverless backend to access Google Drive API

Currently used as backend for [ExpV2](https://github.com/jaks024/expv2) and deployed on Google Cloud Run

API accessable through https://gwagon-tae44npnkq-pd.a.run.app

### Notes
Following environment variables needs to be set:
- PORT (server port)
- CLIENTSECRET (Google IAM client secret)

API:
- almost all API call requires "accessToken" to be set in the header of request (OAuth access token) 
