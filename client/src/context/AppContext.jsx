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
  const [rooms, setRooms] = useState([])

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms')
      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  

  const fetchUser = async () => {
    console.log("=== FETCH USER STARTED ===");
    console.log("User object:", user);
    
    try {
        console.log("Making API call to /api/user...");
        const { data } = await axios.get('/api/user', {
        headers: {
            Authorization: `Bearer ${await getToken()}`
        }
        });
        console.log("API response:", data);
        if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities)
        console.log("User fetch successful, role:", data.role);
        } else {
            console.log("User fetch failed with message:", data.message);
            // Try to create user if user not found
            if (data.message === "User not found") {
                console.log("User not found, attempting to create user...");
                try {
                    console.log("=== ATTEMPTING USER CREATION ===");
                    console.log("User data for creation:", {
                        email: user.primaryEmailAddress.emailAddress,
                        username: `${user.firstName} ${user.lastName}`,
                        image: user.imageUrl
                    });
                    
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
                    setTimeout(() => {
                        fetchUser();
                    }, 1000);
                } catch (createError) {
                    console.error("=== USER CREATION ERROR ===");
                    console.error("Create error details:", createError);
                    console.error("Create error response:", createError.response?.data);
                    toast.error("Failed to create user account. Please try again.");
                }
            } else {
                // Retry fetching user details after 5 seconds for other errors
                setTimeout(()=>{
                    fetchUser()
                }, 5000)
            }
        }
    } catch (error) {
        console.log("=== FETCH USER ERROR ===");
        console.log("Error details:", error);
        console.log("Error response:", error.response?.data);
        console.log("Error message:", error.message);
        toast.error("Failed to fetch user data. Please try again.");
    }
  }


  useEffect(() => {
    console.log("=== USE EFFECT TRIGGERED ===");
    console.log("User state:", user);
    if (user) {
      console.log("User exists, calling fetchUser...");
      fetchUser();
    } else {
      console.log("No user found");
    }
  }, [user])

  useEffect(() => {
    
    fetchRooms()
    
  }, [])

    
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
    setSearchedCities,
    rooms,
    setRooms
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )

}

export const useAppContext = () => useContext(AppContext);

