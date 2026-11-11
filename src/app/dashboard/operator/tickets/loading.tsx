import React from 'react';

export default function Loading() {
    return (
        <div className="w-full max-w-[1440px] mx-auto animate-pulse">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="h-[10px] w-40 bg-[var(--canvas)] rounded-[3px]"></div>
                    <div className="h-[22px] w-48 bg-[var(--canvas)] rounded-[3px]"></div>
                </div>
            </div>

            {/* Toolbar skeleton */}
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                    <div className="flex gap-2">
                        <div className="h-9 w-64 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-9 w-32 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-9 w-24 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-9 w-24 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                </div>

                {/* Tabel skeleton */}
                <div className="flex flex-col rounded-[4px] border border-[var(--rule)] bg-[var(--surface)] w-full overflow-hidden">
                    <div className="h-[38px] border-b border-[var(--rule)]"></div>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-4 px-4 py-3 border-b border-[var(--rule)] items-center overflow-hidden">
                            <div className="h-[14px] w-[14px] bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-3 w-20 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-3 w-24 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-3 w-full max-w-[200px] bg-[var(--canvas)] rounded-[3px]"></div>
                            <div className="h-3 w-24 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-7 w-32 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-7 w-28 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="h-7 w-32 bg-[var(--canvas)] rounded-[3px] shrink-0"></div>
                            <div className="flex gap-2 ml-auto shrink-0">
                                <div className="h-8 w-16 bg-[var(--canvas)] rounded-[3px]"></div>
                                <div className="h-8 w-16 bg-[var(--canvas)] rounded-[3px]"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
