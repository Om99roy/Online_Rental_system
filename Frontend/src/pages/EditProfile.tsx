import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import {
  editProfileSchema,
  type EditProfileInput,
} from "../lib/validation/auth.schema";
import { API } from "../lib/api";
import FormError from "../components/forms/FormError";
import { useAuthStore } from "../store/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loadingUser, setLoadingUser] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username,
        phone: user.phone ?? "",
      });
      setLoadingUser(false);
    }
  }, [user, reset]);

  async function onSubmit(data: EditProfileInput) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.patch(API.AUTH.UPDATE_PROFILE, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
        timeout: 10000,
      });
      setUser(response.data.data);
      toast.success("Profile updated");
      navigate("/get-profile");
    } catch (e) {
      console.error(e);
      const message =
        e instanceof AxiosError
          ? (e.response?.data?.message ?? "Could not update profile")
          : "Could not update profile";
      toast.error(message);
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold purple-fade-text mb-1">
          Edit profile
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Update your account details
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-text-muted mb-1.5"
              >
                First name
              </label>
              <input
                id="firstName"
                {...register("firstName")}
                className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <FormError error={errors.firstName} />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-text-muted mb-1.5"
              >
                Last name
              </label>
              <input
                id="lastName"
                {...register("lastName")}
                className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <FormError error={errors.lastName} />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-text-muted mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              {...register("username")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.username} />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-text-muted mb-1.5"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.phone} />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate("/get-profile")}
              className="flex-1 bg-surface-2 border border-border hover:bg-surface transition-colors text-text font-semibold rounded-lg py-2.5"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
