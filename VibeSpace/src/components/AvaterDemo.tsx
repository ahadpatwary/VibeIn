import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDemoProps {
  src?: string ; // optional string
  size?: string;
}

function AvatarDemo({ src, size }: AvatarDemoProps) {
  return (
    <Avatar className={size}>
      <AvatarImage src={src} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}

export { AvatarDemo };
