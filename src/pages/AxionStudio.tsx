import { useState, useEffect } from 'react';
import { ArrowRight, Clock, Menu, X } from 'lucide-react';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';

function useLondonTime() {
  const [time, setTime] = useState('00:00');
  useEffect(() => {
    function update() {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function TextRollButton({ text, arrowColor = 'text-white', bgColor = 'bg-gray-900', hoverBg = 'hover:bg-gray-800', textColor = 'text-white', circleBg = 'bg-white', arrowIconColor = 'text-gray-900', circleSize = 'w-6 h-6', containerPad = 'pl-5 pr-2 py-2', fontSize = '13px' }: {
  text: string;
  arrowColor?: string;
  bgColor?: string;
  hoverBg?: string;
  textColor?: string;
  circleBg?: string;
  arrowIconColor?: string;
  circleSize?: string;
  containerPad?: string;
  fontSize?: string;
}) {
  return (
    <button className={`group ${bgColor} ${hoverBg} ${textColor} rounded-full ${containerPad} flex items-center gap-2 cursor-pointer transition-colors duration-300`}>
      <span className="flex flex-col overflow-hidden h-[20px]">
        <span className={`block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2`} style={{ fontSize }}>
          <span className="block font-medium">{text}</span>
          <span className="block font-medium">{text}</span>
        </span>
      </span>
      <span className={`${circleBg} ${circleSize} rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg]`}>
        <ArrowRight size={14} className={arrowIconColor} />
      </span>
    </button>
  );
}

function VideoCard({ videoSrc, bgColor, buttonText, buttonDark = false, description, title }: {
  videoSrc: string;
  bgColor: string;
  buttonText: string;
  buttonDark?: boolean;
  description: string;
  title: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className={`relative rounded-2xl overflow-hidden ${bgColor}`}>
        <video src={videoSrc} autoPlay muted loop playsInline className="w-full object-cover aspect-[329/246] first-of-type:aspect-square" />
        <div className="absolute bottom-4 left-4">
          <div className={`h-9 ${buttonDark ? 'bg-gray-900' : 'bg-white'} rounded-full flex items-center transition-all duration-300 ease-in-out overflow-hidden group-hover:w-[148px] ${buttonDark ? 'group-hover:w-[168px]' : ''}`}>
            <span className={`flex items-center justify-center w-9 h-9 shrink-0`}>
              {buttonDark ? (
                <ArrowRight size={14} className="text-white transition-all duration-300 ease-in-out group-hover:rotate-0 -rotate-45" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 transition-all duration-300 ease-in-out group-hover:rotate-0 -rotate-45">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </span>
            <span className={`text-[13px] font-medium whitespace-nowrap pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 ${buttonDark ? 'text-white' : 'text-gray-900'}`}>
              {buttonText}
            </span>
          </div>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-gray-600 mt-4">{description}</p>
      <h3 className="text-[14px] font-semibold text-gray-900 mt-1">{title}</h3>
    </div>
  );
}

export default function AxionStudio() {
  const londonTime = useLondonTime();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full overflow-x-hidden font-sans antialiased">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen w-full bg-[#EFEFEF] flex flex-col">
        {/* Shader overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <Shader style={{ width: '100%', height: '100%' }}>
            <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
            <ChromaFlow baseColor="#ffffff" downColor="#ff5f03" leftColor="#ff5f03" rightColor="#ff5f03" upColor="#ff5f03" momentum={13} radius={3.5} />
            <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
            <FilmGrain strength={0.05} />
          </Shader>
        </div>

        {/* Navigation */}
        <nav className="relative z-20 w-full max-w-[1440px] mx-auto p-2 sm:p-3">
          <div className="bg-white rounded-full p-[5px] flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold tracking-tight" style={{ fontSize: '10px' }}>AX</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300">Projects</a>
                <a href="#" className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300">Studio</a>
                <a href="#" className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300">Journal</a>
                <a href="#" className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300">Connect</a>
              </div>
            </div>

            {/* Right - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <span className="hidden lg:block text-[13px] text-gray-600">Taking on projects for Q1 2026</span>
              <div className="hidden lg:flex items-center gap-1 text-[13px] text-gray-600">
                <Clock size={14} />
                <span>{londonTime} in London</span>
              </div>
              <button className="group bg-gray-900 text-white rounded-full pl-5 pr-2 py-2 flex items-center gap-2 cursor-pointer transition-colors duration-300 hover:bg-gray-800">
                <span className="flex flex-col overflow-hidden h-[20px]">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                    <span className="block text-[13px] font-medium">Book a strategy call</span>
                    <span className="block text-[13px] font-medium">Book a strategy call</span>
                  </span>
                </span>
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg]">
                  <ArrowRight size={14} className="text-gray-900" />
                </span>
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-gray-900 rounded-full p-2 text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-2xl mx-3 mb-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="p-5 space-y-6">
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <Clock size={14} />
                <span>{londonTime} in London</span>
              </div>
              <div className="space-y-4">
                <a href="#" className="block text-[28px] font-medium text-gray-900" style={{ lineHeight: '32px' }}>Projects</a>
                <a href="#" className="block text-[28px] font-medium text-gray-900" style={{ lineHeight: '32px' }}>Studio</a>
                <a href="#" className="block text-[28px] font-medium text-gray-900" style={{ lineHeight: '32px' }}>Journal</a>
                <a href="#" className="block text-[28px] font-medium text-gray-900" style={{ lineHeight: '32px' }}>Connect</a>
              </div>
              <TextRollButton text="Start a project" />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex-1" />
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20 relative z-20">
          <p className="text-[13px] sm:text-[14px] text-gray-900 tracking-wide mb-5 sm:mb-8">Axion Studio</p>
          <h1 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900"
            style={{ fontSize: 'clamp(1.75rem,7vw,4.2rem)' }}
          >
            We craft digital experiences<br className="hidden sm:block" />
            for brands ready to dominate<span className="sm:hidden"> </span>
            <br className="hidden sm:block" />
            their category online.
          </h1>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <button className="group bg-[#F26522] hover:bg-[#e05a1a] text-white rounded-full pl-5 sm:pl-6 pr-2 py-2 flex items-center gap-2 cursor-pointer transition-colors duration-300" style={{ fontSize: '13px' }}>
              <span className="flex flex-col overflow-hidden h-[20px]">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  <span className="block font-medium" style={{ fontSize: '14px' }}>Start a project</span>
                  <span className="block font-medium" style={{ fontSize: '14px' }}>Start a project</span>
                </span>
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg]">
                <ArrowRight size={14} className="text-[#F26522]" />
              </span>
            </button>
            <div className="flex items-center gap-2 bg-white rounded-[4px] px-3 sm:px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#E8704E] shrink-0">
                <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
              </svg>
              <span className="text-[13px] sm:text-[14px] font-medium text-gray-900">Certified Partner</span>
              <span className="text-[10px] sm:text-[11px] bg-gray-900 text-white px-1.5 sm:px-2 py-0.5 rounded font-medium">Featured</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT */}
      <section className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] sm:text-[12px] font-semibold">1</div>
            <span className="text-[12px] sm:text-[13px] font-medium border border-gray-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">Introducing Axion</span>
          </div>

          <h2 className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 px-5 sm:px-8 lg:px-12 mb-12 sm:mb-16 lg:mb-28"
            style={{ fontSize: 'clamp(1.5rem,4vw,3.2rem)' }}
          >
            Strategy-led creatives, delivering<br />
            results in digital and beyond.
          </h2>

          {/* Mobile/Tablet layout */}
          <div className="lg:hidden px-5 sm:px-8 lg:px-12">
            <p className="text-[15px] sm:text-[17px] leading-[1.6] font-medium text-gray-900 mb-6">
              Through research, creative thinking and iteration we help growing brands realize their digital full potential.
            </p>
            <div className="mb-6">
              <TextRollButton
                text="About our studio"
                bgColor="bg-[#F26522]"
                hoverBg="hover:bg-[#e05a1a]"
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-[#F26522]"
                circleSize="w-7 h-7 sm:w-8 sm:h-8"
                containerPad="pl-5 sm:pl-6 pr-2 py-2"
                fontSize="14px"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <div className="sm:w-[45%]">
                <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85" alt="Axion Studio workspace" className="w-full h-auto rounded-xl sm:rounded-2xl object-cover" style={{ aspectRatio: '438/346' }} />
              </div>
              <div className="sm:w-[55%]">
                <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85" alt="Axion Studio team" className="w-full h-auto rounded-xl sm:rounded-2xl object-cover" style={{ aspectRatio: '900/600' }} />
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-5 sm:px-8 lg:px-12">
            <div className="self-end">
              <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85" alt="Axion Studio workspace" className="w-full h-auto rounded-2xl object-cover" style={{ aspectRatio: '438/346' }} />
            </div>
            <div className="self-start flex flex-col justify-end items-end">
              <p className="text-[16px] leading-[1.65] font-medium text-gray-900 whitespace-nowrap mb-4">
                Through research, creative thinking<br />
                and iteration we help growing<br />
                brands realize their digital full<br />
                potential.
              </p>
              <TextRollButton
                text="About our studio"
                bgColor="bg-[#F26522]"
                hoverBg="hover:bg-[#e05a1a]"
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-[#F26522]"
                circleSize="w-8 h-8"
                containerPad="pl-6 pr-2 py-2"
                fontSize="14px"
              />
            </div>
            <div className="self-end">
              <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85" alt="Axion Studio team" className="w-full h-auto rounded-2xl object-cover" style={{ aspectRatio: '3/2' }} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CASE STUDIES */}
      <section className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] sm:text-[12px] font-semibold">2</div>
            <span className="text-[12px] sm:text-[13px] font-medium border border-gray-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">Featured client work</span>
          </div>

          <h2 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14 lg:mb-16"
            style={{ fontSize: 'clamp(1.75rem,7vw,4.2rem)' }}
          >
            Our projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7 px-5 sm:px-8 lg:px-12">
            <VideoCard
              videoSrc="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4"
              bgColor="bg-[#1a1d2e]"
              buttonText="Learn more"
              description="Winner of Site of the Month 2025 - an interactive 3D showcase driving record engagement"
              title="Narrativ"
            />
            <VideoCard
              videoSrc="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4"
              bgColor="bg-[#6b6b6b]"
              buttonText="View case study"
              buttonDark={true}
              description="Transforming a dated platform into a conversion-focused brand experience"
              title="Luminar"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
