// app/api/download/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { url, fileName } = await request.json();
    try {
        const response = await fetch(`http://localhost:3000${url}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Response(blob, {
            headers: {
                "content-disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error('Error downloading item:', error);
        return NextResponse.json({ message: 'Failed to download item' }, { status: 500 });
    }
}