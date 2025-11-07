"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Import icons ---
import { Mail, Lock, LogIn } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {loginUserAction} from "@/features/auth/server/auth.actions";
import {toast} from "sonner";


interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const LoginData =  {
    
      email: formData.email,
      password: formData.password,
    }

   


     const result =  await loginUserAction(LoginData);

     if(result.status==="success"){
        toast.success(result.message)
     }
     else{
        toast.error(result.message)
     }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-sm"
      >
        <Card className="w-full shadow-lg border-gray-800 bg-gray-950/90 text-gray-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
              <LogIn className="w-6 h-6" />
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- Email Input --- */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10" // Add padding for the icon
                  />
                </div>
              </div>

              {/* --- Password Input --- */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10" 
                  />
                </div>
              </div>

              {/* --- Error Message Section --- */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* --- Submit Button --- */}
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
              >
                Login
              </Button>
            </form>

            {/* --- Link to Register Page --- */}
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/register" // Point back to the register page
                className="underline hover:text-gray-300 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;