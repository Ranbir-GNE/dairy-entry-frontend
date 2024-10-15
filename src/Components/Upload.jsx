import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

const Upload = () => {
  const cld = new Cloudinary({ cloud: { cloudName: "media_upload_preset_test" } });

  const img = cld
    .image("cld-sample-5")
    .format("auto") 
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500)); 

  return <AdvancedImage cldImg={img} />;
};

export default Upload;
