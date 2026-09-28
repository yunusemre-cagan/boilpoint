import { User as UserIcon } from "lucide-react";
import { getAboutData } from "@/app/admin/actions/about";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AboutForm } from "./AboutForm";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Hakkımda Yönetimi | Admin",
};

export default async function AdminAboutPage() {
    const aboutData = await getAboutData();

    return (
        <div className="space-y-6">
            <PageHeader icon={UserIcon} title="Hakkımda" description="Sitedeki kişisel bilgilerini, kariyer geçmişini, yeteneklerini ve sosyal hesaplarını düzenle." />
            <AboutForm initialData={aboutData} />
        </div>
    );
}
