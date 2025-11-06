"use server"

import {db} from "@/config/db";
import {users} from "@/drizzle/schema";



export const registrationAction = async (data:{
    name: string;
    email: string;
    userName: string;
    password: string;
    role: "applicant" | "employer";
}) => {
    const {name,email,userName,password,role} = data;

    await db.insert(users).values({name,email,userName,password,role})
}   