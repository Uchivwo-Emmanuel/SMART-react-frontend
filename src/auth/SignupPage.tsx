import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import type { SignupRequest } from "../api/types";
import { useAuth } from "../hooks/useAuth.tsx";

type SignupForm = SignupRequest & { profilePicture?: File };

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  /* ----------  NEW: preview url  ---------- */
  const [preview, setPreview] = useState<string>("");

  const { login } = useAuth();
  const nav = useNavigate();

  /* ---------- file picker ---------- */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((f) => ({ ...f, profilePicture: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview("");
    }
  };

  /* ---------- submit ---------- */
  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.signup(form);
      toast.success("Account created!");
      await login({ email: form.email, password: form.password });
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Signup failed");
    }
  };

  return (
    <div className="min-h-screen grid place-content-center bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-teal-600">SMART</span>
          <span className="text-sm text-gray-500">Sales made simple</span>
        </div>
        <h1 className="text-xl font-semibold mb-4">Create your account</h1>

        <form onSubmit={handle} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="First name"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Last name"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Phone number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />

          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* ----  file input + preview  ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile picture (optional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onFileChange}
              className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-teal-500 file:text-teal-600 hover:file:bg-teal-50"
            />
            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition">
            Sign up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link className="text-teal-600 underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
