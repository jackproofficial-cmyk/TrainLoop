import { useState } from "react";
import { FaRepeat } from "react-icons/fa6";

export const Home = () => {

    return (
        <div className="">

            <div id="Hero" className="bg-[#1e1e1e] min-h-screen flex items-center justify-center flex-col text-white font-cal font-bold ">
                <div className="text-center ">
                    <h1 className="text-[9rem] text-red-white"><span className="text-blue-300">Train</span ><span>Loop</span></h1>
                    <p className="text-[1rem] mt-[2vh] font-sans font-medium"><span className="text-gray-300">Train</span> <span className="text-blue-100">Repeat</span> <span className="text-gray-300">Sleep</span>  </p>
                </div>
            </div>

            <div id="About" className="bg-[#1e1e1e] min-h-screen flex items-center justify-center flex-col text-white ">

            </div>
        </div>
    )
}