const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * 이미지 파일을 Cloudinary에 업로드하고 secure_url을 반환합니다.
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} folder - Cloudinary 내 폴더 경로 (예: "biography", "works/2025")
 * @returns {Promise<string>} 업로드된 이미지의 public URL
 */
export const uploadImageToCloudinary = async (file, folder = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Cloudinary 업로드 실패 (${res.status})`);
    }

    const data = await res.json();
    return data.secure_url;
};

/**
 * PDF/Word 등 파일을 Cloudinary raw 타입으로 업로드합니다.
 * @param {File} file - 업로드할 파일
 * @param {string} folder - Cloudinary 내 폴더 경로
 * @returns {Promise<string>} 업로드된 파일의 public URL
 */
export const uploadFileToCloudinary = async (file, folder = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Cloudinary 파일 업로드 실패 (${res.status})`);
    }

    const data = await res.json();
    return data.secure_url;
};
