// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { createWriteStream } from "fs";
import path from "path";

export async function POST(request: Request) {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as Blob;
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const filename = formData.get("filename") as string;
    const currentPath = formData.get("currentPath") as string;
    const uid = formData.get("uid") as string;

    const uploadDir = currentPath ? `${process.env.ROOT_PATH}/${uid}/${currentPath}` : `${process.env.ROOT_PATH}/${uid}`;
    const filePath = path.join(uploadDir, filename);

    try {
        // Create or append to the file stream
        const fileStream = createWriteStream(filePath, { flags: "a" });
        const reader = chunk.stream().getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fileStream.write(Buffer.from(value));
        }

        fileStream.end(); // Close the file stream

        // Check if all chunks have been uploaded
        if (chunkIndex === totalChunks - 1) {
            return NextResponse.json({ message: "File upload complete", status: 200 });
        } else {
            return NextResponse.json({ message: "Chunk upload successful", status: 200 });
        }
    } catch (error) {
        console.error("Error occurred during file upload: ", error);
        return NextResponse.json({ message: "Failed to upload chunk", status: 500 });
    }
}
