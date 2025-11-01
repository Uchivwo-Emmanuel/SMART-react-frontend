import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiPackage,
  FiHome,
  FiShoppingCart,
  FiShoppingBag,
  FiList,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.tsx";

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onNavClick?: () => void;
};

export default function Sidebar({ isOpen, setIsOpen, onNavClick }: Props) {
  const { pathname } = useLocation();
  const { user, logout: ctxLogout } = useAuth();

  /* ---------- avatar / initials ---------- */
  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => n![0].toUpperCase())
      .join("") || user?.email[0].toUpperCase();

  const handleLogout = async () => {
    try {
      await ctxLogout();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  const nav = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { name: "Stock", path: "/stock", icon: <FiPackage /> },
    { name: "Store", path: "/store", icon: <FiShoppingCart /> },
    { name: "Order", path: "/order", icon: <FiShoppingBag /> },
    { name: "Transactions", path: "/transactions", icon: <FiList /> },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-56" : "w-16"
      } bg-teal-700 text-white flex flex-col transition-all duration-300`}
    >
      {/* ---- header ---- */}
      <div className="p-3 flex items-center justify-between">
        <span className={`font-bold ${!isOpen && "hidden"}`}>SMART</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xl"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ---- navigation ---- */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {nav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick} // <-- new callback
            className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-teal-600 ${
              pathname.startsWith(item.path) && "bg-teal-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* ---- user card ---- */}
      <div className="border-t border-teal-600 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-900 flex items-center justify-center text-sm font-semibold">
          {user?.profilePictureUrl ? (
            <img
              src={
                user.profilePictureUrl.includes("cloudinary.com")
                  ? user.profilePictureUrl.replace(
                      "/upload/",
                      "/upload/c_fill,g_face,h_40,w_40,q_auto:eco,f_auto/",
                    )
                  : user.profilePictureUrl
              }
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <FiUser />
          )}
        </div>

        {isOpen && (
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">
              {user?.fullName || user?.email}
            </p>
            <p className="text-xs text-teal-200">{user?.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 rounded hover:bg-teal-600"
          title="Log out"
          aria-label="Log out"
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
}
