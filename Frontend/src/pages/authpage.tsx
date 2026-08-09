import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import { Check, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { API } from "../lib/api";
import { useAuthStore } from "../store/AuthContext.tsx";
import RoleToggle from "./RoleToggle";
import CaptchaModal from "./captchaModel";

const authSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pendingData, setPendingData] = useState<AuthFormData | null>(null);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<AuthFormData>({ resolver: zodResolver(authSchema) });

    const submitForm = async (data: AuthFormData) => {
        try {
            if (isLogin) {
                const response = await axios.post(
                    API.AUTH.LOGIN,
                    { email: data.email, password: data.password },
                    { withCredentials: true }
                );
                const { user, accessToken } = response.data.data;
                useAuthStore.getState().setUser(user);
                localStorage.setItem("accessToken", accessToken);
                toast.success("Login successful");
                navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
            } else {
                await axios.post(API.AUTH.REGISTER, {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    role,
                });
                toast.success("Registration successful");

                if (role === "ADMIN") {
                    toast.success("Admin account created — please sign in.");
                    setIsLogin(true);
                    reset();
                    setCaptchaVerified(false);
                } else {
                    navigate("/verify-email", { state: { email: data.email } });
                }
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "An error occurred");
        }
    };

    const handleCaptchaVerify = () => {
        setCaptchaVerified(true);
        setShowCaptcha(false);
        if (pendingData) {
            submitForm(pendingData);
            setPendingData(null);
        }
    };

    const onSubmit = (data: AuthFormData) => {
        if (!isLogin && !data.username) {
            toast.error("Username is required for signup");
            return;
        }
        if (!captchaVerified) {
            setPendingData(data);
            setShowCaptcha(true);
            return;
        }
        submitForm(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold purple-fade-text">
                        {role === "ADMIN" ? "Admin Portal" : "Welcome"}
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        {isLogin ? "Log in to continue" : "Create your account"}
                    </p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                    <RoleToggle
                        role={role}
                        onChange={(r) => {
                            setRole(r);
                            setCaptchaVerified(false);
                        }}
                    />

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-1.5">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    placeholder="johndoe"
                                    {...register("username")}
                                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-text-muted">
                                    Password
                                </label>
                                {isLogin && (
                                    <a href="/forgot-password" className="text-xs text-primary hover:text-secondary transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 pr-10 text-text placeholder:text-text-subtle outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div
                            className={`border rounded-lg p-3 bg-surface-2 transition-colors cursor-pointer ${captchaVerified ? "border-green-500/50" : "border-border hover:border-primary/50"
                                }`}
                            onClick={() => {
                                if (!captchaVerified) setShowCaptcha(true);
                            }}
                        >
                            <div className="flex items-center gap-3 select-none">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${captchaVerified ? "bg-green-500 border-green-500" : "border-text-muted bg-surface"
                                        }`}
                                >
                                    {captchaVerified && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className="text-sm text-text-muted">I am not a robot</span>
                                <ShieldCheck className="w-4 h-4 text-text-subtle ml-auto" />
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? isLogin
                                    ? "Signing in..."
                                    : "Creating account..."
                                : isLogin
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-6">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin((v) => !v);
                                reset();
                                setCaptchaVerified(false);
                            }}
                            className="text-primary hover:text-secondary font-medium transition-colors"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>

            <CaptchaModal isOpen={showCaptcha} onVerify={handleCaptchaVerify} onClose={() => setShowCaptcha(false)} />
        </div>
    );
}