import { useState, useEffect } from 'react';
import { Box, keyframes } from '@chakra-ui/react';
import { AttentionSeeker } from 'react-awesome-reveal';

export function HoverAnimation({onEnter, on, onLeave, children, ...rest}) {
  const [isHover, setHover] = useState(false);
  const [isLeaving, setLeaving] = useState(false);
  const props = isHover && (on !== false) ? {animation: onEnter} : {animation: onLeave}; 
  return (<Box {... props} {... rest} 
    onMouseEnter={() => {setHover(true);}} 
    onMouseLeave={() => {setHover(false);}}> 
    {children}
  </Box>)
}

export function ClickAnimation({onClick, on, timeout, children, ...rest}) {
  const [isClick, setClick] = useState(false);
  const props = isClick && (on !== false) ? {animation: onClick} : {};
  return (<Box {... props} {... rest}
    onClick={() => {setClick(true); setTimeout(() => {setClick(false);}, timeout);}}>
    {children}
  </Box>)
}

export function ConditionalAnimation({on, animation, children, ...rest}) {
  const props = on ? {animation: animation} : {};
  return (<Box {... props} {... rest}>{children}</Box>)
}

export function ConditionalAttentionSeeker({on, effect, children, ...rest}) {
  if(on) {
    return (<AttentionSeeker effect={effect}>{children}</AttentionSeeker>)
  }
  return children;
}

export const click= keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }
  50% {
    transform: scale3d(0.95, 0.95, 0.95);
  }
  to {
    transform: scale3d(1, 1, 1);
  }
`;
export const quickClick = `${click} 1 0.3s ease forwards`;

export const noClick = keyframes`
  0% {
    transform: translateX(0);
  }
  6.5% {
    transform: translateX(-6px) rotateY(-9deg);
  }
  18.5% {
    transform: translateX(5px) rotateY(7deg);
  }
  31.5% {
    transform: translateX(-3px) rotateY(-5deg);
  }
  43.5% {
    transform: translateX(2px) rotateY(3deg);
  }
  50% {
    transform: translateX(0);
  }
`;
export const badClick = `${noClick} 2 0.5s ease-in-out forwards`;

export const hoverScaleIn = keyframes`
  from { transform: scale(1.0); }
  to   { transform: scale(1.05); }
`;
export const hoverScaleOut = keyframes`
  from { transform: scale(1.05); }
  to   { transform: scale(1.0); }
`;
export const hoverScaleAnimation = {
  onEnter: `${hoverScaleIn} 1 0.3s ease forwards`,
  onLeave: `${hoverScaleOut} 1 0.3s ease forwards`
};
