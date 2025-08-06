import Image from 'next/image'

export default function LogoSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full flex items-center justify-center">
          {/* Background gradient */}
          <Image
            src="/gradient.png"
            alt=""
            width={400}
            height={300}
            className="absolute w-full border-2 border-black border-r border-solid rounded-lg z-[1]"
          />
          
          {/* Mask overlay */}
          <Image
            src="https://cdn.prod.website-files.com/67c21d2a7633aaaad4da9a36/67d3adaf0a086cde05255daf_mask.svg"
            alt=""
            width={400}
            height={300}
            className="absolute w-full rounded-lg z-[3]"
          />
          
          {/* Shine effect */}
          <div className="shine absolute w-4/5 h-[120%] left-auto right-auto ml-auto mr-auto z-[2] opacity-100 blur-[50px] bg-black/50 rounded-none"></div>
          
          {/* Main logo */}
          <div className="absolute w-full flex items-center justify-center z-[5]">
            <Image
              src="/logo.svg"
              alt="TBPN Logo"
              width={200}
              height={150}
              className="w-1/2 ml-auto mr-auto static left-auto right-auto z-[4]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}