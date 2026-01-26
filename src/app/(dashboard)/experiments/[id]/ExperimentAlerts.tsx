"use client";

import { useRouter } from "next/navigation";
import { acknowledgeAlert } from "./actions";

type Alert = {
  alertId: string;
  experimentId: string;
  acknowledgedAt: Date | null;
  acknowledgedById: string | null;
  alert: {
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    title: string;
    message: string | null;
    createdAt: Date;
  };
};

export function ExperimentAlerts({
  experimentId,
  alerts,
  currentUserId,
}: {
  experimentId: string;
  alerts: Alert[];
  currentUserId?: string;
}) {
  const router = useRouter();

  if (alerts.length === 0) return null;

  async function handleAck(alertId: string) {
    try {
      await acknowledgeAlert(alertId, experimentId);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to acknowledge.");
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Alerts affecting this experiment</h2>
      <ul className="mt-4 space-y-3">
        {alerts.map((ae) => (
          <li
            key={ae.alertId}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-gray-900">{ae.alert.title}</p>
              {ae.alert.message && (
                <p className="mt-1 text-sm text-gray-600">{ae.alert.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {ae.alert.createdAt.toLocaleString()}
                {ae.acknowledgedAt && (
                  <span> · Acknowledged {ae.acknowledgedAt.toLocaleString()}</span>
                )}
              </p>
            </div>
            {!ae.acknowledgedAt && currentUserId && (
              <button
                type="button"
                onClick={() => handleAck(ae.alertId)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Acknowledge
              </button>
            )}
            {ae.acknowledgedAt && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Acknowledged
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
