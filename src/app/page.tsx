import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Aliquot First-Class
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track vendor batches and generate uniquely traceable aliquots for lab experiments.
            Trace contamination and maintain complete provenance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/batches"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Batches
            </h2>
            <p className="text-gray-600">
              View and create vendor batches. Generate aliquots with unique traceable codes.
            </p>
          </Link>

          <Link
            href="/experiments"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Experiments
            </h2>
            <p className="text-gray-600">
              Create experiments and attach aliquots. Track which aliquots were used.
            </p>
          </Link>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Create a batch when receiving a vendor shipment</li>
            <li>Generate aliquots from the batch with unique traceable codes</li>
            <li>Create experiments and attach aliquots used</li>
            <li>Mark aliquots as contaminated to see the &quot;blast radius&quot; of affected experiments</li>
            <li>Print QR code labels for aliquots</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
