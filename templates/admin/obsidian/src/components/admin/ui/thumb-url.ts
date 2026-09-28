/**
 * Cloudinary adreslerine küçük boyutlu dönüşüm ekler (liste ve ızgaralarda tam
 * boy görsel indirmemek için). Diğer adresler olduğu gibi döner.
 */
export function thumbUrl(url: string, width: number, height: number) {
    if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
    return url.replace("/image/upload/", `/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
}
