"use client";

import {
    AudioWaveform,
    File,
    FileImage,
    FolderArchive,
    UploadCloud,
    Video,
    X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import ProgressBar from "../ui/progress";
import { toast } from "../ui/use-toast";
interface FileUploadProgress {
    progress: number;
    File: File;
}

enum FileTypes {
    Image = "image",
    Pdf = "pdf",
    Audio = "audio",
    Video = "video",
    Other = "other",
}

const ImageColor = {
    bgColor: "bg-purple-600",
    fillColor: "fill-purple-600",
};

const PdfColor = {
    bgColor: "bg-blue-400",
    fillColor: "fill-blue-400",
};

const AudioColor = {
    bgColor: "bg-yellow-400",
    fillColor: "fill-yellow-400",
};

const VideoColor = {
    bgColor: "bg-green-400",
    fillColor: "fill-green-400",
};

const OtherColor = {
    bgColor: "bg-gray-400",
    fillColor: "fill-gray-400",
};

interface UploadProps {
    currentPath: string
    uid: string,
    onComplete: () => void,
}
export const ImageUpload = ({ currentPath, uid, onComplete }: UploadProps) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);

    const getFileIconAndColor = (file: File) => {
        if (file.type.includes(FileTypes.Image)) {
            return {
                icon: <FileImage size={40} className={ImageColor.fillColor} />,
                color: ImageColor.bgColor,
            };
        }

        if (file.type.includes(FileTypes.Pdf)) {
            return {
                icon: <File size={40} className={PdfColor.fillColor} />,
                color: PdfColor.bgColor,
            };
        }

        if (file.type.includes(FileTypes.Audio)) {
            return {
                icon: <AudioWaveform size={40} className={AudioColor.fillColor} />,
                color: AudioColor.bgColor,
            };
        }

        if (file.type.includes(FileTypes.Video)) {
            return {
                icon: <Video size={40} className={VideoColor.fillColor} />,
                color: VideoColor.bgColor,
            };
        }

        return {
            icon: <FolderArchive size={40} className={OtherColor.fillColor} />,
            color: OtherColor.bgColor,
        };
    };

    const removeFile = (file: File) => {
        setFilesToUpload((prevUploadProgress) => {
            return prevUploadProgress.filter((item) => item.File !== file);
        });

        setUploadedFiles((prevUploadedFiles) => {
            return prevUploadedFiles.filter((item) => item !== file);
        });
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setFilesToUpload((prevUploadProgress) => {
            return [
                ...prevUploadProgress,
                ...acceptedFiles.map((file) => {
                    return {
                        progress: 0,
                        File: file
                    };
                }),
            ];
        });

        acceptedFiles.map((file) => {
            return uploadFileSequentially(file, currentPath, uid);
        })
    }, [currentPath, uid, uploadFileSequentially]);

    const onUploadProgress = (
        progress: number,
        message: string,
        file: File,
    ) => {
        if (progress === 100) {
            setUploadedFiles((prevUploadedFiles) => [...prevUploadedFiles, file]);

            setFilesToUpload((prevUploadProgress) =>
                prevUploadProgress.filter((item) => item.File !== file)
            );
        } else {
            setFilesToUpload((prevUploadProgress) =>
                prevUploadProgress.map((item) =>
                    item.File.name === file.name
                        ? { ...item, progress }
                        : item
                )
            );
        }
        console.log(message);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function uploadFileSequentially(file: File, currentPath: string, uid: string) {
        const CHUNK_SIZE = 1024 * 1024; // 1MB chunk size
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let startByte = 0;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
            const chunk = file.slice(startByte, endByte);

            const formData = new FormData();
            formData.append("chunk", chunk);
            formData.append("totalChunks", totalChunks.toString());
            formData.append("chunkIndex", chunkIndex.toString());
            formData.append("filename", file.name);
            formData.append("currentPath", currentPath);
            formData.append("uid", uid)

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    toast({
                        title: "Error uploading",
                        description: "Failed To upload File",
                    });
                    onComplete()
                    throw new Error("Failed to upload chunk.");
                }

                onComplete()

                const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                const message = `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`;

                onUploadProgress(progress, message, file);

                onComplete()

                startByte = endByte; // Move to the next chunk
            } catch (error) {
                console.error("Error occurred during chunk upload: ", error);
                return; // Abort upload if an error occurs
            }
        }

        const progress = 100;
        const message = "Sequential upload complete";

        onComplete()
        onUploadProgress(progress, message, file);
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div>
            <div>
                <label
                    {...getRootProps()}
                    className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-violet-500 focus:border-violet-500 hover:border-violet-500 border-dashed rounded-lg cursor-pointer"
                >
                    <div className=" text-center">
                        <div className=" border p-2 rounded-md max-w-min mx-auto">
                            <UploadCloud size={20} className="stroke-violet-500" />
                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Drag files</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Click to upload files &#40;files should be under 10 MB &#41;
                        </p>
                    </div>
                </label>

                <Input
                    {...getInputProps()}
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                />
            </div>

            {filesToUpload.length > 0 && (
                <div>
                    <ScrollArea className="h-40">
                        <p className="font-medium my-2 mt-6 text-sm">
                            Files to upload
                        </p>
                        <div className="space-y-2 pr-3">
                            {filesToUpload.map((fileUploadProgress) => {
                                return (
                                    <div
                                        key={fileUploadProgress.File.lastModified}
                                        className="flex justify-between gap-2 rounded-lg overflow-hidden border border-slate-100 group hover:pr-0 pr-2"
                                    >
                                        <div className="flex items-center flex-1 p-2">
                                            <div className="">
                                                {getFileIconAndColor(fileUploadProgress.File).icon}
                                            </div>

                                            <div className="w-full ml-2 space-y-1">
                                                <div className="text-sm flex justify-between">
                                                    <p className="text-muted-foreground ">
                                                        {fileUploadProgress.File.name.slice(0, 25)}
                                                    </p>
                                                    <span className="text-xs">
                                                        {fileUploadProgress.progress}%
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    progress={fileUploadProgress.progress}
                                                    className={
                                                        getFileIconAndColor(fileUploadProgress.File).color
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                removeFile(fileUploadProgress.File);
                                                onComplete()
                                            }}
                                            className="bg-red-500 transition-all items-center justify-center cursor-pointer px-2 hidden group-hover:flex"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div>
                    <p className="font-medium my-2 mt-6 text-muted-foreground text-sm">
                        Uploaded Files
                    </p>
                    <div className="space-y-2 pr-3">
                        {uploadedFiles.map((file) => {
                            return (
                                <div
                                    key={file.lastModified}
                                    className="flex justify-between gap-2 rounded-lg overflow-hidden border group hover:pr-0 pr-2 hover:border-slate-300 transition-all"
                                >
                                    <div className="flex items-center flex-1 p-2">
                                        <div className="">
                                            {getFileIconAndColor(file).icon}
                                        </div>
                                        <div className="w-full ml-2 space-y-1">
                                            <div className="text-sm flex justify-between">
                                                <p className="text-muted-foreground ">
                                                    {file.name.slice(0, 25)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            removeFile(file)
                                            onComplete()
                                        }}
                                        className="bg-red-500 transition-all items-center justify-center px-2 hidden group-hover:flex"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}