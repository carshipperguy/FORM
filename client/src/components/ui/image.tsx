interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

export default function Image({ width, height, className, ...props }: ImageProps) {
  return (
    <img
      {...props}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}
