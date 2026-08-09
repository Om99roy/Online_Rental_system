import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { registerSchema, type RegisterInput } from "../lib/validation/auth.schema";
import { API } from "../lib/api";
import FormError from "../components/forms/FormError";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    try {
      await axios.post(API.AUTH.REGISTER, data);
      toast.success("Registration successful");
      navigate("/verify-email", { state: { email: data.email } });
    } catch (e) {
      console.error(e);
      const message =
        e instanceof AxiosError
          ? e.response?.data?.message ?? "Registration unsuccessful"
          : "Registration unsuccessful";
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold purple-fade-text mb-1">Create account</h1>
        <p className="text-text-muted text-sm mb-8">some text</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-muted mb-1.5">
                First name
              </label>
              <input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <FormError error={errors.firstName} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-muted mb-1.5">
                Last name
              </label>
              <input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
                className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <FormError error={errors.lastName} />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-1.5">
              Username
            </label>
            <input
              id="username"
              placeholder="johndoe"
              {...register("username")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.username} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.email} />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-muted mb-1.5">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...register("phone")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.phone} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full bg-surface-2 border placeholder:text-text-subtle rounded-lg px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <FormError error={errors.password} />
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:text-secondary transition-colors">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
