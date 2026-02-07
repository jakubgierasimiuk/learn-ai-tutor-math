import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#1E293B] mb-4">404</h1>
        <p className="text-xl text-[#64748B] mb-6">Ups! Nie znaleźliśmy tej strony</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2DD4BF] to-[#7C3AED] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
