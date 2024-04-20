// app/api/route.ts 👈🏽
export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const {currentPath , currentUser } = await request.json();
    let directoryPath: string;

    if (currentPath === "" && currentUser !== "") {
        directoryPath = `./public/${currentUser}`;
    } else {
        directoryPath = `./public/${currentUser}/${currentPath}`;
    }

    try {
        // Check if the directory exists
        if (!fs.existsSync(directoryPath) || !fs.lstatSync(directoryPath).isDirectory()) {
            return NextResponse.json({ message: `Directory not found: ${directoryPath}` }, { status: 404 });
        }

        // Get directory contents
        const directoryContents = fs.readdirSync(directoryPath);
        if (directoryContents.length === 0) {
            // Return an empty array if directory is empty
            return NextResponse.json([], { status: 200 });
        }

        // Process directory contents
        const items = [];
        for (const item of directoryContents) {
            const itemPath = path.join(directoryPath, item);
            if (!fs.existsSync(itemPath)) continue; // Skip non-existent files

            const stats = fs.statSync(itemPath);
            let fileType;
            if (stats.isDirectory()) {
                fileType = 'folder';
            } else {
                const ext = path.extname(item).toLowerCase();
                switch (ext) {
                    case '.mp4':
                    case '.avi':
                    case '.mov':
                        fileType = 'video';
                        break;
                    case '.pdf':
                        fileType = "pdf";
                        break;
                    case '.zip':
                    case '.rar':
                    case '.7z':
                        fileType = 'compressed';
                        break;
                    case '.ipa':
                    case '.apk':
                        fileType = 'iOS';
                        break;
                    case '.jpg':
                    case '.jpeg':
                    case '.png':
                    case '.gif':
                    case '.svg':
                    case '.bmp':
                    case '.webp':
                    case '.avif':
                        fileType = 'image';
                        break;
                    default:
                        fileType = 'file';
                        break;
                }
            }
            items.push({
                name: item,
                type: fileType,
                size: stats.size,
            });
        }

        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while reading the directory: ${error}` },
            { status: 500 }
        );
    }
}

/**export async function PUT(request: Request) {
    try {
        const { oldName, newName, isFolder } = await request.json();

        const oldPath = path.join('./public/cloud', oldName);
        const newPath = path.join('./public/cloud', newName);

        fs.renameSync(oldPath, newPath);
        return NextResponse.json({ message: 'Rename successful' }, { status: 200 });
    } catch (error) {
        // Handle errors
        console.error('Error renaming folder/file:', error);
        return NextResponse.json({ message: 'Failed to rename folder/file' }, { status: 500 });
    }
} **/