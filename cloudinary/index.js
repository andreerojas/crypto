const cloudinary = require('cloudinary').v2;
cloudinary.config({
  CLOUDINARY_URL : process.env.CLOUDINARY_URL
})

module.exports = {cloudinary};


