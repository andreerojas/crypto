const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  CLOUDINARY_URL : process.env.CLOUDINARY_URL
})

const folder = process.env.CLOUDINARY_CRYPTO_FOLDER || 'CryptoBay/Local/profilePics';
const storageProfilePics = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      public_id   : (req,file)=> req.user._id.toString(),
      folder,
      allowed_formats : ['jpg','png','jpeg']
  }
});
  

module.exports = {cloudinary, storageProfilePics};


