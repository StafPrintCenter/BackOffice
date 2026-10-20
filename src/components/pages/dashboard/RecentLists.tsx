import { Briefcase, FileCheck2 } from "lucide-react";
import {
  JOB_OFFER_CONTRACT_LABELS,
  JOB_OFFER_STATUS_LABELS,
  getJobOfferStatusBadge,
} from "@/data/jobOffers";
import { JOB_APPLICATION_STATUS_LABELS } from "@/data/jobApplications";

interface DashboardRecentListsProps {
  jobOffers: any[];
  jobOffersLoading: boolean;
  jobApplications: any[];
  jobApplicationsLoading: boolean;
}

export function DashboardRecentLists({
  jobOffers,
  jobOffersLoading,
  jobApplications,
  jobApplicationsLoading,
}: DashboardRecentListsProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Offres d'emploi */}
      <div className="rounded-2xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <div className="font-display text-lg font-semibold">Dernières offres d'emploi</div>
        </div>
        <ul className="mt-4 divide-y">
          {jobOffersLoading && (
            <li className="py-4 text-center text-sm text-muted-foreground">Chargement...</li>
          )}
          {jobOffers.slice(0, 4).map((offer) => {
            const contractLabel =
              (JOB_OFFER_CONTRACT_LABELS as Record<string, string>)[offer.contractType] ||
              offer.contractType;
            const statusLabel =
              (JOB_OFFER_STATUS_LABELS as Record<string, string>)[offer.status] ||
              offer.status;
            const statusBadgeClass = (
              getJobOfferStatusBadge as unknown as (status: string) => string
            )(offer.status);

            return (
              <li key={offer.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-sm font-medium truncate">{offer.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {contractLabel} • {offer.location}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
              </li>
            );
          })}
          {!jobOffersLoading && jobOffers.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">Aucune offre créée</li>
          )}
        </ul>
      </div>

      {/* Candidatures */}
      <div className="rounded-2xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <div className="font-display text-lg font-semibold">Dernières candidatures</div>
        </div>
        <ul className="mt-4 divide-y">
          {jobApplicationsLoading && (
            <li className="py-4 text-center text-sm text-muted-foreground">Chargement...</li>
          )}
          {jobApplications.slice(0, 4).map((app) => (
            <li key={app.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1 pr-4">
                <div className="text-sm font-medium truncate">
                  {app.firstName} {app.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{app.email}</div>
              </div>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {(JOB_APPLICATION_STATUS_LABELS as Record<string, string>)[app.status] || app.status}
              </span>
            </li>
          ))}
          {!jobApplicationsLoading && jobApplications.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Aucune candidature reçue
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}