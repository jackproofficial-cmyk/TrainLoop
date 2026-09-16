import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom";

export const Navbar = () => {

    const { isAuthenticated, user, logout } = useAuth();

    const activeLink = useState() // useRef
    const hoveredLink = useState() // to change other links status 

    return (
        <header className="fixed left-1/2 -translate-x-1/2 z-50 top-9 max-w-lg   ">

            <nav className="w-full flex items-center content-center ">
                
                <ul className="w-full flex content-center items-center gap-[5vw] text-[1.2rem] font-semi-bold font-cal py-5 px-15 rounded-2xl shadow-lg backdrop-blur-2xl /*bg-white/80*/ bg-blue-300 ">
                    <li>
                        <a href="/" className="text-[#2d2d30] /*hover:text-[1.5rem]*/ inline-block  hover:scale-125 transition-all duration-150 ease-in-out  hover:drop-shadow-md hover:text-white text-">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="/" className=" text-[#2d2d30] /*hover:text-[1.5rem]*/ inline-block  hover:scale-125 transition-all duration-150 ease-in-out hover:drop-shadow-md hover:text-white text-">
                            Features
                        </a>
                    </li>
                    <li>
                        <a href="/" className=" text-[#2d2d30] /*hover:text-[1.5rem]*/ inline-block  hover:scale-125 transition-all duration-150 ease-in-out hover:drop-shadow-md hover:text-white">
                            Pricing
                        </a>
                    </li>

                </ul>
                <div className="cta ml-[5vw] h-full">
                    {isAuthenticated ? (

                        <Link to="/dashboard" className="w-min bg-blue-100 py-4 px-6 rounded-2xl text-[#2d2d30] font-bold hover:py-5 hover:px-12 transition-all duration-200 ease-in-out "> Dashboard </Link>

                    ) : (

                        <Link to="/login" className="w-min bg-blue-100 py-4 px-6 rounded-2xl text-[#2d2d30] font-bold hover:py-5 hover:px-12 transition-all duration-200 ease-in-out "> Login </Link>

                    )}
                </div>
            </nav>

        </header>
    )
}