"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Info, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountSettingsPage() {
  const [formData, setFormData] = useState({
    name: "Alemayehu Gezahegne",
    email: "myemail@address.com",
    password: "••••••••••",
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Edit your personal information and manage account security.
          </p>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="py-6"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="py-6"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      readOnly
                      className="bg-gray-50 py-6"
                    />
                    <Button variant="outline" className="text-sm">
                      Change
                    </Button>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4 relative h-fit">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src="/placeholder-avatar.png"
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    <User className="w-12 h-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>

                {/* Upload button */}
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer absolute bottom-0 left-[calc(50%-18px)] bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-200/50 shadow-sm">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete your account?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is irreversible. All your data will be
                      permanently erased.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-200 text-red-800 hover:bg-red-300 border border-red-300/50 shadow-sm">
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                <Info size={16} />
                <span>All your data will be permanently erased.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end mt-10">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
