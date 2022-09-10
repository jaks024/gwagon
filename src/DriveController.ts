import { UserRefreshClient } from "google-auth-library";
import { google } from "googleapis";
import { IEntry } from "./models/IEntry";

export function DriveController() {
    const CLIENT_ID = "1019728199135-2bqo08s8e7ml30shimo019a4pqu275e1.apps.googleusercontent.com";
    const CLIENT_SECRET = process.env.CLIENTSECRET;
    const USERDATA_FILENAME = "gwagon-userdata";
    
    const authClient = new google.auth.OAuth2(
        CLIENT_ID,  
        CLIENT_SECRET,  
        process.env.APPDOMAIN
    );

    const drive = google.drive( {
        version: "v3",
        auth: authClient
    });

    const updateAuthClient = (accessToken: string) => {
        authClient.setCredentials({ access_token: accessToken});
    };

    const getRefreshToken = async (code: string) => {
        const response = await authClient.getToken(code).catch(err => {
            console.log(err);
            return err;
        });
        console.log(response);
        if (response.res.status == 200) {
            return {
                accessToken: response.tokens.access_token,
                refreshToken: response.tokens.refresh_token
            };
        } 
        return 500;
    };

    const getAccessToken = async (refreshToken: string) => {
        const user = new UserRefreshClient(
            CLIENT_ID,
            CLIENT_SECRET,
            refreshToken,
        );
        const { credentials } = await user.refreshAccessToken(); 
        return credentials.access_token;
    };

    const createFile = async (accessToken: string, fileName: string) => {
        updateAuthClient(accessToken);
        
        let status = 500;
        await drive.files.create({
            requestBody: {
                name: fileName,
                parents: ["appDataFolder"],
                mimeType: "application/json",
            }
        })
        .then(res => {
            status = res.status;
        })
        .catch( (err) => {
            console.log(err);
        });
        return status;
    };

    const getSaveFileName = (month: number | string, year: number | string) => {
        return `${year}-${month}`;
    };

    const getFileIdFromFileName = async (accessToken: string, fileName: string) => {
        const files = await listFiles(accessToken, fileName);
        if (files.length == 0) {
            return -1;
        }
        return files[0].id;
    };

    const addEntry = async (accessToken: string, data: string) => {
        updateAuthClient(accessToken);

        let entry : IEntry;
        try {
            console.log(data);
            entry = JSON.parse(JSON.stringify(data));
        } catch (err) {
            console.log(err);
            return 500;
        }
        
        const saveFileName = getSaveFileName(entry.month, entry.year);
        let fileId = await getFileIdFromFileName(accessToken, saveFileName);
        
        let isNewFile = false;
        if (fileId === -1) {
            console.log(`file id not found from ${saveFileName}, attempting to create save file`);
            const createStatus = await createFile(accessToken, saveFileName);
            if (createStatus === 200) {
                fileId = await getFileIdFromFileName(accessToken, saveFileName);
                if (fileId === -1) {
                    console.log("failed to create new save file");
                    return 500;
                }
            }
            isNewFile = true;
        }

        let updatedData: string;
        if (isNewFile) {
            const newSaveData: IEntry[] = [
                entry
            ];
            updatedData = JSON.stringify(newSaveData);
        } else {
            const retrievdData = await getFileFromId(fileId);
            if (retrievdData === 500) {
                console.log(`failed to retireve data from file id: ${fileId}`);
                return 500;
            }

            const savedData: IEntry[] = JSON.parse(JSON.stringify(retrievdData));
            console.log(savedData);
            savedData.push(entry);
            updatedData = JSON.stringify(savedData);
        }

        const response = await drive.files.update({
            fileId: fileId,
            media: {
                body: updatedData
            }
        });
        
        return response.status;
    };

    const removeEntry = async (accessToken: string, year: string, month: string, entryId: string) => {
        const fileId = await getFileIdFromFileName(accessToken, getSaveFileName(month, year));
        const retrievdData = await getFileFromId(fileId);
        if (retrievdData === 500) {
            console.log(`failed to retireve data from file id: ${fileId}`);
            return 500;
        }
        const savedData: IEntry[] = JSON.parse(JSON.stringify(retrievdData));
        let entryIndex = -1;
        console.log("entry id " + entryId);
        for (let i = 0; i < savedData.length; ++i) {
            console.log(savedData[i].id.toString());
            if (savedData[i].id.toString() == entryId) {
                entryIndex = i;
            }
        }
        if (entryIndex === -1) {
            return 200;
        }
        console.log("removed index " + entryIndex);
        savedData.splice(entryIndex, 1);
        const updatedData = JSON.stringify(savedData);
        
        const response = await drive.files.update({
            fileId: fileId,
            media: {
                body: updatedData
            }
        });
        
        return response.status;
    };

    const getFileFromId = async (fileId: string) => {
        const response = await drive.files.get({
            fileId: fileId,
            alt: "media"
        });
        console.log("get");
        console.log(response.data);
        if (response.status == 200) {
            return response.data; 
        }
        console.log(`failed to get file from file id ${fileId}`);
        return response.status;
    };

    const getFile = async (accessToken: string, fileName: string) => {
        updateAuthClient(accessToken);

        const fileId = await getFileIdFromFileName(accessToken, fileName);
        if (fileId == -1) {
            console.log(`did not fild file with name ${fileName}`);
            return 500;
        }
        return getFileFromId(fileId);
    };

    const listFiles = async (accessToken: string, fileName: string) => {
        updateAuthClient(accessToken);

        console.log(fileName);
        const response = await drive.files.list({
            q: `name="${fileName}"`,
            spaces: "appDataFolder"
        })
        .catch((err) => {
            console.log(err);
            return err;
        });  
        if (response.status == 200) {
            console.log(response);
            return (response as any).data.files;
        }
        return [];
    };

    // delete all files of the same file name
    const deleteFile = async (accessToken: string, fileName: string) => {
        updateAuthClient(accessToken);

        const files: any[] = await listFiles(accessToken, fileName);
        let ok = true;
        files.forEach(async (file) => {
            if (file.name == fileName) {
                const response: any = await drive.files.delete({
                    fileId: file.id
                }).catch(err => {
                    console.log(err);
                    ok = false;
                    return 500;
                });
                if (response.status != 200 || response.status != 204) {
                    ok = false;
                }
                console.log(response);
            }
        });
        return ok ? 200 : 500;
    };

    const saveData = async (accessToken: string, fileId: string, data: string) => {
        updateAuthClient(accessToken);

        console.log(data);
        const response = await drive.files.update({
            fileId: fileId,
            media: {
                body: data
            }
        });
        console.log(response);
        return response.status;
    };

    const createUserData = async (accessToken: string) => {
        const status = await createFile(accessToken, USERDATA_FILENAME);
        return status;
    };

    const getUserData = async (accessToken: string) => {
        const fileId = await getFileIdFromFileName(accessToken, USERDATA_FILENAME);
        console.log(fileId);
        if (fileId == -1) {
            return null;
        }
        const data = await getFileFromId(fileId);
        return data;
    };
    
    const saveUserData = async (accessToken: string, data: string) => {
        const fileId = await getFileIdFromFileName(accessToken, USERDATA_FILENAME);
        if (fileId == -1) {
            return 500;
        }
        const status = saveData(accessToken, fileId, data);
        return status;
    };

    return {
        GetRefreshToken: getRefreshToken,
        GetAccessToken: getAccessToken,
        CreateFile: createFile,
        CreateUserData: createUserData,
        AddEntry: addEntry,
        SaveData: saveData,
        SaveUserData: saveUserData,
        DeleteFile: deleteFile,
        GetSaveFileName: getSaveFileName,
        GetFile: getFile,
        GetUserData: getUserData,
        ListFiles: listFiles,
        RemoveEntry: removeEntry
    };
}
