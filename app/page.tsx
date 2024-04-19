"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cloudy,
  Copy,
  CreditCard,
  Home,
  icons,
  LineChart,
  MoreVertical,
  MoveRight,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/upload/mage-upload"
import axios from "axios"
import { DirectoryInfo } from "@/types/directoryinfor"
import ProgressBar, { Progress } from "@/components/ui/progress"

interface FileProp {
  name: string;
  size: number;
  type: string;
}

export default function Index() {
  const { toast } = useToast()
  const [currentPath, setPath] = useState("");
  const [dialog, setDialog] = useState(false);
  const [isDetectedDragAndDrop, setIsDetectedDragAndDrop] = useState(false);
  const [fileData, setFileData] = useState<FileProp[]>([]);
  const [createdFolderName, createfolder] = useState("")

  const [directoryInfo, setDirectoryInfo] = useState<DirectoryInfo | null>(null);

  const menus = [
    {
      name: "Home",
      icons: <Cloud />
    }
  ]

  // Fetch files from the server and update state
  useEffect(() => {
    fetchDirectoryInfo();
    collection(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  async function fetchDirectoryInfo() {
    try {
      const response = await axios.get('/api/storage');
      setDirectoryInfo(response.data);
    } catch (error) {
      console.error('Error fetching directory information:', error);
    }
  }

  const collection = (currentPath: string) => {
    fetch('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: currentPath, // Correctly stringify the currentPath
    })
      .then(response => {
        if (!response.ok) {
          toast({
            title: "Failed to fetch files",
            description: "Failed to fetch files",
          })
          throw new Error('Failed to fetch files');
        }
        return response.json();
      })
      .then(data => {
        //setFiles(data);
        setFileData(data);
      })
      .catch(error => {
        toast({
          title: "Error fetching files",
          description: `Error fetching files ${error}`,
        })
      });
  };

  const createFolder = () => {
    if (createdFolderName == "") {
      toast({
        title: "Failed To Create Folder",
        description: "Please Input a name for your folder",
      })
      return
    }

    fetch(`/api/create`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        folderName: createdFolderName,
        currentPath: currentPath
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        collection(currentPath);
        toast({
          title: "Successfully Created Folder",
          description: `Created ${createdFolderName}`,
        })
        createfolder("")
        return response.json();
      })
      .catch(error => console.error('Error fetching files:', error))
  }

  const deleteFile = (
    fileName: string,
    fileType: string,
  ) => {
    fetch("/api/delete", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemName: fileName,
        itemType: fileType,
        currentPath: currentPath
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        collection(currentPath);
        toast({
          title: "Successfully Deleted Folder",
          description: `Deleted ${fileType} ${fileName}`,
        })
        return response.json();
      })
      .catch(error => console.error('Error fetching files:', error))
  }

  const refreshWebsite = () => {
    window.location.reload();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDetectedDragAndDrop(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDetectedDragAndDrop(false);
  };

  const handleDragAndDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDetectedDragAndDrop(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files?.[0];

      // Pass the file directly to uploadFileSequentially
      uploadFileSequentially(file, currentPath);
    }
  };

  async function uploadFileSequentially(file: File, currentPath: string) {
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

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          toast({
            title: "Error uploading",
            description: "Failed To upload File"
          })
          throw new Error("Failed to upload chunk.");
        }

        toast({
          title: "Upload Progress",
          description: ""
        })

        console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`);

        startByte = endByte; // Move to the next chunk
      } catch (error) {
        console.error("Error occurred during chunk upload: ", error);
        return; // Abort upload if an error occurs
      }
    }

    console.log("Sequential upload complete");
  }

  // Update the current path when clicking on a folder
  const handleClick = (item: FileProp) => {
    if (item.type.includes("folder")) {
      setPath((prevPath) => {
        if (prevPath === "") {
          return item.name; // If current path is empty, set to the folder name
        } else {
          return `${prevPath}/${item.name}`; // Otherwise, append the folder name to the current path
        }
      });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("index"));

    const draggedItem = fileData[sourceIndex];
    const updatedFileData = [...fileData];
    updatedFileData.splice(sourceIndex, 1);
    updatedFileData.splice(targetIndex, 0, draggedItem);
    setFileData(updatedFileData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Cloudy className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Pherus Drive</span>
          </Link>

          {menus.map((item, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    {item.icons}
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>

        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-3 text-lg font-medium">
                <div className="flex flex-row gap-3 items-center">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                  >
                    <Cloudy className="h-5 w-5 transition-all group-hover:scale-110" />
                  </Button>
                  <h1 className="text-lg font-bold">Pherus Drive</h1>
                </div>

                {menus.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="flex flex-row gap-3 justify-start h-14 items-center px-2.5 text-foreground"
                  >
                    {item.icons}
                    {item.name}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  className="flex flex-row gap-3 justify-start h-14 items-center px-2.5 text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild onClick={() => setPath("")}>
                  <h2>All Files</h2>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {currentPath.split('/').map((pathSegment, index, segments) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild onClick={() => setPath(segments.slice(0, index + 1).join('/'))}>
                      <h2>{pathSegment}</h2>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/next.svg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div
          className="flex items-center justify-center w-full h-full"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDragAndDrop}
        >
          {!isDetectedDragAndDrop && (
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
              <Breadcrumb className="flex md:hidden">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild onClick={() => setPath("")}>
                      <h2>All Files</h2>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {currentPath.split('/').map((pathSegment, index, segments) => (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild onClick={() => setPath(segments.slice(0, index + 1).join('/'))}>
                          <h2>{pathSegment}</h2>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <Dialog>
                  <ContextMenu >
                    <ContextMenuTrigger className="w-full md:h-screen">
                      <div className="grid gap-4 grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 h-fit w-full">
                        {fileData
                          .sort((a, b) => {
                            if (a.type === 'folder' && b.type !== 'folder') {
                              return -1; // Folder comes before non-folder
                            } else if (a.type !== 'folder' && b.type === 'folder') {
                              return 1; // Non-folder comes before folder
                            } else {
                              return 0; // Keep the order unchanged
                            }
                          })
                          .map((item, index) => (
                            <ContextMenu key={index}>
                              <div
                                x-chunk={`dashboard-05-chunk-${index}`}
                                draggable={item.type.includes("folder")}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}
                                style={{ zIndex: 1 }}
                                onClick={() => handleClick(item)}
                                className="flex flex-col">
                                <ContextMenuTrigger>
                                  <div className="flex flex-col w-full items-center">
                                    {item.type.includes("folder") ? (
                                      <Image
                                        alt="folder"
                                        src="/icons/folder.png"
                                        width={1000}
                                        height={1000}
                                        className="w-20 h-20"
                                      />
                                    ) : item.type.includes("file") ? (
                                      <Image
                                        alt="file"
                                        src="/icons/markdown.png"
                                        width={1000}
                                        height={1000}
                                        className="w-[80px] h-[70px] mb-1 rounded-[5px]"
                                      />
                                    ) : item.type.includes("compressed") ? (
                                      <Image
                                        alt="file"
                                        src="/icons/zip.png"
                                        width={1000}
                                        height={1000}
                                        className="w-[80px] h-[70px] mb-1 rounded-[5px]"
                                      />
                                    ) : item.type.includes("video") ? (
                                      <Image
                                        alt="file"
                                        src="/icons/video.png"
                                        width={1000}
                                        height={1000}
                                        className="w-[80px] h-[70px] mb-1 rounded-[5px]"
                                      />
                                    ) : item.type.includes("pdf") ? (
                                      <Image
                                        alt="file"
                                        src="/icons/pdf.png"
                                        width={1000}
                                        height={1000}
                                        className="w-[80px] h-[70px] mb-1 rounded-[5px]"
                                      />
                                    ) : (
                                      <Dialog>
                                        <DialogTrigger>
                                          {currentPath && currentPath !== "" ? (
                                            <Image
                                              alt="file"
                                              src={`/cloud/${currentPath}/${item.name}`}
                                              width={1000}
                                              height={1000}
                                              className="w-full h-24 rounded-[5px]"
                                            />
                                          ) : (
                                            <Image
                                              alt="file"
                                              src={`/cloud/${item.name}`}
                                              width={1000}
                                              height={1000}
                                              className="w-full h-24 rounded-[5px]"
                                            />
                                          )}
                                        </DialogTrigger>

                                        <DialogContent className="p-1 rounded-[8px] shrink-0 shadow-none"
                                          style={{
                                            backgroundImage: `url("/cloud/${item.name}") no-repeat center center fixed`,
                                            backgroundSize: "cover",
                                            WebkitBackgroundSize: "auto"
                                          }}>
                                          <div className="w-full h-full">
                                            {currentPath && currentPath !== "" ? (
                                              <Image
                                                alt="file"
                                                src={`/cloud/${currentPath}/${item.name}`}
                                                width={1000}
                                                height={1000}
                                                className="w-full h-full rounded-[5px]"
                                              />
                                            ) : (
                                              <Image
                                                alt="file"
                                                src={`/cloud/${item.name}`}
                                                width={1000}
                                                height={1000}
                                                className="w-full h-full rounded-[10px] z-[100]"
                                              />
                                            )}
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                    <Label className="text-center w-20 whitespace-normal z-0 line-clamp-1">{item.name.toString()}</Label>
                                  </div>
                                </ContextMenuTrigger>
                              </div>

                              <ContextMenuContent>
                                <ContextMenuItem>Rename</ContextMenuItem>
                                <ContextMenuItem onClick={() => deleteFile(
                                  item.name,
                                  item.type
                                )}>Delete</ContextMenuItem>
                                <ContextMenuItem>Share</ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          ))}
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent>
                      <DialogTrigger className="w-full">
                        <ContextMenuItem onClick={() => setDialog(false)}>Create Folder</ContextMenuItem>
                      </DialogTrigger>

                      <DialogTrigger asChild>
                        <ContextMenuItem onClick={() => setDialog(true)}>Upload</ContextMenuItem>
                      </DialogTrigger>

                      <ContextMenuItem onClick={() => refreshWebsite()}>Refresh</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {dialog ? (
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-center">
                          Upload your files
                        </DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <ImageUpload currentPath={currentPath} />
                      </div>
                    </DialogContent>
                  ) : (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create A Folder</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col">
                        <Input
                          placeholder="Folder Name"
                          value={createdFolderName}
                          onChange={(e) => createfolder(e.target.value)}
                          className="flex rounded-[5px]" />
                      </div>

                      <DialogFooter>
                        <Button variant="outline" size="sm" className="rounded-full"
                          onClick={() => createFolder()}>
                          <DialogClose>
                            Create Folder
                          </DialogClose>
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>
              </div>

              <div className="md:flex md:flex-col md:w-full hidden">
                <Card
                  className="overflow-hidden w-full" x-chunk="dashboard-05-chunk-4"
                >
                  <CardHeader className="flex flex-row items-start bg-muted/50">
                    <div className="grid gap-0.5">
                      <CardTitle className="group flex items-center gap-2 text-lg">
                        Pherus Drive
                      </CardTitle>
                      <CardDescription>Date: {directoryInfo?.currentDate}</CardDescription>
                    </div>

                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                          Own Cloud Drive
                        </span>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 text-sm w-full">
                    <div className="grid gap-3">
                      <div className="font-semibold">Storage</div>
                      <ul className="grid gap-3">
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Totoal Storage
                          </span>
                          <span>15 GB</span>
                        </li>

                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Used Storage
                          </span>
                          <span>{`${directoryInfo?.totalSizeGB} GB`}</span>
                        </li>

                        <Progress value={directoryInfo?.totalSizeGB} className="h-10 rounded-[5px]" />
                      </ul>

                      <Separator className="my-2" />
                      <ul className="grid gap-3">
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Folders</span>
                          <span>{directoryInfo?.numFolders}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Files</span>
                          <span>{directoryInfo?.numFiles}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Photos</span>
                          <span>{directoryInfo?.numImages}</span>
                        </li>
                        <li className="flex items-center justify-between font-semibold">
                          <span className="text-muted-foreground">Total</span>
                          <span>{`${directoryInfo?.totalSizeGB} GB`}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                    <div className="text-xs text-muted-foreground">
                      Updated <time dateTime="2023-11-23">{directoryInfo?.currentDate}</time>
                    </div>
                    <Pagination className="ml-auto mr-0 w-auto" aria-disabled>
                      <PaginationContent>
                        <PaginationItem>
                          <Button disabled size="icon" variant="outline" className="h-6 w-6">
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span className="sr-only">Previous Order</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button disabled size="icon" variant="outline" className="h-6 w-6">
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="sr-only">Next Order</span>
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            </main>
          )}

          {isDetectedDragAndDrop && (
            <div
              className="fixed inset-0 z-10 bg-opacity-50 flex items-center justify-center rounded-lg border border-dashed shadow-sm"
            >
              <label htmlFor="dropzone-file" className="">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Drag and</span> drop here to upload</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Files, Folders, Images, Music, Compressed etc (MAX. 800x400px)</p>
                </div>

                <input
                  type="file"
                  id="uploads"
                  className="hidden"
                  onChange={(e) => {
                    // Handle file selection here
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      console.log('Files selected:', files);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}