// app/api/delete/route.ts

import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
    try {
        const { itemName, itemType, currentPath } = await request.json();
        let itemPath: string;

        // Construct the path of the item to be deleted based on the current path
        if (currentPath === "") {
            itemPath = `./public/cloud/${itemName}`;
        } else {
            itemPath = `./public/cloud/${currentPath}/${itemName}`;
        }

        // Check if the item exists
        if (!fs.existsSync(itemPath)) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        // Delete the item based on its type (file or folder)
        if (itemType === 'file') {
            fs.unlinkSync(itemPath); // Delete file
        } else if (itemType === 'folder') {
            fs.rmdirSync(itemPath, { recursive: true }); // Delete folder recursively
        }
        return NextResponse.json({ message: 'Deletion successful' }, { status: 200 });
    } catch (error) {
        // Handle errors
        console.error('Error deleting item:', error);
        return NextResponse.json({ message: 'Failed to delete item' }, { status: 500 });
    }
}
