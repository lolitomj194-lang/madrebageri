import { getBusinessSettings, getCalculatorSettings } from "@/lib/settings";
import { BusinessSettingsForm, CalculatorSettingsForm, PasswordForm } from "@/components/admin/SettingsForms";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, calc] = await Promise.all([getBusinessSettings(), getCalculatorSettings()]);
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Configuración" subtitle="Datos comerciales, WhatsApp, reglas de la calculadora y seguridad." />
      <BusinessSettingsForm settings={settings} />
      <CalculatorSettingsForm settings={calc} />
      <PasswordForm />
    </div>
  );
}
