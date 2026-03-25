"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateAdvertisement } from "@/hooks/advertisements";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  owner_type: z.enum(["broker", "dealer"]),
  owner_id: z.coerce.number().int().positive("Owner ID must be positive"),
  target_type: z.string().min(1, "Target type is required"),
  target_id: z.coerce.number().int().positive("Target ID must be positive"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image URL or path is required"),
  status: z.string().min(1, "Status is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  views: z.coerce.number().int().min(0),
  clicks: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

function toIsoFromLocal(local: string) {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return d.toISOString();
}

export default function NewAdvertisementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const createMutation = useCreateAdvertisement(
    () => {
      toast({
        title: "Advertisement created",
        description: "Your advert was saved successfully.",
      });
      router.push("/advertisements");
    },
    (err) => {
      toast({
        variant: "destructive",
        title: "Could not create advert",
        description: err.message,
      });
    }
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      owner_type: "broker",
      owner_id: 1,
      target_type: "car",
      target_id: 1,
      title: "",
      description: "",
      image: "",
      status: "pending",
      start_date: "",
      end_date: "",
      views: 0,
      clicks: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      owner_type: values.owner_type,
      owner_id: values.owner_id,
      target_type: values.target_type,
      target_id: values.target_id,
      title: values.title,
      description: values.description,
      image: values.image,
      status: values.status,
      start_date: toIsoFromLocal(values.start_date),
      end_date: toIsoFromLocal(values.end_date),
      views: values.views,
      clicks: values.clicks,
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6 -ml-2" asChild>
        <Link href="/advertisements">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to advertisements
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create advertisement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner type</Label>
                <Controller
                  name="owner_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="dealer">Dealer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.owner_type && (
                  <p className="text-sm text-destructive">
                    {errors.owner_type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_id">Owner ID</Label>
                <Input id="owner_id" type="number" {...register("owner_id")} />
                {errors.owner_id && (
                  <p className="text-sm text-destructive">
                    {errors.owner_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_type">Target type</Label>
                <Input id="target_type" {...register("target_type")} />
                {errors.target_type && (
                  <p className="text-sm text-destructive">
                    {errors.target_type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_id">Target ID</Label>
                <Input id="target_id" type="number" {...register("target_id")} />
                {errors.target_id && (
                  <p className="text-sm text-destructive">
                    {errors.target_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" type="text" placeholder="https://…" {...register("image")} />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start (local)</Label>
                <Input id="start_date" type="datetime-local" {...register("start_date")} />
                {errors.start_date && (
                  <p className="text-sm text-destructive">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End (local)</Label>
                <Input id="end_date" type="datetime-local" {...register("end_date")} />
                {errors.end_date && (
                  <p className="text-sm text-destructive">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="views">Views</Label>
                <Input id="views" type="number" min={0} {...register("views")} />
                {errors.views && (
                  <p className="text-sm text-destructive">{errors.views.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clicks">Clicks</Label>
                <Input id="clicks" type="number" min={0} {...register("clicks")} />
                {errors.clicks && (
                  <p className="text-sm text-destructive">{errors.clicks.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create advertisement"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/advertisements">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
