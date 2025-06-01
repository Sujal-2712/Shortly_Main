import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { DropdownMenu } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuContent } from "./ui/dropdown-menu";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Avatar } from "./ui/avatar";
import { AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "./ui/avatar";
import design from "./../assets/output1.png"
import { DropdownMenuLabel } from "./ui/dropdown-menu";
import { DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Cookie, LinkIcon, Lock, LogOut } from "lucide-react";
import logo from "./../assets/output.svg";
import { useContext } from "react";
import { UserContext } from "./../App"
import { removeFromSession } from "@/common/session";
import toast from "react-hot-toast";

const Header = () => {
    const navigate = useNavigate();
    const { userAuth, setUserAuth } = useContext(UserContext);
    return (
        <div className="flex justify-between items-center px-10 pr-10">
            <Link to="/">
                <img src={design} className=" md:h-16 h-14 my-4 bg-transparent" alt="Trimmr Logo" />
            </Link>

            <div>
                {!userAuth.access_token ? (
                    <Button onClick={() => navigate("/auth")}>Login</Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-10 overflow-hidden rounded-full cursor-pointer">
                            <Avatar>
                                <AvatarImage src={userAuth?.profile_img} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-lg">{userAuth?.email.split["@"]}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-md cursor-pointer">
                                <Link to="/dashboard" className="flex gap-2"><LinkIcon /> My Links</Link>

                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="font-semibold text-md cursor-pointer"
                                onClick={() => {
                                    navigate("/reset-password");
                                }}
                            >
                                <Lock />
                                Reset Password
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-red-700 text-md font-semibold cursor-pointer"
                                onClick={() => {
                                    removeFromSession("user");
                                    setUserAuth({
                                        access_token: null,
                                        profile_img: null,
                                        email: null
                                    });
                                    toast.success("Logout Sucessfully!!")
                                    navigate("/");
                                }}
                            >
                                <LogOut className="" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};

export default Header;
