import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface DirectoryInfo {
    totalSizeGB: number;
    totalFiles: number;
    totalFolders: number;
    totalPhotos: number;
    totalOtherFiles: number;
}

export async function PUT(request: Request) {
    const { uid } = await request.json();
    const directoryPath = `./public/${uid}`;
    const fullPath = path.join(process.cwd(), directoryPath);

    try {
        const files = await fs.readdir(fullPath);
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const stats = await fs.stat(path.join(fullPath, file));
                return { name: file, stats };
            })
        );

        const directoryInfo: DirectoryInfo = {
            totalSizeGB: 0,
            totalFiles: 0,
            totalFolders: 0,
            totalPhotos: 0,
            totalOtherFiles: 0
        };

        directoryInfo.totalFiles = fileStats.filter(file => file.stats.isFile()).length;
        directoryInfo.totalFolders = fileStats.filter(file => file.stats.isDirectory()).length;

        // Filter out folders and images
        const folders = fileStats.filter((file) => file.stats.isDirectory());
        const images = fileStats.filter((file) =>
            /\.(jpg|jpeg|png|gif)$/i.test(file.name)
        );

        // Calculate total size in bytes
        const totalLimitGB = 15; // Total limit in GB
        const totalSizeBytes = 123456789; // Example total size in bytes
        const totalSizeGBs = totalSizeBytes / (1024 * 1024 * 1024);
        const totalSizeGB = (totalSizeGBs / totalLimitGB) * 100;

        // Format date
        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        return NextResponse.json({
            totalSizeGB: totalSizeGB.toFixed(2),
            numFiles: directoryInfo.totalFiles,
            numFolders: directoryInfo.totalFolders,
            numImages: images.length,
            currentDate,
        });
    } catch (error) {
        console.error("Error occurred: ", error);
        return NextResponse.json({ error: "Failed to fetch directory information" }, { status: 500 });
    }
}
