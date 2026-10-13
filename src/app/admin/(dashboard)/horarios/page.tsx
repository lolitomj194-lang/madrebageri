import { getOpeningHours, getClosedDates, getBusinessSettings } from "@/lib/settings";
import { HoursManager } from "@/components/admin/HoursManager";
import { DeliverySettingsForm } from "@/components/admin/DeliverySettingsForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminHoursPage() {
  const [hours, closed, settings] = await Promise.all([getOpeningHours(), getClosedDates(), getBusinessSettings()]);
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Horarios y reparto" subtitle="Horarios por día (hora de Argentina), cupos por franja, cierres y modalidades." />
      <DeliverySettingsForm settings={settings} />
      <HoursManager hours={hours} closed={closed} />
    </div>
  );
}
