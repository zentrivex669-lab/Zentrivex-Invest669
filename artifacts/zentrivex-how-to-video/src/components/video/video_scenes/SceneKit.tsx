import type { CSSProperties, ReactNode } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

export function imagePath(name: string) {
  return `${import.meta.env.BASE_URL}images/${name}`;
}

export function PhoneFrame({
  image,
  className = '',
  imageClassName = '',
  style,
  children,
}: {
  image: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={`video-phone ${className}`} style={style}>
      <div className="video-phone__screen">
        <img
          className={imageClassName}
          src={imagePath(image)}
          alt=""
          draggable={false}
        />
        {children && <div className="video-phone__overlay">{children}</div>}
        <div className="video-phone__island" />
      </div>
      <span className="video-phone__button video-phone__button--left-one" />
      <span className="video-phone__button video-phone__button--left-two" />
      <span className="video-phone__button video-phone__button--right" />
    </div>
  );
}

export function StepLabel({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="video-step-label">
      <span className="video-step-label__number">{number}</span>
      <span className="video-step-label__title">{title}</span>
    </div>
  );
}

export function GoldRule({ className = '' }: { className?: string }) {
  return <span className={`video-gold-rule ${className}`} aria-hidden="true" />;
}