const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  CLOUDINARY_URL : process.env.CLOUDINARY_URL
})

const storageProfilePics = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      public_id   : (req,file)=> req.user._id.toString(),
      folder: 'CryptoBay/profilePics',
      allowed_formats : ['jpg','png','jpeg']
  }
});
  

module.exports = {cloudinary, storageProfilePics};


