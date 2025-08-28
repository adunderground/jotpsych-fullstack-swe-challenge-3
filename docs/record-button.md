Record button should be a red circle. Take all other notes from the component specified below

You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
ripple-effect-creator.tsx
"use client";

import React, { 
  ReactNode, 
  useState, 
  useMemo, 
  MouseEvent, 
  CSSProperties, 
  isValidElement,
  cloneElement
} from 'react';

// --- HELPER TYPES & CONSTANTS ---

interface RippleState {
  key: number;
  x: number;
  y: number;
  size: number;
}

interface RippleEffectProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
  disabled?: boolean;
}

// A set of HTML tags that are "void" (cannot have children).
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);


// --- THE RIPPLE OVERLAY (INTERNAL COMPONENT) ---

// This is separated for clarity. It's the visual part of the ripple.
const RippleOverlay = ({ ripples, color, duration }: {
  ripples: RippleState[];
  color: string;
  duration: number;
}) => (
  <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
    {ripples.map(ripple => (
      <span
        key={ripple.key}
        className="absolute rounded-full animate-js-ripple-effect"
        style={{
          left: ripple.x,
          top: ripple.y,
          width: ripple.size,
          height: ripple.size,
          backgroundColor: color,
          '--ripple-duration': `${duration}ms`,
        } as CSSProperties}
      />
    ))}
  </div>
);


// --- THE MAIN, HYBRID RIPPLE COMPONENT ---

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  rippleColor: userProvidedRippleColor,
  rippleDuration = 600,
  disabled = false,
  className: wrapperClassName, // Renamed to avoid conflict with child's className
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  // --- SHARED LOGIC ---

  const rippleStyles = useMemo(() => `
    @keyframes js-ripple-animation {
      0% { transform: scale(0); opacity: 0.3; }
      100% { transform: scale(1); opacity: 0; }
    }
    .animate-js-ripple-effect { 
      animation: js-ripple-animation var(--ripple-duration, 600ms) ease-out forwards; 
    }
    :root { --ripple-color: oklch(0.145 0 0 / 0.3); }
    .dark { --ripple-color: oklch(0.985 0 0 / 0.4); }
  `, []);

  const determinedRippleColor = useMemo(() => {
    return userProvidedRippleColor || 'var(--ripple-color)';
  }, [userProvidedRippleColor]);

  const createRipple = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;

    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple: RippleState = { key: Date.now(), x, y, size };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(current => current.filter(r => r.key !== newRipple.key));
    }, rippleDuration);
  };

  // --- CONDITIONAL RENDERING LOGIC ---

  if (!isValidElement(children)) {
    return <>{children}</>;
  }
  
  const child = children as React.ReactElement<any>;
  const isVoid = typeof child.type === 'string' && VOID_ELEMENTS.has(child.type);

  // --- STRATEGY 1: SMART WRAPPER (for void elements like <img>, <input>) ---
  if (isVoid) {
    return (
      <div
        onClick={createRipple}
        // The wrapper inherits the child's className to match its border-radius
        className={`relative inline-block overflow-hidden cursor-pointer isolate ${child.props.className || ''} ${wrapperClassName || ''}`}
        {...props}
      >
        <style>{rippleStyles}</style>
        {/* Render the original, unmodified child */}
        {child}
        {/* The ripple overlay is a sibling, visually on top */}
        <RippleOverlay ripples={ripples} color={determinedRippleColor} duration={rippleDuration} />
      </div>
    );
  }

  // --- STRATEGY 2: CLONE ELEMENT (for regular elements like <button>, <div>) ---
  return (
    <>
      <style>{rippleStyles}</style>
      {cloneElement(child, {
        ...props,
        className: `relative overflow-hidden isolate ${child.props.className || ''} ${wrapperClassName || ''}`.trim(),
        onClick: (event: MouseEvent<HTMLElement>) => {
          createRipple(event);
          if (child.props.onClick) {
            child.props.onClick(event);
          }
        },
        children: (
          <>
            {child.props.children}
            {/* The overlay is injected as a child, ensuring it's clipped by the parent's border */}
            <RippleOverlay ripples={ripples} color={determinedRippleColor} duration={rippleDuration} />
          </>
        ),
      })}
    </>
  );
};

demo.tsx
// app/ripple-demo/page.tsx

"use client";

import React, { useState } from 'react';
import { RippleEffect } from "@/components/ui/ripple-effect-creator";

const ShowcaseContainer = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen w-screen flex items-center justify-center border-b border-gray-700">
    {children}
  </div>
);

export default function RippleShowcasePage() {
  return (
    <div className="dark">
      <ShowcaseContainer>
        <RippleEffect rippleColor="#030303">
          <button className="px-10 py-5 text-xl font-bold text-white bg-blue-600 rounded-xl shadow-lg">
            Standard Button
          </button>
        </RippleEffect>
      </ShowcaseContainer>

      <ShowcaseContainer>
        <RippleEffect>
          <a href="#" onClick={e=>e.preventDefault()} className="inline-block px-12 py-5 text-xl font-bold text-white bg-teal-500 rounded-full shadow-lg hover:bg-teal-600 transform hover:scale-105 transition-transform">
            Pill-Shaped Link
          </a>
        </RippleEffect>
      </ShowcaseContainer>
      
      <ShowcaseContainer>
        <RippleEffect>
          <img
            src="https://i.pravatar.cc/250?img=35"
            alt="Avatar"
            className="w-48 h-48 rounded-full object-cover shadow-2xl cursor-pointer border-4 border-gray-600 transform hover:scale-105 transition-transform"
          />
        </RippleEffect>
      </ShowcaseContainer>
      
      <ShowcaseContainer>
        <RippleEffect>
          <div className="w-[400px] h-[300px] bg-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center cursor-pointer shadow-xl transform transition-transform">
            <p className="font-bold text-3xl">Interactive Card</p>
            <p className="text-lg opacity-80">(a div element)</p>
          </div>
        </RippleEffect>
      </ShowcaseContainer>

      <ShowcaseContainer>
        <RippleEffect rippleColor="#FBFF01">
          <button className="px-10 py-5 text-xl font-bold text-white bg-purple-600 rounded-xl shadow-lg">
            Custom Ripple yellow color
          </button>
        </RippleEffect>
      </ShowcaseContainer>

       <ShowcaseContainer>
        <RippleEffect rippleDuration={2000}>
          <button className="px-10 py-5 text-xl font-bold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 transform hover:scale-105 transition-transform">
            Slow Duration (2s)
          </button>
        </RippleEffect>
      </ShowcaseContainer>
      
      <ShowcaseContainer>
        <RippleEffect disabled>
          <button className="px-10 py-5 text-xl font-bold text-white bg-gray-500 rounded-xl cursor-not-allowed opacity-70">
            Disabled
          </button>
        </RippleEffect>
      </ShowcaseContainer>
    </div>
  );
}
```

Extend existing Tailwind 4 index.css with this code (or if project uses Tailwind 3, extend tailwind.config.js or globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --animate-star-movement-bottom: star-movement-bottom linear infinite alternate;
  --animate-star-movement-top: star-movement-top linear infinite alternate;
}


@keyframes star-movement-bottom {
  0% {
    transform: translate(0%, 0%);
    opacity: 1;
  }
  100% {
    transform: translate(-100%, 0%);
    opacity: 0;
  }
}

@keyframes star-movement-top {
  0% {
    transform: translate(0%, 0%);
    opacity: 1;
  }
  100% {
    transform: translate(100%, 0%);
    opacity: 0;
  }
}
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
