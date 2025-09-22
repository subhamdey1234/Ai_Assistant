import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Create the context
export const Context = createContext();

// API configuration
const BASE_URL = "http://localhost:5000";

// Create custom axios instance
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Create the provider component
export function ContextProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userdata, setUserdata] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [frontimage,setfrontendimage]=useState(null);
    const [backendimage,setbackendimage]=useState(null);
    const [selectedimage,setselectedimage]=useState(null);




    // Intercept all requests to add token
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // We store the raw JWT in localStorage. Prefix with 'Bearer ' for the header.
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Intercept responses to handle common errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setUserdata(null);
                // Use replace so history doesn't keep protected routes
                navigate('/login', { replace: true });
            }
            return Promise.reject(error);
        }
    );

    const handleuserdata = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setUserdata(null);
                return;
            }
            
            const result = await api.get('/api/user/current');
            
            if (result.data && result.data.user) {
                setUserdata(result.data.user);
            } else {
                setUserdata(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error("Error fetching user data:", error.response?.data || error.message);
            setUserdata(null);
            localStorage.removeItem('token');
            setError(error.response?.data?.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, [navigate]);


    const geminiresponse=async(command)=>{
        try {
            const result=await api.post('/api/user/askassitant', { command });
            return result.data;

        } catch (error) {
            console.log(error);
                return {err:error.message};
            
        }
    }


    useEffect(() => {
        handleuserdata();
    }, [handleuserdata]);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.post('/api/auth/login', { email, password });
            
            if (response.data.token) {
                // Backend returns 'Bearer <token>' in response.token; store raw token only
                const returned = response.data.token;
                const token = (typeof returned === 'string' && returned.startsWith('Bearer ')) ? returned.slice(7) : returned;
                localStorage.setItem('token', token);
                setUserdata(response.data.user);
                // Always redirect to customize after login
                navigate('/customize' , {replace: true});
                return { success: true };
            }
            
            setError(response.data.message || 'Login failed');
            return { success: false, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred during login';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            // Call backend to clear cookie / server session
            await api.post('/api/auth/logout');
        } catch (err) {
            // Log but continue with client-side logout
            console.warn('Logout API call failed:', err?.response?.data || err.message);
        } finally {
            localStorage.removeItem('token');
            setUserdata(null);
            // clear image selections
            setbackendimage(null);
            setfrontendimage(null);
            setselectedimage(null);
            // Replace current history entry so Back won't return to protected pages
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const contextValue = {
        baseUrl: BASE_URL,
        serverUrl: BASE_URL,
        userdata,
        loading,
        error,
        setUserdata,
        handleuserdata,
        login,
        logout,
        frontimage,
        backendimage,
        setbackendimage,
        setfrontendimage,
        selectedimage,
        setselectedimage,
        geminiresponse
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

