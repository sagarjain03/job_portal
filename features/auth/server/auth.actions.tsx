"use server";

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import { eq, or } from "drizzle-orm";
import argon2 from "argon2";
import { RegisterUserData, registerUserSchema } from "../auth.schema";
import { LoginUserData,LoginUserSchema } from "../auth.schema";

export const registrationAction = async (data: RegisterUserData) => {
  try {

    const {data:validatedData,error}= registerUserSchema.safeParse(data);
    if(error)return {status:"error",message:error.issues[0].message};
    const { name, email, userName, password, role } = validatedData;

    // 1️⃣ Basic validation
    if (!name || !email || !userName || !password || !role) {
      return {
        status: "error",
        message: "All fields are required",
      };
    }

    // 2️⃣ Check if user already exists (email OR username)
    const existingUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.userName, userName)));

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];

      if (existing.email === email) {
        return { status: "error", message: "Email already in use" };
      }
      if (existing.userName === userName) {
        return { status: "error", message: "Username already in use" };
      }
    }

    // 3️⃣ Hash password
    const hashedPassword = await argon2.hash(password);

    // 4️⃣ Insert new user
    await db.insert(users).values({
      name,
      email,
      userName,
      phoneNumber: "0000000000", // required field
      role,
      password: hashedPassword,
    });

    // 5️⃣ Return success
    return {
      status: "success",
      message: "User registered successfully 🎉",
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: "error",
      message:
        error?.message?.includes("Duplicate entry") ||
        error?.code === "ER_DUP_ENTRY"
          ? "User already exists"
          : "Registration failed. Please try again.",
    };
  }
};

type LoginData = {
  email: string;
  password: string;
};

export const loginUserAction = async (data: unknown) => {
  try {
    // ✅ Validate input using Zod
    const parsed = LoginUserSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.errors[0]?.message || "Invalid input data",
      };
    }

    const { email, password } = parsed.data;

    // ✅ Fetch user from DB
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser || existingUser.length === 0) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    const user = existingUser[0];

    // ✅ Verify password
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // ✅ Login success
    return {
      status: "success",
      message: "Login successful 🎉",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      status: "error",
      message: "Login failed. Please try again.",
    };
  }
};