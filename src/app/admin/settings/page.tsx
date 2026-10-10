import { AdminPageHeader, Panel } from "@/features/admin/components/page-header";
import { SettingsForm } from "@/features/content/components/admin/settings-form";
import { getSiteSettings } from "@/features/content/queries";

export const metadata = { title: "Settings" };

export default async function SettingsAdminPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <AdminPageHeader title="Settings" description="Contact details shown across the site, default ticket prices and how long seats are held." />
      <Panel>
        <SettingsForm settings={settings} />
      </Panel>
    </>
  );
}
