'use client'

import { sdk } from '@farcaster/miniapp-sdk'

export default function Disclaimer() {
  const handleTokenClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    try {
      await sdk.actions.viewToken({ 
        token: "eip155:8453/erc20:0xcc00f0712bf00496000d792fd096d90332a885b9" 
      })
    } catch (err) {
      console.error('viewToken failed:', err)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="border-t border-[#656565] pt-2 w-full">
        <h2 className="text-3xl font-record-laser font-black uppercase tracking-wide leading-[90%] m-0">
          DISCLAIMER
        </h2>
      </div>
      <div className="disclaimer text-left w-full self-start ml-0 pl-0">
        <p className="text-sm leading-tight uppercase">
          THIS MINI APP IS BROUGHT TO YOU BY{' '}
          <a 
            href="#" 
            className="token-link text-[#2154F7] underline font-bold hover:text-[#2154F7] visited:text-[#2154F7] active:text-[#2154F7]"
            onClick={handleTokenClick}
          >
            $TAPWATER
          </a>
          , THE MODEL T OF WATER AND TOKEN TURNING TAP INTO GOLD ONE STREAM AT A TIME. NEVER LET YOUR ABSOLUTE BOYS TAP OUT. DRINK TAP WATER.
        </p>
      </div>
    </div>
  )
}