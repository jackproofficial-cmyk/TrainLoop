import { useState } from "react";
import { useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from '../../api/axios.jsx'

export const LogIn = () => {

    const [activeTab, setActiveTab] = useState("login") // That make the signIn and logIn page in the same file.

    const toggleActiveTab = () => {
        setActiveTab(`${activeTab === 'login' ? "signin" : "login"}`)
    }
    const LoginForm = () => {

        const { login } = useAuth()
        const navigate = useNavigate()

        const [password, setPassword] = useState("")
        const [email, setEmail] = useState("")

        const [showPassword, setShowPassword] = useState(false);

        const [error, setError] = useState("")
        const [loading, setLoading] = useState(false)

        const handleSubmit = async (e) => {
            e.preventDefault()
            setError("")
            setLoading(true)

            try {

                const { data } = await api.post('/users/login', { email, password })
                await login(data.user)
                navigate("/dashboard")

            } catch (err) {
                setError(err.response?.data?.message || "Invalid login credentials")
            } finally {
                setLoading(false)
            }
        }

        return (
            <div id="formContainer" className="flex-1 flex items-center justify-center">


                <form autoComplete="off" onSubmit={handleSubmit} className="w-7/10 bg-blue-100/80 backdrop-blur-sm p-15 rounded-2xl shadow-xl flex flex-col gap-4 justify-center items-center">

                    {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                    />
                    <div className="flex flex-col items-center"> {/* PASSWORD INPUT */}
                        {/* Password Input Wrapper */}
                        <div className="relative flex items-center justify-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                            />

                            {/* Eye Icon floated outside the centering boundary */}
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-full ml-2 text-black/50 cursor-pointer select-none"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </span>
                        </div>

                        {/* Perfectly aligned with the underline */}
                        <Link
                            to="/"
                            className="text-[0.75rem] text-black/45 hover:text-black transition-colors mt-2"
                        >
                            Forgot Password ?
                        </Link>
                    </div>


                    <button className="bg-blue-300 text-white py-3 rounded-2xl font-cal mt-2.5 w-8/10 hover:bg-blue-400 transition-all ease-in-out duration-150 hover:cursor-pointer active:scale-[0.98]">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

            </div>
        )

    }

    const SignUpForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: {
            firstName: "",
            lastName: ""
        },
        email: "",
        birthdate: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNameChange = (e) => {
        setFormData({
            ...formData,
            name: {
                ...formData.name,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleDate = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
        let formatted = digits;
        if (digits.length > 4) {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        } else if (digits.length > 2) {
            formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }
        setFormData((prev) => ({ ...prev, birthdate: formatted }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.birthdate.length !== 10) {
            return setError("Please enter a complete birthdate (MM/DD/YYYY)");
        }

        setLoading(true);

        const [month, day, year] = formData.birthdate.split("/");
        const isoBirthdate = new Date(`${year}-${month}-${day}`).toISOString();

        // Send nested name object directly
        const signupPayload = {
            name: formData.name,
            email: formData.email,
            birthdate: isoBirthdate,
            password: formData.password,
        };

        try {
            // Single API call receives token and user object directly
            const { data } = await api.post('/users', signupPayload);
            await login(data.user)
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="formContainer" className="flex-1 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-7/10 bg-blue-100/80 backdrop-blur-sm p-15 rounded-2xl shadow-xl flex flex-col gap-4 justify-center items-center transition-all ease-in-out duration-150" autoComplete="off">
                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                <input
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.name.firstName}
                    onChange={handleNameChange}
                    className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                />

                <input
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.name.lastName}
                    onChange={handleNameChange}
                    className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                />

                <input
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                />

                <input
                    type="text"
                    value={formData.birthdate}
                    onChange={handleDate}
                    placeholder="MM / DD / YYYY"
                    name="birthdate"
                    maxLength={10}
                    className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2"
                />

                <div className="relative flex items-center justify-center w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="outline-none text-center border-b border-black/20 focus:border-blue-300 focus:border-b-2 text-black/90 placeholder:text-black/50"
                    />

                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 text-xs text-black/50 cursor-pointer select-none"
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                </div>

                <button disabled={loading} className="bg-blue-300 text-white rounded-xl py-3.25 mt-2 font-bold shadow-sm hover:bg-blue-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer w-8/10 disabled:opacity-50">
                    {loading ? "Creating account..." : "Sign-Up"}
                </button>
            </form>
        </div>
    );
};

    return (
        <div className="h-screen w-screen bg-[#1e1e1e] flex items-center justify-center ">
            <div id="contentBox" className={`bg-blue-200 w-[28vw] h-[55vh] rounded-2xl flex flex-col ${activeTab === 'signin' ? "h-[62vh]" : ""} transition-all ease-in-out duration-150 p-1`}>

                <div id="tabChoice" className="h-13/100 flex rounded-2xl m-2 bg-blue-200 font-cal gap-1">
                    <div
                        className={`w-1/2 h-full flex items-center justify-center  hover:bg-blue-300 rounded-2xl hover:text-white shadow-md transition-all ease-in-out duration-150 ${activeTab === 'login' ? 'bg-blue-300 text-white shadow-md hover:bg-blue-400 hover:shadow-lg' : 'hover:bg-blue-300/50 text-gray-700'}`}
                        onClick={toggleActiveTab}
                    >
                        <p >Login</p>
                    </div>

                    <div
                        className={`w-1/2 h-full flex items-center justify-center hover:bg-blue-300 rounded-2xl hover:text-white shadow-md transition-all ease-in-out duration-150 ${activeTab === 'signin' ? 'bg-blue-300 text-white shadow-md hover:bg-blue-400 hover:shadow-lg' : 'hover:bg-blue-300/50 text-gray-700'}`}
                        onClick={toggleActiveTab}
                    >
                        <p >SignUp</p>
                    </div>
                </div>
                {activeTab === 'login' ? ( // LOGIN
                    <LoginForm />
                ) : ( // SIGNUP
                    <SignUpForm />
                )}

            </div>
        </div>
    )
}


// TODO : make it semantic like. Make it responsive. make the forgot password page. Connect the backend. Make the user profile page.