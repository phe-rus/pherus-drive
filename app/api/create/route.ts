// app/api/create/route.ts

import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function PUT(request: Request) {
    try {
        const { folderName, currentPath , currentUid} = await request.json();
        let directoryPath: string;

        // Construct the directory path based on the current path
        if (currentPath === "") {
            directoryPath = `${process.env.ROOT_PATH}/${currentUid}`;
        } else {
            directoryPath = `${process.env.ROOT_PATH}/${currentUid}/${currentPath}`;
        }

        // Create the directory
        const newFolderPath = path.join(directoryPath, folderName);
        fs.mkdirSync(newFolderPath);

        return NextResponse.json({ message: 'Folder creation successful' }, { status: 200 });
    } catch (error) {
        // Handle errors
        console.error('Error creating folder:', error);
        return NextResponse.json({ message: 'Failed to create folder' }, { status: 500 });
    }
}
