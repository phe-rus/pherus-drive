import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Define a route to create a directory
export async function POST(request: Request) {
    try {
        const { uid } = await request.json();
        const directoryPath = `./public/${uid}`;

        // Check if directory already exists
        if (fs.existsSync(directoryPath)) {
            return NextResponse.json({ status: 200 });
        }

        // Create the directory
        fs.mkdir(directoryPath, { recursive: true }, (err) => {
            if (err) {
                return NextResponse.json({ error: 'Failed to create directory', details: err.message }, { status: 500 });
            }
            return NextResponse.json({ message: 'Welcome To Pherus Cloud Drive' }, { status: 200 });
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}