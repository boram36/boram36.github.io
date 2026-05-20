// Supabase Storage → Cloudinary 마이그레이션 스크립트
// 실행: node migrate-to-cloudinary.js
// 필요: Node 18+, npm install sharp

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = "https://lnfoyqgnldmeonuyezsh.supabase.co";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const isSupabaseUrl = (url) =>
    typeof url === "string" && url.includes("supabase.co/storage");

function parseSupabasePath(url) {
    // https://xxx.supabase.co/storage/v1/object/public/BUCKET/PATH
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) return null;
    return { bucket: match[1], path: match[2] };
}

async function compressImage(sourceUrl) {
    let buffer;

    const parsed = parseSupabasePath(sourceUrl);
    if (parsed) {
        const { data, error } = await supabase.storage
            .from(parsed.bucket)
            .download(parsed.path);
        if (error) throw new Error(`Supabase 다운로드 실패: ${error.message}`);
        buffer = Buffer.from(await data.arrayBuffer());
    } else {
        const res = await fetch(sourceUrl);
        if (!res.ok) throw new Error(`다운로드 실패: HTTP ${res.status}`);
        buffer = Buffer.from(await res.arrayBuffer());
    }

    return sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
}

async function uploadToCloudinary(sourceUrl, resourceType = "image", folder = "") {
    const body = new FormData();

    if (resourceType === "image") {
        const compressed = await compressImage(sourceUrl);
        body.append("file", new Blob([compressed], { type: "image/jpeg" }), "image.jpg");
    } else {
        // 파일(PDF 등)은 URL 직접 전달
        body.append("file", sourceUrl);
    }

    body.append("upload_preset", UPLOAD_PRESET);
    if (folder) body.append("folder", folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const res = await fetch(endpoint, { method: "POST", body });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.secure_url;
}

function parseImages(raw, fallback) {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {}
    }
    return fallback ? [fallback].filter(Boolean) : [];
}

function parseFiles(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {}
    }
    return [];
}

// images 배열만 있는 테이블 (portfolio_works는 array 타입, 나머지는 JSON string)
// hasImageCol: 테이블에 단수 image 컬럼이 있는지 여부
async function migrateImageRows(rows, folder, tableName, storeAsArray = false, hasImageCol = true) {
    let count = 0;
    for (const row of rows) {
        const images = parseImages(row.images, row.image);
        if (!images.some(isSupabaseUrl)) continue;

        process.stdout.write(`  #${row.id}: `);
        try {
            const newImages = [];
            for (const url of images) {
                if (isSupabaseUrl(url)) {
                    const newUrl = await uploadToCloudinary(url, "image", folder);
                    newImages.push(newUrl);
                    process.stdout.write("✓");
                } else {
                    newImages.push(url);
                    process.stdout.write("-");
                }
            }

            const payload = {
                images: storeAsArray ? newImages : JSON.stringify(newImages),
            };
            if (hasImageCol) payload.image = newImages[0] || null;

            const { error: updateError } = await supabase
                .from(tableName)
                .update(payload)
                .eq("id", row.id);

            if (updateError) throw new Error(updateError.message);

            count++;
            console.log(` (${newImages.length}장)`);
        } catch (err) {
            console.log(` ✗ ${err.message}`);
        }
    }
    return count;
}

// images + files 모두 있는 테이블 (publications, essays_press)
async function migrateImageAndFileRows(rows, folder, tableName) {
    let count = 0;
    for (const row of rows) {
        const images = parseImages(row.images, row.image);
        const files = parseFiles(row.files);

        const needsImage = images.some(isSupabaseUrl);
        const needsFile = files.some((f) => {
            const url = typeof f === "string" ? f : f?.url;
            return isSupabaseUrl(url);
        });

        if (!needsImage && !needsFile) continue;

        process.stdout.write(`  #${row.id}: `);
        try {
            const newImages = [];
            for (const url of images) {
                if (isSupabaseUrl(url)) {
                    newImages.push(await uploadToCloudinary(url, "image", folder));
                    process.stdout.write("✓");
                } else {
                    newImages.push(url);
                }
            }

            const newFiles = [];
            for (const f of files) {
                const url = typeof f === "string" ? f : f?.url;
                const label = typeof f === "object" ? (f?.label || f?.name || "파일") : "파일";
                if (isSupabaseUrl(url)) {
                    const newUrl = await uploadToCloudinary(url, "raw", folder);
                    newFiles.push({ url: newUrl, label });
                    process.stdout.write("📄");
                } else {
                    newFiles.push(f);
                }
            }

            await supabase
                .from(tableName)
                .update({
                    images: JSON.stringify(newImages),
                    image: newImages[0] || null,
                    files: JSON.stringify(newFiles),
                    file_url: newFiles[0]?.url || null,
                    file_name: newFiles[0]?.label || null,
                })
                .eq("id", row.id);

            count++;
            console.log("");
        } catch (err) {
            console.log(` ✗ ${err.message}`);
        }
    }
    return count;
}

async function main() {
    console.log("🚀 Supabase Storage → Cloudinary 마이그레이션 시작\n");

    // portfolio_works (images: PostgreSQL array 타입, image 단수 컬럼 없음)
    console.log("📁 portfolio_works");
    const { data: works, error: worksError } = await supabase
        .from("portfolio_works")
        .select("id, images");
    if (worksError) {
        console.log(`   ✗ 쿼리 실패: ${worksError.message}\n`);
    } else {
        console.log(`   총 ${works?.length || 0}행 발견`);
        const worksCount = await migrateImageRows(works || [], "works", "portfolio_works", true, false);
        console.log(`   → ${worksCount}개 항목 완료\n`);
    }

    // biography (images: JSON string)
    console.log("📁 biography");
    const { data: bio } = await supabase
        .from("biography")
        .select("id, images, image");
    const bioCount = await migrateImageRows(bio || [], "biography", "biography", false);
    console.log(`   → ${bioCount}개 항목 완료\n`);

    // public_art (images: JSON string)
    console.log("📁 public_art");
    const { data: art } = await supabase
        .from("public_art")
        .select("id, images, image");
    const artCount = await migrateImageRows(art || [], "public_art", "public_art", false);
    console.log(`   → ${artCount}개 항목 완료\n`);

    // publications (images + files)
    console.log("📁 publications");
    const { data: pubs } = await supabase
        .from("publications")
        .select("id, images, image, files");
    const pubsCount = await migrateImageAndFileRows(pubs || [], "publications", "publications");
    console.log(`   → ${pubsCount}개 항목 완료\n`);

    // essays_press (images + files)
    console.log("📁 essays_press");
    const { data: essays } = await supabase
        .from("essays_press")
        .select("id, images, image, files");
    const essaysCount = await migrateImageAndFileRows(essays || [], "essays_press", "essays_press");
    console.log(`   → ${essaysCount}개 항목 완료\n`);

    // main_bg
    console.log("📁 main_bg");
    const { data: bg } = await supabase.from("main_bg").select("id, url");
    for (const row of bg || []) {
        if (!isSupabaseUrl(row.url)) continue;
        process.stdout.write(`  #${row.id}: `);
        try {
            const newUrl = await uploadToCloudinary(row.url, "image", "main_bg");
            await supabase.from("main_bg").update({ url: newUrl }).eq("id", row.id);
            console.log("✓");
        } catch (err) {
            console.log(`✗ ${err.message}`);
        }
    }
    console.log("");

    console.log("✅ 마이그레이션 완료!");
    console.log("이제 Supabase Storage 버킷을 비우고 무료 플랜으로 다운그레이드하세요.");
}

main().catch(console.error);
