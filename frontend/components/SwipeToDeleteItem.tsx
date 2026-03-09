import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2Icon } from 'lucide-react';
import { IconButton } from '@mui/material';

interface SwipeToDeleteItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    deleteThreshold?: number;
    disabled?: boolean;
}

export const SwipeToDeleteItem: React.FC<SwipeToDeleteItemProps> = ({
    children,
    onDelete,
    deleteThreshold = -100,
    disabled = false
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [0, deleteThreshold], [0, 1]);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < deleteThreshold) {
            if (window.confirm("Are you sure you want to remove this item?")) {
                setIsDeleting(true);
                onDelete();
            }
        }
    };

    if (disabled) {
        return <div className="w-full relative">{children}</div>;
    }

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-red-500 overflow-x-hidden group">
            <motion.div
                className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-6 w-full h-full pointer-events-none"
                style={{ opacity: backgroundOpacity }}
            >
                <Trash2Icon className="text-white" size={24} />
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.5, right: 0 }}
                style={{ x }}
                onDragEnd={handleDragEnd}
                animate={isDeleting ? { x: -1000, opacity: 0 } : { x: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="w-full h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl relative z-10 cursor-grab active:cursor-grabbing"
                dragDirectionLock
                onDirectionLock={(axis) => console.log('Direction locked:', axis)}
            >
                {children}
            </motion.div>
        </div>
    );
};
