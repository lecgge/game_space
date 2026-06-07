import { motion } from 'framer-motion';
export function IconMinimize({ className }) {
  return (
    <motion.svg
      width="12"
      height="3"
      viewBox="0 0 12 3"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.75 1.5H11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

export function IconMaximize({ className }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 3H8V2C8 1.44772 7.55229 1 7 1H6C5.44772 1 5 1.44772 5 2V3H4C3.44772 3 3 3.44772 3 4V5H2C1.44772 5 1 5.44772 1 6V7C1 7.55229 1.44772 8 2 8H3V9C3 9.55228 3.44772 10 4 10H5V11C5 11.5523 5.44772 12 6 12H7C7.55229 12 8 11.5523 8 11V10H9C9.55228 10 10 9.55228 10 9V8H11C11.5523 8 12 7.55229 12 7V6C12 5.44772 11.5523 5 11 5H10V4C10 3.44772 9.55228 3 9 3ZM6 3H7V5H5V4H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

export function IconClose({ className }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.75 3.75L4.25 7.25M6.75 3.75V6H9V7H8V8H6V5H4V6.00001C4 6.55228 4.44772 7 5 7H6V8H6.75V7H7.75V6.25H6.75V5.75H7.75Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMaximizeSolid({ className }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="5" y="2" width="2" height="2" rx="0.5"/>
      <rect x="3" y="9" width="2" height="2" rx="0.5"/>
      <rect x="7" y="9" width="2" height="1" rx="0.5"/>
      <rect x="3" y="3" width="2" height="1" rx="0.5"/>
    </motion.svg>
  );
}
