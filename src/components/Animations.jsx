import { chakra, shouldForwardProp } from '@chakra-ui/react';
import { motion, isValidMotionProp } from 'framer-motion';

export const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and non-Chakra props to be forwarded.
   */
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

export const HeadShakeMotion = {
  x: [0, -6, 5, -3, 2, 0],
  rotateY: [0, -9, 7, -5, 3, 0], 
  transition: {
    duration: 0.5,
    times: [0, 0.065, 0.185, 0.315, 0.435, 0.5] 
  }
};
