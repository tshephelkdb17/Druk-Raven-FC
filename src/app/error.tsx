"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="shell py-24"><h1 className="title text-5xl">Unable to load this page.</h1><p className="my-6 text-neutral-400">Please try again in a moment.</p><button className="button" onClick={reset}>Try again</button></div>}
