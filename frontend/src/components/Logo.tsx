type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className }: LogoProps) {
  return (
    <span
      className={['gc-logo inline-flex shrink-0', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <style>
        {`
          .gc-logo svg {
            overflow: visible;
          }

          .gc-logo__half {
            fill: #10B981;
            stroke: #10B981;
            stroke-width: 1.5;
            stroke-linejoin: round;
            transform-origin: center;
            transition-property: transform;
            transition-duration: 0.6s;
            transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          }

          .gc-logo__left {
            animation: gc-logo-left-enter 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .gc-logo__right {
            animation: gc-logo-right-enter 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .gc-logo:hover .gc-logo__half {
            transition-duration: 0.4s;
          }

          .gc-logo:hover .gc-logo__left {
            transform: translate(-2px, -3px);
          }

          .gc-logo:hover .gc-logo__right {
            transform: translate(2px, 3px);
          }

          @keyframes gc-logo-left-enter {
            from {
              transform: translate(-15px, -20px);
              opacity: 0;
            }

            72% {
              transform: translate(1.75px, 2.5px);
              opacity: 1;
            }

            to {
              transform: translate(0, 0);
              opacity: 1;
            }
          }

          @keyframes gc-logo-right-enter {
            from {
              transform: translate(15px, 20px);
              opacity: 0;
            }

            72% {
              transform: translate(-1.75px, -2.5px);
              opacity: 1;
            }

            to {
              transform: translate(0, 0);
              opacity: 1;
            }
          }
        `}
      </style>

      <svg
        width={size}
        height={size}
        viewBox="-5 -10 110 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="gc-logo__half gc-logo__left"
          d="M 46 -3 L 1 42 L 46 87 L 46 67 L 21 42 L 46 17 Z"
        />
        <path
          className="gc-logo__half gc-logo__right"
          d="M 54 13 L 54 33 L 79 58 L 54 83 L 54 103 L 99 58 Z"
        />
      </svg>
    </span>
  );
}
