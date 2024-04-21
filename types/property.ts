"use client";

import { ReactNode } from "react";

export interface AuthProps {
    children: ReactNode;
}

export interface HeaderProps {
    avatar: string;
    headerVal: string;
    headerCurrentPath: string;
    headerMenu: { name: string; icons: React.JSX.Element }[];
    headerSel: (value: string) => void;
    headerPath: (value: string) => void;
    headerLogout: () => Promise<void>;
}

export interface DragDropZoneProp {
    id: string
}

export interface DirectoryInfo {
    totalSizeGB: number;
    numFiles: number;
    numFolders: number;
    numImages: number;
    currentDate: string;
}

export interface FileProp {
    name: string;
    size: number;
    type: string;
}