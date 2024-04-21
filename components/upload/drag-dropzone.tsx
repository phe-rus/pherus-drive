import { DragDropZoneProp } from "@/types/property";

export const DragDropZone = ({ id }: DragDropZoneProp) => {
    return (
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
                    id={id}
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
    )
}