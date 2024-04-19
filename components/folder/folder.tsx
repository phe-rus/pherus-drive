import { Folder } from "lucide-react"
import { Card, CardContent, CardHeader } from "../ui/card"
import Image from "next/image"

export const Folders = () => {
    return (
        <div className="flex flex-col w-fit">
            <Image
                alt="folder"
                src="/icons/folder.png"
                width={1000}
                height={1000}
                className="w-20 h-20" />

            <div className="p-3">
                <h2 className="text-[8px] font-bold">Folder Name</h2>
            </div>
        </div>
    )
}