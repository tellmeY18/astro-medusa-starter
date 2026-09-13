import clsx from "clsx";
import { useEffect, useState } from "react";

interface OptimizedImageData {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  sizes?: string;
}

export interface OptimizedCarouselImage {
  originalUrl: string;
  main: OptimizedImageData;
  thumb: OptimizedImageData;
}

interface Props {
  images: OptimizedCarouselImage[];
  alt: string;
}

export const ImageCarousel = ({ images, alt }: Props) => {
  if (images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const currentImage = images[currentIndex];

  const handlePreview = () => setIsPreviewing(true);
  const handleClosePreview = () => setIsPreviewing(false);
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) =>
    event.stopPropagation();

  useEffect(() => {
    if (!isPreviewing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClosePreview();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewing]);

  const renderOptimizedImg = (
    data: OptimizedImageData,
    extraProps?: React.ImgHTMLAttributes<HTMLImageElement>,
  ) => (
    <img
      src={data.src}
      srcSet={data.srcSet}
      sizes={data.sizes}
      width={data.width}
      height={data.height}
      alt={alt}
      loading={extraProps?.loading ?? "lazy"}
      decoding="async"
      draggable={false}
      {...extraProps}
    />
  );

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-50 flex items-center justify-center transition-all duration-200",
          {
            "opacity-0 pointer-events-none": !isPreviewing,
            "opacity-100": isPreviewing,
          },
        )}
        onClick={handleClosePreview}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
      >
        <button
          type="button"
          onClick={handleClosePreview}
          aria-label="Close image preview"
          className={clsx(
            "absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-2xl leading-none hover:bg-black/70 transition-colors",
            {
              "opacity-0 pointer-events-none": !isPreviewing,
            },
          )}
        >
          &times;
        </button>
        {renderOptimizedImg(currentImage.main, {
          className: "object-contain max-w-3xl",
          onClick: handleImageClick,
        })}
      </div>

      <div className="flex flex-col gap-4">
        {renderOptimizedImg(currentImage.main, {
          className:
            "w-full aspect-[4/5] object-cover rounded-xl cursor-pointer",
          onClick: handlePreview,
          loading: "eager",
        })}

        <div className="flex gap-2 justify-center">
          {images.map((image, index) => (
            <button
              key={image.originalUrl}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={clsx(
                "w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-transparent cursor-pointer transition-colors duration-200",
                {
                  "border-bark shadow-md": currentIndex === index,
                },
              )}
            >
              {renderOptimizedImg(image.thumb, {
                className: "w-full h-full aspect-square object-cover",
              })}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};