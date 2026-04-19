import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { downloadImage, urlToFile } from "@lib/client-helpers";
import { maxFiles, maxSize } from "@lib/constants";
import { RejectionFiles } from "@lib/types";
import { cn } from "@lib/utils";
import { debounce } from "lodash";
import { Upload } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

interface Image extends FileWithPath {
  preview: string;
}

interface Props {
  image: FileWithPath | null;
  disabled: boolean;
  currPic: string;
  rejectedFiles: RejectionFiles[];
  setRejectedFiles: React.Dispatch<React.SetStateAction<RejectionFiles[]>>;
  setFile: React.Dispatch<React.SetStateAction<FileWithPath | null>>;
}

export default function ProfilePicture({
  image,
  disabled,
  rejectedFiles,
  currPic,
  setRejectedFiles,
  setFile,
}: Props) {
  // const [url, setUrl] = useState(profilePic || "");

  // const image =
  //   typeof profilePic === "string" ? profilePic : profilePic.preview;

  // const imageUrl =
  //   typeof profilePic === "string" ? profilePic : profilePic.path;
  // console.log("IMAGEe", profilePic);
  // useEffect(() => {
  //   if (!url || url === profilePic) return;

  //   async function fetchImage() {
  //     try {
  //       const response = await fetch(url, { mode: "cors" });
  //       const blob = await response.blob();
  //       const file = new File([blob], "downloaded-image.jpg", {
  //         type: blob.type,
  //       });

  //       const image = Object.assign(file, {
  //         preview: URL.createObjectURL(file),
  //       });

  //       // console.log("Generated Preview URL:", previewUrl);

  //       setFile(image);
  //     } catch (error) {
  //       console.error("Error fetching image:", error);
  //     }
  //   }

  //   fetchImage();
  // }, [url, setFile]);

  // useEffect(() => {
  //   if (!url || url === profilePic) return;

  //   downloadImage(url).then((file) => {
  //     if (!file) return;

  //     const image = Object.assign(file, { preview: URL.createObjectURL(file) });

  //     console.log("Updated Image preview:", image.preview);
  //     setFile(image);
  //   });
  // }, [url, setFile]);

  // debounce(() => {
  //   urlToFile(url, "image.jpg", "image/jpeg").then((file) => {
  //     console.log("FILE", file);
  //   });
  // }, 200);

  const viewedImage = image ? URL.createObjectURL(image) : currPic;
  const fileType = image ? image.type.split("/")[0] : "";

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(viewedImage);
    };
  }, [viewedImage]);

  useEffect(() => {
    return () => {
      rejectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      // Do something with the files

      if (rejectedFiles.length) {
        console.log("REJECTED", rejectedFiles[0]);
        const rejectedFile = Object.assign(rejectedFiles[0], {
          preview: URL.createObjectURL(rejectedFiles[0].file),
        });

        setRejectedFiles((rejected) => [...rejected, rejectedFile]);
      }

      if (!acceptedFiles.length) return;
      // const image: Image = Object.assign(acceptedFiles[0], {
      //   preview: URL.createObjectURL(acceptedFiles[0]),
      // });

      setFile(acceptedFiles[0]);
    },
    []
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize,
    maxFiles,
    // accept: { "image/*": [] },
  });

  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className=" flex flex-col md:flex-row md:items-center gap-x-5 justify-between ">
          <Label>Profile image:</Label>

          <div className=" flex items-center gap-3 md:flex-1 md:max-w-[85%]  ">
            <Input
              onClick={(e) => e.stopPropagation()}
              value={image ? image.path : viewedImage}
              className="  flex-1 "
            />
            <div
              className={cn(
                " w-14 h-14 flex mt-3  mx-auto cursor-pointer   items-center overflow-hidden  justify-center rounded-xl border",
                {
                  " opacity-55": isDragActive,
                }
              )}
            >
              {viewedImage ? (
                fileType === "video" ? (
                  <video
                    src={viewedImage}
                    autoPlay
                    controls={false}
                    muted
                    loop
                    className=" w-full h-full object-cover  object-top   "
                  />
                ) : (
                  <img
                    src={viewedImage}
                    className=" w-full h-full object-cover  object-top   "
                  />
                )
              ) : (
                <Upload size={20} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
