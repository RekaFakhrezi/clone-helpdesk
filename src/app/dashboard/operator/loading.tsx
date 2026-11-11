import React from 'react';

export default function Loading() {
    return (
        <div className="w-full max-w-[1440px] mx-auto animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="h-[22px] w-64 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-[13px] w-96 bg-[var(--canvas)] rounded-[3px]"></div>
            </div>

            {/* Strip metrik skeleton */}
            <div className="mt-6 border-y border-[var(--rule)] grid grid-cols-1 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`py-5 lg:py-6 pr-4 ${i > 0 ? 'md:border-l md:border-[var(--rule)] md:pl-6' : ''}`}>
                        <div className="h-[10px] w-40 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="mt-3 h-[30px] w-16 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="mt-3 h-[11px] w-40 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-6">
                {/* Filter tanggal skeleton */}
                <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] p-4 flex flex-wrap items-end gap-3 h-[88px]">
                    <div className="flex flex-col gap-2">
                        <div className="h-[10px] w-20 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-9 w-36 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                    <div className="h-4 w-4 bg-[var(--canvas)] rounded-[3px] mb-2"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-[10px] w-24 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-9 w-36 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                    <div className="h-9 w-20 bg-[var(--canvas)] rounded-[3px] ml-2"></div>
                </div>

                {/* Grafik skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] p-4 h-[400px] lg:col-span-2 flex flex-col">
                        <div className="h-[13px] w-48 bg-[var(--canvas)] rounded-[3px] mb-6"></div>
                        <div className="flex-1 flex items-end gap-2 w-full px-4 border-b border-l border-[var(--rule)]">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex-1 bg-[var(--canvas)] rounded-[2px]" style={{ height: `${Math.max(20, Math.random() * 80)}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] p-4 h-[400px] flex flex-col items-center">
                        <div className="h-[13px] w-48 bg-[var(--canvas)] rounded-[3px] mb-2 self-start"></div>
                        <div className="h-[11px] w-32 bg-[var(--canvas)] rounded-[3px] mb-12 self-start"></div>
                        <div className="h-[200px] w-[200px] rounded-full border-[24px] border-[var(--canvas)] mt-2"></div>
                    </div>
                </div>

                {/* Tabel skeleton */}
                <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] p-4 h-[400px] flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div className="h-[13px] w-48 bg-[var(--canvas)] rounded-[3px]"></div>
                        <div className="h-[11px] w-32 bg-[var(--canvas)] rounded-[3px]"></div>
                    </div>
                    <div className="border border-[var(--rule)] rounded-[4px] overflow-hidden">
                        <div className="h-[40px] bg-[var(--canvas)] border-b border-[var(--rule)]"></div>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[48px] border-b border-[var(--rule)] flex items-center px-4">
                                <div className="h-3 w-1/4 bg-[var(--canvas)] rounded-[3px]"></div>
                                <div className="h-3 w-16 bg-[var(--canvas)] rounded-[3px] mx-auto"></div>
                                <div className="h-3 w-24 bg-[var(--canvas)] rounded-[3px] mx-auto"></div>
                                <div className="h-6 w-20 bg-[var(--canvas)] rounded-[3px] ml-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
