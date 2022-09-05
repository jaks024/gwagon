import { UserRefreshClient } from "google-auth-library";
import { google } from "googleapis";

export function DriveController() {
    const CLIENT_ID = "1019728199135-2bqo08s8e7ml30shimo019a4pqu275e1.apps.googleusercontent.com";
    const CLIENT_SECRET = "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";

    const authClient = new google.auth.OAuth2(
        CLIENT_ID,  
        CLIENT_SECRET,  
        "http://localhost:3001" // set this to site address
    );

    const drive = google.drive( {
        version: "v3",
        auth: authClient
    });

    const updateAuthClient = (accessToken: string) => {
        authClient.setCredentials({ access_token: accessToken});
    };

    const getRefreshToken = async (code: string) => {
        const { tokens } = await authClient.getToken(code).catch(err => {
            console.log(err);
            return err;
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
        }    
    };

    const getAccessToken = async (refreshToken: string) => {
        const user = new UserRefreshClient(
            CLIENT_ID,
            CLIENT_SECRET,
            refreshToken,
        );
        const { credentials } = await user.refreshAccessToken(); 
        return credentials.access_token;
    }

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
                q: `trashed=${false} and mimeType="text/plain"`,
              });  
              console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    return {
        GetRefreshToken: getRefreshToken,
        GetAccessToken: getAccessToken,
        CreateFile: createFile,
        SaveFile: saveFile,
        GetFile: getFile,
        ListFiles: listFiles
    };
}
