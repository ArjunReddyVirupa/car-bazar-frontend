"use client";
import {useEffect} from "react";import {RefreshCw} from "lucide-react";
export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{},[]);return <main className="grid min-h-[70vh] place-items-center px-4"><div className="text-center"><h1 className="text-3xl font-black">Something went wrong.</h1><p className="mt-2 text-slate-500">Please try again.</p><button onClick={()=>reset()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-white"><RefreshCw size={17}/> Try again</button></div></main>}
