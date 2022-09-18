# gwagon
A containerized, serverless backend to access Google Drive API

Currently used as backend for [ExpV2](https://github.com/jaks024/expv2) and deployed on Google Cloud Run

### Notes
Following environment variables needs to be set:
- PORT (server port)
- CLIENTSECRET (Google IAM client secret)

API:
- almost all API call requires "accessToken" to be set in the header of request (OAuth access token) 

### Packages used
- ESLint
- TypeScript
- [google-auth-library](https://www.npmjs.com/package/google-auth-library)
- Express
- Docker
