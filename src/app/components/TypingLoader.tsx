import { motion } from 'motion/react';

export function TypingLoader() {
  // 2×3のドット配置
  const dots = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-20">
        <div className="grid grid-cols-3 gap-3">
          {dots.map((dot, index) => (
            <motion.div
              key={index}
              className="w-4 h-4 bg-green-500 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
                x: [0, Math.random() * 4 - 2, 0],
                y: [0, Math.random() * 4 - 2, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-6">文字組を調整中...</p>
    </div>
  );
}
