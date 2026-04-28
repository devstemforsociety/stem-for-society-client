import { Button, FileInput, Title } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Phone } from "lucide-react";
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { useBlogStepper } from "../lib/hooks";
import { GenericError, GenericResponse } from "../lib/types";
import { mutationErrorHandler } from "../lib/utils";
import { AuthorDetails, OverlayedImage } from "./BlogAuthorDetails";
import { BlogContentType } from "./BlogWrite";
import { useNavigate } from "react-router-dom";

type BlogDetailsForm = BlogContentType & AuthorDetails & { coverImage: File };

function useCreateBlog() {
  const navigate = useNavigate();
  return useMutation<
    GenericResponse,
    AxiosError<GenericError>,
    BlogDetailsForm,
    unknown
  >({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("authorName", data.name);
      formData.append("authorMobile", data.phoneNumber);
      formData.append("authorEmail", data.emailAddress);
      formData.append("authorLinkedin", data.linkedInProfileUrl);
      formData.append("authorDesignation", data.designation);
      formData.append("coverImage", data.coverImage);
      formData.append("content", data.content);
      formData.append("references", JSON.stringify(data.references ?? []));
      formData.append("title", data.title);

      const response = await api().post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onError: (error) => mutationErrorHandler(error),
    onSuccess: () => {
      toast.success("Blog creation successful");
      navigate("/blogs");
    },
  });
}

function BlogDetails() {
  const { setActive } = useBlogStepper();
  const { data: blogAuthorDetails } = useQuery<AuthorDetails | undefined>({
    queryKey: ["blog", "authorDetails"],
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const { data: blogContent } = useQuery<BlogContentType | undefined>({
    queryKey: ["blog", "content"],
    staleTime: Infinity,
    gcTime: Infinity,
  });
  // I am not sure if this is dangerous or not, I think I should be doing this inside an useEffect
  if (!blogAuthorDetails || !blogContent) setActive(0);

  const [coverImg, setCoverImg] = useState<File | null>(null);
  const { mutate, isPending } = useCreateBlog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImg) {
      toast.error("Cover Image is required");
      return;
    }
    if (!blogAuthorDetails || !blogContent) {
      toast.error("Author details and blog content are required");
      setActive(0);
      return;
    }
    mutate({
      ...blogAuthorDetails!,
      coverImage: coverImg,
      ...blogContent!,
    });
  };

  return (
    <div className="flex flex-row h-full w-full shadow-md">
      <form
        className="flex-1 flex items-center flex-col p-4 w-full gap-5 mx-auto"
        onSubmit={handleSubmit}
      >
        <Title order={4}>Blog Details</Title>
        {/* Show existing details from blogAuthorDetails */}
        <div className="flex w-full justify-center gap-8">
          <div className="text-base flex flex-col *:flex *:gap-1 *:items-center">
            <h4 className="font-medium">Author</h4>
            <span>{blogAuthorDetails?.name}</span>
            <span>
              <Phone size={14} />
              {blogAuthorDetails?.phoneNumber}
            </span>
            <span>
              <FaEnvelope size={14} />
              {blogAuthorDetails?.emailAddress}
            </span>
          </div>
          <div className="text-base flex flex-col">
            <h4 className="font-medium">Socials</h4>
            <p>{blogAuthorDetails?.linkedInProfileUrl}</p>
            {blogAuthorDetails?.designation}
          </div>
        </div>
        {coverImg && (
          <img
            src={URL.createObjectURL(coverImg)}
            alt="Cover Image"
            className="w-auto h-64"
          />
        )}
        <FileInput
          label="Upload Cover"
          description={
            <div className="grid">
              Size: 1280x720
              <span className="text-red-600 text-sm">
                *Do not upload any copyrighted images, as they will be taken
                down due to legal repercussions.
              </span>
            </div>
          }
          placeholder="Select Image"
          className="w-2/3"
          size="md"
          name="coverImage"
          onChange={setCoverImg}
        />
        <Button radius={999} type="submit" w="400" disabled={isPending}>
          Submit
        </Button>
      </form>
    </div>
  );
}

export default BlogDetails;
