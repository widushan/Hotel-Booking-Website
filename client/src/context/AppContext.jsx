import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const currency = import.meta.env.VITE_CURRENCY || "Rs";
  const navigate = useNavigate();    
  const {user} = useUser();
  const {getToken} = useAuth();
  
  const [isOwner, setIsOwner] = useState(false)
  const [showHotelReg, setShowHotelReg] = useState(false)
  const [searchedCities, setSearchedCities] = useState([])

  const fetchUser = async () => {
    try {
        const { data } = await axios.get('/api/user', {
        headers: {
            Authorization: `Bearer ${await getToken()}`
        }
        });
        if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities)
        } else {
            //Retry fetching user details after 5 seconds
            setTimeout(()=>{
                fetchUser()
            }, 5000)
        }
    } catch (error) {
        console.log("Fetch user error:", error.response?.data || error.message);
        // If user doesn't exist, try to create them
        if (error.response?.data?.message === "User not found" || error.response?.status === 400) {
            try {
                console.log("Attempting to create user...");
                const createResponse = await axios.post('/api/user/create', {
                    email: user.primaryEmailAddress.emailAddress,
                    username: `${user.firstName} ${user.lastName}`,
                    image: user.imageUrl
                }, {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`
                    }
                });
                console.log("User creation response:", createResponse.data);
                // Retry fetching user after creation
                fetchUser();
            } catch (createError) {
                console.error("User creation error:", createError.response?.data || createError.message);
                toast.error(createError.response?.data?.message || createError.message);
            }
        } else {
            toast.error(error.response?.data?.message || error.message);
        }
    }
  }


  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user])

    
  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    showHotelReg,
    setShowHotelReg,
    axios,
    searchedCities,
    setSearchedCities
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )

}

export const useAppContext = () => useContext(AppContext);

