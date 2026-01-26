import { withAuth } from "next-auth/middleware";

const protectedPaths = [
  "/samples",
  "/aliquots",
  "/experiments",
  "/batches",
  "/storage",
  "/alerts",
  "/import-export",
  "/search",
];

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === "/" || path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/api/auth")) return true;
      if (protectedPaths.some((p) => path.startsWith(p))) return !!token;
      return true;
    },
  },
});

export const config = {
  matcher: ["/", "/samples/:path*", "/aliquots/:path*", "/experiments/:path*", "/batches/:path*", "/storage/:path*", "/alerts/:path*", "/import-export/:path*", "/search", "/login", "/register"],
};
