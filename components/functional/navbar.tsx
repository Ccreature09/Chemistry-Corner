"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import UserForm from "./signIn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  signInWithPopup,
  User,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

import { cn } from "@/lib/utils";
import { auth } from "@/firebase/firebase";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

const provider = new GoogleAuthProvider();
const adminArray = [
  "KSca1U09jwMSIK0qYedXZDhe7d02",
  "6ok0udZR89QleRS7nlDC8jcNHFs2",
];

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        setProfileImageUrl(user.photoURL);
      } else {
        setUser(null);
        setProfileImageUrl(null);
      }
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return (
    <>
      <div className="py-20 flex flex-col md:flex-row justify-between md:hidden bg-blue-500 items-center">
        <div className="mx-auto flex flex-col md:flex-row">
          <Link href={"/"}>
            <Image
              src="https://i.ibb.co/kX703qN/image-1.png"
              alt="Logo"
              width={200}
              height={200}
              className="w-96 mx-auto mb-3 md:hidden  md:w-16 "
            ></Image>
          </Link>
        </div>
      </div>

      <div className="w-full my-auto flex justify-between items-center bg-blue-500 h-24">
        <div className="flex md:space-x-24 mx-auto">
          <div className="flex items-center">
            <Link href={"/"}>
              <Image
                src="https://i.ibb.co/kX703qN/image-1.png"
                alt="Logo"
                width={1000}
                height={1000}
                className="w-44  my-auto hidden  md:flex mb-3 md:w-96 "
              />
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="xl:hidden flex items-center mx-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 my-auto  text-blue-500 bg-white rounded-lg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Навигация</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/">Начална Страница</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/periodic-table">Периодична Таблица</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/calendar">Календар</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/blog">Блог</Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Тестове</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Link href="/tests/grade-8">8 Клас</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/tests/grade-9">9 Клас</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/tests/grade-10">10 Клас</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Игри</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Link href="/games/grade-8">8 Клас</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/games/grade-9">9 Клас</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/games/grade-10">10 Клас</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>STEM</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Link href="/presentations">Презентации</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/comics">Комикси</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/useful-info">Мисловни Карти</Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavigationMenu className="hidden xl:flex">
            <NavigationMenuList className="gap-3">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Тестове</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components built with Radix UI
                            and Tailwind CSS.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/tests/grade-8" title="8 Клас">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/tests/grade-9" title="9 Клас">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/tests/grade-10" title="10 Клас">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Игри</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components built with Radix UI
                            and Tailwind CSS.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/games/grade-8" title="8 Клас">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/games/grade-9" title="9 Клас">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/games/grade-10" title="10 Клас">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>STEM</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components built with Radix UI
                            and Tailwind CSS.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/presentations" title="Презентации">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/comics" title="Комикси">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/useful-info" title="Мисловни Карти">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/periodic-table" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Периодична Таблица
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/calendar" target="_blank" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Календар
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/blog" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Блог
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Popover>
            <PopoverTrigger className="flex items-center mx-8">
              {!user ? (
                <>
                  <div className=" rounded-lg text-white p-2 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 rounded-lg p-1 text-white bg-white"
                      viewBox="0 0 512 512"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      id="login"
                    >
                      <path d="M255.988 32C160.473 32 78.934 91.804 46.727 176h34.639c9.396-20.484 22.457-39.35 38.868-55.762C156.497 83.973 204.709 64 255.988 64c51.286 0 99.504 19.973 135.771 56.239C428.027 156.505 448 204.719 448 256c0 51.285-19.973 99.501-56.239 135.765C355.494 428.029 307.275 448 255.988 448c-51.281 0-99.493-19.971-135.755-56.234-16.412-16.412-29.473-35.28-38.871-55.766H46.725c32.206 84.201 113.746 144 209.264 144C379.703 480 480 379.715 480 256c0-123.702-100.297-224-224.012-224z"></path>
                      <path d="M206.863 323.883l22.627 22.627L320 256l-90.51-90.51-22.628 22.628L258.745 240H32v32h226.745z"></path>
                    </svg>
                  </div>
                </>
              ) : user && profileImageUrl ? (
                profileImageUrl && (
                  <div className=" flex flex-col justify-center mx-3">
                    <Avatar className="flex mx-auto">
                      <AvatarImage src={profileImageUrl} alt="User" />
                      <AvatarFallback>{user.displayName}</AvatarFallback>
                    </Avatar>
                    {adminArray.includes(user.uid) && (
                      <Badge className="flex">Admin</Badge>
                    )}
                  </div>
                )
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </PopoverTrigger>
            <PopoverContent>
              {user && adminArray.includes(user.uid) && (
                <Link href={"/admin"}>
                  <Button className="w-full">Admin Dashboard</Button>
                </Link>
              )}
              {!user ? (
                <>
                  <h1 className=" text-center mb-8 font-bold text-2xl">
                    Вход / Регистрация
                  </h1>
                  <Button className="w-full mb-5" onClick={handleGoogleSignIn}>
                    Вход с Google
                  </Button>
                  <UserForm login />
                  <Separator className="mb-5" />
                  <UserForm login={false} />
                </>
              ) : (
                <Button className="w-full mt-4" onClick={handleSignOut}>
                  Изход
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="bg-green-500 w-full h-8 flex flex-col"></div>
    </>
  );
};
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
