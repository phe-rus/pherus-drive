"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { LucideCloudy, LucideLockKeyhole } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { auth } from "@/config/config";
import { encryptData } from "../encryption/encypt";
import { toast } from "../ui/use-toast";
import { Progress } from "../ui/progress";
import { AuthProps } from "@/types/property";

export const Auths = ({ children }: AuthProps) => {
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [currentUser, setCurrentUser] = useState<boolean>(false);

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (typeof window !== 'undefined' && window.localStorage) {
                        localStorage.setItem('user_data',
                            JSON.stringify(
                                {
                                    email: encryptData(user.email),
                                    displayName: encryptData(user.displayName),
                                    uid: encryptData(user.uid),
                                    avatar: encryptData(user.photoURL)
                                }
                            )
                        );
                    }
                    createDirectory(user.uid); // Pass the UID to createDirectory function
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    }

    async function createDirectory(uid: string | null) {
        if (uid == null) {
            return;
        }

        try {
            const response = await fetch("/api/new", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: uid })
            });

            if (!response.ok) {
                toast({
                    title: "Failed",
                    description: `Failed to create directory`,
                });
                throw new Error('Failed to create directory');
            }

            toast({
                title: "Success",
                description: `Successfull Logged In !!`,
            });
            setCurrentUser(true);
        } catch (error) {
            console.error('Error creating directory:', error);
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const userDataString = localStorage.getItem('user_data');
            if (userDataString && userDataString.trim() !== '') {
                // If user data exists in local storage, start loading until currentUser becomes true
                const interval = setInterval(() => {
                    setLoadingPercentage(prevPercentage => {
                        const newPercentage = prevPercentage + 10;
                        return newPercentage >= 100 ? 100 : newPercentage;
                    });
                }, 500);

                // Set currentUser to true once loading reaches 100%
                setTimeout(() => {
                    setCurrentUser(true);
                    clearInterval(interval);
                    setLoadingPercentage(100);
                }, 3000); // Adjust the duration as needed

            } else {
                // If user data does not exist, set currentUser to false immediately
                setCurrentUser(false);
            }
        }
    }, []);

    return (
        <div className="flex-1">
            {
                currentUser ? (
                    <>{children}</>
                ) : (
                    <section className="flex flex-col w-full h-full items-center justify-center bg-muted/40">
                        <div className="flex flex-col gap-10 justify-center items-center">
                            <Button variant="secondary" className="flex flex-row gap-3 size-[129px] z-[50] rounded-full zigzag"
                                onClick={() => {
                                    currentUser ? (
                                        ""
                                    ) : (
                                        signInWithGoogle()
                                    )
                                }}>
                                {
                                    loadingPercentage > 1 ? (
                                        <LucideCloudy className="h-20 w-20 stroke-violet-500" />
                                    ) : (
                                        <LucideLockKeyhole className="h-10 w-10 stroke-violet-500" />
                                    )
                                }

                            </Button>
                            <Progress value={loadingPercentage} className="border-dashed dark:bg-black/40 z-[50]" />
                        </div>
                    </section>
                )
            }
        </div>
    );
};