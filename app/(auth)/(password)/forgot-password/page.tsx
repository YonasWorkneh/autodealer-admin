"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/lib/auth/resetPassword";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, formState, setError, reset } = useForm<ForgotPasswordFormData>();
  const { errors } = formState;
  const { showToast } = useToast();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setError("email", { message: "" });
      await resetPassword({ email: data.email });
      showToast(
        "success",
        "Password reset link has been sent to your email address."
      );
      reset();
    } catch (err: any) {
      const errorMessage =
        err.message || "Something went wrong. Please try again.";
      setError("email", { message: errorMessage });
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[380px] sm:w-[450px] border-primary/10 shadow-lg">
      <CardHeader>
        <Link
          href={"/"}
          className="flex items-center justify-center gap-2 mb-3 border-b border-primary/20 pb-4"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image
              src="/wheel.png"
              alt="wheel"
              width={100}
              height={100}
              className="w-full h-full"
            />
          </div>
          <h1 className="text-primary font-semibold">AUTO&mdash;DEALER</h1>
        </Link>
        <CardTitle className="text-lg md:text-xl text-primary">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email address and we'll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
                className="pl-10 h-12"
              />
              {errors?.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors?.email?.message as string}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/signin"
            className="text-primary underline decoration-primary/60 hover:decoration-primary transition-colors text-sm font-medium"
          >
            Back to Signin
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
