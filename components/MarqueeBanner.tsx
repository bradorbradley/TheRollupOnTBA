'use client'

export default function MarqueeBanner() {
  const bannerText = "TBPN on TBA - تی‌بی‌پی‌ان علی تی‌بی‌ای - TBPN en TBA - TBPN 在 TBA 上 - TBPN su TBA - TBPN sur TBA - TBPN kwenye TBA - TBPN wɔ TBA so - TBPN nye TBA me - TBPN ji he ni TBA fɛɛ mɔ yɔɔ - TBPN på TBA - TBPN บน TBA - ТБПН на ТБА - ТБПН на ТБА - TBPN auf TBA - TBPN, TBA üzerinde - టిబిపిఎన్ TBAపై - टीबीपीएन TBA पर - TBPN no TBA - TBPN n'elu TBA - TBPN lori TBA - TBPN a kan TBA - TBPN auf TBA - TBPN na TBA - TBPN op TBA -"

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#0052FF] h-9 flex overflow-hidden">
      <div className="flex items-center gap-12 w-max marquee-content">
        <div className="text-white font-medium whitespace-nowrap uppercase text-sm">
          {bannerText}
        </div>
        <div className="text-white font-medium whitespace-nowrap uppercase text-sm">
          {bannerText}
        </div>
      </div>
    </div>
  )
}