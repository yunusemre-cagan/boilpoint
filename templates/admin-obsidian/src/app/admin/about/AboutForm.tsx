"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { Segmented } from "@/components/admin/ui/Segmented";
import { MarkdownEditor } from "@/components/admin/editor/MarkdownEditor";
import { uploadImage } from "@/components/admin/editor/upload";
import { updateAbout } from "@/app/admin/actions/about";
import {
    Loader2, Save, Plus, X, Code, Link as LinkIcon, FileText, Smartphone, Laptop, Globe, Palette, Brain, Zap, Github,
    Rocket, GraduationCap, Trash2, Camera, Linkedin, Twitter, Instagram,
    Facebook, Mail, Youtube, Music, Briefcase,
    BarChart3, ChevronUp, ChevronDown, User as UserIcon
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Check, GripVertical } from 'lucide-react';

const AVAILABLE_ICONS = [
    { name: "Github", icon: Github },
    { name: "Rocket", icon: Rocket },
    { name: "GraduationCap", icon: GraduationCap },
    { name: "Smartphone", icon: Smartphone },
    { name: "Laptop", icon: Laptop },
    { name: "Globe", icon: Globe },
    { name: "Palette", icon: Palette },
    { name: "Brain", icon: Brain },
    { name: "Zap", icon: Zap },
];

const COLORS = [
    { name: "Blue", text: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Purple", text: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Emerald", text: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Orange", text: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Rose", text: "text-rose-500", bg: "bg-rose-500/10" },
];

const SOCIAL_PLATFORMS = [
    { platform: "Github", icon: Github, color: "hover:text-foreground" },
    { platform: "Linkedin", icon: Linkedin, color: "hover:text-[#0A66C2]" },
    { platform: "Twitter", icon: Twitter, color: "hover:text-black" },
    { platform: "Instagram", icon: Instagram, color: "hover:text-[#E1306C]" },
    { platform: "Facebook", icon: Facebook, color: "hover:text-[#1877F2]" },
    { platform: "Youtube", icon: Youtube, color: "hover:text-[#FF0000]" },
    { platform: "Spotify", icon: Music, color: "hover:text-[#1DB954]" },
    { platform: "AppleMusic", icon: Music, color: "hover:text-[#FC3C44]" },
    { platform: "Stackoverflow", icon: Code, color: "hover:text-[#F48024]" },
    { platform: "Twitch", icon: Youtube, color: "hover:text-[#9146FF]" },
    { platform: "Discord", icon: Mail, color: "hover:text-[#5865F2]" },
    { platform: "Whatsapp", icon: Mail, color: "hover:text-[#25D366]" },
    { platform: "Telegram", icon: Mail, color: "hover:text-[#0088CC]" },
    { platform: "Reddit", icon: Globe, color: "hover:text-[#FF4500]" },
    { platform: "Medium", icon: FileText, color: "hover:text-foreground" },
    { platform: "Dribbble", icon: Palette, color: "hover:text-[#EA4C89]" },
    { platform: "Behance", icon: Palette, color: "hover:text-[#1769FF]" },
    { platform: "TikTok", icon: Youtube, color: "hover:text-foreground" },
    { platform: "Mail", icon: Mail, color: "hover:text-accent" },
    { platform: "Website", icon: Globe, color: "hover:text-accent" },
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="adm-btn adm-btn-primary"
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Değişiklikleri Kaydet
        </button>
    );
}

// Sortable Item Component
function SortableSocialItem({
    social,
    index,
    onRemove,
    onToggle,
    onUpdate
}: {
    social: any,
    index: number,
    onRemove: (i: number) => void,
    onToggle: (i: number) => void,
    onUpdate: (i: number, data: any) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: index.toString() });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ platform: social.platform, url: social.url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const platformData = SOCIAL_PLATFORMS.find((p: any) => p.platform === social.platform);
    const PlatformIcon = platformData?.icon || Globe;

    const handleSave = () => {
        let url = editData.url.trim();
        if (url && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
            url = `https://${url}`;
        }
        onUpdate(index, { ...social, platform: editData.platform, url });
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-4 bg-[var(--adm-surface)] border border-[var(--adm-border)] rounded-2xl hover:border-accent/30 transition-all group"
        >
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="p-1 adm-text-3 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                <div className={`w-10 h-10 rounded-xl bg-[var(--adm-surface-2)] flex items-center justify-center text-gray-500 shrink-0 ${platformData?.color || ""}`}>
                    <PlatformIcon className="w-5 h-5" />
                </div>

                {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                        <select
                            value={editData.platform}
                            onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                            className="px-3 py-1 bg-[var(--adm-surface)] border border-[var(--adm-border-strong)] rounded-lg text-xs outline-none"
                        >
                            {SOCIAL_PLATFORMS.map((p: any) => (
                                <option key={p.platform} value={p.platform}>{p.platform}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={editData.url}
                            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                            className="flex-1 px-3 py-1 bg-[var(--adm-surface)] border border-[var(--adm-border-strong)] rounded-lg text-xs outline-none font-mono"
                        />
                    </div>
                ) : (
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{social.platform === 'Twitter' ? 'X' : social.platform}</p>
                        <p className="truncate text-xs adm-text-3">{social.url}</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-4">
                {isEditing ? (
                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-9 h-9 flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl transition-all"
                        title="Kaydet"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-9 h-9 flex items-center justify-center adm-text-3 hover:text-[var(--adm-accent)] hover:bg-[var(--adm-accent-soft)] rounded-xl transition-all"
                        title="Düzenle"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onToggle(index)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all shrink-0 ${social.showOnAbout ? "bg-accent/10 text-accent border border-accent/20" : "bg-[var(--adm-surface-2)] text-gray-500 border border-[var(--adm-border-strong)]"}`}
                    title="Hakkımda sayfasında göster"
                >
                    {social.showOnAbout ? "AÇIK" : "KAPALI"}
                </button>

                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="w-9 h-9 flex items-center justify-center adm-text-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function AboutForm({ initialData }: { initialData: any }) {
    const [state, formAction] = useActionState(updateAbout, {} as any);

    const [bio, setBio] = useState(initialData?.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || "");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [technologies, setTechnologies] = useState<any[]>(initialData?.technologies || []);
    const [interests, setInterests] = useState<any[]>(initialData?.interests || []);
    const [socialAccounts, setSocialAccounts] = useState<any[]>(initialData?.socialAccounts || []);
    const [experiences, setExperiences] = useState<any[]>(initialData?.experiences || []);
    const [educations, setEducations] = useState<any[]>(initialData?.educations || []);
    const [stats, setStats] = useState<any[]>(() => {
        try {
            const parsed = JSON.parse(initialData?.stats || "[]");
            return parsed.length > 0 ? parsed : [
                { label: "Tamamlanan Proje", value: "20+", icon: "Rocket", color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Yıllık Deneyim", value: "3+", icon: "Calendar", color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Kahve Tüketimi", value: "1.2k+", icon: "Coffee", color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: "Kod Satırı", value: "50k+", icon: "BarChart3", color: "text-green-500", bg: "bg-green-500/10" },
            ];
        } catch {
            return [
                { label: "Tamamlanan Proje", value: "20+", icon: "Rocket", color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Yıllık Deneyim", value: "3+", icon: "Calendar", color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Kahve Tüketimi", value: "1.2k+", icon: "Coffee", color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: "Kod Satırı", value: "50k+", icon: "BarChart3", color: "text-green-500", bg: "bg-green-500/10" },
            ];
        }
    });

    const [newTech, setNewTech] = useState("");
    const [newSocial, setNewSocial] = useState({ platform: "Github", url: "" });

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSocialAccounts((items) => {
                const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
                const newIndex = items.findIndex((_, i) => i.toString() === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    // Form Tabs State
    const [currentFormTab, setCurrentFormTab] = useState<"personal" | "career" | "skills" | "stats">("personal");

    useEffect(() => {
        if (state.success) {
            toast.success("Hakkımda sayfası güncellendi", { action: { label: "Sitede görüntüle", onClick: () => window.open("/hakkimda", "_blank", "noopener") } });
        }
    }, [state.success]);

    const addTech = () => {
        if (newTech.trim()) {
            setTechnologies([...technologies, { name: newTech.trim() }]);
            setNewTech("");
        }
    };

    const removeTech = (index: number) => {
        setTechnologies(technologies.filter((_, i) => i !== index));
    };

    const addInterest = () => {
        setInterests([...interests, {
            title: "Yeni İlgi Alanı",
            description: "Açıklama buraya...",
            icon: "Rocket",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }]);
    };

    const updateInterest = (index: number, field: string, value: string) => {
        const updated = [...interests];
        if (field === "style") {
            const style = COLORS.find(c => c.name === value);
            if (style) {
                updated[index].color = style.text;
                updated[index].bg = style.bg;
            }
        } else {
            updated[index][field] = value;
        }
        setInterests(updated);
    };

    const removeInterest = (index: number) => {
        setInterests(interests.filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setAvatarUrl(""); // Clear URL when file is selected
            };
            reader.readAsDataURL(file);
        }
    };

    const clearAvatar = () => {
        setAvatarUrl("");
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const addSocial = () => {
        if (!newSocial.url) return;
        // Otomatik protocol ekleme — eksik "https://" linklerini düzelt
        let url = newSocial.url.trim();
        if (url && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
            url = `https://${url}`;
        }
        setSocialAccounts([...socialAccounts, { ...newSocial, url, isActive: true, showOnAbout: true }]);
        setNewSocial({ platform: "Github", url: "" });
    };

    const removeSocial = (index: number) => {
        setSocialAccounts(socialAccounts.filter((_, i) => i !== index));
    };

    const toggleSocialAbout = (index: number) => {
        setSocialAccounts(socialAccounts.map((s, i) =>
            i === index ? { ...s, showOnAbout: !s.showOnAbout } : s
        ));
    };

    const updateSocial = (index: number, data: any) => {
        setSocialAccounts(socialAccounts.map((s, i) =>
            i === index ? data : s
        ));
    };

    return (
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="technologies" value={JSON.stringify(technologies)} />
            <input type="hidden" name="interests" value={JSON.stringify(interests)} />
            <input type="hidden" name="socialAccounts" value={JSON.stringify(socialAccounts)} />
            <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />
            <input type="hidden" name="educations" value={JSON.stringify(educations)} />
            <input type="hidden" name="stats" value={JSON.stringify(stats)} />

            {/* Sekmeler */}
            <div className="sticky top-[calc(var(--adm-header-h)+0.75rem)] z-20 flex">
                <Segmented
                    ariaLabel="Hakkımda bölümleri"
                    value={currentFormTab}
                    onChange={setCurrentFormTab}
                    className="max-w-full overflow-x-auto shadow-[var(--adm-shadow-md)]"
                    items={[
                        { value: "personal", label: "Kişisel bilgiler", icon: UserIcon },
                        { value: "career", label: "Kariyer & eğitim", icon: Briefcase },
                        { value: "skills", label: "Yetenekler", icon: Zap },
                        { value: "stats", label: "İstatistikler", icon: BarChart3 },
                    ]}
                />
            </div>

            {/* --- PERSONAL TAB --- */}
            <div className={currentFormTab === "personal" ? "contents" : "hidden"}>
                <div className="adm-page-enter space-y-6">

                    {/* Avatar Management */}
                    <div className="adm-card p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-center lg:items-start">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[1.75rem] bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-1 relative overflow-hidden border border-[var(--adm-border-strong)]">
                                    {avatarPreview ? (
                                        <>
                                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover rounded-[1.5rem]" />
                                            <button
                                                type="button"
                                                onClick={clearAvatar}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] text-white"
                                                title="Avatarı Kaldır"
                                            >
                                                <Trash2 className="w-8 h-8" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center adm-text-3 gap-2">
                                            <Camera className="w-10 h-10 stroke-[1.5]" />
                                            <span className="text-[10px] font-medium uppercase tracking-wider">Fotoğraf Yok</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="adm-label">Profil Resmi URL'si</label>
                                        <input
                                            type="text"
                                            name="avatarUrl"
                                            value={avatarUrl}
                                            onChange={(e) => {
                                                setAvatarUrl(e.target.value);
                                                setAvatarPreview(e.target.value);
                                            }}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="adm-input adm-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="adm-label">Bilgisayardan Yükle</label>
                                        <input
                                            type="file"
                                            name="avatarFile"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="adm-btn adm-btn-secondary w-full"
                                        >
                                            <Plus className="w-4 h-4" /> Fotoğraf Seç
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs adm-text-3">Herhangi bir görsel linki yapıştırabilir veya bilgisayarınızdan dosya yükleyebilirsiniz.</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Management */}
                    <div className="adm-card space-y-6 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="adm-icon-tile">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight adm-text">Sosyal Medya Hesapları</h3>
                                <p className="text-sm adm-text-3">İletişim kanallarınızı yönetin (Sürükleyerek sıralayabilir veya düzenleyebilirsiniz).</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-[var(--adm-surface-2)] p-4 rounded-2xl border border-[var(--adm-border)]">
                            <div className="md:col-span-1">
                                <label className="adm-label text-xs">Platform</label>
                                <select
                                    value={newSocial.platform}
                                    onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                                    className="adm-input"
                                >
                                    {SOCIAL_PLATFORMS.map((p: any) => (
                                        <option key={p.platform} value={p.platform}>{p.platform}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="adm-label text-xs">URL / Link</label>
                                <input
                                    type="url"
                                    value={newSocial.url}
                                    onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                                    placeholder="https://..."
                                    className="adm-input"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addSocial}
                                className="adm-btn adm-btn-primary h-[2.625rem]"
                            >
                                <Plus className="w-4 h-4" /> Ekle
                            </button>
                        </div>

                        <div className="space-y-3">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={socialAccounts.map((_, i) => i.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {socialAccounts.map((social: any, index: number) => (
                                        <SortableSocialItem
                                            key={index}
                                            index={index}
                                            social={social}
                                            onRemove={removeSocial}
                                            onToggle={toggleSocialAbout}
                                            onUpdate={updateSocial}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>

                    <div className="adm-card grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label className="adm-label">Ad Soyad</label>
                            <input
                                type="text"
                                name="name"
                                required
                                defaultValue={initialData?.name}
                                className="adm-input"
                            />
                        </div>
                        <div>
                            <label className="adm-label">Unvan / Kısa Açıklama</label>
                            <input
                                type="text"
                                name="jobTitle"
                                required
                                defaultValue={initialData?.jobTitle}
                                className="adm-input"
                            />
                        </div>
                        <div>
                            <label className="adm-label">Konum</label>
                            <input
                                type="text"
                                name="location"
                                defaultValue={initialData?.location}
                                className="adm-input"
                            />
                        </div>
                        <div>
                            <label className="adm-label">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={initialData?.email}
                                className="adm-input"
                            />
                        </div>
                    </div>

                    {/* Biyografi */}
                    <MarkdownEditor
                        name="bio"
                        label="Biyografi (Hikayem bölümü)"
                        value={bio}
                        onChange={setBio}
                        minHeight={320}
                        placeholder="Hakkında bir şeyler yaz…"
                        onImage={async (file) => `![${file.name.replace(/\.[^.]+$/, "")}](${await uploadImage(file)})`}
                    />

                </div>
            </div>

            {/* --- SKILLS TAB --- */}
            <div className={currentFormTab === "skills" ? "contents" : "hidden"}>
                <div className="adm-page-enter space-y-6">

                    {/* Technologies */}
                    <div className="adm-card p-6">
                        <h3 className="mb-4 text-base font-semibold adm-text">Teknolojiler</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {technologies.map((tech: any, i: number) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--adm-surface)] border border-[var(--adm-border-strong)] rounded-lg text-sm">
                                    {tech.name}
                                    <button type="button" onClick={() => removeTech(i)} className="adm-text-3 hover:text-red-500"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTech}
                                onChange={(e) => setNewTech(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                                placeholder="Örn: Next.js"
                                className="adm-input flex-1"
                            />
                            <button type="button" onClick={addTech} className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="adm-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold adm-text">Daha Yakından Tanı (İlgi Alanları)</h3>
                            <button type="button" onClick={addInterest} className="flex items-center gap-1 text-sm text-blue-600 font-medium"><Plus className="w-4 h-4" /> Yeni Ekle</button>
                        </div>
                        <div className="space-y-4">
                            {interests.map((item, i) => (
                                <div key={i} className="adm-inset adm-enter group relative space-y-3 p-4">
                                    <button type="button" onClick={() => removeInterest(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateInterest(i, "title", e.target.value)}
                                            placeholder="Başlık"
                                            className="adm-input h-9 font-semibold"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={AVAILABLE_ICONS.find((ic: any) => ic.name === item.icon)?.name || "Rocket"}
                                                onChange={(e) => updateInterest(i, "icon", e.target.value)}
                                                className="adm-input h-9 flex-1"
                                            >
                                                {AVAILABLE_ICONS.map((ic: any) => <option key={ic.name} value={ic.name}>{ic.name}</option>)}
                                            </select>
                                            <select
                                                value={COLORS.find((c: any) => c.text === item.color)?.name || "Blue"}
                                                onChange={(e) => updateInterest(i, "style", e.target.value)}
                                                className="adm-input h-9 flex-1"
                                            >
                                                {COLORS.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateInterest(i, "description", e.target.value)}
                                        placeholder="Açıklama"
                                        rows={2}
                                        className="adm-input resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- CAREER TAB --- */}
            <div className={currentFormTab === "career" ? "contents" : "hidden"}>
                <div className="adm-page-enter space-y-6">

                    {/* Experience Management */}
                    <div className="adm-card space-y-6 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="adm-icon-tile">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight adm-text">Deneyim</h3>
                                <p className="text-sm adm-text-3">İş deneyimlerinizi ekleyin ve yönetin.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {experiences.map((exp: any, i: number) => (
                                <div key={i} className="adm-inset adm-enter group relative space-y-3 p-5">
                                    <button type="button" onClick={() => setExperiences(experiences.filter((_, idx) => idx !== i))} className="absolute right-3 top-3 adm-text-3 opacity-0 transition-all hover:scale-110 hover:text-rose-500 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="adm-label text-xs">Pozisyon</label>
                                            <input type="text" value={exp.position} onChange={(e) => { const u = [...experiences]; u[i] = { ...u[i], position: e.target.value }; setExperiences(u); }} placeholder="Software Developer" className="adm-input" />
                                        </div>
                                        <div>
                                            <label className="adm-label text-xs">Şirket</label>
                                            <input type="text" value={exp.company} onChange={(e) => { const u = [...experiences]; u[i] = { ...u[i], company: e.target.value }; setExperiences(u); }} placeholder="Şirket Adı" className="adm-input" />
                                        </div>
                                        <div>
                                            <label className="adm-label text-xs">Dönem</label>
                                            <input type="text" value={exp.period} onChange={(e) => { const u = [...experiences]; u[i] = { ...u[i], period: e.target.value }; setExperiences(u); }} placeholder="2023 - Devam Ediyor" className="adm-input" />
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={exp.current || false} onChange={(e) => { const u = [...experiences]; u[i] = { ...u[i], current: e.target.checked }; setExperiences(u); }} className="w-4 h-4 rounded" />
                                                <span className="text-sm font-medium">Hâlâ devam ediyor</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="adm-label text-xs">Açıklama</label>
                                        <textarea value={exp.description} onChange={(e) => { const u = [...experiences]; u[i] = { ...u[i], description: e.target.value }; setExperiences(u); }} rows={2} placeholder="İş tanımı..." className="adm-input resize-none" />
                                    </div>
                                    {/* Move buttons */}
                                    <div className="flex gap-1 absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {i > 0 && <button type="button" onClick={() => { const u = [...experiences];[u[i - 1], u[i]] = [u[i], u[i - 1]]; setExperiences(u); }} className="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon h-7 w-7"><ChevronUp className="w-3.5 h-3.5" /></button>}
                                        {i < experiences.length - 1 && <button type="button" onClick={() => { const u = [...experiences];[u[i], u[i + 1]] = [u[i + 1], u[i]]; setExperiences(u); }} className="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon h-7 w-7"><ChevronDown className="w-3.5 h-3.5" /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={() => setExperiences([...experiences, { position: "", company: "", period: "", description: "", current: false }])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--adm-border-strong)] py-3 text-sm font-medium adm-text-3 transition-all hover:border-[var(--adm-accent)] hover:bg-[var(--adm-accent-softer)] hover:text-[var(--adm-accent-text)]">
                            <Plus className="w-4 h-4" /> Yeni Deneyim Ekle
                        </button>
                    </div>

                    {/* Education Management */}
                    <div className="adm-card space-y-6 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="adm-icon-tile">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight adm-text">Eğitim</h3>
                                <p className="text-sm adm-text-3">Eğitim geçmişinizi ekleyin ve yönetin.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {educations.map((edu: any, i: number) => (
                                <div key={i} className="adm-inset adm-enter group relative space-y-3 p-5">
                                    <button type="button" onClick={() => setEducations(educations.filter((_, idx) => idx !== i))} className="absolute right-3 top-3 adm-text-3 opacity-0 transition-all hover:scale-110 hover:text-rose-500 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="adm-label text-xs">Bölüm / Derece</label>
                                            <input type="text" value={edu.degree} onChange={(e) => { const u = [...educations]; u[i] = { ...u[i], degree: e.target.value }; setEducations(u); }} placeholder="Bilgisayar Mühendisliği" className="adm-input" />
                                        </div>
                                        <div>
                                            <label className="adm-label text-xs">Okul</label>
                                            <input type="text" value={edu.school} onChange={(e) => { const u = [...educations]; u[i] = { ...u[i], school: e.target.value }; setEducations(u); }} placeholder="Üniversite Adı" className="adm-input" />
                                        </div>
                                        <div>
                                            <label className="adm-label text-xs">Dönem</label>
                                            <input type="text" value={edu.period} onChange={(e) => { const u = [...educations]; u[i] = { ...u[i], period: e.target.value }; setEducations(u); }} placeholder="2020 - 2024" className="adm-input" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="adm-label text-xs">Açıklama (Opsiyonel)</label>
                                        <textarea value={edu.description || ""} onChange={(e) => { const u = [...educations]; u[i] = { ...u[i], description: e.target.value }; setEducations(u); }} rows={2} placeholder="Eğitim detayları..." className="adm-input resize-none" />
                                    </div>
                                    {/* Move buttons */}
                                    <div className="flex gap-1 absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {i > 0 && <button type="button" onClick={() => { const u = [...educations];[u[i - 1], u[i]] = [u[i], u[i - 1]]; setEducations(u); }} className="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon h-7 w-7"><ChevronUp className="w-3.5 h-3.5" /></button>}
                                        {i < educations.length - 1 && <button type="button" onClick={() => { const u = [...educations];[u[i], u[i + 1]] = [u[i + 1], u[i]]; setEducations(u); }} className="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon h-7 w-7"><ChevronDown className="w-3.5 h-3.5" /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={() => setEducations([...educations, { degree: "", school: "", period: "", description: "" }])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--adm-border-strong)] py-3 text-sm font-medium adm-text-3 transition-all hover:border-[var(--adm-accent)] hover:bg-[var(--adm-accent-softer)] hover:text-[var(--adm-accent-text)]">
                            <Plus className="w-4 h-4" /> Yeni Eğitim Ekle
                        </button>
                    </div>

                </div>
            </div>

            {/* --- STATS TAB --- */}
            <div className={currentFormTab === "stats" ? "contents" : "hidden"}>
                <div className="adm-page-enter space-y-6">

                    {/* Stats Management */}
                    <div className="adm-card space-y-6 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="adm-icon-tile">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight adm-text">İstatistikler</h3>
                                <p className="text-sm adm-text-3">Hakkımda sayfasındaki istatistik kartlarını düzenleyin.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.map((stat: any, i: number) => (
                                <div key={i} className="adm-inset space-y-3 p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="adm-label text-xs">Etiket</label>
                                            <input type="text" value={stat.label} onChange={(e) => { const u = [...stats]; u[i] = { ...u[i], label: e.target.value }; setStats(u); }} className="adm-input" />
                                        </div>
                                        <div>
                                            <label className="adm-label text-xs">Değer</label>
                                            <input type="text" value={stat.value} onChange={(e) => { const u = [...stats]; u[i] = { ...u[i], value: e.target.value }; setStats(u); }} className="adm-input font-semibold" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <div className="adm-header sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-[var(--adm-border)] px-4 py-3 shadow-[var(--adm-shadow-lg)]">
                <p className="text-xs adm-text-3">{state.error ? <span className="text-rose-500">{state.error}</span> : "Değişiklikler kaydedilince hakkımda sayfası güncellenir."}</p>
                <div className="flex items-center gap-2">
                    <a href="/hakkimda" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-secondary adm-nudge">
                        <ArrowUpRight className="adm-nudge-up" /> <span className="hidden sm:inline">Sitede görüntüle</span>
                    </a>
                    <SubmitButton />
                </div>
            </div>
        </form>
    );
}
