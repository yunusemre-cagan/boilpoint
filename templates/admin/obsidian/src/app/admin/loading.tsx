/** Admin sayfaları arasında geçerken gösterilen iskelet. */
export default function AdminLoading() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Yükleniyor">
            <div className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="adm-skeleton h-11 w-11 rounded-[0.9rem]" />
                    <div className="space-y-2">
                        <span className="adm-skeleton h-6 w-48" />
                        <span className="adm-skeleton h-4 w-72 max-w-[60vw]" />
                    </div>
                </div>
                <span className="adm-skeleton hidden h-10 w-32 rounded-xl sm:block" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="adm-card space-y-4 p-5">
                        <span className="adm-skeleton h-4 w-24" />
                        <span className="adm-skeleton h-8 w-20" />
                        <span className="adm-skeleton h-3 w-32" />
                    </div>
                ))}
            </div>
            <div className="adm-card space-y-3 p-5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="adm-skeleton h-10 w-10 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <span className="adm-skeleton h-4 w-1/2" />
                            <span className="adm-skeleton h-3 w-1/4" />
                        </div>
                        <span className="adm-skeleton hidden h-6 w-20 rounded-full sm:block" />
                    </div>
                ))}
            </div>
        </div>
    );
}
