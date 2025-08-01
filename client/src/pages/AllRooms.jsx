import React, { useState, useMemo } from 'react'
import { assets, facilityIcons, roomsDummyData} from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';

export const AllRooms = () => {

    const { rooms, navigate, currency } = useAppContext();

    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: [],
    });

    const [selectedSort, setSelectedSort] = useState('');

    const [openFilters, setOpenFilters] = useState(false)

    const CheckBox = ({label, selected=false, onChange =() => { }}) =>{
        return (
            <label className='flex items-center gap-3 cursor-pointemt-2 text-sm'>
                <input type="checkbox" checked={selected} onChange={(e)=>{onChange(e.target.checked, label)}} />
                <span className='font-light select-none'>{label}</span>
            </label>
        )
    }

    const RadioButton = ({label, selected=false, onChange =() => { }}) =>{
        return (
            <label className='flex items-center gap-3 cursor-pointemt-2 text-sm'>
                <input type="radio" name='sortOption' checked={selected} onChange={()=>{onChange(label)}} />
                <span className='font-light select-none'>{label}</span>
            </label>
        )
    }

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];

    const priceRanges = [
        "Below Rs.1000",
        "Rs.1000 - Rs.3000",
        "Rs.3000 - Rs.5000",
        "Above Rs.5000",
    ];

    const sortOptions = [
        "Price: Low to High",
        "Price: High to Low",
        "Newest First",
    ];

    //handle changes for filters and sorting
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
          const updatedFilters = { ...prevFilters };
          if (checked) {
            updatedFilters[type].push(value);
          } else {
            updatedFilters[type] = updatedFilters[type].filter(
              (item) => item !== value
            );
          }
          return updatedFilters;
        });
      };

    //handle sorting change
    const handleSortChange = (sortOption) => {
        setSelectedSort(sortOption);
    }

    // Function to check if a room matches the selected room types
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
    };
    
    // Function to check if a room matches the selected price ranges
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split(' to ').map(Number);
        return room.pricePerNight >= min && room.pricePerNight <= max;
        });
    };

    // Function to sort rooms based on the selected sort option
    const sortRooms = (a, b) => {
        if (selectedSort === 'Price Low to High') {
            return a.pricePerNight - b.pricePerNight;
        }
        if (selectedSort === 'Price High to Low') {
            return b.pricePerNight - a.pricePerNight;
        }
        if (selectedSort === 'Newest First') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    };
  
     // Filter Destination
    const filterDestination = (room) => {
        const destination = searchParams.get('destination');
        if (!destination) return true;
        return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
    };
    
    // Filter and sort rooms based on the selected filters and sort option
    const filteredRooms = useMemo(() => {
        return rooms.filter(room =>
        matchesRoomType(room) &&
        matchesPriceRange(room) &&
        filterDestination(room)
        ).sort(sortRooms);
    }, [rooms, selectedFilters, selectedSort, searchParams]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedFilters({
        roomType: [],
        priceRange: []
        });
        setSelectedSort('');
        setSearchParams({});
    };
  
  
      

  return (

    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        
        {/*Rooms*/}
        <div>

            <div>
                <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
            </div>


            {roomsDummyData.map((room)=>(
                <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                    <img onClick={()=>{navigate(`/rooms/${room._id}`), scrollTo(0,0)}} src={room.images[0]}  alt="hotel-img" title='View Room Details' className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />
                    <div className='md:w-1/2 flex flex-col gap-2'>
                        <p className='text-gray-500'>{room.hotel.city}</p>
                        <p onClick={()=>{navigate(`/rooms/${room._id}`), scrollTo(0,0)}} className='text-gray-800 text-3xl font-playfair cursor-pointer'>{room.hotel.name}</p>
                        <div className='flex items-center'>
                            <StarRating />
                            <p className='ml-2'>200+ reviews</p>
                        </div>
                        <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                            <img src={assets.locationIcon} alt="location-icon" />
                            <span>{room.hotel.address}</span>
                        </div>

                        {/*Room facilities*/}
                        <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                            {room.amenities.map((item, index)=>(
                                <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                                    <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                                    <p className='text-xs'>{item}</p>
                                </div>
                            ))}
                        </div>


                        {/*Room Price*/}
                        <p className='text-xl font-medium text-gray-700'>Rs.{room.pricePerNight} /night</p>

                    </div>
                </div>
            ))}

        </div>
        

        {/*Filters*/}
        <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>
            <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && 'border-b'}`}>
                <p className='text-base font-medium text-gray-800'>FILTERS</p>
                <div className='text-xs cursor-pointer'>
                    <span onClick={()=>setOpenFilters(!openFilters)} className='lg:hidden'>{openFilters ? 'HIDE' : 'SHOW'}</span>
                    <span className='hidden lg:block'>CLEAR</span>
                </div>
            </div>

            <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>Popular Filters</p>
                    {roomTypes.map((room, index)=>(
                        <CheckBox key={index} label={room} />
                    ))}
                </div>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                    {priceRanges.map((range, index)=>(
                        <CheckBox key={index} label={range} />
                    ))}
                </div>
                <div className='px-5 pt-5 pb-7'>
                    <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                    {sortOptions.map((option, index)=>(
                        <RadioButton key={index} label={option} />
                    ))}
                </div>
            </div>
        </div>


    </div>

  )

}

export default AllRooms
