import { useMemo, useState } from "react";
import { Check, X, Shield } from "lucide-react";

interface CaptchaModalProps {
    isOpen: boolean;
    onVerify: () => void;
    onClose: () => void;
}

type CaptchaImage = { id: string; src: string; category: string };
type CaptchaRound = { target: string; label: string; images: CaptchaImage[] };

// Swap these for your own hosted assets if you don't want to depend on an
// external image host — the component only cares about {id, src, category}.
const ROUNDS_DATA: CaptchaRound[] = [
    {
        target: "bus",
        label: "buses",
        images: [
            { id: "b1", src: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=300&fit=crop", category: "bus" },
            { id: "b2", src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop", category: "bus" },
            { id: "b3", src: "https://images.unsplash.com/photo-1569251992681-4934e35e2e3e?w=300&h=300&fit=crop", category: "bus" },
            { id: "c1", src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop", category: "car" },
            { id: "t1", src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&h=300&fit=crop", category: "truck" },
            { id: "m1", src: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&h=300&fit=crop", category: "motorcycle" },
            { id: "br1", src: "https://images.unsplash.com/photo-1534234828563-025cf17ebb4d?w=300&h=300&fit=crop", category: "bridge" },
            { id: "tl1", src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&h=300&fit=crop", category: "traffic light" },
            { id: "bo1", src: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?w=300&h=300&fit=crop", category: "boat" },
        ],
    },
    {
        target: "bicycle",
        label: "bicycles",
        images: [
            { id: "bi1", src: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=300&fit=crop", category: "bicycle" },
            { id: "bi2", src: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=300&fit=crop", category: "bicycle" },
            { id: "bi3", src: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=300&h=300&fit=crop", category: "bicycle" },
            { id: "c2", src: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=300&h=300&fit=crop", category: "car" },
            { id: "b4", src: "https://images.unsplash.com/photo-1569251992681-4934e35e2e3e?w=300&h=300&fit=crop", category: "bus" },
            { id: "tr1", src: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&h=300&fit=crop", category: "train" },
            { id: "t2", src: "https://images.unsplash.com/photo-1586191582151-f73872dfd183?w=300&h=300&fit=crop", category: "truck" },
            { id: "br2", src: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=300&h=300&fit=crop", category: "bridge" },
            { id: "tl2", src: "https://images.unsplash.com/photo-1568820252191-0a0169565170?w=300&h=300&fit=crop", category: "traffic light" },
        ],
    },
    {
        target: "traffic light",
        label: "traffic lights",
        images: [
            { id: "tl3", src: "https://images.unsplash.com/photo-1568820252191-0a0169565170?w=300&h=300&fit=crop", category: "traffic light" },
            { id: "tl4", src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&h=300&fit=crop", category: "traffic light" },
            { id: "tl5", src: "https://images.unsplash.com/photo-1589820296156-2454bb8a6d54?w=300&h=300&fit=crop", category: "traffic light" },
            { id: "c3", src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=300&fit=crop", category: "car" },
            { id: "bi4", src: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=300&h=300&fit=crop", category: "bicycle" },
            { id: "t3", src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&h=300&fit=crop", category: "truck" },
            { id: "br3", src: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=300&h=300&fit=crop", category: "bridge" },
            { id: "b5", src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop", category: "bus" },
            { id: "m2", src: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&h=300&fit=crop", category: "motorcycle" },
        ],
    },
];

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

export default function CaptchaModal({ isOpen, onVerify, onClose }: CaptchaModalProps) {
    const [round, setRound] = useState(0);
    const [selected, setSelected] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const currentRound = useMemo(() => {
        const r = ROUNDS_DATA[round];
        return { ...r, images: shuffle(r.images) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [round]);

    if (!isOpen) return null;

    const correctIds = currentRound.images.filter((i) => i.category === currentRound.target).map((i) => i.id);

    const reset = () => {
        setRound(0);
        setSelected([]);
        setShowSuccess(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const toggleImage = (id: string) => {
        if (showSuccess) return;

        setSelected((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];

            const allCorrectPicked = correctIds.every((cid) => next.includes(cid));
            const onlyCorrectPicked = next.every((sid) => correctIds.includes(sid));

            if (allCorrectPicked && onlyCorrectPicked && next.length === correctIds.length) {
                setTimeout(() => {
                    if (round < ROUNDS_DATA.length - 1) {
                        setRound((r) => r + 1);
                        setSelected([]);
                    } else {
                        setShowSuccess(true);
                        setTimeout(() => {
                            onVerify();
                            reset();
                        }, 1400);
                    }
                }, 500);
            }

            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-surface-2 border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-text">Security Check</h3>
                    </div>
                    <button onClick={handleClose} className="text-text-muted hover:text-text">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="flex gap-2 mb-2">
                        {ROUNDS_DATA.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${i < round || showSuccess ? "bg-green-500" : i === round ? "bg-primary" : "bg-surface-2"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-text-muted text-center">
                        {showSuccess ? "Verification complete" : `Select all images with ${currentRound.label}`}
                    </p>
                </div>

                <div className="p-6">
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <p className="text-green-400 font-semibold text-lg">Verified successfully</p>
                            <p className="text-text-muted text-sm">Redirecting you...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {currentRound.images.map((img) => {
                                const isSelected = selected.includes(img.id);
                                const isCorrect = img.category === currentRound.target;
                                return (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => toggleImage(img.id)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                ? isCorrect
                                                    ? "border-green-500 ring-2 ring-green-500/30"
                                                    : "border-red-500 ring-2 ring-red-500/30"
                                                : "border-transparent hover:border-primary/50"
                                            }`}
                                    >
                                        <img
                                            src={img.src}
                                            alt="verify"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://placehold.co/300x300/1e293b/475569?text=${encodeURIComponent(
                                                    img.category
                                                )}`;
                                            }}
                                        />
                                        {isSelected && (
                                            <div
                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 ${isCorrect ? "text-green-400" : "text-red-400"
                                                    }`}
                                            >
                                                {isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {!showSuccess && (
                    <div className="border-t border-border p-4 flex justify-between text-xs text-text-muted">
                        <span>
                            Round {round + 1} of {ROUNDS_DATA.length}
                        </span>
                        <button type="button" onClick={() => setSelected([])} className="text-primary hover:text-secondary">
                            Clear selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}