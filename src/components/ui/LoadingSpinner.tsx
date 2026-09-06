"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  variant?: "default" | "fullscreen";
}

const sizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-24 h-24",
  full: "w-64 h-64 md:w-80 md:h-80",
};

export function LoadingSpinner({ size = "md", className = "", variant = "default" }: LoadingSpinnerProps) {
  const SvgContent = (
    <div className={`relative ${sizes[size]} ferret-wrapper ${className}`}>
      <style>{`
        .ferret-wrapper {
          animation: ferret-bounce 2.5s ease-in-out infinite;
        }
        .ferret-shadow {
          animation: ferret-shadow 2.5s ease-in-out infinite;
        }
        .ferret-eye {
          transform-origin: center;
          animation: ferret-blink 4s infinite;
        }
        .ferret-paw-left {
          transform-origin: 105px 236px;
          animation: ferret-pawLeft 2.5s ease-in-out infinite;
        }
        .ferret-paw-right {
          transform-origin: 215px 236px;
          animation: ferret-pawRight 2.5s ease-in-out infinite;
        }
        @keyframes ferret-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3%); }
        }
        @keyframes ferret-shadow {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(0.85); opacity: 0.6; }
        }
        @keyframes ferret-blink {
          0%, 44%, 48%, 100% { transform: scaleY(1); }
          46% { transform: scaleY(0.08); }
        }
        @keyframes ferret-pawLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg) translateY(-2px); }
        }
        @keyframes ferret-pawRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg) translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ferret-wrapper, .ferret-shadow, .ferret-eye, .ferret-paw-left, .ferret-paw-right {
            animation: none !important;
          }
        }
      `}</style>
      <svg viewBox="0 0 320 300" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="160" cy="282" rx="92" ry="10" fill="rgba(20,80,160,0.18)" className="ferret-shadow"/>
        <path d="M88 190 C72 210 68 248 82 267 C94 283 117 286 133 273 C144 285 176 285 187 273 C203 286 226 283 238 267 C252 248 248 210 232 190 Z" fill="#fdfdfd"/>
        <ellipse cx="160" cy="240" rx="72" ry="42" fill="#e9f2ff"/>
        <circle cx="82" cy="68" r="40" fill="#fff"/>
        <circle cx="82" cy="68" r="25" fill="#c7dcff"/>
        <circle cx="238" cy="68" r="40" fill="#fff"/>
        <circle cx="238" cy="68" r="25" fill="#c7dcff"/>
        <ellipse cx="160" cy="135" rx="122" ry="105" fill="#fff"/>
        <path d="M50 120 C70 88 108 84 160 102 C212 84 250 88 270 120 C280 140 271 169 248 180 C220 193 190 178 160 164 C130 178 100 193 72 180 C49 169 40 140 50 120 Z" fill="#c7dcff"/>
        <ellipse cx="112" cy="132" rx="27" ry="32" fill="#102657" className="ferret-eye"/>
        <ellipse cx="208" cy="132" rx="27" ry="32" fill="#102657" className="ferret-eye"/>
        <circle cx="103" cy="121" r="9" fill="#fff"/>
        <circle cx="199" cy="121" r="9" fill="#fff"/>
        <ellipse cx="160" cy="166" rx="55" ry="39" fill="#fff"/>
        <path d="M142 155 C148 148 172 148 178 155 C183 162 174 174 160 177 C146 174 137 162 142 155 Z" fill="#102657"/>
        <path d="M160 176 C160 190 146 194 136 187" fill="none" stroke="#102657" strokeWidth="6" strokeLinecap="round"/>
        <path d="M160 176 C160 190 174 194 184 187" fill="none" stroke="#102657" strokeWidth="6" strokeLinecap="round"/>
        <path d="M68 166 L22 158" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        <path d="M68 177 L18 180" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        <path d="M252 166 L298 158" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        <path d="M252 177 L302 180" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        <g className="ferret-paw-left">
          <ellipse cx="105" cy="236" rx="31" ry="23" fill="#fff"/>
          <path d="M94 234 L94 244" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
          <path d="M105 232 L105 243" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
          <path d="M116 234 L116 243" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
        </g>
        <g className="ferret-paw-right">
          <ellipse cx="215" cy="236" rx="31" ry="23" fill="#fff"/>
          <path d="M204 234 L204 244" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
          <path d="M215 232 L215 243" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
          <path d="M226 234 L226 243" stroke="#102657" strokeWidth="4" strokeLinecap="round"/>
        </g>
        <ellipse cx="112" cy="91" rx="13" ry="6" fill="#b5cff8" transform="rotate(25 112 91)"/>
        <ellipse cx="208" cy="91" rx="13" ry="6" fill="#b5cff8" transform="rotate(-25 208 91)"/>
      </svg>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2f8cff] via-[#4da0ff] to-[#2384f5]" role="status" aria-label="กำลังโหลด">
        <style>{`
          .ferret-text {
            margin-top: 20px;
            color: white;
            font-size: 25px;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-shadow: 0 2px 8px rgba(0, 50, 130, 0.15);
          }
          .ferret-dots span {
            animation: ferret-dot 1.4s infinite;
            opacity: 0.25;
          }
          .ferret-dots span:nth-child(2) { animation-delay: 0.2s; }
          .ferret-dots span:nth-child(3) { animation-delay: 0.4s; }
          
          .ferret-heart {
            position: absolute;
            color: white;
            pointer-events: none;
            right: 9%;
            top: 20%;
            font-size: 20px;
            animation: ferret-floatHeart 2.8s ease-in-out infinite;
          }
          
          .ferret-sparkle1 {
            position: absolute;
            color: white;
            pointer-events: none;
            left: 5%;
            top: 32%;
            font-size: 18px;
            animation: ferret-sparkle 1.8s ease-in-out infinite;
          }
          
          .ferret-sparkle2 {
            position: absolute;
            color: white;
            pointer-events: none;
            right: 4%;
            top: 48%;
            font-size: 13px;
            animation: ferret-sparkle 2s 0.5s ease-in-out infinite;
          }

          @keyframes ferret-dot {
            0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-4px); }
          }
          @keyframes ferret-floatHeart {
            0%, 100% { opacity: 0.3; transform: translateY(8px) scale(0.8) rotate(-10deg); }
            50% { opacity: 1; transform: translateY(-12px) scale(1.1) rotate(10deg); }
          }
          @keyframes ferret-sparkle {
            0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
          }
          @media (max-width: 480px) {
            .ferret-text { font-size: 22px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .ferret-dots span, .ferret-heart, .ferret-sparkle1, .ferret-sparkle2 {
              animation: none !important;
            }
          }
        `}</style>
        
        <div className="relative w-[min(90vw,430px)] text-center flex flex-col items-center">
          <div className="ferret-sparkle1">✦</div>
          <div className="ferret-sparkle2">✦</div>
          <div className="ferret-heart">♥</div>
          
          {SvgContent}
          
          <div className="ferret-text">
            กำลังโหลด
            <span className="ferret-dots inline-flex w-[25px] text-left">
              <span className="inline-block">.</span>
              <span className="inline-block">.</span>
              <span className="inline-block">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {SvgContent}
    </div>
  );
}
