import { FcKey } from 'react-icons/fc';
import { HiKey } from 'react-icons/hi';

export const KeyIcon = ({keyInfo, size = null, props = {}}) => {
  var sizeProps = size ? {size: size} : {};
  return (keyInfo.isRoot ? <FcKey {... sizeProps} {... props}/> : <HiKey color='#333' {... sizeProps} {... props}/>)
}
