import { redirect } from "next/navigation";

/** Kategoriler ve etiketler artık tek ekranda yönetiliyor. */
export default function LegacyTaxonomyRoute() {
    redirect("/admin/taxonomy");
}
