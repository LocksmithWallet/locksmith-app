import { chakra, Box, shouldForwardProp } from '@chakra-ui/react';
import { 
  motion,
  AnimatePresence,
  isValidMotionProp
} from 'framer-motion';

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

export const OverlayBlur = ({disclosure, onClose, ...rest}) => {
  return (<AnimatePresence>
    { disclosure.isOpen && <Box as={motion.div}
      data-blurry='blurry'
      initial={{opacity: 0}}
      animate={{opacity: 0.6}}
      exit={{opacity: 0}}
      onClick={onClose || disclosure.onClose}
      style={{
        position: 'fixed',
        left: 0,
        width: '500vw',
        top: -200,
        height: '500vh',
        cursor: 'pointer',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 500,
      }}/>
    }
    </AnimatePresence>)
}
