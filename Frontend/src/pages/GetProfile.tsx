import { useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/AuthContext.tsx";
import { API } from "../lib/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1$/, "") ?? "";

export default function GetProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  const avatarSrc = user.profileImageUrl ? `${BASE_URL}${user.profileImageUrl}` : null;
  const initials = `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(API.AUTH.UPLOAD_AVATAR, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        timeout: 15000,
      });
      setUser(response.data.data);
      toast.success("Profile photo updated");
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Could not upload photo"
          : "Could not upload photo";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-primary hover:bg-secondary transition-colors text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold shadow-md disabled:opacity-50"
              title="Change photo"
            >
              {uploading ? "…" : "✎"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <h1 className="text-2xl font-bold mt-4">
            {user.firstName ?? ""} {user.lastName ?? ""}
          </h1>
          <p className="text-text-muted text-sm">@{user.username}</p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-text-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-text-muted">Phone</span>
            <span>{user.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-text-muted">Email verified</span>
            <span>{user.emailVerified ? "Yes" : "No"}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 mt-8"
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}
