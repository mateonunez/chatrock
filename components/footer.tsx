'use client';

import { motion } from 'framer-motion';

const currentYear = new Date().getFullYear();

export default function Footer(): JSX.Element {
  return (
    <motion.footer
      key="footer"
      className="rounded-xl flex flex-col leading-relaxed text-center max-w-xl mx-auto p-6 gap-4"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <p className="text-sm text-muted-foreground">
        Made with{' '}
        <span role="img" aria-label="heart emoji">
          ❤️
        </span>{' '}
        by{' '}
        <a
          href="https://x.com/mmateonunez"
          title="Follow Mateo Nunez on X"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          @mateonunez
        </a>
        .
      </p>
    </motion.footer>
  );
}
