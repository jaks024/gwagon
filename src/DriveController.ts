import { google } from "googleapis";

export function DriveController()
{
    const CLIENT_ID = "1019728199135-2bqo08s8e7ml30shimo019a4pqu275e1.apps.googleusercontent.com";

    const authClient = new google.auth.OAuth2(
        CLIENT_ID
    );
    
    const drive = google.drive( {
        version: "v3",
        auth: authClient
    });

    const updateAuthClient = (accessToken: string) => {
        authClient.setCredentials({ access_token: accessToken});
    };

    const createFile = async (accessToken: string, fileName: string) => {
        updateAuthClient(accessToken);
        try {
            const response = await drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: ["appDataFolder"],
                    mimeType: "application/json",
                }
            });
            
            console.log(response.status);
            return response.status;
        } catch (error) {
            console.log(error.message);
            return null;
        }
    };

    const saveFile = async (accessToken: string, data: string) => {
        return accessToken + data;  // temporary
    };

    const getFile = async (accessToken: string, fileName: string) => {
        return accessToken + fileName;  // temporary
    };

    const listFiles = async (accessToken: string) => {
        updateAuthClient(accessToken);
        try {
            const response = await drive.files.list({
                q: `name="${"test"}" and trashed=false and mimeType="text/plain"`,
              });  
              console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    return {
        CreateFile: createFile,
        SaveFile: saveFile,
        GetFile: getFile,
        listFiles: listFiles
    };
}