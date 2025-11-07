"use server";

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import { eq, or } from "drizzle-orm";
import argon2 from "argon2";

export const registrationAction = async (data: {
  name: string;
  email: string;
  userName: string;
  password: string;
  role: "applicant" | "employer";
}) => {
  try {
    const { name, email, userName, password, role } = data;

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

export const loginUserAction = async (data: LoginData) => {
  try {
    const { email, password } = data;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return {
        status: "error",
        message: "Email and password are required",
      };
    }

    // 2️⃣ Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length === 0) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // 3️⃣ Verify password
    const user = existingUser[0];
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // 4️⃣ Success
    return {
      status: "success",
      message: "Login successful 🎉",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: "error",
      message: "Login failed. Please try again.",
    };
  }
};