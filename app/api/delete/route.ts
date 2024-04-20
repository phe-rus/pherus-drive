// app/api/delete/route.ts

import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
    try {
        const { itemName, itemType, currentPath, uid } = await request.json();
        let itemPath: string;

        // Construct the path of the item to be deleted based on the current path
        if (currentPath === "") {
            itemPath = `./public/${uid}/${itemName}`;
        } else {
            itemPath = `./public/${uid}/${currentPath}/${itemName}`;
        }

        // Check if the item exists
        if (!fs.existsSync(itemPath)) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        // Delete the item based on its type (file or folder)
        if (itemType === 'folder') {
            fs.rmdirSync(itemPath, { recursive: true }); // Delete folder recursively
        } else {
            fs.unlinkSync(itemPath); // Delete file
        }

        return NextResponse.json({ message: 'Deletion successful' }, { status: 200 });
    } catch (error) {
        // Handle errors
        console.error('Error deleting item:', error);
        return NextResponse.json({ message: 'Failed to delete item' }, { status: 500 });
    }
}
