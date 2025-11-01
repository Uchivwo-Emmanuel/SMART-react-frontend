import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.tsx";
import type { LoginRequest } from "../api/types.ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // ← grab user from context
  const nav = useNavigate();

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const freshUser = await login({ email, password } as LoginRequest);
      console.log("fresh user", freshUser); // must be object
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-content-center bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-teal-600">SMART</span>
          <span className="text-sm text-gray-500">Sales made simple</span>
        </div>
        <h1 className="text-xl font-semibold mb-4">Sign in to your account</h1>

        <form onSubmit={handle} className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition">
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          No account yet?{" "}
          <Link className="text-teal-600 underline" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
