const ImageKit = require("imagekit");

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy_key",
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/demo",
});

// Upload image to ImageKit
const uploadImage = async (file, folder = "penportal") => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: folder,
      useUniqueFileName: true,
    });

    return result.url;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Delete image from ImageKit
const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error("ImageKit delete error:", error);
    return false;
  }
};

module.exports = { imagekit, uploadImage, deleteImage };
