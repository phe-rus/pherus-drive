// app/api/share/route.ts

import { NextResponse } from "next/server";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Function to generate a random token
function generateToken(length: number = 8): string {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, length); // return required number of characters
}

// Function to get the icon based on file type
function getFileIcon(type: string): string {
    if (type.includes("folder")) {
        return "/icons/folder.png";
    } else if (type.includes("image")) {
        return "/icons/image.png";
    } else {
        return "/icons/file.png";
    }
}

export async function POST(request: Request) {
    try {
        // Parse request body
        const { name, type, currentPath } = await request.json();

        // Generate a random token for the folder
        const token = generateToken();

        // Construct the shareable link based on the token and folder information
        const shareableLink = `http://example.com/share/${token}/${currentPath}/${name}`;

        // Get the appropriate icon based on the file type
        const icon = getFileIcon(type);

        return NextResponse.json({ shareableLink, icon }, { status: 200 });
    } catch (error) {
        // Handle errors
        console.error('Error generating shareable link:', error);
        return NextResponse.json({ message: 'Failed to generate shareable link' }, { status: 500 });
    }
}
