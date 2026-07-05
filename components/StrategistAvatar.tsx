"use client";

/**
 * StrategistAvatar — the animated face of "Ask the Strategist"
 * Stylised inline-SVG portrait (component, not <img>), editorial flat style.
 *
 * Usage:
 *   <StrategistAvatar size={96} />                    // idle: breathing + lens glint
 *   <StrategistAvatar size={96} state="thinking" />   // gold thinking dots
 *   <StrategistAvatar size={96} state="speaking" />   // mouth animates while streaming
 *
 * Wire `state` to the chat lifecycle:
 *   idle → waiting · thinking → request in flight · speaking → tokens streaming
 * Respects prefers-reduced-motion.
 */

export type StrategistState = "idle" | "thinking" | "speaking";

interface StrategistAvatarProps {
  size?: number;
  state?: StrategistState;
  className?: string;
  /** Accessible label; set "" to mark decorative */
  title?: string;
}

export default function StrategistAvatar({
  size = 96,
  state = "idle",
  className,
  title = "Ask the Strategist",
}: StrategistAvatarProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      data-state={state}
    >
      <style>{`
        .sa-figure { animation: sa-breathe 4.5s ease-in-out infinite; }
        .sa-glint { animation: sa-glint 7s ease-in-out infinite; }
        .sa-dot { opacity: 0; }
        [data-state="thinking"] .sa-dot { animation: sa-dot 1.4s ease-in-out infinite; }
        [data-state="thinking"] .sa-dot:nth-of-type(2) { animation-delay: 0.2s; }
        [data-state="thinking"] .sa-dot:nth-of-type(3) { animation-delay: 0.4s; }
        .sa-mouth-open { opacity: 0; }
        [data-state="speaking"] .sa-mouth-closed { animation: sa-talk-a 0.55s steps(1) infinite; }
        [data-state="speaking"] .sa-mouth-open { animation: sa-talk-b 0.55s steps(1) infinite; }
        @keyframes sa-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes sa-glint {
          0%, 72% { transform: translateX(-140px) skewX(-18deg); opacity: 0; }
          78% { opacity: 0.45; }
          88%, 100% { transform: translateX(170px) skewX(-18deg); opacity: 0; }
        }
        @keyframes sa-dot {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-5px); }
        }
        @keyframes sa-talk-a { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes sa-talk-b { 0%, 49% { opacity: 0; } 50%, 100% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .sa-figure, .sa-glint, .sa-dot, .sa-mouth-closed, .sa-mouth-open { animation: none !important; }
          [data-state="thinking"] .sa-dot { opacity: 0.8; }
        }
      `}</style>

  <defs>
    <clipPath id="sa-badge"><circle cx="200" cy="200" r="196"/></clipPath>
    <clipPath id="sa-lenses">
      <path d="M 149 136 H 199 C 202 136 203 139 203 143 L 202 160 C 200 174 191 181 177 181 C 162 181 153 172 150 157 C 148.6 150 148.4 141 149 136 Z"/>
      <path d="M 261 136 H 211 C 208 136 207 139 207 143 L 208 160 C 210 174 219 181 233 181 C 248 181 257 172 260 157 C 261.4 150 261.6 141 261 136 Z"/>
    </clipPath>
    <linearGradient id="sa-curtain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F1E7D6"/>
      <stop offset="1" stopColor="#FAF6F1"/>
    </linearGradient>
    <linearGradient id="sa-lens" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#23272E"/>
      <stop offset="1" stopColor="#0F1216"/>
    </linearGradient>
  </defs>

  <g clipPath="url(#sa-badge)">
    <rect width="400" height="400" fill="url(#sa-curtain)"/>
    <g stroke="#EBE0CD" strokeWidth="12" opacity="0.7">
      <line x1="36" y1="0" x2="36" y2="400"/><line x1="92" y1="0" x2="92" y2="400"/>
      <line x1="148" y1="0" x2="148" y2="400"/><line x1="204" y1="0" x2="204" y2="400"/>
      <line x1="260" y1="0" x2="260" y2="400"/><line x1="316" y1="0" x2="316" y2="400"/>
      <line x1="372" y1="0" x2="372" y2="400"/>
    </g>
    <g stroke="#E2D5BF" strokeWidth="2.5" opacity="0.8">
      <line x1="64" y1="0" x2="64" y2="400"/><line x1="120" y1="0" x2="120" y2="400"/>
      <line x1="176" y1="0" x2="176" y2="400"/><line x1="232" y1="0" x2="232" y2="400"/>
      <line x1="288" y1="0" x2="288" y2="400"/><line x1="344" y1="0" x2="344" y2="400"/>
    </g>

    {/* plant bottom-left */}
    <g opacity="0.95">
      <path d="M 50 336 C 28 298 32 266 56 244 C 64 276 60 308 50 336 Z" fill="#2F6B3C"/>
      <path d="M 58 342 C 56 294 72 260 102 248 C 98 286 82 320 58 342 Z" fill="#3E8A4E"/>
      <path d="M 44 346 C 18 320 8 290 18 260 C 42 280 50 314 44 346 Z" fill="#4FA05F"/>
      <path d="M 64 348 C 76 314 98 294 126 290 C 112 322 90 342 64 348 Z" fill="#2F6B3C"/>
    </g>

    <g className="sa-figure"><g transform="rotate(4 205 210)">
      {/* suit */}
      <path d="M 46 400 C 52 320 96 274 158 264 L 205 256 L 252 264 C 314 274 358 320 364 400 Z" fill="#566070"/>
      {/* right-side suit shading */}
      <path d="M 252 264 C 314 274 358 320 364 400 L 292 400 C 290 336 276 292 252 264 Z" fill="#4B5563"/>
      {/* shirt */}
      <path d="M 172 264 L 205 256 L 238 264 L 231 330 L 205 386 L 179 330 Z" fill="#FDFBF7"/>
      {/* lapels */}
      <path d="M 172 262 L 205 296 L 184 344 C 168 316 166 288 172 262 Z" fill="#4B5563"/>
      <path d="M 238 262 L 205 296 L 226 344 C 242 316 244 288 238 262 Z" fill="#4B5563"/>
      <path d="M 172 262 L 205 296 L 200 302 L 170 272 Z" fill="#3F4854" opacity="0.6"/>
      <path d="M 238 262 L 205 296 L 210 302 L 240 272 Z" fill="#3F4854" opacity="0.6"/>
      {/* pocket square */}
      <path d="M 278 316 L 298 310 L 292 330 Z" fill="#C9A876"/>

      {/* neck */}
      <path d="M 186 226 L 234 226 L 232 262 C 223 271 197 271 188 262 Z" fill="#5B3A26"/>
      <path d="M 186 226 L 234 226 L 233 244 C 219 251 201 251 187 244 Z" fill="#452A19"/>

      {/* collar */}
      <path d="M 180 252 L 205 260 L 192 280 L 174 264 Z" fill="#FDFBF7"/>
      <path d="M 240 252 L 205 260 L 218 280 L 246 264 Z" fill="#FDFBF7"/>
      {/* tie */}
      <path d="M 197 258 L 223 258 L 216 277 L 204 277 Z" fill="#22252B"/>
      <path d="M 205 260 L 215 260 L 210 268 Z" fill="#30343C"/>
      <path d="M 204 277 L 216 277 L 226 366 L 210 392 L 195 364 Z" fill="#22252B"/>

      {/* ears */}
      <path d="M 141 158 C 135 156 132 162 134 170 C 136 178 142 182 147 179 Z" fill="#5B3A26"/>
      <path d="M 269 158 C 275 156 278 162 276 170 C 274 178 268 182 263 179 Z" fill="#5B3A26"/>

      {/* head: wider, rounder */}
      <path d="M 145 152 C 145 106 169 84 205 84 C 241 84 265 106 265 152 C 265 182 258 206 246 221 C 236 233 222 240 205 240 C 188 240 174 233 164 221 C 152 206 145 182 145 152 Z" fill="#5B3A26"/>
      {/* side shadow for dimension */}
      <path d="M 245 110 C 258 124 265 138 265 152 C 265 182 258 206 246 221 C 240 228 233 233 225 236 C 240 220 250 196 252 168 C 253 146 251 126 245 110 Z" fill="#4A2E1D" opacity="0.55"/>
      {/* soft forehead light */}
      <ellipse cx="198" cy="104" rx="26" ry="9" fill="#6E462E" opacity="0.45"/>

      {/* hair: short, clean hairline */}
      <path d="M 145 148 C 145 102 169 81 205 81 C 241 81 265 102 265 148 C 264 136 261 126 255 118 C 241 110 222 106 205 106 C 188 106 169 110 155 118 C 149 126 146 136 145 148 Z" fill="#1E1610"/>
      {/* temple fade hint */}
      <path d="M 148 132 C 150 124 153 119 157 116 C 154 122 151 128 150 136 Z" fill="#3A2718" opacity="0.7"/>
      <path d="M 262 132 C 260 124 257 119 253 116 C 256 122 259 128 260 136 Z" fill="#3A2718" opacity="0.7"/>

      {/* aviator sunglasses: large, squarish teardrop, brow bar + double bridge */}
      <path d="M 149 136 H 199 C 202 136 203 139 203 143 L 202 160 C 200 174 191 181 177 181 C 162 181 153 172 150 157 C 148.6 150 148.4 141 149 136 Z" fill="url(#sa-lens)"/>
      <path d="M 261 136 H 211 C 208 136 207 139 207 143 L 208 160 C 210 174 219 181 233 181 C 248 181 257 172 260 157 C 261.4 150 261.6 141 261 136 Z" fill="url(#sa-lens)"/>
      <path d="M 149 136 H 199 C 202 136 203 139 203 143 L 202 160 C 200 174 191 181 177 181 C 162 181 153 172 150 157 C 148.6 150 148.4 141 149 136 Z" fill="none" stroke="#B9BDC4" strokeWidth="2.5"/>
      <path d="M 261 136 H 211 C 208 136 207 139 207 143 L 208 160 C 210 174 219 181 233 181 C 248 181 257 172 260 157 C 261.4 150 261.6 141 261 136 Z" fill="none" stroke="#B9BDC4" strokeWidth="2.5"/>
      <line x1="147" y1="135" x2="263" y2="135" stroke="#B9BDC4" strokeWidth="3"/>
      <line x1="203" y1="146" x2="207" y2="146" stroke="#B9BDC4" strokeWidth="8"/>
      <line x1="147" y1="139" x2="141" y2="150" stroke="#B9BDC4" strokeWidth="2.5"/>
      <line x1="263" y1="139" x2="269" y2="150" stroke="#B9BDC4" strokeWidth="2.5"/>
      {/* one restrained highlight per lens */}
      <path d="M 158 141 L 168 141 L 156 168 L 152 158 Z" fill="#FFFFFF" opacity="0.10"/>
      <path d="M 220 141 L 230 141 L 218 168 L 214 158 Z" fill="#FFFFFF" opacity="0.10"/>
      <g clipPath="url(#sa-lenses)">
        <rect className="sa-glint" x="118" y="128" width="24" height="60" fill="#FFFFFF" opacity="0" transform="skewX(-18)" />
      </g>

      {/* nose: minimal */}
      <path d="M 205 182 L 205 193" stroke="#4A2E1D" strokeWidth="2.5" opacity="0.5" strokeLinecap="round"/>
      <path d="M 198 197 C 202 201 208 201 212 197" fill="none" stroke="#452A19" strokeWidth="3" strokeLinecap="round"/>

      {/* mustache: slim, neat */}
      <path d="M 184 209 C 192 202 222 202 230 209 C 224 213 218 214 207 214 C 196 214 190 213 184 209 Z" fill="#1E1610"/>
      <path d="M 184 209 C 182 212 181 216 183 219 C 185 219 186 218 186 216 C 185 213 184 211 184 209 Z" fill="#1E1610"/>
      <path d="M 230 209 C 232 212 233 216 231 219 C 229 219 228 218 228 216 C 229 213 230 211 230 209 Z" fill="#1E1610"/>

      {/* lips: subtle closed smile */}
      <g className="sa-mouth-closed">
        <path d="M 182 217 C 193 226 221 226 230 215" fill="none" stroke="#352014" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M 189 220 C 197 228 217 228 223 219 C 221 233 194 234 189 220 Z" fill="#7A4A33" opacity="0.9"/>
      </g>
      <g className="sa-mouth-open">
        <path d="M 185 218 C 195 222 219 222 227 216 C 224 230 217 235 206 235 C 196 235 189 229 185 218 Z" fill="#2E1B12"/>
        <path d="M 190 219 C 198 222 216 222 223 218 C 222 223 217 224 206 224 C 196 224 192 223 190 219 Z" fill="#FDFBF7" opacity="0.95"/>
      </g>

      {/* chin hair: soft patch */}
      <path d="M 201 234 C 205 237 211 237 215 234 C 213 240 203 240 201 234 Z" fill="#1E1610" opacity="0.9"/>
    </g></g>
    <g fill="#C9A876">
      <circle className="sa-dot" cx="300" cy="96" r="8" />
      <circle className="sa-dot" cx="326" cy="82" r="10" />
      <circle className="sa-dot" cx="352" cy="66" r="12" />
    </g>
  </g>
  <circle cx="200" cy="200" r="196" fill="none" stroke="#C9A876" strokeWidth="6"/>

    </svg>
  );
}
