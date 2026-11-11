import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-[22px] w-40 bg-[var(--canvas)] rounded-[3px] mb-2"></div>
        <div className="h-[13px] w-64 bg-[var(--canvas)] rounded-[3px]"></div>
      </div>

      {/* Card Skeleton */}
      <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-[var(--rule)]">
          <div className="h-[13px] w-48 bg-[var(--canvas)] rounded-[3px]"></div>
        </div>

        {/* Card Body */}
        <div className="p-4 md:p-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Avatar Section */}
            <div className="md:col-span-1 flex flex-col items-center gap-3 pt-2">
              <div className="w-20 h-20 rounded-[4px] bg-[var(--canvas)]"></div>
              <div className="h-3 w-16 bg-[var(--canvas)] rounded-[3px] mt-1"></div>
            </div>

            {/* Fields Section */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <div className="h-[10px] w-16 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-[10px] w-16 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <div className="h-[10px] w-24 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-[10px] w-28 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-[10px] w-28 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
            </div>
          </div>

          <hr className="border-[var(--rule)] my-6" />

          {/* Auth Section */}
          <div className="flex flex-col gap-4">
            <div className="h-[13px] w-32 bg-[var(--canvas)] rounded-[3px] mb-2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-4">
              <div className="flex flex-col gap-2 md:col-span-2 sm:col-span-1">
                <div className="h-[10px] w-20 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2 sm:col-span-1">
                <div className="h-[10px] w-32 bg-[var(--canvas)] rounded-[3px]"></div>
                <div className="h-9 w-full bg-[var(--canvas)] rounded-[3px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--rule)] px-4 py-3 flex justify-center gap-3">
          <div className="h-9 w-32 bg-[var(--canvas)] rounded-[3px]"></div>
          <div className="h-9 w-24 bg-[var(--canvas)] rounded-[3px]"></div>
        </div>
      </div>
    </div>
  );
}
