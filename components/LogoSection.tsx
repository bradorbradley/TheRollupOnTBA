import Image from 'next/image'

export default function LogoSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full flex items-center justify-center">
          {/* The Rollup brand background - clean tan-white */}
          <div className="absolute w-full h-[240px] bg-bg-elev border border-line rounded-base shadow-sm z-[1]"></div>
          
          {/* The Rollup Wordmark */}
          <div className="absolute w-full flex items-center justify-center z-[5] py-12">
            <Image
              src="/brand/Wordmark color logo + black words.PNG"
              alt="The Rollup"
              width={280}
              height={120}
              className="w-3/4 max-w-sm h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}