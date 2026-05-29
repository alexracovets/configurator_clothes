'use client';

import { AtomImage, Box, Button, Text } from '@atoms';

const Notification = () => {
  return (
    <Button className="relative w-fit">
      <AtomImage src="/svg/whatsapp.svg" alt="WhatsApp" width={60} height={61} />
      <Box className="w-4 h-4 absolute top-1 right-1 bg-[#FF0000] rounded-full flex items-center justify-center">
        <Text variant="whatsapp_badge" asChild>
          <span>1</span>
        </Text>
      </Box>
    </Button>
  );
};

export { Notification };
