import MarqueeBanner from '@/components/MarqueeBanner'
import VideoSection from '@/components/VideoSection'
import LiveStatus from '@/components/LiveStatus'
import LogoSection from '@/components/LogoSection'
import SponsorSection from '@/components/SponsorSection'

export default function Home() {
  return (
    <div className="flex flex-col overflow-visible">
      {/* Marquee Banner */}
      <MarqueeBanner />

      <div className="flex flex-col lg:flex-row justify-between items-start pr-0">
        {/* Video Section */}
        <VideoSection />

        {/* Scrollable Content */}
        <div className="w-full lg:w-[37%] lg:fixed lg:top-9 lg:right-0 lg:h-[calc(100vh-2.25rem)] lg:overflow-y-auto flex flex-col gap-2 lg:gap-3 px-2 py-2 lg:py-[46px] pb-3 mt-2 lg:mt-0">
          {/* Live Status Indicators */}
          <LiveStatus />

          {/* Content Sections */}
          <div className="flex flex-col gap-2 mr-0">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-2 lg:gap-4">
              <LogoSection />
            </div>

            {/* Sponsor Section */}
            <div className="flex flex-col items-center gap-2 lg:gap-4">
              <SponsorSection />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}