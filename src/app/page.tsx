import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Aliquot First-Class</h1>
        <p className="mt-2 text-gray-600">
          Sample + aliquot traceability for small academic biology labs. Answer &quot;where did it go and who used it?&quot; in under 30 seconds.
        </p>

        {session ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/samples"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Samples
            </Link>
            <Link
              href="/aliquots"
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Aliquots
            </Link>
            <Link
              href="/experiments"
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Experiments
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
