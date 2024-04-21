import { Cloudy, Link, LucideCloudy, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Button } from "../ui/button"

interface SiderBarProps {
    sidevar: string;
    sidemenu: { name: string; icons: React.JSX.Element }[];
    sidesel: (value: string) => void;
}

export const SiderBar = ({ sidevar, sidemenu, sidesel }: SiderBarProps) => {
    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full size-[30px]"
                >
                    <LucideCloudy className="h-8 w-8 transition-all group-hover:scale-110" />
                    <span className="sr-only">Pherus Drive</span>
                </Button>

                {sidemenu.map((item, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => sidesel(item.name)}
                                    className={`rounded-full ${sidevar.includes(item.name) ? ("bg-violet-500 stroke-white") : ("stroke-violet-500")}`}
                                >
                                    {item.icons}
                                    <span className="sr-only">{item.name}</span>
                                </Button>
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`rounded-full ${sidevar.includes("Settings") ? ("bg-violet-500") : ("")}`}
                                onClick={() => sidesel("Settings")}
                            >
                                <Settings className={`h-5 w-5 ${sidevar.includes("Settings") ? ("stroke-white") : ("stroke-violet-500 hover:stroke-violet-500")}`} />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    )
}