"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cloudy,
  LineChart,
  PanelLeft,
  Search,
  Settings,
  X,
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
import { Progress } from "@/components/ui/progress"
import { signOut } from "firebase/auth"
import { auth } from "@/config/config"
import { decryptData } from "@/components/encryption/encypt"
import { Checkbox } from "@/components/ui/checkbox"
import { Theme } from "@/components/theme/theme"
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { SiderBar } from "@/components/header/sidebar"
import { Header } from "@/components/header/header"
import { DragDropZone } from "@/components/upload/drag-dropzone"
import { DirectoryInfo, FileProp } from "@/types/property"



export default function Index() {
  const { toast } = useToast()
  const [currentPath, setPath] = useState("");
  const [dialog, setDialog] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState("Home")
  const [currentUid, setCUid] = useState<string>("")
  const [avatars, setAvatar] = useState<string>("")
  const [isDetectedDragAndDrop, setIsDetectedDragAndDrop] = useState(false);
  const [fileData, setFileData] = useState<FileProp[]>([]);
  const [createdFolderName, createfolder] = useState("")

  const [directoryInfo, setDirectoryInfo] = useState<DirectoryInfo | null>(null);

  const menus = [
    {
      name: "Home",
      icons: <Cloud className={`h-5 w-5 ${selectedRoot.includes("Home") ? ("stroke-white") : ("stroke-violet-500 hover:stroke-violet-500")}`} />
    }
  ]

  // Fetch files from the server and update state
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userDataString = localStorage.getItem('user_data');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          const decryptedUid = decryptData(userData.uid);
          const avatarDecrpted = decryptData(userData.avatar);

          setAvatar(avatarDecrpted)
          setCUid(decryptedUid);
          fetchDirectoryInfo(decryptedUid);
          collection(currentPath, decryptedUid);
        } catch (error) {
          console.error('Error parsing or decrypting user data:', error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  async function fetchDirectoryInfo(uid: string) {
    try {
      const response = await fetch(`/api/storage?uid=${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: uid
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setDirectoryInfo(data);
    } catch (error) {
      console.error('Error fetching directory information:', error);
    }
  }

  const collection = (currentPath: string, currentUId: string | undefined) => {
    fetch('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPath: currentPath,
        currentUser: currentUId
      }),
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
        currentPath: currentPath,
        currentUid: currentUid
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        collection(currentPath, currentUid);
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
        currentPath: currentPath,
        uid: currentUid
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        collection(currentPath, currentUid);
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
        collection(currentPath, currentUid)
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

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user_data');
    }
    await signOut(auth)
    refreshWebsite()
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SiderBar
        sidevar={selectedRoot}
        sidemenu={menus}
        sidesel={(value) => setSelectedRoot(value)}
      />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header
          avatar={avatars.toString()}
          headerVal={selectedRoot}
          headerCurrentPath={currentPath}
          headerMenu={menus}
          headerSel={(value) => setSelectedRoot(value)}
          headerPath={(value) => setPath(value)}
          headerLogout={handleLogout}
        />

        <div
          className="flex items-center justify-center w-full h-full"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDragAndDrop}
        >
          {!isDetectedDragAndDrop && (
            <>
              {selectedRoot.includes("Home") ? (
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
                                          <Drawer>
                                            <DrawerTrigger>
                                              <Image
                                                alt="file"
                                                src="/icons/pdf.png"
                                                width={1000}
                                                height={1000}
                                                className="w-[80px] h-[70px] mb-1 rounded-[5px]"
                                              />
                                            </DrawerTrigger>

                                            <DrawerContent className="flex flex-col p-0 min-h-screen w-screen">
                                              {currentPath && currentPath !== "" ? (
                                                <>
                                                  <embed src={`/${currentUid}/${currentPath}/${item.name}`} type="application/pdf" className="w-full h-screen p-0 object-contain" />
                                                  <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute top-5 right-0 m-4 p-2 rounded-full z-5"
                                                  >
                                                    <DrawerClose>
                                                      <X />
                                                    </DrawerClose>
                                                  </Button>
                                                </>
                                              ) : (
                                                <>
                                                  <embed src={`/${currentUid}/${item.name}`} type="application/pdf" className="w-full h-screen p-0 object-contain" />
                                                  <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute top-5 right-0 mt-4 mr-3 rounded-full z-5"
                                                  >
                                                    <DrawerClose>
                                                      <X className="stroke-violet-500" />
                                                    </DrawerClose>
                                                  </Button>
                                                </>
                                              )}
                                            </DrawerContent>
                                          </Drawer>
                                        ) : item.type.includes("image") && !item.name.includes("The requested resource isn't a valid image for") ? (
                                          <Dialog>
                                            <DialogTrigger>
                                              {currentPath && currentPath !== "" ? (
                                                <Image
                                                  alt="file"
                                                  src={`/${currentUid}/${currentPath}/${item.name}`}
                                                  width={1000}
                                                  height={1000}
                                                  loading="lazy"
                                                  className="w-full h-24 rounded-[5px]"
                                                />
                                              ) : (
                                                <Image
                                                  alt="file"
                                                  src={`/${currentUid}/${item.name}`}
                                                  width={1000}
                                                  height={1000}
                                                  loading="lazy"
                                                  className="w-full h-24 rounded-[5px]"
                                                />
                                              )}
                                            </DialogTrigger>

                                            <DialogContent className="p-1 rounded-[8px] shrink-0 shadow-none"
                                              style={{
                                                backgroundImage: `url("/${currentUid}/${item.name}") no-repeat center center fixed`,
                                                backgroundSize: "cover",
                                                WebkitBackgroundSize: "auto"
                                              }}>
                                              <div className="w-full h-full">
                                                {currentPath && currentPath !== "" ? (
                                                  <Image
                                                    alt="file"
                                                    src={`/${currentUid}/${currentPath}/${item.name}`}
                                                    width={1000}
                                                    height={1000}
                                                    priority={true}
                                                    className="w-full h-full rounded-[5px]"
                                                  />
                                                ) : (
                                                  <Image
                                                    alt="file"
                                                    src={`/${currentUid}/${item.name}`}
                                                    width={1000}
                                                    height={1000}
                                                    priority={true}
                                                    className="w-full h-full rounded-[10px] z-[100]"
                                                  />
                                                )}
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        ) : (<></>)}
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
                            <ImageUpload currentPath={currentPath} uid={currentUid} onComplete={() => collection(currentPath, currentUid)} />
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
              ) : selectedRoot.includes("Settings") ? (
                <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
                  <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                  </div>

                  <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav
                      className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
                    >
                      <Link href="#" className="font-semibold text-primary">
                        General
                      </Link>
                      <Link href="#">Security</Link>
                      <Link href="#">Integrations</Link>
                      <Link href="#">Support</Link>
                      <Link href="#">Organizations</Link>
                      <Link href="#">Advanced</Link>
                    </nav>
                    <div className="grid gap-6">
                      <Card x-chunk="dashboard-04-chunk-1">
                        <CardHeader>
                          <CardTitle>Store Name</CardTitle>
                          <CardDescription>
                            Used to identify your store in the marketplace.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form>
                            <Input placeholder="Store Name" />
                          </form>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                          <Button>Save</Button>
                        </CardFooter>
                      </Card>
                      <Card x-chunk="dashboard-04-chunk-2">
                        <CardHeader>
                          <CardTitle>Plugins Directory</CardTitle>
                          <CardDescription>
                            The directory within your project, in which your plugins are
                            located.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form className="flex flex-col gap-4">
                            <Input
                              placeholder="Project Name"
                              defaultValue="/content/plugins"
                            />
                            <div className="flex items-center space-x-2">
                              <Checkbox id="include" defaultChecked />
                              <label
                                htmlFor="include"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Allow administrators to change the directory.
                              </label>
                            </div>
                          </form>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                          <Button>Save</Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </main>
              ) : ("")}
            </>
          )}

          {isDetectedDragAndDrop && (
            <DragDropZone id={"uploads"} />
          )}
        </div>
      </div>
    </div>
  );
}