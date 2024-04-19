// app/api/route.ts 👈🏽
export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const currentPath = await request.text();
    let directoryPath: string;

    if (currentPath === "") {
        directoryPath = "./public/cloud";
    } else {
        directoryPath = `./public/cloud/${currentPath}`;
    }

    try {
        const items = fs.readdirSync(directoryPath).map((item) => {
            const itemPath = path.join(directoryPath, item);
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
                    case '.bmp':
                        fileType = 'image';
                        break;
                    default:
                        fileType = 'file';
                        break;
                }
            }
            return {
                name: item,
                type: fileType,
                size: stats.size,
            };
        });
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while reading the directory: ${error}` },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
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
}