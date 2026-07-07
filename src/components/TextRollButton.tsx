import { ArrowRight } from 'lucide-react';

export default function TextRollButton({ text, arrowColor = 'text-white', bgColor = 'bg-gray-900', hoverBg = 'hover:bg-gray-800', textColor = 'text-white', circleBg = 'bg-white', arrowIconColor = 'text-gray-900', circleSize = 'w-6 h-6', containerPad = 'pl-5 pr-2 py-2', fontSize = '13px', type, onClick, disabled }: {
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
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`group ${bgColor} ${hoverBg} ${textColor} rounded-full ${containerPad} flex items-center gap-2 cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="flex flex-col overflow-hidden h-[20px]">
        <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2" style={{ fontSize }}>
          <span className="block font-medium whitespace-nowrap">{text}</span>
          <span className="block font-medium whitespace-nowrap">{text}</span>
        </span>
      </span>
      <span className={`${circleBg} ${circleSize} rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg] shrink-0`}>
        <ArrowRight size={14} className={arrowIconColor} />
      </span>
    </button>
  );
}
