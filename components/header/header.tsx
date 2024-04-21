import { Button } from "@/components/ui/button"
import { Theme } from "../theme/theme"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Cloudy, LineChart, PanelLeft, Search } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb"
import React from "react"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import Image from "next/image"
import { HeaderProps } from "@/types/property"

export function Header({ avatar, headerVal, headerCurrentPath, headerMenu, headerSel, headerPath, headerLogout }: HeaderProps) {
    return (
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

                        {headerMenu.map((item, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                onClick={() => headerSel(item.name)}
                                className={`flex flex-row gap-3 justify-start h-14 items-center px-2.5 text-foreground ${headerVal.includes(item.name) ? ("bg-accent") : ("")}`}
                            >
                                {item.icons}
                                {item.name}
                            </Button>
                        ))}

                        <Button
                            variant="ghost"
                            onClick={() => headerSel("Settings")}
                            className={`flex flex-row gap-3 justify-start h-14 items-center px-2.5 text-foreground ${headerVal.includes("Settings") ? ("bg-accent") : ("")}`}
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
                        <BreadcrumbLink asChild onClick={() => headerPath("")}>
                            <h2>All Files</h2>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {headerCurrentPath.split('/').map((pathSegment, index, segments) => (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild onClick={() => headerPath(segments.slice(0, index + 1).join('/'))}>
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

            <Theme />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <Image
                            src={avatar}
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
                    <DropdownMenuItem onClick={() => headerSel("Settings")}>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => headerLogout()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}