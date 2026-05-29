'use client';

import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';
import { IoIosClose, IoIosSearch } from 'react-icons/io';

import { Flex, SearchInput } from '@atoms';

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setValue('');
    setIsOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    if (!value.trim()) setIsOpen(false);
  };

  return (
    <motion.div
      role="search"
      initial={{ width: 20 }}
      animate={{ width: isOpen ? 280 : 20 }}
      style={{ height: 35 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (isOpen) inputRef.current?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
      }}
    >
      <Flex variant="search_bar" data-active={isOpen}>
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="search-icon"
              ref={triggerRef}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open search"
              aria-expanded={false}
              aria-controls="search-input"
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <IoIosSearch aria-hidden="true" className="size-5 text-primary-10 cursor-pointer shrink-0" />
            </motion.button>
          ) : (
            <motion.button
              key="close-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClose}
              aria-label="Close search"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7 rounded-full bg-border flex items-center justify-center z-10"
            >
              <IoIosClose aria-hidden="true" className="size-5 text-primary-10 cursor-pointer" />
            </motion.button>
          )}
        </AnimatePresence>
        <SearchInput
          ref={inputRef}
          id="search-input"
          placeholder="Type to search"
          value={value}
          aria-label="Search"
          inert={!isOpen}
          onBlur={handleBlur}
          data-active={isOpen}
          onChange={(e) => setValue(e.target.value)}
        />
      </Flex>
    </motion.div>
  );
};

export { Search };
